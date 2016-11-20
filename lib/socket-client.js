var Primus = require('primus');
var Promise = require('bluebird');





/**
 * create a socket connection with the server
 *
 * @param {string} address - address of the socket server
 * @param {number} port - port of the socket server
 */
var SocketClient = function SocketClient(address, port) {
    if (typeof address === 'undefined')
	throw new Error('first parameter sent to SocketClient must be a {string} address. got undefined.');
    if (typeof port === 'undefined')
	throw new Error('second paramemter sent to SocketClient must be a {number} port. got undefined.');


    var self = this;
    self.address = address;
    self.port = port;
    self.uri = 'http://'+self.address+':'+self.port+'/primus';



    return self;
}



SocketClient.prototype.connect = function connect() {
    var self = this;
    var primusOptions = {transformer: 'websockets'};


    // validate uri
    validRegex = /http:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]+\/primus/;
    if (!validRegex.test(self.uri))
	return new Promise.reject(new Error('invalid url.'));

    var Socket = Primus.createSocket(primusOptions);
    self.primus = new Socket(self.uri);

    console.log('connecting to socket %s', self.uri);

    return new Promise(function(resolve, reject) {
	self.primus.on('open', function() {
	    console.log('opened. promise resolved for %s', self.uri);
	    resolve(self.primus);
	});
	
	self.primus.on('error', function(err) {
	    console.error(err);
	    reject('errored for '+self.uri);
	});

	self.primus.on('timeout', function() {
	    console.log('timed out');
	    reject('timed out for '+self.uri);
	});    
    });
    
}








module.exports = SocketClient;
