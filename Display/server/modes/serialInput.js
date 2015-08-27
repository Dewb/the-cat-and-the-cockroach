// Serial communication to Arduino or virtual serial port
var serial = require("serialport");

// Log input to the filesystem
var fs = require("fs");
var logFile = fs.createWriteStream("/Users/dewb/blunderwood_log", { flags: 'a' });

var defaultArduinoPortName = "/dev/virtual-tty";

var hardwarePortPrefixes = {
  'darwin': '/dev/cu.usbmodem',
  'win32': 'COM',
  'win64': 'COM',
  'linux': '/dev/ttyACM'
}

var os = require('os');
var portPrefix = hardwarePortPrefixes[os.platform()];

function byteToHTML(byte) {
  if (byte == 0x08 || byte == 0x7F) { // backspace
    return '«';
  }   

  return String.fromCharCode(byte);
}

function ab2str(buf) {
  return byteToHTML.apply(null, new Uint16Array(buf));
}

var SerialInputMode = {};

SerialInputMode.name = "SerialInput";

SerialInputMode.activate = function(socketio, options) {

  this.options = options;
  this.socketio = socketio;
  var modeContext = this;

  var arduinoPortName = defaultArduinoPortName;

  serial.list(function (err, ports) {
    ports.forEach(function(port) {
      if (port.comName.substring(0, portPrefix.length) == portPrefix) {
        arduinoPortName = port.comName;
      }
    });
 
    var arduinoPort = new serial.SerialPort(arduinoPortName, {
      baudrate: 115200,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      flowControl: false
    });

    modeContext.arduinoPort = arduinoPort;

    arduinoPort.on("open", function () {
      console.log('Serial connection to ' + arduinoPortName + ' established');

      arduinoPort.on('data', function(rawdata) {
        var data = ab2str(rawdata);
        console.log('data received: ' + data);
        logFile.write(data);
        socketio.emit('t', data);
      });
    });
  });

}

SerialInputMode.getOptions = function() {
  return this.options;
}

SerialInputMode.updateOptions = function(options) {
  this.options = options;
}

SerialInputMode.deactivate = function() {

  this.arduinoPort.close();
  this.arduinoPort = null;

}

module.exports = SerialInputMode;
