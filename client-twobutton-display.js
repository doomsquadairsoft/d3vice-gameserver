`use strict`


//var Input = require('./lib/input');
var Input = require('./lib/mock-input');
var Client = require('./lib/d3vice-client');
var Display = require('./lib/ws2811');
var debug = require('debug')('d3vice-gameserver:client-twobutton');



var input = new Input().begin();
var client = new Client().start();
var adapter = client.adapter;
var display = new Display();



input.on('button', function(b) {

    if (b === 'red') {
	adapter.send({'button': 'red'})
        display.setColor('red');
    }

    if (b === 'green') {
	adapter.send({'button': 'green'});
	display.setColor('green');
    }
	
    if (b === 'start') {
	adapter.send({'button': 'start'});
	display.setColor('goldenrod');
    }

    if (b === 'stop') {
	adapter.send({'button': 'stop'});
	display.setColor('fuchsia');
    }

    if (b === 'clear') {
	adapter.send({'button': 'clear'});
	display.setColor('darkslateblue');
    }
    

});

