'use strict';

import mongoose from 'mongoose';
import Promise from 'bluebird';
let Schema = mongoose.Schema;

var BarSchema = new mongoose.Schema({
  id: String,
  attending: Array
});

BarSchema.statics = {
	findByYID: function(param, cb) {
		this.findOne({id: param})
			.exec(cb);	
  }, 
  fou: function(param, doc){
    return new Promise((resolve, reject) =>{
      this.findOneAndUpdate(param, doc)
        .exec((err, ndoc, found) =>{
        return resolve(doc);
      })
    })
  }
};

export default mongoose.model('Bar', BarSchema);
