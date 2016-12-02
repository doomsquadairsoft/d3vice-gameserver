`use strict`


var Input = require('./lib/mock-input');
var Client = require('./lib/d3vice-client');
var Pammy = require('./lib/public-address');
var debug = require('debug')('d3vice-gameserver:client-twobutton-pa');


var input = new Input().begin();
var client = new Client().start();
var adapter = client.adapter;
var pammy = new Pammy(adapter);



debug('accessing d3vice client adapter');
debug(adapter);


pammy.play('./sounds/test.ogg')
    .catch(function(e) {
	debug('problem while playing soundfile');
	debug(e);
    })
    .then(function() {
	debug('sound played!');
	return pammy.say('domination');
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

