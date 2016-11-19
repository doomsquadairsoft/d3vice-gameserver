

var Game = require('./lib/domination');
var advertiser = require('./lib/advertiser');
var HttpServer = require('./lib/http');
var SocketServer = require('./lib/socket-server');




// start an http server for serving game status page & admin controls
var http = new HttpServer();



// start a socket server which sends/receives live data from sensors & displays
var ss = new SocketServer(http.httpServer);


// create game instance which handles game state & game events
var game = new Game().start();


// advertise the game server's presense to the network via MDNS
advertiser.begin();
