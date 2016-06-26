var assert = require('chai').assert;
var util = require('../lib/util');


describe('util', function() {
  describe('generateGUID', function() {
    it('should generate a guid', function() {
      var guid = util.generateGUID();
      assert.isString(guid);
      assert.match(guid, /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/);
    });
  });
});


// 6fdf6ffc-ed77-94fa-407e-a7b86ed9e59d
