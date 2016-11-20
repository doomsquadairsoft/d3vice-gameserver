var express = require('express');
var http = require('http');




var HttpServer = function HttpServer() {
    var self = this;
    self.app = express();
    self.httpServer = http.createServer(self.app);
    self.port = process.env.PORT || 5000;


    self.app.get('/', function(req, res) {
	res.send('D3VICE');
    });
    
    self.httpServer.listen(self.port);

    return self;
}


HttpServer.prototype.getPort = function getPort() {
    var self = this;
    return self.port;
}




module.exports = HttpServer;


