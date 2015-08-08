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
//  options.message = options.message || "All work and no play makes Jack a dull boy.\n";
//  options.message = options.message || "Will you marry me, Kristen?\n";
  options.message = options.message || "Save «««««Xxxx Burn the man!\n\n\nWe don't need no water, let the motherfuck««««$%^!er burn!\n\n\n\nwhy do you fellows\npull this stunt i asked him\nbecause it is the conventional\nthing for moths or why\nif that had been an uncovered\ncandle instead of an electric\nlight bulb you would\nnow be a small unsightly cinder\nhave you no sense\n\n\n\nit is better to be part of beauty\nfor one instant and then cease to\nexist than to exist forever\nand never be a part of beauty\nour attitude toward life\nis come easy go easy\nwe are like human beings\nused to be before they became\ntoo civilized to enjoy themselves\n\n\n";
  options.minDelay = options.minDelay || 325;
  options.maxDelay = options.maxDelay || 80;
  options.lineEndDelay = options.lineEndDelay || 1100;

  this.options = options;
  this.socketio = socketio;

  createKeyEvent(socketio, 0, options);
}

RepeatMessageMode.getOptions = function() {
  return this.options;
}

RepeatMessageMode.updateOptions = function(options) {
  this.options = options;
}

RepeatMessageMode.deactivate = function() {
  timers.clearTimeout(nextTimeout);

}

module.exports = RepeatMessageMode;
