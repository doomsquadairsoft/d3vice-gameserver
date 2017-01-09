

/**
 * Adapts input events to network sockets
 * 
 * or vice versa
 */



var debug = require('debug')('d3vice-gameserver:adapter-client');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Promise = require('bluebird');



/**
 *  adapt the input to the socket
 *
 * @param {} input - 
 * @param {Primus} socket - primus client instance
 */
var Adapter = function Adapter(input, socket) {
    var self = this;
    
    self.input = input || null;
    self.socket = socket || null;
    self.lastData = '';

    EventEmitter.call(self);
}
util.inherits(Adapter, EventEmitter);



/**
 * Bridge the input with the socket
 */
Adapter.prototype.connect = function connect(input, socket) {
    var self = this;
    self.input = input;
    self.socket = socket;
    return self;
}



/**
 * setSocket
 *
 * Define the Adapter's socket connection.
 * the socket connection is used to send button events to the server
 * during normal operation, the Adapter starts out with no socket connection.
 * the Adapter is given a socket connection once the discover module (mdns)
 * finds a valid connection to the server
 * 
 * @param {Primus} socket - a primus client instance
 */
Adapter.prototype.setSocket = function setSocket(socket) {
    var self = this;
    self.socket = socket;
    return self;
}


/**
 * listen
 *
 * listen for and handle events emitted by the socket server
 */
Adapter.prototype.listen = function listen() {
    var self = this;

    if (!self.socket) {
	debug('no socket available for listening. trying again in 1s');
	setTimeout(function(){self.listen()}, 1000);
    }

    else {
	debug('listening to socket.');
	debug(self.socket);
	self.socket.on('data', function(data) {
	    debug('got data from socket server');
	    debug(data);
	    self.emit('data', data);
	});
    }
}


/**
 * send data over the websocket
 * if no websocket connection is active, cache the latest data received
 *
 * @param {string|object} button
 */
Adapter.prototype.send = function send(data) {
    var self = this;
    if (typeof data === 'undefined')
	throw new Error('first param sent to send() must be defined');

    if (typeof self.socket === 'undefined' || self.socket === null)
	self.lastData = data;
    else {
	// send the data over the socket
	debug('adapter has a socket');
	debug(self.socket.host);
	self.socket.write(data);
    }
	
    return self;
}



/**
 *
 */


module.exports = Adapter;

