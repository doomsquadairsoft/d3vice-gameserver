
/**
 * D3vice client class
 *
 * Client class which other modules can make use of
 * useful for when a d3vice does more than one thing that needs to communicate with the server
 *
 * For example, a d3vice box that runs on a RPi, has two pushbuttons, and a speaker output.
 * For a box like this, it would be good to run a client, d3vice-pammy as well as another client, 
 * d3vice-client-twobutton.
 * instead of needing to open two sockets, one for each client, just use this D3vice client class
 * and d3vice-pammy as well as d3vice-client-twobutton just talk to the socket adapter on this
 * D3vice client class.
 *
 *
 */
 



var Discoverer = require('./discoverer');
var Promise = require('bluebird');
var Adapter = require('./adapter-client');
var debug = require('debug')('d3vice-gameserver:client');



var Client = function Client() {

    var self = this;
    self.adapter = new Adapter();
    self.discoverer = new Discoverer();
    self.isStarted = false;

    self.setAdapterSocket = function setAdapterSocket(primus) {
	debug('setting adapter socket');
	self.adapter.setSocket(primus);
    };

    return self;
}


Client.prototype.start = function start() {

    var self = this;

    // In case two modules try to start this client,
    // ignore all but the first call to start()
    // ie don't do anything if already started
    if (self.isStarted)
	return self;
    

    // poll the discovery module every few seconds
    // to find a D3VICE server
    self.isStarted = true;
    self._discovery = self.discoverer
	.poll()
	.getFoundSocket()
	.then(self.setAdapterSocket);

    return self;
}




module.exports = Client;






