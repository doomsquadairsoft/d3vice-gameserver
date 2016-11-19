var express = require('express');
var http = require('http');




var HttpServer = function HttpServer() {
    this.app = express();
    this.httpServer = http.createServer(this.app);


    this.app.get('/', function(req, res) {
	res.send('D3VICE');
    });
    
    //this.app.listen(process.env.PORT || 5000);
    this.httpServer.listen(process.env.PORT || 5000);

    return this;
}




module.exports = HttpServer;


