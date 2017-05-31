
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


port2 = new SerialPort(exists2, {}, true, function () {
	port2.once('data', function(recvData) {
	 	alert("success receive data!!");
	 	console.log(recvData);
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

