var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
var EventEmitter = require('events').EventEmitter;
var util = require('util');




var Input = function Input() {
    this.app = app;
    this.page = _.template('<html><head><title>D3VICE Input Mock</title></head><body> <form action="/" method="post"><button name="green" value="green">Green Team</button><button name="red" value="red">Red Team</button></form></body></html>');



    EventEmitter.call(this);
}
util.inherits(Input, EventEmitter);



Input.prototype.begin = function begin() {

    var self = this;

    self.app.set('port', (process.env.PORT || 5000));
    self.app.use(bodyParser.urlencoded({ extended: false }))
    
    
    self.app.get('/', function(req, res) {
	res.send(self.page());
    });
    
    self.app.post('/', function(req, res) {
	console.log('got POST red=%s green=%s', req.body.red, req.body.green);
	if (req.body.red)
	    self.emit('button', 'red');
	
	if (req.body.green)
	    self.emit('button', 'green');
	
	
	res.send(self.page());
    });
    
    
    
    self.app.listen(self.app.get('port'), function() {
	console.log('app listening on port %s', self.app.get('port'));
    });



    return self;
}






module.exports = Input;


