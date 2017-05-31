
var SerialPortFactory = require('chrome-serialport');
SerialPortFactory.extensionId = 'blpiikpknmobbfcmohnbmkjcobihpgaa';


var SerialPort = SerialPortFactory.SerialPort;

var decodePosData = require('./pos_recv');

var encodePosData = require('./pos_send');


var payElement = document.getElementById("test");


var exists = 'COM5';
var exists2 = 'COM6';
var port2 = new SerialPort(exists2, {}, function () {
 	port2.once('data', function(recvData) {
 	alert("success receive data!!");
 		console.log(recvData);
  	});
});

payElement.onclick = function() {

	var port = new SerialPort(exists, function() {
        port.write(encodePosData(), function(err) {
         	port.close();
        })
    })

}

