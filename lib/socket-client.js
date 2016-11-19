var Primus = require('primus');


var Socket = Primus.createSocket(); //(server, { transformer: 'websockets' });
var wsc = new Socket('http://localhost:8080');



/**
 * create a socket connection with the server
 *
 * @param {string} address - address+port of the socket server
 */
var SocketClient = function SocketClient(address) {
    
}



// connects to server using primus
wsc.on('data', function(data) {
    
});
