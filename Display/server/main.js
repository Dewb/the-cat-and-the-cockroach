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
var serverModeList = {
  "SerialInput": require('./modes/serialInput.js'),
  "RepeatMessage": require('./modes/repeatMessage.js'),
}
var currentMode = null;

function setServerMode(newModeName, options) {
  if (newModeName in serverModeList) {
    if (currentMode != null) {
      currentMode.deactivate();
    }
    currentMode = serverModeList[newModeName];
    currentMode.activate(socketio, options);
  }
}

setServerMode("SerialInput", {});

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



