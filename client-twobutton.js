`use strict`


var Input = require('./lib/mock-input');
var Client = require('./lib/d3vice-client');
var debug = require('debug')('d3vice-gameserver:client-twobutton');


var input = new Input().begin();
var client = new Client().start();
var adapter = client.adapter;


debug('accessing d3vice client adapter');
debug(adapter);



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

