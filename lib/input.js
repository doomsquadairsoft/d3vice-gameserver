
var Gpio = require('onoff').Gpio;
var EventEmitter = require('events').EventEmitter;
var util = require('util');



/**
 * Input class
 */
var Input = function Input() {
    this.led = new Gpio('16', 'out');
    this.redButton = new Gpio('12', 'in');
    this.greenButton = new Gpio('18', 'in');

    EventEmitter.call(this);
}
util.inherits(Input, EventEmitter);



Input.prototype.begin = function begin() {

    var self = this;

    self.greenButton.watch(function(err, val) {
	if (err) throw err;
	self.led.writeSync(val);
	self.emit('button', 'green');
    });

    self.redButton.watch(function(err, val) {
	if (err) throw err;
	self.led.writeSync(val);
	self.emit('button', 'red');
    });


    return self;
}






module.exports = Input;


