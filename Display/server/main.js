// Express serves screen and control interfaces
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var webport = process.env.PORT || 8000;

server.listen(webport, function () {
  console.log('Web server listening at port %d', webport);
});

app.use('/screen', express.static(__dirname + '/../screen'));
app.use('/control', express.static(__dirname + '/../control'));

// Socket.io communicates with screen and control clients
var socketio = require('socket.io')(server);

// Server modes
var SerialInputMode = require('./modes/serialInput.js');
var serverModeList = {};
serverModeList[SerialInputMode.name] = SerialInputMode;

var currentMode = null;

function setServerMode(newModeName, options) {
  if ((currentMode == null || newModeName != currentMode.name) && newModeName in serverModeList) {
    if (currentMode != null) {
      currentMode.deactivate();
    }
    currentMode = serverModeList[newModeName];
    currentMode.activate(socketio, options);
  }
}

setServerMode(SerialInputMode.name, {});

socketio.on('connection', function (socket) {
  console.log("New socket connection");

  socket.on('reload', function () {
    socket.broadcast.emit('reload');
  });

  socket.on('disconnect', function () {
  });

  socket.on('switchServerMode', function (newModeName, options) {
    setServerMode(newModeName, options);
  });

});



