// dependencies:
//   - build-essential
//   - python-dev
//   - git
//   - scons
//   - swig
//   - rpi_ws281x (https://github.com/jgarff/rpi_ws281x)

var ws281x = require('rpi-ws281x-native');
var toHex = require('colornames');
var debug = require('debug')('d3vice-gameserver');



var Display = function Display(opts) {
    if (typeof opts === 'undefined') opts = {};
    var self = this;
    self.numLEDs = opts.numLEDs || 16;
    self.pixelData = new Uint32Array(self.numLEDs);
    ws281x.init(self.numLEDs);
}




// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
    ws281x.reset();
    process.nextTick(function () { process.exit(0); });
});


// ---- animation-loop
// var offset = 0;
// setInterval(function () {
//     for (var i = 0; i < NUM_LEDS; i++) {
// 	pixelData[i] = colorwheel((offset + i) % 256);
//     }

//     offset = (offset + 1) % 256;
//     ws281x.render(pixelData);
// }, 1000 / 30);




// rainbow-colors, greets http://goo.gl/Cs3H0v
function colorwheel(pos) {
    pos = 255 - pos;
    if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
    else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
    else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
}

function rgb2Int(r, g, b) {
    return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}




Display.prototype.setColor = function setColor(color, percentage) {
    var self = this;

    if (typeof color !== 'string') throw new Error('setColor must have a {string} colorname as first param');
    if (typeof percentage === 'undefined') percentage = 50;
    
    var hexColor = toHex(color);
    var redValue = parseInt(hexColor.substring(1, 3), 16);
    var grnValue = parseInt(hexColor.substring(3, 5), 16); 
    var bluValue = parseInt(hexColor.substring(5, 7), 16);

    debug('red=%s, grn=%s, blu=%s', redValue, grnValue, bluValue);

    self.sectionSize = self.numLEDs / 4;

    function map(value, fromLow, fromHigh, toLow, toHigh) {
	//var mappedMax = fromHigh / toHigh;
	//var mappedMin = fromLow / toLow;
	var percentage = value / fromHigh;
	return mappedValue = Math.ceil(percentage * toHigh);
    }

    // example
    //console.log('mapped 80. return=%s', map(80, 0, 100, 0, 4));

    // ranges example
    //0, (self.sectionSize*1)
    //(self.sectionSize*1), (self.sectionSize*2)
    //(self.sectionSize*2), (self.sectionSize*3)
    //(self.sectionSize*3), (self.sectionSize*4)

    // map (0, 100) to (0, self.sectionSize)

    var mapped = map(percentage, 0, 100, 0, 4);
    console.log('mapped =%s', mapped);

    // section 1 (0 to 3)
    // i = 0; i < 4; i++
    // 0, 1, 2, 3
    var count = 0;
    for (var i = 0; i <= (self.numLEDs/4); i++) {
	if (count < mapped) {
	    console.log('section 1 pixel %s', i);
	    self.pixelData[i] = rgb2Int(redValue, grnValue, bluValue);
	}
	count++;
    }

    // section 2 (7 to 4)
    count = 0;
    // i = 7; i >= 4; i--
    // 7, 6, 5, 4
    for (var i = (((self.numLEDs/4)*2)-1); i >= ((self.numLEDs/4)*1); i--) {
	if (count < mapped) {
	    console.log('section 2 pixel %s', i);
	    self.pixelData[i] = rgb2Int(redValue, grnValue, bluValue);
	}
	count++;
    }
	 
    // section 3 (8 to 11)
    // i = 8; i < 12; i++
    // 8, 9, 10, 11
    count = 0;
    for (var i = ((self.numLEDs/4)*2); i < ((self.numLEDs/4)*3); i++) {
	if (count < mapped) {
	    console.log('section 3 pixel %s', i);
	    self.pixelData[i] = rgb2Int(redValue, grnValue, bluValue);
	}
	count++;
    }

    // section 4 (15 to 12)
    // i = 15; i > 11; i--
    // 15, 14, 13, 12
    count = 0;
    for (var i = (((self.numLEDs/4)*4)-1); i > (((self.numLEDs/4)*3)-1); i--) {
	if (count < mapped) {
	    console.log('section 4 pixel %s', i);
	    self.pixelData[i] = rgb2Int(redValue, grnValue, bluValue);
	}
	count++;
    }


    //for (var i = 0; i < self.numLEDs; i++) {
    //  self.pixelData[i] = rgb2Int(redValue, grnValue, bluValue);
    //}

    ws281x.render(self.pixelData);
}



module.exports = Display;



