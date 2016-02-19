var path  = require('path');
var red = require(path.join('..', 'database'));
var moment = require('moment');
var _ = require('underscore');

var freshNetworkState = {
    "meta": {
        "version": 1,
        "type": "D3vice Network",
        "home": "Doom Squad Airsoft Test Net"
    },
    "availableInventory": {
        "nodes": []
    }
};


/**
 * creates a fresh network state
 * calls back with new state object
 *
 * @param {onCreatedCallback} cb
 */
var create = function create(cb) {
  // only create if state doesn't already exist
  red.GET('d3vice/network/state', function(err, state) {
    if (err) return cb(err, null);
    if (state) return cb(new Error('state already exists, so can\'t create'), null);

    // create fresh network state
    var s;
    try { s = JSON.stringify(freshNetworkState) }
    catch(e) { return cb(e, null) }

    // set network state to redis
    red.SET('d3vice/network/state', s, function(err, reply) {
      if (err) return cb(err, null);
      if (!reply) return cb(new Error('no reply from redis when creating network state'), null);
      return cb(null, freshNetworkState);
    });
  });
};
/**
 * @callback {onCreatedCallback}
 * @param {error} err
 * @param {object} state
 */


/**
 * read network state from the database
 *
 * @param {onReadCallback} cb
 */
var read = function read(cb) {
  red.GET('d3vice/network/state', function(err, state) {
    if (err) return cb(err, null);
    if (!state) return cb(new Error('no network state exists'), null);
    var s;
    try { s = JSON.parse(state) }
    catch(e) { return cb(e, null) }
    return cb(null, s);
  });
};
/**
 * @callback {onReadCallback}
 * @param {error} err
 * @param {object} state
 */



/**
 * update the network state
 *
 * accepts a node maifest as parameter, which it then uses to update an existing
 * node with that nodeID, or create a new one in the network state
 *
 * @param {onUpdatedCallback} cb
 */
var update = function update(nodeManifest, cb) {

  // get existing network state (error if none)
  read(function(err, state) {
    if (err) return cb(err, null);
    if (!state) return cb(new Error('state does not exist'), null);
    if (typeof nodeManifest === 'string') return cb(new Error('nodeManifest was a string, has the json not been parsed?'), null)
    if (typeof state.availableInventory === 'undefined') return cb(new Error('availableInventory not found in network state'), null);
    if (typeof state.availableInventory.nodes === 'undefined') return cb(new Error('availableInventory.nodes not found in network state'), null);
    if (typeof nodeManifest.nodeID === 'undefined') return cb(new Error('nodeID not found in nodeManifest'), null);

    // use nodeID in nodeManifest to see if there an existing matching nodeID in state
    var nodeID = nodeManifest.nodeID;
    var matchingIndex = _.indexOf(state.availableInventory.nodes, nodeID);

    if (matchingIndex > -1) {
      // overwrite if there is a match
      state.availableInventory.nodes[matchingIndex] = nodeManifest;
    } else {
      // insert if new
      state.availableInventory.nodes.push(nodeManifest);
    }

    // write to db
    var s;
    try { s = JSON.stringify(state) }
    catch(e) { return cb(e, null) }

    red.SET('d3vice/network/state', s, function(err, reply) {
      if (err) return cb(err, null);
      if (!reply) return cb(new Error('no reply from redis when updating network state'));

      // return updated network state
      return cb(null, state);
    });

  });

};
/**
 * @callback {onUpdatedCallback}
 * @param {error} err
 * @param {object} state - the updated state, after the node manifest has been applied
 */


/**
 * delete the network state
 *
 * @param {onDeletedCallback} cb
 */
var del = function del(cb) {
  red.DEL('d3vice/network/state', function(err, reply) {
    if (err) return cb(err, null);
    if (!reply) return cb(new Error('no reply from redis when deleting network state'));
    return cb(null);
  });
};
/**
 * @callback {onDeletedCallback}
 * @param {error} err
 */

module.exports = {
  create: create,
  read: read,
  update: update,
  del: del
};
