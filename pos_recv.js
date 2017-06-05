
/*
*
*  STX(1byte) + LEN(2bytes) + DATA(n bytes) + ETX(1byte) + LRC(1 byte)
* 	STX：0x02
* 	LEN: DATA长度, 两个字节，16进制（大端） 
* 	DATA: 数据
*   详见下文
*		ETX:0x03
*		LRC:从LEN字段开始到ETX字段逐个进行异或的值. (包含LEN，不包含ETX)
*

TAG	Length(BYTE)	Value

0x0900	0x0001	"银行卡：A （大写A的ascii码） 微信：B （大写B的ascii码） 支付宝：C （大写C的ascii码）"
0x0901	0x0001	"0X01：消费 "
0x0902	LLVar	交易金额（最小位分）举例：‘200000’长度为6，表示2000元
0x0903	LLVar	订单号 （最长为32的字符串）

*/

function decode(packet) {

	var pkt = unpackage(packet);

	var res = checkPkt(pkt);

	if (res.error != 0) {
		console.log("unpackage pos data error: " + res.error);
	}

	var blocks = TlvBlocks(pkt.dataBuffer);

	return blocks;
}

function unpackage(packet) {
	var pkt = {};

	var view = new Uint8Array(packet, 0);
	pkt.stx = view[0];

	view = new DataView(packet, 1);
	pkt.dataLength = view.getUint16(0);

	view = new Uint8Array(packet, 3, pkt.dataLength);
	pkt.dataBuffer = view.buffer;

	view = new Uint8Array(packet, pkt.dataLength + 3, 2);
	pkt.etx = view[0];
	pkt.lrc = view[1];

	pkt.pktLength = packet.byteLength;

	view = new Uint8Array(packet, 1, pkt.dataLength + 2);
	var lrc = 0;
	for (var i = 0; i < view.length; ++i) {
		lrc = lrc^view[i];
	}
	pkt.calc_lrc = lrc;
}

function checkPkt(pkt) {
	var res = {};
	res.error = 0;

	if (pkt.stx != 0x02) {
		res.error = -1;
	}

	if (pkt.etx != 0x03) {
		res.error = -2;
	}

	if (pkt.pktLength != pkt.dataBuffer.byteLength + 5) {
		res.error = -3;
	}

	if (pkt.lrc != pkt.calc_lrc) {
		res.error = -4;
	}

	return res;
}

function TlvBlocks(dataBuffer) {
	var blocks = [];

	var offset = 0;

	while (offset < dataBuffer.byteLength) {
		var view = new DataView(dataBuffer, offset);
		var block = {};
		block.tag = view.getUint16(0);
		block.dataLength = view.getUint16(2);
		
		view = new Uint8Array(dataBuffer, offset + 4);
		if (block.dataLength == 1) {
			block.value = view[0];
		} else {
			block.value = '';
			for (var i = 0; i < block.dataLength; ++i) {
				block.value += String.fromCharCode(view[i])
			}
		}

		offset += (4 + block.dataLength);
	}

	return blocks;
}


module.exports = decode;