/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/bars              ->  index
 * POST    /api/bars              ->  create
 * GET     /api/bars/:id          ->  show
 * PUT     /api/bars/:id          ->  upsert
 * PATCH   /api/bars/:id          ->  patch
 * DELETE  /api/bars/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Bar from './bar.model';
import Promise from 'bluebird';
import config from '../../config/environment';
import _ from 'lodash';
import Yelp from 'yelp';

let yelp = new Yelp({
  consumer_key: config.yelp_consumer_key,
  consumer_secret: config.yelp_consumer_secret,
  token: config.yelp_token,
  token_secret: config.yelp_token_secret
})

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function respondWithResultA(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      if ('attending' in entity && typeof entity.attending != 'number'){
        entity.attending = entity.attending.length;
      }
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function apiCall (loc) {
  if (!loc) {
    return reject();
  }
  return new Promise((resolve, reject) => {
    yelp.search({ term: 'bars', location: loc })
      .then( data => {
        return resolve(new Promise.map(data.businesses, (bar) => { return findBarFromAPI(bar)}));
      })
      .catch( err => {
      return reject(err)
    })
  })

}

function findBarFromAPI(bar) {
  return new Promise((resolve, reject) => {
    Bar.findByYID(bar.id, (err, doc) => {
      if(err){return reject(err)};
      if(!doc){bar.attending = 0; return resolve(bar)};
      bar.attending = doc.attending.length;
      return resolve(bar);
    })
  })
}


function attendBar(bar, user, id) {
  return new Promise((resolve, reject) => {
    Bar.findOne({id: id}, (err, doc) => {
      if (err) return reject(err);
      if (!doc) {
        return resolve(Bar.create({id: id, attending:[user]}))
      }
      let n = doc.attending.indexOf(user);
      if (n != -1){
        doc.attending.splice(n, 1);
      } else {
        doc.attending.push(user);
      }
      return resolve(Bar.fou({id: id}, doc));
    })
  })
}

// Gets a list of Bars
export function index(req, res) {
  return Bar.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//Get List of bars from :loc
export function getBar(req, res) {
  return apiCall(req.params.loc)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//Add User to Attend Bar
export function attending(req, res) {
  let user = req.user._id;
  let id = req.params.id;
  let bar = req.body;
  return attendBar(bar, user, id)
    .then(respondWithResultA(res))
    .catch(handleError(res));
}

// Gets a single Bar from the DB
export function show(req, res) {
  return Bar.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Bar in the DB
export function create(req, res) {
  return Bar.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Bar in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Bar.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Bar in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Bar.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Bar from the DB
export function destroy(req, res) {
  return Bar.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
