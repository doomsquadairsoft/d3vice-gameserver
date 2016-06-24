const fortune = require('fortune');
const express = require('express');
const cors = require('cors');
const nedbAdapter = require('fortune-nedb');
const jsonApiSerializer = require('fortune-json-api');
const path = require('path');
//const game = require('./game');
const network = require('./network');
const faker = require('faker');


const store = require('./store');
const port = 1337;
const fortuneOpts = {
  adapter: [
    nedbAdapter, {
      dbPath: path.join(process.env.HOME, '.d3vice', 'db.nedb')
    }
  ]
}
const fortuneHttpOpts = {
  serializers: [
    [jsonApiSerializer]
  ]
}

const server = express();
const app = fortune(store, fortuneOpts);
//var g = game(app);

setInterval(function() {
  network.broadcast(
    'd3vice.'+faker.random.word(),
    faker.lorem.sentence(),
    function(err) {
      if (err) throw err;
      return
    })}, 5000);

server.use(cors());
server.use(fortune.net.http(app, fortuneHttpOpts));
console.log('listening on port ' + port);
server.listen(port);


module.exports = server;
