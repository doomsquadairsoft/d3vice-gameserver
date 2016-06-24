var assert = require('chai').assert;
var network = require('../lib/network');


describe('network', function() {
  describe('broadcast', function() {
    it('should bork if receiving no params', function() {
      assert.throws(
        network.broadcast,
        /params are required/
      );
    });
    it('should bork if receiving only one param', function() {
      assert.throws(
        function() {
          network.broadcast('terd');
        }, /params are required/
      );
    });
    it('should bork if receiving only two params', function() {
      assert.throws(
        function() {
          network.broadcast('yolo', function(err) {});
        }, /params are required/);
    });
    it('should accept a routingKey, message, and callback', function(done) {
      network.broadcast('d3vice.pyro.artillery', 'launch or something', function(err) {
        assert.isNull(err);
        done();
      });
    });
    it('should bork if routingKey is not a string', function() {
      assert.throws(
        function() {
          network.broadcast(function(err){}, 'launch or something',
            function(err) {});
        }, /must be {string}/);
    });
    it('should bork if message is not a string', function() {
      assert.throws(
        function() {
          network.broadcast('d3vice.pyro.artillery', function(err) {},
          function(err) {});
        }, /must be {string}/);
    });
    it('should bork if callback is not a function', function() {
      assert.throws(
        function() {
          network.broadcast('d3vic3.pyro.artillery', 'launch or something',
          'im not a callback function neener neener');
        }, /must be a callback function/);
      });
    });
});
