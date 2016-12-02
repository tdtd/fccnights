'use strict';

var app = require('../..');
import request from 'supertest';

var newBar;

describe('Bar API:', function() {
  describe('GET /api/bars', function() {
    var bars;

    beforeEach(function(done) {
      request(app)
        .get('/api/bars')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          bars = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(bars).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/bars', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/bars')
        .send({
          name: 'New Bar',
          info: 'This is the brand new bar!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newBar = res.body;
          done();
        });
    });

    it('should respond with the newly created bar', function() {
      expect(newBar.name).to.equal('New Bar');
      expect(newBar.info).to.equal('This is the brand new bar!!!');
    });
  });

  describe('GET /api/bars/:id', function() {
    var bar;

    beforeEach(function(done) {
      request(app)
        .get(`/api/bars/${newBar._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          bar = res.body;
          done();
        });
    });

    afterEach(function() {
      bar = {};
    });

    it('should respond with the requested bar', function() {
      expect(bar.name).to.equal('New Bar');
      expect(bar.info).to.equal('This is the brand new bar!!!');
    });
  });

  describe('PUT /api/bars/:id', function() {
    var updatedBar;

    beforeEach(function(done) {
      request(app)
        .put(`/api/bars/${newBar._id}`)
        .send({
          name: 'Updated Bar',
          info: 'This is the updated bar!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedBar = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedBar = {};
    });

    it('should respond with the original bar', function() {
      expect(updatedBar.name).to.equal('New Bar');
      expect(updatedBar.info).to.equal('This is the brand new bar!!!');
    });

    it('should respond with the updated bar on a subsequent GET', function(done) {
      request(app)
        .get(`/api/bars/${newBar._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let bar = res.body;

          expect(bar.name).to.equal('Updated Bar');
          expect(bar.info).to.equal('This is the updated bar!!!');

          done();
        });
    });
  });

  describe('PATCH /api/bars/:id', function() {
    var patchedBar;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/bars/${newBar._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Bar' },
          { op: 'replace', path: '/info', value: 'This is the patched bar!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedBar = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedBar = {};
    });

    it('should respond with the patched bar', function() {
      expect(patchedBar.name).to.equal('Patched Bar');
      expect(patchedBar.info).to.equal('This is the patched bar!!!');
    });
  });

  describe('DELETE /api/bars/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/bars/${newBar._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when bar does not exist', function(done) {
      request(app)
        .delete(`/api/bars/${newBar._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
