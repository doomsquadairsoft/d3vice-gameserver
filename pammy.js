var say = require('./lib/say');





say('red team')
    .then(function() {
	return say('green team');
    })



