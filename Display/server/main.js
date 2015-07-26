var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var webport = process.env.PORT || 8000;

var SerialPort = require("serialport").SerialPort;
var arduinoSerial = new SerialPort("/dev/virtual-tty", {
  baudrate: 57600
});

var fs = require("fs");
var logFile = fs.createWriteStream("/Users/dewb/blunderwood_log", { flags: 'a' });

server.listen(webport, function () {
  console.log('Server listening at port %d', webport);
});

app.use('/screen', express.static(__dirname + '/../screen'));
app.use('/control', express.static(__dirname + '/../control'));

io.on('connection', function (socket) {
  console.log("New socket connection");

  socket.on('reload', function () {
    socket.broadcast.emit('reload');
  });

  socket.on('disconnect', function () {
  });
});

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

arduinoSerial.on("open", function () {
  console.log('Opening serial port');

  arduinoSerial.on('data', function(data) {
    console.log('data received: ' + data);
    logFile.write(data);
    io.emit('t', ab2str(data));
  });

});

