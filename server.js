

var Game = require('./lib/domination');
var advertiser = require('./lib/advertiser');
var HttpServer = require('./lib/http');
var SocketServer = require('./lib/socket-server');
var Adapter = require('lib/adapter');



// start an http server for serving game status page & admin controls
var http = new HttpServer();



// start a socket server which sends/receives live data from sensors & displays
var ss = new SocketServer(http.httpServer);



// create game instance which handles game state & game events
var game = new Game().start();



// create a sensor input (via socket) adapter which sends data to the game
var adapter = new Adapter(game, ss);



// advertise the game server's presense to the network via MDNS
advertiser.begin(http.getPort());