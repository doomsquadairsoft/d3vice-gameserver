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
      meta: {
        version: 1,
        type: "D3vice Game",
        time: moment().valueOf()
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
    if (!reply) return cb(new Error('game state does not exist'), null);
    // parse stringified json reply
    var r;
    try { r = JSON.parse(reply); }
    catch(e) { return cb(e, null); }
    return cb(null, r);
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
 * @param {object} content - a game event object
 * @param {onAppendedCallback} cb
 */
var append = function append(content, cb) {
  if ((typeof content.event) === 'undefined') return cb(new Error('appended content did not have required event object'), null);
  if ((typeof content.time) === 'undefined') return cb(new Error('appended content did not have required time number'), null);
  if ((typeof content.params) === 'undefined') return cb(new Error('appended content did not have required params object'), null);

  get(function(err, state) {
    if (err) return cb(err, null);
    state.gameState.push(content);

    var s = JSON.stringify(state);
    red.SET('d3vice/game/active', s, function(err, reply) {
      if (err) return cb(err, null);
      if (reply !== 'OK') return cb(new Error('could not SET new event'));
      return cb(null, state);
    });
  });
}
/**
 * @callback {onAppendedCallback}
 * @param {error} err
 * @param {object} s - updated gameState js object
 */




/**
 * archive active game data/state to d3vice/game/{{date}}
 *
 * @param {onArchivedCallback} cb
 */
var archive = function archive(cb) {
  // get the active game state
  get(function(err, state) {
    var invalidStateErr = new Error('could not archive because active game state was invalid');
    if (err) return cb(err, null);
    if (typeof state === 'undefined') return cb(invalidStateErr, null);
    if (typeof state.meta === 'undefined') return cb(invalidStateErr, null);
    if (typeof state.meta.time === 'undefined') return cb(invalidStateErr, null);

    // get state's time and validate it (expecting epoch in milliseconds)
    var time = state.meta.time;
    if (!moment(time, 'x', true).isValid()) return cb(new Error('time to archive was not epoch in milliseconds'));

    // stringify the state
    var key = 'd3vice/game/'+time;
    var s;
    try { s = JSON.stringify(state); }
    catch(e) { return cb(err, null); }

    // copy the state to the new archive
    red.SET(key, s, function(err, reply) {
      if (err) return cb(err, null);
      if (reply !== "OK") return cb(new Error('Redis could not SET d3vice/game/'+time), null)

      // create a pointer to the archive
      red.LPUSH('d3vice/game/history', key, function(err, reply) {
        if (err) return cb(err, null);
        if (typeof reply !== 'number') return cb(new Error('redis could not RPUSH to d3vice/game/history'));

        // peacefully delete the state
        clear(function(err) {
          if (err) return cb(err, null);

          // call back the archived state
          return cb(null, key);
        });
      });
    });
  });
}
/**
 * @callback {onArchivedCallback}
 * @param {error} err
 * @param {object} archive - the state that was just archived
 */


module.exports = {
  get: get,
  append: append,
  clear: clear,
  create: create,
  archive: archive
}
