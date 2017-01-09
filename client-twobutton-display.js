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

console.log(adapter);




adapter.listen();
adapter.on('heartbeat', function(inf) {
    console.log('got heartbeat.');
    console.log(inf);
    
});

adapter.on('data', function(dta) {
    //console.log('got data');
    //console.log(dta);
    if (typeof dta.heartbeat !== 'undefined') {
	var hb = dta.heartbeat;
	var ct = hb.controlTeam;
	var t = hb.timers[ct] || 0;
	var ttw = hb.timeToWin;
	
	console.log('ct=%s, t=%s, ttw=%s', ct, t, ttw);

	display.setColor((ct === 1) ? 'green' : 'red', (ttw/t));

		// |  { heartbeat:
		//      12:55:10 AM gameClient.1 |     { isRunning: true,
		// 				      12:55:10 AM gameClient.1 |       startTime: 1483922934677,
		// 				      12:55:10 AM gameClient.1 |       lastTickTIme: 1483923310000,
		// 				      12:55:10 AM gameClient.1 |       teams: [ 0, 1 ],
		// 				      12:55:10 AM gameClient.1 |       controlTeam: 1,
		// 				      12:55:10 AM gameClient.1 |       timeToWin: 900000,
		// 				      12:55:10 AM gameClient.1 |       timers: [ 0, 283202 ] } }
    }
});


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

