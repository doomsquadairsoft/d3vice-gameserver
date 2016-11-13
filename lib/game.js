var assert = require('chai').assert;
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var util = require('util');



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
    

    this.timers = function() {
	// for each team, create a timer
	var t = [];
	for (i=0; i<this.teams.length; i++) {
	    t[i] = 0;
	}
	return t;
    }

    EventEmitter.call(this);

    return this;

}
util.inherits(Game, EventEmitter);





Game.prototype.start = function start() {
    this.run();
    return this;
}



/**
 *
 * @param [winningTeam] the team which won the round
 */
Game.prototype.stop = function stop(winningTeam) {

    var self = this;

    // stop the run loop
    self.isRunning = false;

    // stop any timers

    if (winningTeam) {
	assert.isNumber(winningTeam, 'winningTeam passed to stop() was not a number');
	self.emit('win', winningTeam);
    }
    return self;
}


Game.prototype.run = function run() {

    var self = this;

    // see if the team in control has won the game
    if (self.timers[self.controlTeam] >= self.timeToWin) {
	self.stop(self.controlTeam);
    }
    
    

    if (self.isRunning) process.nextTick(run);
    return self;
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
