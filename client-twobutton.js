`use strict`


var Input = require('./lib/mock-input');
var Discoverer = require('./lib/discoverer');
var Promise = require('bluebird');
var Socket = require('./lib/socket-client');



/**
 *  adapt the input to the socket
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
    self.input = input;
    self.socket = socket;
}


Adapter.prototype.setSocket = function setSocket(socket) {
    self.socket = socket;
}

/**
 * send data over the websocket
 * if no websocket connection is active, cache the latest button pressed
 */
Adapter.prototype.send = function send(button) {
    if (typeof button === 'undefined')
	throw new Error('first param sent to send() must be a button name');

    if (!self.socket)
	self.lastButton = button;
    else
	//self.socket.send();
	console.log(self.socket);
	
}


var adapter = new Adapter();
var disco = new Discoverer();
var input = new Input().begin();






// poll the discovery module every 1s until we get a list of discovered servers
// use the list of discovered servers to find the suitable D3VICE server
var pollDiscoTimer = setTimeout(function() {

    var discoList = disco.getDiscovered();
    
    var connectionList = new Promise.mapSeries(discoList, function(server) {
	// for each server in the list, return a promise of a connection.
	// these fulfilled/rejected promises will be used to deterimine
	// which connection to use for the game.
	if (typeof server.addresses === 'undefined')
	    throw new Error('server found by discoverer has no addresses. '+server);
	return new Socket(server.addresses[0], server.port)
	    .connect()
	    .catch(function(err) {
		console.log(err);
	    })
    })
    
    // go through the connections and filter out any that had connection issues
    .filter(function(primus) {
	
	if (typeof primus === 'undefined')
	    return false;
	
	if (typeof primus.id === 'undefined')
	    return false

	return true
	
    })
    
    
    .then(function(p) {
	console.log(p.length);
	return p;
    })

    .mapSeries(function(primus) {
	// got valid primus objects

	//console.log(primus);
	primus.on('data', function(d) {
	    primus.id(function(id) {
		console.log('%s got data', id);
		console.log(d);		
	    });
	});


    })



}, 2000);













input.on('button', function(b) {

    if (b === 'red')
	adapter.send('red')

    if (b === 'green')
	adapter.send('green');

    if (b === 'start')
	adapter.send('start');

    if (b === 'stop')
	adapter.send('stop');

    if (b === 'clear')
	adapter.send('clear');

});

