'use strict';

var Primus = require('primus');



var SocketServer = function SocketServer(httpServer) {
    if (typeof httpServer === 'undefined')
	throw new Error('SocketServer must receive an http server instance as first param');

    this.serverOpts = {
	transformer: 'websockets'
    };

    this.primus = new Primus(httpServer, this.serverOpts);

    this.primus.on('connection', function connection(spark) {
	spark.on('data', function received(data) {
	    console.log(spark.id, 'received message:', data);
	    spark.write(data);
	});
    });
}


module.exports = SocketServer;
