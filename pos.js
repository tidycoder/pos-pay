
var SerialPortFactory = require('chrome-serialport');
SerialPortFactory.extensionId = 'blpiikpknmobbfcmohnbmkjcobihpgaa';


var SerialPort = SerialPortFactory.SerialPort;

var decodePosData = require('./pos_recv');

var encodePosData = require('./pos_send');

var port;
var port2;

var payElement = document.getElementById("test");

SerialPortFactory.isInstalled(function(err){
	console.log("is installed : " + err);
});


SerialPortFactory.list(function(err, data){
  console.log(data);
});


var exists = 'COM9';
//var exists2 = 'COM6';

function concatBuffers(arr) {

  if (!Array.isArray(arr)) {
    arr = Array.prototype.slice.call(arguments, 0);
  }

  var len = 0, i = 0;
  for (i = 0; i < arr.length; ++i) {
    len += arr[i].byteLength;
  }

  var u8 = new Uint8Array(len);
  var nextIndex = 0;
  for (i = 0; i < arr.length; ++i) {
    u8.set(arr[i], nextIndex);
    nextIndex += arr[i].byteLength;
  }

  return u8;
}

function bcd2int(bcd) {
	var highByte = bcd >> 8;
	var lowByte = bcd & 0xff;
	var hex1 = highByte >> 4;
	var hex2 = highByte & 0x0f;
	var hex3 = lowByte >> 4;
	var hex4 = lowByte & 0x0f;
	return hex1*1000 + hex2*100 + hex3*10 + hex4;
}


function processRecv(recv_buffer){
	var view = new DataView(recv_buffer.buffer);
	var length = bcd2int(view.getUint16(1));
	console.log("processRecv : " + length);
	if (recv_buffer.length >= length + 5){
		var blocks = decodePosData(recv_buffer.buffer);
		console.log(blocks);
	}

}


var recv_buffer = new ArrayBuffer(0);

payElement.onclick = function() {

	if (!port) {

		port = new SerialPort(exists, {}, true, function() {
			console.log("serial port opened!");
			port.addListener('data', function(recvData) {
 	 			console.log(recvData);
 	 			recv_buffer = concatBuffers(recv_buffer, recvData);
 	 			processRecv(recv_buffer);
 	 		})
		});

	}
	else {
		var data =  new Buffer(encodePosData());
		console.log(data);
		port.write(new Buffer(encodePosData()), function(err) {
	    	if (err) {
	    		console.log("error: " + err);
	    	}
	    })
	}


}

