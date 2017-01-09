

/**
 * Adapts socket events to the game
 * 
 * or vice versa
 */



var debug = require('debug')('d3vice-gameserver:adapter-server');
var EventEmitter = require('events').EventEmitter;
var util = require('util');


/**
 *  adapt the socket to the game
 *
 * @param {} game - gameserver class instance
 *                  the game provides hook functions, and we send events to hooks when things happen
 * @param {Primus} socket - primus server instance
 */
var Adapter = function Adapter(game, socket) {
    var self = this;
    
    self.game = game || null;
    self.socket = socket || null;

    debug(self.socket);
    
    self.socket.primus.on('connection', function(spark) {
	
	// when data is received through the socket, send it to the game
	spark.on('data', function(w) {
	    debug('got data event with data');
	    debug(w);

	    if (typeof w === 'undefined')
		return false;

	    // send the data received to the game module
	    self.game.hookInput(w);
	    
	});

	// when game events are generated, forward them through the socket
	self.game.on('heartbeat', function(hb) {
	    spark.write({'heartbeat': hb});
	});
    });

    EventEmitter.call(self);

    return self;
}

util.inherits(Adapter, EventEmitter);







module.exports = Adapter;

