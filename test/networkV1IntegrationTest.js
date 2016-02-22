var path = require('path');
var assert = require('chai').assert;
var game = require(path.join('..', 'game'));
var network = require(path.join('..', 'network'));
var redis = require('redis');
var nconf = require('nconf');
var moment = require('moment');


nconf.file(path.join(__dirname, '..', 'config.json'));
var redisHost = nconf.get('REDIS_HOST');
var redisPort = nconf.get('REDIS_PORT');
assert.isDefined(redisHost);
assert.isDefined(redisPort);
var red = redis.createClient({host: redisHost, port: redisPort});

var fakeNodeManifest = {
  meta: {
    version: 1
  },
  nodeID: "3838383838",
  defaultProfile: "sector",
  hardware: [
    {type: "button", name: "green button", gpio: 3},
    {type: "button", name: "red button", gpio: 5},
    {type: "neopixel", name: "neopixel display", gpio: 8}
  ]
};

var fakeNetworkState = {
    "meta": {
        "version": 1,
        "type": "D3vice Network",
        "home": "Doom Squad Airsoft Test Net"
    },
    "availableInventory": {
        "nodes": [{
            "name": "Vehicle Pyro 1",
            "defaultProfile": "pyro",
            "nodeID": "ae34bb9303",
            "hardware": [{
                "type": "output",
                "version": 1,
                "name": "smoke screen 1",
                "gpio": 2
            }, {
                "type": "output",
                "version": 1,
                "name": "loud report 1",
                "gpio": 3
            }, {
                "type": "output",
                "version": 1,
                "name": "loud report 2",
                "gpio": 4
            }, {
                "type": "output",
                "version": 1,
                "name": "loud report 3",
                "gpio": 6
            }]
        }, {
            "name": "Strategic Keypad 1",
            "defaultProfile": "keypad",
            "nodeID": "38dd38020f",
            "hardware": [{
                "type": "keypad",
                "version": 1,
                "name": "Keypad Remote",
                "gpio": 2
            }]
        }]
    }
};




describe('Network Integration', function() {
  describe('state', function() {

    describe('create', function() {

      beforeEach(function(done) {
        red.DEL('d3vice/network/state', function(err, reply) {
          assert.isNull(err);
          assert.isNumber(reply);
          done();
        })
      });

      it('should error if state already exists', function(done) {
        red.SET('d3vice/network/state', JSON.stringify(fakeNetworkState), function(err, reply) {
          assert.isNull(err);
          assert.equal(reply, 'OK');
          network.state.create(function(err, state) {
            assert.match(err, /exists/);
            assert.isNull(state);
            done();
          });
        });
      });


      it('should callback with new state', function(done) {
        network.state.create(function(err, state) {
          assert.isNull(err);
          assert.isObject(state);
          assert.equal(state.meta.version, 1);
          assert.equal(state.meta.type, 'D3vice Network');
          done();
        });
      });
    }); // end of create




    describe('read', function() {
      it('should return network state object', function(done) {
        network.state.read(function(err, state) {
          assert.isNull(err);
          assert.isDefined(state);
          assert.isObject(state);
          done();
        });
      });

      it('should have meta version 1 and meta type \'D3vice Network\'', function(done) {
        network.state.read(function(err, state) {
          assert.equal(state.meta.version, 1);
          assert.equal(state.meta.type, 'D3vice Network');
          done();
        });
      });
    }); // end of read




    describe('update', function() {

      beforeEach(function(done) {
        red.DEL('d3vice/network/state', function(err, reply) {
          assert.isNull(err);

          network.state.create(function(err, state) {
            assert.isNull(err);
            assert.isObject(state);
            done();
          });
        });
      });

      it('should error if there is no existing network state', function(done) {
        red.DEL('d3vice/network/state', function(err, reply) {
          assert.equal(reply, 1); // redis should say that it deleted `1` key
          network.state.update(fakeNodeManifest, function(err, state) {
            assert.match(err, /network state does not exist/);
            assert.isNull(state);
            done();
          });
        });
      });

      it('should error if networkState.availableInventory is missing from existing state', function(done) {
        // create fake state which is missing availableInventory
        var badNetworkState = JSON.parse(JSON.stringify(fakeNetworkState)); // copy fake data
        delete badNetworkState.availableInventory; // delete availableInventory object
        red.SET('d3vice/network/state', JSON.stringify(badNetworkState), function(err, reply) {
          assert.isNull(err);

          network.state.update(fakeNodeManifest, function(err, state) {
            assert.match(err, /availableInventory not found/);
            assert.isNull(state);
            done();
          });
        });
      });

      it('should error if nodeID is missing from nodeManifest', function(done) {
        var badNodeManifest = JSON.parse(JSON.stringify(fakeNodeManifest));
        delete badNodeManifest.nodeID;


        network.state.update(badNodeManifest, function(err, state) {
          //console.log(state);
          assert.match(err, /nodeID not found/);
          assert.isNull(state);
          done();
        });
      });

      it('should error if nodes list is missing from existing state', function(done) {
        // create fake state which is missing availableInventory
        var badNetworkState = JSON.parse(JSON.stringify(fakeNetworkState)); // copy fake data
        delete badNetworkState.availableInventory.nodes; // delete availableInventory object
        red.SET('d3vice/network/state', JSON.stringify(badNetworkState), function(err, reply) {
          assert.isNull(err);

          network.state.update(fakeNodeManifest, function(err, state) {
            assert.match(err, /availableInventory\.nodes not found/);
            assert.isNull(state);
            done();
          });
        });
      });

      it('should accept a nodeManifest, returning updated network state', function(done) {
        network.state.update(fakeNodeManifest, function(err, state) {
          assert.isNull(err);
          assert.isObject(state);
          assert.equal(state.meta.version, 1);
          done();
        });
      });

      it('should error if nodeManifest is stringified JSON', function(done) {
        network.state.update(JSON.stringify(fakeNodeManifest), function(err, state) {
          assert.match(err, /json/);
          done();
        });
      });

      it('should save the new network state to redis d3vice/network/state', function(done) {
        network.state.update(fakeNodeManifest, function(err, state) {
          assert.isNull(err);
          red.GET('d3vice/network/state', function(err, state) {
            assert.isNull(err);
            assert.isString(state);
            state = JSON.parse(state);
            assert.equal(state.meta.version, 1);
            assert.equal(state.availableInventory.nodes[0].nodeID, '3838383838');
            done();
          });
        });
      });


    }); // end of update




    describe('delete', function() {
      beforeEach(function(done) {
          red.DEL('d3vice/network/state', function(err, reply) {
            assert.isNull(err);
            network.state.create(function(err, state) {
              done();
            });
          });
      });

      it('should delete the network state in redis', function(done) {
        // read network state, assert exists
        red.GET('d3vice/network/state', function(err, reply) {
          assert.isNull(err);
          assert.isString(reply);

          // try to delete, assert no errors
          network.state.del(function(err) {
            assert.isNull(err);

            // read network state, assert not exists
            red.GET('d3vice/network/state', function(err, reply) {
              assert.isNull(err);
              assert.isNull(reply);
              done();
            });
          });
        });
      });
    }); // end of delete



  });
});
