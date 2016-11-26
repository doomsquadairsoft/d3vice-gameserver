'use strict';

var Primus = require('primus');
var debug = require('debug')('d3vice-gameserver:socket-server');


var SocketServer = function SocketServer(httpServer) {
    if (typeof httpServer === 'undefined')
	throw new Error('SocketServer must receive an http server instance as first param');

    this.httpServer = httpServer;
    
    this.serverOpts = {
	transformer: 'websockets'
    };

    this.primus = new Primus(httpServer, this.serverOpts);

    this.primus.on('connection', function connection(spark) {
	debug('new connection with %s', spark.id);

	spark.on('data', function received(data) {
	    debug('%s received message ↓', spark.id);
	    debug(data);
	    spark.write(data);
	});

	// @todo delete
	// mock data writing for testing purposes
	setInterval(function() {
	    spark.write({'test': 'data123'});
	}, 5000);
    });

    return this;
}

SocketServer.prototype.getPort = function getPort() {
    var self = this;
    var port = self.httpServer.port;
    
    return port
}


module.exports = SocketServer;
