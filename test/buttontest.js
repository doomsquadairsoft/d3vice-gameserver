var gpio = require('mmm-gpio');
var assert = require('chai').assert;


var greenButtonPin = 16;
var redButtonPin = 18;


describe('gpio', function() {
    it('should init', function(done) {
        gpio.init(function(error) {
            if (error) throw error;
            console.log('success');
            done();
        })
    });

    it('should create input', function(done) {

        var inputGreen = gpio.createInput(greenButtonPin);
        var inputRed = gpio.createInput(redButtonPin);


        assert.isFalse(inputGreen(), 'green input is not LOW');
        assert.isFalse(inputRed(), 'red input is not LOW');

        done();
    })
});
