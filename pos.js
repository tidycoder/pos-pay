
var SerialPortFactory = require('chrome-serialport');
//SerialPortFactory.extensionId = 'blpiikpknmobbfcmohnbmkjcobihpgaa';
SerialPortFactory.extensionId = 'gmgafhiagfafhfdgjobcphfgdcnndcjc';



var SerialPort = SerialPortFactory.SerialPort;

var decodePosData = require('./pos_recv');

var encodePosData = require('./pos_send');

var port;
var port2;

var payElement = document.getElementById("test");

SerialPortFactory.isInstalled(function(err){
	console.log("is installed : " + err);
});



var exists = null;
SerialPortFactory.list(function(err, data){
  console.log(data);
  var r = new RegExp('Landi*');
  for (var i = 0; i < data.length; ++i) {
  	if (r.test(data[i].manufacturer)) {
  		exists = data[i].comName;
  		break;
  	}
  }
  if (exists == null) {
  	alert('no available com!');
  } else {
  	console.log('use com :' + exists);
  }
});

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




/*
0x0900	0x0001	"银行卡：A （大写A的ascii码） 
微信：B （大写B的ascii码）
支付宝：C （大写C的ascii码）"
0x0901	0x0001	"0X01：消费 
"
0x0902	LLVar	交易金额（最小位分）举例：‘200000’长度为6，表示2000元
0x0903	LLVar	订单号 （最长为32的字符串）
0x0904	LLVar	商户号
0x0905	LLVar	商户名
0x0906	LLVar	终端号
0x0907	LLVar	收单行号
0x0908	LLVar	发卡行号
0x0909	LLVar	发卡行名
0x090A	LLVar	POS中心号
0x090B	LLVar	卡号
0x090C	LLVar	刷卡类型（S、M、I）
0x090D	LLVar	批次号
0x090E	LLVar	凭证号
0x090F	LLVar	授权码
0x0910	LLVAR	参考号
0x0911	LLVAR	交易日期
0x0912	LLVar	交易时间
0x0913	LLVAR	备注信息（reference）
0x0914	LLVAR	返回码
0x0915	LLVar	返回码中文解释  
0x091A	LLVar	(前6位作收银票号需打印，后14位条码号在底部打印条码)
0x091B	LLVar	卡片有效期
0x091C	LLVar	电子现金余额，标准查询余额
0x091D	LLVar	总计金额
0x091E	LLVar	门店号
0x091F	LLVar	POS机号
*/
function makePosResult(blocks) {
	var result = {};
	for (var i = 0; i < blocks.length; ++i) {
		var block = blocks[i];
		switch(blocks.tag) {
			case 0x0900:
				result.payTpe = block.value;
				break;
			case 0x0902:
				result.price = block.value;
				break;
			case 0x0903:
				result.purchaseNumber = block.value;
				break;
			case 0x0904:
				result.merchantNo = block.value;
				break;
			case 0x0905:
				result.merchantName = block.value;
				break;
			case 0x0906:
				result.terminalNo = block.value;
				break;
			case 0x0908:
				result.issuer = block.value;
				break;
			case 0x0909:
				result.issuerName = block.value;
				break;
			case 0x090B:
				result.cardNo = block.value;
				break;
			case 0x090D:
				result.batchNo = block.value;
				break;
			case 0x090E:
				result.voucherNo = block.value;
				break;
			case 0x0910:
				result.referNo = block.value;
				break;
			case 0x0911:
				result.date = block.value;
				break;
			case 0x0912:
				result.time = block.value;
				break;
			case 0x0914:
				result.returnCode = block.value;
				break;
			default:
				console.log("pos result not handled:" + block.tag);
				break;
		}
	}
	return result;
}

function processRecv(recv_buffer){
	var view = new DataView(recv_buffer.buffer);
	var length = bcd2int(view.getUint16(1));
	console.log("processRecv : " + length);
	if (recv_buffer.length >= length + 5){
		var blocks = decodePosData(recv_buffer.buffer);
		var result = makePosResult(blocks);
		console.log(blocks);
		console.log(result);
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

