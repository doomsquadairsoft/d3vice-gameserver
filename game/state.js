var redis = require('redis');
var path  = require('path');
var nconf = require('nconf');
var moment = require('moment');

nconf.file(path.join(__dirname, '..', 'config.json'));
var redisHost = nconf.get('REDIS_HOST');
var redisPort = nconf.get('REDIS_PORT');


if ((typeof redisHost) === 'undefined') throw new Error('REDIS_HOST not defined in config.json');
if ((typeof redisPort) === 'undefined') throw new Error('REDIS_PORT not defined in config.json');
console.log(redisHost);
console.log(redisPort);

var red = redis.createClient({host: redisHost, port: redisPort});

/**
 * creates state
 *
 * @param {onCreatedCallback} cb
 */
var create = function create(cb) {
  // make sure there isn't already state
  red.GET('d3vice/game/active', function(err, reply) {
    if (err) return cb(err, null);
    if (reply) return cb(new Error('cannot create state because state already exists'), null);


    //console.log('game.state.create CHECK reply: ', reply);
    var state = {
      "meta": {
        "version": 1,
        "type": "D3vice Game",
      },
      "gameState": []
    };

    red.SET('d3vice/game/active', JSON.stringify(state), function(err, reply) {
      if (err) return cb(err, null);
      if (!reply) return cb(new Error('reply from redis when creating state was null'));
      return cb(null, state)
      done();
    });
  });
};
/**
 * @callback {onCreatedCallback}
 * @param {error} err
 * @param {object} state - the newly created state
 */



/**
 * clears state
 *
 * @param {onClearedCallback} cb
 */
var clear = function clear(cb) {
  red.DEL('d3vice/game/active', function(err, reply) {
    if (err) return cb(err, null);
    if ((typeof reply) === "undefined") return cb(new Error('no reply from redis'));
    return cb(null);
  });
}
/**
 * @callback {onGotStateCallback}
 * @param {error} err
 */

/**
 * returns the state of the game
 *
 * @param {onGotStateCallback} cb
 */
var get = function get(cb) {
  red.GET('d3vice/game/active', function(err, reply) {
    if (err) return cb(err, null);
    if (!reply) return cb(new Error('reply from Redis was null'));
    return cb(null, reply);
  });
}
/**
 * @callback {onGotStateCallback}
 * @param {error} err
 * @param {object} state
 */


/**
 * append history to the game state.
 *
 * @param {object} content - a js object containing a game event object
 * @param {onAppendedCallback} cb
 */
var append = function append(content, cb) {
  if ((typeof content.event) === 'undefined') return cb(new Error('appended content did not have required event object'));
  if ((typeof content.time) === 'undefined') return cb(new Error('appended content did not have required time number'));
  if ((typeof content.params) === 'undefined') return cb(new Error('appended content did not have required params object'));

  get(function(err, reply) {
    if (err) return cb(err, null);
    var s;
    try { s = JSON.parse(reply); }
    catch(e) { return cb(e, null); }
    s.gameState.push(content);
    return cb(null, s);
  });
}
/**
 * @callback {onAppendedCallback}
 * @param {error} err
 * @param {object} s - updated gameState js object
 */

module.exports = {
  get: get,
  append: append,
  clear: clear,
  create: create
}
