/**
 * Bar model events
 */

'use strict';

import {EventEmitter} from 'events';
import Bar from './bar.model';
var BarEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
BarEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Bar.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    BarEvents.emit(event + ':' + doc._id, doc);
    BarEvents.emit(event, doc);
  };
}

export default BarEvents;
