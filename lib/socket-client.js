var Primus = require('primus');
var Promise = require('bluebird');
var debug = require('debug')('d3vice-gameserver:socket-client');




/**
 * create a socket connection with the server
 *
 */
var SocketClient = function SocketClient() {
    var self = this;
    self.address;
    self.port;
    self.uri;



    return self;
}


/**
 * connect
 *
 * @param {string} address - address of the socket server
 * @param {number} port - port of the socket server
 */
SocketClient.prototype.connect = function connect(address, port) {
    var self = this;

    if (typeof address === 'undefined')
	throw new Error('first parameter sent to SocketClient must be a {string} address. got undefined.');
    if (typeof port === 'undefined')
	throw new Error('second paramemter sent to SocketClient must be a {number} port. got undefined.');

    var primusOptions = {transformer: 'websockets'};
    
    self.address = address;
    self.port = port;
    self.uri = 'http://'+self.address+':'+self.port+'/primus';

    // validate uri
    validRegex = /http:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]+\/primus/;
    if (!validRegex.test(self.uri))
	return new Promise.reject(new Error('invalid url. '+self.uri));

    var Socket = Primus.createSocket(primusOptions);
    self.primus = new Socket(self.uri);

    debug('connecting to socket %s', self.uri);

    return new Promise(function(resolve, reject) {
	self.primus.on('open', function() {
	    debug('opened. promise resolved for %s', self.uri);
	    resolve(self.primus);
	});
	
	self.primus.on('error', function(err) {
	    debug(err);
	    reject('errored for '+self.uri);
	});

	self.primus.on('timeout', function() {
	    debug('timed out');
	    reject('timed out for '+self.uri);
	});    
    });
    
}








module.exports = SocketClient;
