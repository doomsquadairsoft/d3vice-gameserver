const fortune = require('fortune');
const express = require('express');
const cors = require('cors');
const nedbAdapter = require('fortune-nedb');
const jsonApiSerializer = require('fortune-json-api');
const path = require('path');
const faker = require('faker');
//const game = require('./game');
const network = require('./network');
const advertiser = require('./advertiser');



const store = require('./store');
const port = process.env.PORT || 11337;
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
  var doVoice = false;
  var randNum = faker.random.number({max: 5});
  if (randNum < 2) doVoice = true;
  var d;
  var s;
  if (randNum == 0) {
    s = 'pammy.all.tts';
    d = JSON.stringify({"text": faker.lorem.sentence(), "voice": "Princess"});
  }
  else {
    s = doVoice ? 'pammy.all.file' : faker.random.word();
    d = JSON.stringify({"path": "clear.wav"});
  }

  network.broadcast(
    'd3vice.'+s,
    d,
    function(err) {
      if (err) throw err;
      return
    })}, 3000);

server.use(cors());
server.use(fortune.net.http(app, fortuneHttpOpts));
server.listen(port, function() {
  console.log('listening on port ' + port);
  return advertiser.begin(port);
});


module.exports = server;
