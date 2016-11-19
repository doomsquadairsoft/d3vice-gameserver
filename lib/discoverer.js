var mdns = require('mdns');
var debug = require('debug')('d3vice:discoverer')
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Primus = require('primus');
var Promise = require('bluebird');






/**
 * discovers D3VICE servers on the network using mdns
 *
 */
var Discoverer = function Discoverer() {
    var self = this;
    
    this.isValidDevice = function validDevice(service) {
	if (typeof service.name === 'undefined')
	    return false
	
	if (service.name === 'D3VICE')
	    return true

	return false
    };

    // greets https://stackoverflow.com/a/29933215
    self.waitForBrowserEvent = function waitForBrowserEvent(eventType) {
	return new Promise(function(resolve) {
	    self.browser.on(eventType, resolve);
	});
    }
    
    
    self.browser = mdns.createBrowser(mdns.tcp('http'));

    self.waitForBrowserEvent('serviceUp')
	.then(self.queueConnection);

    
    self.waitForBrowserEvent('serviceDown')
	.then(function(service) {
	    console.log('service down: ', service.name);
	})
    

    self.browser.start();

    EventEmitter.call(self);

    return self;
}


util.inherits(Discoverer, EventEmitter);




/**
 * connect to D3VICE
 * @param {Promise} serviceInfo - service info received from mdns
 */
Discoverer.prototype.connect = function connect(serviceInfo) {

    
    self.connectionQueue.push(serviceInfo);
    

    if (self.isValidDevice(service))
	self.emit('found', service);
};




module.exports = Discoverer;





