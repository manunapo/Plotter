var serial = require( 'serialport' );
var events = require('events');

var SerialPort = serial.SerialPort;
 
// Replace with the device name in your machine.
var portName = "COM6";

//If isFirst so send 'S'
var isFirst = true;

var isWaiting = false;

var serialPort = new SerialPort( portName, {
    baudrate : 115200
});

function send( data){
    serialPort.write( data);
    console.log("send: "+ data);
}

function sendSpecial( data){
    if(( data == "A")||(data == "Z")||(data == "S")||(data == "T")){
        send( data);
    }else{
        //is a number
        var strC = "" + (parseInt( data) * 10000);
        for( var i = 0; i < strC.length; i++){
            send(strC.charAt(i));
        }
        send('.');
    }
}


var OnDataEvent = function( ops) { this.ops = ops; };

OnDataEvent.prototype = new events.EventEmitter;
 
OnDataEvent.prototype.check = function() {
    var self = this;
    setInterval(function() {
        if(self.ops.hasNext() && isWaiting){
            isWaiting = false;
            self.emit('hasNext');
        }
    }, 30);
};



var socket;
var ops;
var checkEvent;

module.exports = {

    init:function( s, o){
        socket = s;
        ops = o;
        if(isFirst){
            checkEvent = new OnDataEvent( ops);
            checkEvent.on('hasNext', function(){
                sendSpecial(ops.getNext());
            }).check();
            isFirst = false;
        }
    },

    startSending:function(){
        send( 'S');
    },

    reset:function(){
        serialPort.flush();
    },

    startListening:function ( ) {
        
        serialPort.on( 'data', function ( data) {
            console.log("received:"+data.toString());
            isWaiting = false;
            if(data.toString() == "@"){
                isWaiting = true;
            }
            if(data.toString() == "%"){
                console.log("Envio response");
                var msj = 'working';
                if( ops.lastCoord()){
                    msj = 'ready';
                }
                socket.emit('response', msj);
                isWaiting = true;
            }
        });
    },

    endConnection:function( socket){
        send( 'T');
        console.log("Transmission ended");
        isWaiting = false;
    }
};