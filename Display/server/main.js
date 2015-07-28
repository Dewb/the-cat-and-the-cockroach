var os = require('os');

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

// Socket.io communications with screen and control clients

var socketio = require('socket.io')(server);

socketio.on('connection', function (socket) {
  console.log("New socket connection");

  socket.on('reload', function () {
    socket.broadcast.emit('reload');
  });

  socket.on('disconnect', function () {
  });

});

// Log input to the filesystem

var fs = require("fs");
var logFile = fs.createWriteStream("/Users/dewb/blunderwood_log", { flags: 'a' });

// Serial communication to Arduino or virtual serial port

var serial = require("serialport");
var arduinoPortName = "/dev/virtual-tty";

var hardwarePortPrefixes = {
  'darwin': '/dev/cu.usbmodem',
  'win32': 'COM',
  'win64': 'COM',
  'linux': '/dev/ttyACM'
}

var portPrefix = hardwarePortPrefixes[os.platform()];

serial.list(function (err, ports) {
  ports.forEach(function(port) {
    if (port.comName.substring(0, portPrefix.length) == portPrefix) {
      arduinoPortName = port.comName;
    }
  });
});

var arduinoPort = new serial.SerialPort(arduinoPortName, {
  baudrate: 115200,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

arduinoPort.on("open", function () {
  console.log('Serial connection to ' + arduinoPortName + ' established');

  arduinoPort.on('data', function(data) {
    console.log('data received: ' + data);
    logFile.write(data);
    socketio.emit('t', ab2str(data));
  });
});

