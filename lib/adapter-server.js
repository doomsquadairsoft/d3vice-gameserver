

/**
 * Adapts input events to network sockets
 * 
 * or vice versa
 */



var debug = require('debug')('d3vice-gameserver:adapter-server');




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
    self.lastButton = '';
}



/**
 * bridge the input with the socket
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
 * send data over the websocket
 * if no websocket connection is active, cache the latest button pressed
 *
 * @param {string|object} button
 */
Adapter.prototype.send = function send(button) {
    var self = this;
    if (typeof button === 'undefined')
	throw new Error('first param sent to send() must be a button name');

    if (typeof self.socket === 'undefined')
	self.lastButton = button;
    else {
	debug('adapter has a socket');
	debug(self.socket.write(button));
    }
	
    return self;
}



Module.exports = Adapter;

