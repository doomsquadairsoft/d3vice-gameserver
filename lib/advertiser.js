var mdns = require('mdns-js');
var debug = require('debug')('d3vice:advertiser');
var pkg = require('../package.json');


if ( typeof pkg.version === 'undefined' ) throw new Error('advertiser module could not read version from package.json');
console.log(typeof pkg.version);

/**
 * advertises the D3VICE server to the network
 * allows D3VICE clients/nodes/endpoints to find and connect
 *
 * @param {number} [port] - port the service is running on
 */
module.exports.begin = function begin(port) {
    if (typeof port === 'undefined')
	port = 7777;

    var ad = mdns.createAdvertisement(mdns.tcp('_http'), port, {
	name: 'D3VICE'
    });

    ad.start();

    // give deregister process a second to quit when we Ctrl+C
    process.on('SIGINT', function() {
	ad.stop();
	setTimeout(function onTimeout() {
	    process.exit();
	}, 1000);
    });

    debug('d3vice advertizing via mdns on port %s', port);
}
