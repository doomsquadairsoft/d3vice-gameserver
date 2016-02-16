var express = require('express');
var game = require('./game');

var createServer = function(port) {
  var app = express();

  app.get('/api/v1/game', function(req, res) {
    game.state.get(function(err, state) {
      if (err) return res.status(500).json({error: err});
      if (typeof(state) === 'undefined') return res.status(500).json({error: 'game state not defined'})
      res.json(state);
    });
  });

  return app.listen(port);
};

module.exports = createServer;
