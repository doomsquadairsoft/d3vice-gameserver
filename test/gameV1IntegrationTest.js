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
  gameState: [{foo: "bar"}, {fee: "burr"}]
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
      it('should return game state', function(done) {
        game.state.get(function(err, s) {
          assert.isNull(err);
          assert.isJson(s, 'game state was not JSON');
          done();
        });
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
