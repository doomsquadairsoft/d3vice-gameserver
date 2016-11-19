`use strict`


var Input = require('./lib/mock-input');
var Discoverer = require('./lib/discoverer');
var Promise = require('bluebird');
var Connection = require('./lib/socket-client');



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



// greets https://stackoverflow.com/a/29933215
var waitForDiscoveryEvent = function waitForDiscoveryEvent(type) {
    return new Promise(function(resolve) {
	disco.on(type, resolve);
    });
}



// poll the discovery module every 1s until we get a list of discovered servers
// use the list of discovered servers to find the suitable D3VICE server
var pollDiscoTimer = setInterval(function() {
    var discoList = disco.getDiscovered();
    
    return new Promise.mapSeries(discoList, function(server) {
	// for each server in the list, return a promise of a connection.
	// these fulfilled/rejected promises will be used to deterimine
	// which connection to use for the game.
	return new Connection(server.adddresses[0], server.port);
    })


}, 1000);







var waitForButton = function waitForButton(buttonName) {
    return new Promise(function(resolve) {
	input.on(buttonName, resolve);
    });
};



   


waitForButton('red')
    .then(function() {
	adapter.send('red')
    });

waitForButton('green')
    .then(function() {
	adapter.send('green');
    });

waitForButton('start')
    .then(function() {
	adapter.send('start');
    });

waitForButton('stop')
    .then(function() {
	adapter.send('stop');
    });

waitForButton('clear')
    .then(function() {
	adapter.send('clear');
    });


