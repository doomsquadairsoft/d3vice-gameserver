var assert = require('chai').assert;
var game = require('../game');
var ipfs = require('ipfs-api');


describe('Game', function() {
  //var state;

  // before(function() {
  //
  // });
  //
  // after(function() {
  //
  // });

  describe('Bootstrapping', function() {
    it('bootstraps, returing D3vice network state', function(done) {
      game.bootstrap(function(err, networkData) {
        assert.isNull(err);
        assert.isJson(networkData);
        assert.isNumber(networkData.meta.version);
        assert.isDefined(networkData.networkState);
        done();
      });
    });

    it('searches for an existing game on this LAN segment', function(done) {

    });

    it('joins an existing D3vice network if one is found on this LAN', function(done) {

    });

    it('joins a D3vice network if a network address exists in environment', function(done) {});

    it('generates an IPNS address for this D3vice network if one doesnt exist in environment ', function(done) {

    });

    it('saves network IPNS address to environment', function(done) {})
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

    describe('state', function() {
      it('should return game state if callback is only param', function(done) {
        game.state.get(function(err, s) {
          assert.isNull(err);
          assert.isJson(s, 'game state was not JSON');
          done();
        });
      });

      describe('append', function() {
        it('should respond with updated state', function(done) {
          game.state.append({
            event: "buttonPress",
            time: 1455278924048,
            params: {
              node: 1,
              button: 4
            }
          }, function(err, s) {
            assert.isNull(err);
            assert.isDefined(s.gameState);
            assert.isEqual(s.gameState[s.gameState.length-1].time, 1455278924048);
            done();
          });
        });



        it('should return error if receiving invalid game event object', function(done) {
          game.state.append({taco: "yes please"}, function(err, s) {
            assert.isDefined(err);
            done();
          });
        });
      }); // end of append


    }); // end of state... (wouldn't that be nice?)
  }); // end of gameplay



});
