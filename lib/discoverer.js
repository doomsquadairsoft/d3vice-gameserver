var mdns = require('mdns');
var debug = require('debug')('d3vice:discoverer')
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Primus = require('primus');
var Promise = require('bluebird');
var _ = require('lodash');







/**
 * discovers D3VICE servers on the network using mdns
 * stores found servers in self._inventory
 */
var Discoverer = function Discoverer() {
    var self = this;
    
    self._inventory = [];

    self.isValidDevice = function validDevice(service) {
	if (typeof service.name === 'undefined')
	    return false
	
	if (service.name === 'D3VICE')
	    return true

	return false
    };

    
    self.browser = mdns.createBrowser(mdns.tcp('http'));

    self.browser.on('serviceUp', function(service) {
	if (self.isValidDevice(service)) {
	    console.log('service up: %s %s %s', service.name, service.addresses[0], service.port);
	    self._inventory.push(service);
	}
    });

    
    self.browser.on('serviceDown', function(service) {
	if (self.isValidDevice(service)) {
	    console.log(service);
	    console.log('service down: %s %s', service.name, service.networkInterface);
	    _.remove(self._inventory, function(i) {
		(i.networkInterface == service.networkInterface)
	    });
	}
    });
    
    self.browser.start();
    EventEmitter.call(self);

    return self;
}


util.inherits(Discoverer, EventEmitter);





Discoverer.prototype.getDiscovered = function getDiscovered() {
    var self = this;
    return self._inventory;
}





module.exports = Discoverer;





