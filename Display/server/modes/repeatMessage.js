var timers = require('timers');

var nextTimeout = null;

function createKeyEvent(socketio, index, options) {
  if (index > options.message.length) { 
    index = 0;
  }

  var key = options.message[index];
  var delay = Math.random() * (options.maxDelay - options.minDelay) + options.minDelay;
  if (key == "\n") {
    delay = options.lineEndDelay;
  }

  nextTimeout = timers.setTimeout(function() {
    socketio.emit('t', key);
    createKeyEvent(socketio, index + 1, options);
  }, delay);
}

var RepeatMessageMode = {};

RepeatMessageMode.name = "RepeatMessage";

RepeatMessageMode.activate = function(socketio, options) {

  options = options || {};
  options.message = options.message || "All work and no play makes Jack a dull boy.\n";
  options.minDelay = options.minDelay || 325;
  options.maxDelay = options.maxDelay || 80;
  options.lineEndDelay = options.lineEndDelay || 700;

  this.options = options;
  this.socketio = socketio;

  createKeyEvent(socketio, 0, options);
}

RepeatMessageMode.deactivate = function() {
  timers.clearTimeout(nextTimeout);

}

module.exports = RepeatMessageMode;
