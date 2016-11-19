var assert = require('chai').assert;
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var debug = require('debug')('d3vice-gameserver:domination');



var Game = function Game(options) {
    
    this.defaultOptions = {
	teams: [0, 1],
	controlTeam: -1,
	timeToWin: ( 1000 * 60 * 15 ), // 15 mins
	isRunning: false
    };

    this.opts = _.defaults(options, this.defaultOptions, {});

    this.teams = this.opts.teams;
    this.controlTeam = this.opts.controlTeam;
    this.timeToWin = this.opts.timeToWin;
    this.isRunning = this.opts.isRunning;
    
    assert.isArray(this.teams, 'teams passed to Game() was not an Array');
    assert.isNumber(this.controlTeam, 'controlTeam passed to Game() was not a number');
    assert.isNumber(this.timeToWin, 'timeToWin passed to Game() was not a number');
    assert.isBoolean(this.isRunning, 'isRunning passed to Game() was not a boolean');
    

    var self = this;
    this.timers = (function() {
	// for each team, create a timer
	var t = [];
	for (i=0; i<self.teams.length; i++) {
	    t[i] = 0;
	}
	return t;
    })();

    this.eventHistory = [];


    EventEmitter.call(this);

    return this;

}
util.inherits(Game, EventEmitter);





Game.prototype.start = function start() {
    var self = this;
    var now = new Date().getTime();
    self.eventHistory.push({'start': new Date().getTime()});
    self.startTime = now;
    self.lastTickTime = now;
    self.isRunning = true;
    setTimeout(function() {self.run()}, 0);
    return self;
}



/**
 *
 * @param [winningTeam] the team which won the round
 */
Game.prototype.stop = function stop(winningTeam) {

    var self = this;

    // log stop event in history
    self.eventHistory.push({'stop': new Date().getTime()});

    // stop the run loop
    self.isRunning = false;

    // stop any timers
    if (winningTeam) {
	assert.isNumber(winningTeam, 'winningTeam passed to stop() was not a number');
	self.emit('win', winningTeam);
    }
    return self;
}



Game.prototype.clear = function clear() {
    var self = this;

    // only clear if a game is not running
    if (!self.isRunning) {
    
	// clear the team timers
	for (var i=0; i<self.timers.length; i++) {
	    self.timers[i] = 0;
	}
	
	// clear the controlTeam
	self.controlTeam = -1;

	// erase event history
	self.eventHistory = [];
    }
	
    return self;
}


Game.prototype.run = function run() {

    assert.instanceOf(this, Game, '`this` is not an instance of Game. Check yo code!');

    var self = this;
    //console.log('running. isRunning=%s', self.isRunning);


    // if the game is running (not paused), run calculations
    if (self.isRunning) {

	// if there is a team in control of the capture point, run calculations
	if (self.controlTeam !== -1) {


	    // see if the team in control has won the game
	    if (self.timers[self.controlTeam] >= self.timeToWin) {
		console.log('team %s has won the game', self.controlTeam);
		self.stop(self.controlTeam);
	    }


	    // increment the timer of the team in control
	    self.timers[self.controlTeam] += (new Date().getTime() - self.lastTickTime);
	
	}


	// debug msgs
	debug('timer_red=%s, timer_green=%s', self.timers[0], self.timers[1]);
	if (new Date().getTime() - self.startTime % 1000)
	    debug('tick');

	// keep track of time
	self.lastTickTime = new Date().getTime();

	// keep running
	//process.nextTick.call(self, run);
	//process.nextTick(run.call(self));
	//process.nextTick(run)
	setTimeout(function() {self.run()}, 0);
    }
    

    //return self;
}


Game.prototype.setControlTeam = function setControlTeam(team) {
    
    var self = this;
    assert.isNumber(team, 'the team passed to setControlTeam was not a number');
    assert.include(self.teams, team, 'the team number passed to setControlTeam did not exist in this game\'s team array');

    // set the team which has control of the point
    self.controlTeam = team;
    
    // stop the loosing team's counter
    // start the gaining team's counter
    
    return self;
}


module.exports = Game;
