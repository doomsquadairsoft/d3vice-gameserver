`use strict`


var Input = require('./lib/mock-input');
var Discoverer = require('./lib/discoverer');
var Promise = require('bluebird');
var Adapter = require('./lib/adapter-client');
var debug = require('debug')('d3vice-gameserver:client-twobutton');




var adapter = new Adapter();
var disco = new Discoverer();
var input = new Input().begin();




// poll the discovery module every few seconds
// to find a D3VICE server
disco.poll().getFoundSocket()
    .then(function(primus) {
	// associate the primus object with the adapter
	// the button presses call the adapter.
	// if a socket is available to the adapter,
	// the adapter uses the socket to send data to the server
	adapter.setSocket(primus);
    });





input.on('button', function(b) {

    if (b === 'red')
	adapter.send({'button': 'red'})

    if (b === 'green')
	adapter.send({'button': 'green'});

    if (b === 'start')
	adapter.send({'button': 'start'});

    if (b === 'stop')
	adapter.send({'button': 'stop'});

    if (b === 'clear')
	adapter.send({'button': 'clear'});

});

