`use strict`


var Input = require('./lib/mock-input');
var Discoverer = require('./lib/discoverer');
var Promise = require('bluebird');
var Socket = require('./lib/socket-client');
var Adapter = require('./lib/adapter');
var debug = require('debug')('d3vice-gameserver:client-twobutton');






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
		debug('there was an error');
		debug(err);
	    })
    })
    
    // go through the connections and filter out any that had connection issues
    .filter(function(primus) {
	
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

	// associate the primus object with the adapter
	// the button presses call the adapter.
	// if a socket is available to the adapter,
	// the adapter uses the socket to send data to the server
	adapter.setSocket(primus);

	//console.log(primus);
	primus.on('data', function(d) {
	    primus.id(function(id) {
		debug('%s got data', id);
		debug(d);
	    });
	});
    })



}, 2000);













input.on('button', function(b) {

    if (b === 'red')
	adapter.send({'button': 'red'})

    if (b === 'green')
	adapter.send('{'green');

    if (b === 'start')
	adapter.send('start');

    if (b === 'stop')
	adapter.send('stop');

    if (b === 'clear')
	adapter.send('clear');

});

