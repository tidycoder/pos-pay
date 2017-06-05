
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


var exists = 'COM5';
var exists2 = 'COM6';

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

function processRecv(recv_buffer){
	var view = new DataView(recv_buffer.buffer);
	var lenth = view.getUint16(1);
	if (recv_buffer.length >= length){
		var blocks = decodePosData(recv_buffer.buffer);
		console.log(blocks);
	}

}


port2 = new SerialPort(exists2, {}, true, function () {
	var recv_buffer = new Uint8Array(0);
	port2.addListener('data', function(recvData) {
	 	alert("success receive data!!");
	 	console.log(recvData);
	 	recv_buffer = concatBuffers(recv_buffer, recvData);

	 	processRecv(recv_buffer);
  	});
});


payElement.onclick = function() {

	if (!port) {

		port = new SerialPort(exists, {}, true, function() {
			console.log("serial port opened!");
		});

	}
	else {
		port.write( new Buffer(encodePosData()), function(err) {
	    	if (err) {
	    		console.log("error: " + err);
	    	}
	    })
	}


}

