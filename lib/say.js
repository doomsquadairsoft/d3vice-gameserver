var say = require('say');
var debug = require('debug')('d3vice:pammy');
var Promise = require('bluebird');


defaults = {
  'voice': 'Princess',
  'speed': 1,
  'text': 'hello world'
};


module.exports = function tts(text, voice, speed, cb) {
    if (typeof text === 'undefined')
	throw new Error('say() requires at least a callback as an argument.');
    
    if (typeof text === 'function') {
	cb = text;
	text = defaults.text;
    }
    
    if (typeof voice === 'function') {
	cb = voice;
	voice = defaults.voice;
    }
    
    if (typeof speed === 'function') {
	cb = speed;
	speed = defaults.speed;
    }
    
    if (typeof voice === 'number') {
	speed = voice;
	voice = defaults.voice;
    }
    
    if (typeof voice === 'undefined')
	voice = defaults.voice;
    
    if (typeof speed === 'undefined')
	speed = defaults.speed;
    
    debug('text=%s, voice=%s, speed=%s', text, voice, speed);
    
    
    return new Promise(function(resolve, reject) {
	say.speak(text, voice, speed, function(err) {
	    if (err) reject(err);
	    resolve(null);
	});
    });

  
};
