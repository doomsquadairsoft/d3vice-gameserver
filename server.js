var path = require('path');
var express = require('express');
var game = require(path.join(__dirname, 'game'));
var network = require(path.join(__dirname, 'network'));


var createServer = function(port) {
  var app = express();

  /**
   * Game state
   *
   * Responds with JSON object representing current game state
   */
  app.get('/api/v1/game', function(req, res) {
    game.state.get(function(err, state) {

      // if there is an error, see if it is one we can handle
      if (err) {
        console.log('there was an error! ' + err);
        if (/state does not exist/.test(err)) {
          // if the state does not exist, create it
          game.state.create(function(err, state) {
            if (err) return res.status(500).json({ error: err });
            //console.log(state);
            res.json(state);
          });
        } else {
          // unknown errors get sent in response
          return res.status(500).json({ error: err });
        }
      } else {
        // no errors, so respond with game state
        console.log('there was no error.')
        res.json(state);
      }
    });
  });

  /**
   * Network state
   *
   * Responds with JSON object representing the current network state
   */
  app.get('/api/v1/network', function(req, res) {
    network.state.read(function(err, state) {

      if (err) {
        // if there is an error, see if it is one we can handle
        if (/state does not exist/.test(err)) {
          // if the state does not exist, create it
          network.state.create(function(err, state) {
            if (err) return res.status(500).json({ error: err });
            res.json(state);
          });
        } else {
          // unknown errors get sent in response
          return res.status(500).json({ error: err });
        }
      } else {
        console.log('no errors getting network state');
        res.json(state);
      }
    });
  });

  return app.listen(port);
};

module.exports = createServer;
