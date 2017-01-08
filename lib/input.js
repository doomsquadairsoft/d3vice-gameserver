
var Gpio = require('onoff').Gpio;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var debug = require('debug')('d3vice-gameserver:input');




/**
 * Input class
 */
var Input = function Input() {
    //this.led = new Gpio('25', 'out');
    this.redButton = new Gpio('23', 'in', 'both');
    this.greenButton = new Gpio('24', 'in', 'both');

    EventEmitter.call(this);
}
util.inherits(Input, EventEmitter);



Input.prototype.begin = function begin() {

    var self = this;
    console.log('let the leds be leds');
    //self.led.writeSync(1);    
    self.greenButton.watch(function(err, val) {
	if (err) throw err;
	debug('green button press');
	//self.led.writeSync(val);
	self.emit('button', 'green');
    });

    self.redButton.watch(function(err, val) {
	if (err) throw err;
	debug('red button press');
	//self.led.writeSync(val);
	self.emit('button', 'red');
    });
       
    
    // when the process wants to exit, unexport the GPIO pins from userspace
    process.on('SIGINT', function() {
	console.log('UNEXPORTING GPIO');
	self.greenButton.unexport();
	self.redButton.unexport();
	//self.led.unexport();
	process.exit();
    });

    return self;
}






module.exports = Input;


