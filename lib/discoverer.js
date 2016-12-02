var mdns = require('mdns-js');
var debug = require('debug')('d3vice-gameserver:discoverer')
var Promise = require('bluebird');
var _ = require('lodash');
var assert = require('chai').assert;
var SocketClient = require('./socket-client');
var EventEmitter = require('events').EventEmitter;
var util = require('util');




/**
 * discovers D3VICE servers on the network using mdns
 * stores found servers in self._inventory
 *
 */
var Discoverer = function Discoverer() {
    var self = this;
    
    self._inventory = [];
    self.foundSockets = [];
    self.pollTimer;



    self.isValidDevice = function validDevice(service) {
	if (typeof service.fullname !== 'string')
	    return false
	
	if (service.fullname.substring(0,6) === 'D3VICE')
	    return true

	return false
    };

    
    //self.browser = mdns.createBrowser(mdns.tcp('http')); // old mdns lib
    self.browser = mdns.createBrowser();
    
    self.browser.on('ready', function() {
	self.browser.discover();
    });

    self.browser.on('update', function(service) {
	debug('browser data');
	debug(service);
	if (self.isValidDevice(service)) {
	    console.log('service up: %s %s %s', 
			service.fullname, 
			service.addresses[0],
			service.port
	    );

	    // add the service to discoverer inventory if not already
	    if ( typeof _.find(self._inventory, service) === 'undefined')
		self._inventory.push(service);
	    }
    });

    
    EventEmitter.call(self);

    return self;
}
util.inherits(Discoverer, EventEmitter);





/**
 * getDiscovered
 *
 * @returns {array} inventory - the inventory of mdns results which match 'D3VICE'
 */
Discoverer.prototype.getDiscovered = function getDiscovered() {
    var self = this;
    return self._inventory;
}



/**
 * getFoundSockets
 *
 * @returns {Promise} - A Promise which will resolve to 
 *                      an array of primus handles belonging to a valid D3VICE server
 */
Discoverer.prototype.getFoundSockets = function getFoundSockets() {
    var self = this;

    return new Promise(function(resolve) {
	self.once('found', function(f) {
	    setTimeout(function() {
		// a dirty hack to make sure we return more than one found socket
		// in the case that there were more than one sockets found
		// a few ms after the first
		resolve(self.foundSockets);
	    }, 2000);
	});
    });

}


/**
 * getFoundSocket
 *
 * returns the first found socket
 *
 * @returns {Promise} - a Promise which will resolve to
 *                      an {array} of primus handles belonging to a valid D3VICE server
 */
Discoverer.prototype.getFoundSocket = function getFoundSocket() {
    var self = this;

    return new Promise(function(resolve) {
	self.once('found', function(f) {
	    debug('socket found event');
	    resolve(self.foundSockets[0]);
	});
    })
}







/**
 * @returns {Discoverer} self
 */
Discoverer.prototype.poll = function poll() {
    var self = this;

    // poll the discovery module every 1s until we get a list of discovered servers
    // use the list of discovered servers to find the suitable D3VICE server
    self.pollTimer = setTimeout(function() {
	
	var discoList = self.getDiscovered();
	
	var connectionList = new Promise.mapSeries(discoList, function(server) {
	    // for each server in the list, return a promise of a connection.
	    // these fulfilled/rejected promises will be used to deterimine
	    // which connection to use for the game.
	    if (typeof server.addresses === 'undefined')
		throw new Error('server found by discoverer has no addresses. '+server);

	    return new SocketClient()
		.connect(server.addresses[0], server.port)
		.catch(function(err) {
		    debug('there was an error during socket setup');
		    debug(err);
		})


	})
	
	// go through the connections and filter out any that had connection issues
	    .filter(function(primus) {

		debug('filtering %s', primus);
		
		if (typeof primus === 'undefined')
		    return false;
		
		if (typeof primus.id === 'undefined')
		    return false;
		
		return true;
		
	    })
	
	
	    .then(function(p) {
		debug('p.length=%s', p.length);
		return p;
	    })
	
	    .mapSeries(function(primus) {
		// got valid primus objects
		// stash the socket handles for later use
		self.foundSockets.push(primus);
		self.emit('found');
	    })
    }, 2000);

    return self;

}



Discoverer.prototype.stopPoll = function  stopPoll() {
    var self = this;
    clearInterval(self.pollTimer);
}






module.exports = Discoverer;





