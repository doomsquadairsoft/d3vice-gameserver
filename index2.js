

var Input = require('./lib/mockInput');
var Game = require('./lib/game');



var game = new Game().start();

var input = new Input().begin().on('button', function(b) {


    if (b === 'green')
        game.setControlTeam(0);

    if (b === 'red')
        game.setControlTeam(1);
});

