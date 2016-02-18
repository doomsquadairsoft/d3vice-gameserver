var assert = require('chai').assert;
var game = require('../game');
var redis = require('redis');
var nconf = require('nconf');
var path = require('path');
var moment = require('moment');
var _ = require('underscore');


nconf.file(path.join(__dirname, '..', 'config.json'));
var redisHost = nconf.get('REDIS_HOST');
var redisPort = nconf.get('REDIS_PORT');
assert.isDefined(redisHost);
assert.isDefined(redisPort);
var red = redis.createClient({host: redisHost, port: redisPort});

var fakeData = {
  meta: {foo: "bar", version: 1, time: 1455699795941},
  gameState: [{event: "bar"}, {fee: "burr"}]
};
console.log(typeof fakeData);


var fakeEvent = {
  event: "somethingCool",
  time: 1455699975941,
  params: {
    node: 3,
    button: 1
  }
};


describe('Game Integration', function() {
  describe('state', function() {

    beforeEach(function(done) {
      // clear state
      game.state.clear(function(err) {
        assert.isNull(err);
        done();
      });
    });

    describe('create', function() {

      it('should error if state already exists', function(done) {
        data = JSON.stringify(fakeData);
        red.set('d3vice/game/active', data, function(err, reply) {
          assert.isNull(err);
          assert.equal(reply, 'OK');

          game.state.create(function(err, s) {
            assert.isDefined(err);
            assert.isNull(s);
            done();
          });
        });
      });

      it('should create state if no state', function(done) {
        game.state.create(function(err, s) {
          assert.isNull(err);
          assert.isDefined(s);
          assert.isDefined(s.meta.version);
          assert.isDefined(s.meta.time);
          assert.isArray(s.gameState);
          assert.equal(s.meta.version, 1, 'game state version was off');
          done();
        });
      });

      it('should return fresh state', function(done) {
        game.state.create(function(err, state) {
          assert.isDefined(state);
          assert.isDefined(state.meta);
          assert.equal(state.meta.version, 1, 'game state version was off');
          assert.isArray(state.gameState);
          done();
        });
      });
    }); // end of create

    describe('get', function() {
      it('should return an error if there is no game state', function(done) {
        game.state.get(function(err, s) {
          assert.isDefined(err);
          assert.match(err, /game state does not exist/);
          assert.isNull(s);
          done();
        });
      });

      it('should return game state when it exists', function(done) {
        game.state.create(function(err, state) {
          game.state.get(function(err, s) {
            assert.isNull(err);
            assert.isDefined(s);
            assert.isDefined(s.meta);
            assert.equal(s.meta.version, 1, 'game state version was off');
            assert.isArray(s.gameState);
            done();
          });
        });
      });
    }); // end of get

    describe('append', function() {
      it('should callback an error if state doesnt exist', function(done) {
        game.state.append(fakeEvent, function(err, s) {
          assert.isDefined(err);
          assert.isNull(s);
          done();
        });
      });

      it('should callback with updated state', function(done) {
        game.state.create(function(err) {
          game.state.append(fakeEvent, function(err, s) {
            assert.isNull(err);
            assert.isDefined(s.gameState);
            assert.equal(s.gameState[s.gameState.length-1].time, fakeEvent.time);
            done();
          });
        });
      });

      it('should save updated state to redis', function(done) {
        game.state.create(function(err) {
          game.state.append(fakeEvent, function(err, s) {
            red.get('d3vice/game/active', function(err, reply) {
              assert.isNull(err);
              assert.isDefined(reply);
              var s;
              try { s = JSON.parse(reply); }
              catch(e) { throw e; }
              assert.equal(s.gameState[s.gameState.length-1].time, fakeEvent.time);
              done();
            });
          });
        });
      });

      it('should callback with error if receiving invalid event object', function(done) {
        game.state.append({taco: "yes please"}, function(err, s) {
          assert.isDefined(err);
          done();
        });
      });
    }); // end of append




    describe('archive', function() {
      var k;
      beforeEach(function(done) {
        red.DEL('d3vice/game/1455711475936', function(err, reply) {
          assert.isNull(err);
          assert.isNumber(reply);
          done();
        });
      });

      it('should error if the game state is invalid', function(done) {
        red.SET('d3vice/game/active', JSON.stringify({}), function(err, reply) {
          game.state.archive(function(err, key) {
            assert.isDefined(err);
            assert.match(err, /invalid/);
            assert.isNull(key);
            done();
          });
        });
      });

      it('should error if there is no state', function(done) {
        game.state.archive(function(err, key) {
          assert.isDefined(err);
          assert.isNull(key);
          done();
        });
      });

      it('should error if the state time is invalid', function(done) {
        var invalidTimeData = _.clone(fakeData);
        invalidTimeData.meta.time = 'yesterday';
        red.SET('d3vice/game/active', JSON.stringify(invalidTimeData), function(err, reply) {
          assert.equal(reply, 'OK');
          game.state.archive(function(err, key) {
            assert.match(err, /non-number/);
            done();
          });
        });
      });

      it('should call back with archive key', function(done) {
        red.SET('d3vice/game/active', JSON.stringify(fakeData), function(err, reply) {
          game.state.archive(function(err, key) {
            assert.isNull(err);
            assert.matches(key, /d3vice\/game\/\d+/);
            k = key;
            done();
          });
        });
      });

      it('should save game state in redis d3vice/game/{{date}}', function(done) {
        red.SET('d3vice/game/active', JSON.stringify(fakeData), function(err, reply) {
          game.state.archive(function(err, key) {
            assert.isNull(err);
            assert.matches(key, /d3vice\/game\/\d+/);
            k = key;
            done();
          });
        });
      });

      it('should save a pointer to the archive in the hash d3vice/game/history', function(done) {

        red.GET(k, function(err, reply) {
          assert.isNull(err);
          assert.isEqual(reply, k);
          done();
        });
      });
    }); // end of archive





    describe('clear', function() {
      it('should callback error if no state', function(done) {
        red.SET('d3vice/game/active', JSON.stringify({}), function(err, reply) {
          game.state.clear(function(err) {
            assert.isDefined(err);
            done();
          });
        });
      });


      it('should delete d3vice/game/active in redis', function(done) {
        red.SET('d3vice/game/active', JSON.stringify({}), function(err, reply) {
          game.state.clear(function(err) {
            assert.isDefined(err);
            done();
          });
        });
      });
    }); // end of clear

  }); // end of state... (wouldn't that be nice?)

}); // end of game
