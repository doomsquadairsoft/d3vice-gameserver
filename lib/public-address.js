
var say = require('say');            // text to speech library
var player = require('play-sound');  // audio file player library
var Promise = require('bluebird');
var debug = require('debug')('d3vice-gameserver:public-address');



var PublicAddress = function PublicAddress(adapter, text, voice, speed) {
    
    var self = this;

    self.defaults = {
	'voice': 'Princess',
	'speed': 1,
	'text': 'hello world'
    };
    
    if (typeof adapter !== 'undefined')
	self.adapter = adapter;
    
    if (typeof voice === 'number') {
	self.speed = voice;
	self.voice = self.defaults.voice;
    }
    
    if (typeof voice === 'undefined')
	self.voice = self.defaults.voice;
    
    if (typeof speed === 'undefined')
	self.speed = self.defaults.speed;

    debug('text=%s, voice=%s, speed=%s', self.text, self.voice, self.speed);


    self.playerOpts = {
	players: [
	    "mplayer",
	    "mpg123",
	    "mpg321",
	    "play",
	    "omxplayer"
	]
    };
    self.player = player(self.playerOpts);

    return self;
};


PublicAddress.prototype.tts = function tts(string) {
    this.speak(string);
}    

PublicAddress.prototype.say = function say(string) {
    this.speak(string);
}

PublicAddress.prototype.speak = function speak(text) {
    var self = this;
    return new Promise(function(resolve, reject) {
	say.speak(text, self.voice, self.speed, function(err) {
	    if (err) reject(err);
	    resolve(null);
	});
    });
}



PublicAddress.prototype.play = function play(filename) {
    var self = this;
    debug('PublicAddres.play()');
    return new Promise(function(resolve, reject) {
	self.player.play(filename, function(err){
	    if (err) reject(err);
	    debug('play complete!');
	    debug(err);
	    resolve(filename);
	})
    })
}





module.exports = PublicAddress;
