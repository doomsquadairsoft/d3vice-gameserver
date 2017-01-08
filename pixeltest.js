// dependencies:
//   - build-essential
//   - python-dev
//   - git
//   - scons
//   - swig
//   - rpi_ws281x (https://github.com/jgarff/rpi_ws281x)

var ws281x = require('rpi-ws281x-native');
var debug = require('debug')('d3vice-gameserver');

var NUM_LEDS = parseInt(process.argv[2], 10) || 16,
    pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
    ws281x.reset();
    process.nextTick(function () { process.exit(0); });
});


// ---- animation-loop
var offset = 0;
setInterval(function () {
    for (var i = 0; i < NUM_LEDS; i++) {
	pixelData[i] = colorwheel((offset + i) % 256);
	debug(colorwheel((offset + i) % 256));
    }

    offset = (offset + 1) % 256;
    ws281x.render(pixelData);
}, 1000 / 30);

console.log('Press <ctrl>+C to exit.');


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




