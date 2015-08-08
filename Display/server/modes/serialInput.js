// Serial communication to Arduino or virtual serial port
var serial = require("serialport");
var timers = require("timers");

// Log input to the filesystem
var fs = require("fs");
var logFile = fs.createWriteStream("/home/dewb/blunderwood_log", { flags: 'a' });

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
  } else if (byte == 61) { // extended ASCII chars remapped for Arduino compiler
	return "¼";  
  } else if (byte == 60) {
	return "½";
  } else if (byte == 62) {
	return "¢"; 
  } else if (byte == 92) {
	return "¾";
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
  this.connected = false;
  this.connect();
}

SerialInputMode.retry = function() {
  if (!this.gaveNoSerialWarning) {
    console.log("Could not open a serial device, waiting...");
    this.gaveNoSerialWarning = true;
  }
  var modeContext = this;
  timers.setTimeout(function() { modeContext.connect() }, 5000);
}

SerialInputMode.connect = function() {

  var arduinoPortName = null;
  var modeContext = this;
  
  serial.list(function (err, ports) {
    ports.forEach(function(port) {
      if (port.comName.substring(0, portPrefix.length) == portPrefix) {
        arduinoPortName = port.comName;
      }
    });
  
    if (!arduinoPortName && fs.existsSync(defaultArduinoPortName)) {
       arduinoPortName = defaultArduinoPortName; 
    }
  
    if (!arduinoPortName) {
       modeContext.retry();
       return;
    }
 
    var arduinoPort = new serial.SerialPort(arduinoPortName, {
      baudrate: 115200,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      flowControl: false
    });

    modeContext.arduinoPort = arduinoPort;
    arduinoPort.on("open", function (err) {
      if (err) {
        arduinoPort = null;
        modeContext.retry();
      } else {
        console.log('Serial connection to ' + arduinoPortName + ' established');
        modeContext.connected = true;

        arduinoPort.on('data', function(rawdata) {
          var data = ab2str(rawdata);
          console.log('data received: ' + data);
          logFile.write(data);
          modeContext.socketio.emit('t', data);
        });
        
        arduinoPort.on('close', function() {
          console.log("Serial device disconnected, retrying...");
          this.gaveNoSerialWarning = true;
          modeContext.retry();
        });

        arduinoPort.on('error', function(err) {
          console.log("Unexpected serial device error: " + err);
          arduinoPort.close();
        });
      }
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

  if (this.arduinoPort) {
    this.arduinoPort.close();
    this.arduinoPort = null;
  }
}

module.exports = SerialInputMode;
