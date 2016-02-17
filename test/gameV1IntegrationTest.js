var assert = require('chai').assert;
var game = require('../game');
var redis = require('redis');
var nconf = require('nconf');
var path = require('path');

nconf.file(path.join(__dirname, '..', 'config.json'));
var redisHost = nconf.get('REDIS_HOST');
var redisPort = nconf.get('REDIS_PORT');
assert.isDefined(redisHost);
assert.isDefined(redisPort);
var red = redis.createClient({host: redisHost, port: redisPort});

var fakeData = {
  meta: {foo: "bar", version: 1},
  gameState: [{event: "bar"}, {fee: "burr"}]
}

var fakeEvent = {
  event: "somethingCool",
  time: 1455699975941,
  params: {
    node: 3,
    button: 1
  }
}

// before(function(done) {
//   console.log('getting redis ready');
//   red.on('ready', function(e) {
//     console.log('redis is ready');
//     done();
//   });
// });


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
        fakeData = JSON.stringify(fakeData);
        red.set('d3vice/game/active', fakeData, function(err, reply) {
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
          assert.isArray(s.gameState);
          assert.equal(s.meta.version, 1, 'game state version was off');
          done();
        });
        //
        // fakeData = JSON.stringify(fakeData);
        // console.log('inserting fake data %s', fakeData);
        //
        // red.set('d3vice/game/active', fakeData, function(err, reply) {
        //
        //
        //   assert.isNull(err);
        //   assert.equal(reply, 'OK');
        //
        //   red.get('d3vice/game/active', function(err, state) {
        //     var s;
        //     try {
        //       s = JSON.parse(state);
        //     }
        //     catch(e) {
        //       throw e;
        //     }
        //     assert.isNull(err);
        //
        //     done();
        //   });
        // });
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
    });

    describe('get', function() {
      it('should return an error if there is no game state', function(done) {
        game.state.get(function(err, s) {
          assert.isDefined(err);
          assert.match(err, /game state does not exist/);
          assert.isNull(s);
          done();
        })
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
    });

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
              catch(e) {throw e}
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
      it('should save game state to /d3vice/game/{{date}}, returning that key', function(done) {
        game.state.archive(function(err, key) {
          assert.isNull(err);
          assert.matches(key, /d3vice\/game\/\d+/);
          k = key;
          done();
        });
      });

      it('should save a pointer to the archive in the hash /d3vice/game/history', function(done) {
        red.GET(k, function(err, reply) {
          assert.isNull(err);
          assert.isEqual(reply, k);
          done();
        });
      });
    }); // end of archive




    // describe('clear', function() {
    //   it('should clear state, returning null state', function(done) {
    //     game.state.clear(function(err, state) {
    //       assert.isNull(err);
    //       assert.isNull(state, 'state object was not null');
    //       done();
    //     });
    //   });
    // }); // end of clear

  }); // end of state... (wouldn't that be nice?)

}); // end of game
