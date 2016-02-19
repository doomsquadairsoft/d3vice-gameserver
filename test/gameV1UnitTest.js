var path = require('path');
var assert = require('chai').assert;
var game = require(path.join('..', 'game'));
var ipfs = require('ipfs-api');


describe('Game Unit', function() {
  //var state;

  // before(function() {
  //
  // });
  //
  // after(function() {
  //
  // });

  describe('Bootstrapping', function() {

  });

  describe('Gameplay', function() {

    it('can be stopped', function(done) {
      game.stop(function(err) {
        assert.isNull(err);
        done();
      });
    });

    it('can be started', function(done) {
      game.start(function(err) {
        assert.isNull(err);
        done();
      });
    });

    it('can be paused', function(done) {
      game.start(function(err) {
        assert.isNull(err);
        done();
      })
    });


  }); // end of gameplay



});
