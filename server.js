const fortune = require('fortune');
const express = require('express');
const cors = require('cors');
const nedbAdapter = require('fortune-nedb');
const jsonApiSerializer = require('fortune-json-api');
const path = require('path');
const game = require('./game');


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
var g = game(app);


server.use(cors());
server.use(fortune.net.http(app, fortuneHttpOpts));
console.log('listening on port ' + port);
server.listen(port);
