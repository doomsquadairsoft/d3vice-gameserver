var path = require('path');
var assert = require('chai').assert;
var request = require('supertest');
var server = require(path.join('..', '/server'));

describe('/api/v1', function() {
  var app;

  before(function() {
    app = server(3000);
  });

  after(function() {
    app.close();
  });

  describe('/game', function() {
    /**
     *
     */
    it('returns JSON containing running game information', function(done) {

      request('http://localhost:3000/')
        .get('api/v1/game')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          assert.isDefined(res.body, 'response contains no body (and therefore no yummy json!)');
          assert.isDefined(res.body.meta, 'json returned did not have expected meta key');
          assert.equal(res.body.meta.version, 1, 'json returned was wrong version');
          assert.equal(res.body.meta.type, 'D3vice Game', 'data returned was wrong type');
        })
        .end(done);

      });
    });


    describe('/network', function() {


      /**
         Returns network state, including network inventory

         https://github.com/doomsquadairsoft/d3vice/wiki/Network-State

       */
        xit('returns JSON containing network state', function(done) {
      request('http://localhost:3000/')
          .get('api/v1/network')
          .set('Accept', 'application/json')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function(res) {
      	assert.isDefined(res.body.meta, 'json returned did not have expected meta key');
      	assert.equal(res.body.meta.version, 1, 'json returned was wrong version');
      	assert.equal(res.body.meta.type, 'Device Network', 'data returned was wrong type');
          })
          .end(done);

      });
    });
});
