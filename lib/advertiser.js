var mdns = require('mdns');
var debug = require('debug')('d3vice:advertiser')


/**
 * advertises the D3VICE server to the network
 * allows D3VICE clients/nodes/endpoints to find and connect
 *
 * @param {number} [port] - port the service is running on
 */
module.exports.begin = function begin(port) {
    if (typeof port === 'undefined')
	port = 7777;

    // advertise the D3VICE server
    var ad = mdns.createAdvertisement(
      mdns.tcp('http'),
      port,
      {"name": "D3VICE"}
    );
    ad.start();
    debug('d3vice advertizing via mdns')
}
