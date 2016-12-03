
var Epoll = require('epoll').Epoll;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');



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

    var valuefd = fs.openSync('/syc/class/gpio_sw/PC4/data', 'r');
    var buffer = new Buffer(1);


    var poller = new Epoll(function(err, fd, events) {
	fs.readSync(fd, buffer, 0, 1, 0);
	console.log(buffer.toString() === '1' ? 'released' : 'pressed');
    });

    // Read the GPIO value file before watching to
    // prevent an additional unauthentic interrupt.
    fs.readSync(valuefd, buffer, 0, 1, 0);

    // start watching for interrupts
    poller.add(valuefd, Epoll.EPOLLPRI);

    // stop watching after 30 seconds.
    setTimeout(function() {
	poller.remove(valuefd).close();
    }, 30000);
    
    /* self.greenButton.watch(function(err, val) {
       if (err) throw err;
       self.led.writeSync(val);
       self.emit('button', 'green');
     * });

     * self.redButton.watch(function(err, val) {
       if (err) throw err;
       self.led.writeSync(val);
       self.emit('button', 'red');
     * });
     */

    // when the process wants to exit, unexport the GPIO pins from userspace
    process.on('SIGINT', function() {
	console.log('UNEXPORTING GPIO');
	//self.greenButton.unexport();
	//self.redButton.unexport();
	//self.led.unexport();
	process.exit();
    });

    return self;
}






module.exports = Input;


