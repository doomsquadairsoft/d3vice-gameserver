var bomb = require('./bomb');
var domination = require('./domination');
var intel = require('./intel');
var state = require('./state');


function start() {

}


function stop() {
  ipfs.name()
}


function pause() {

}

module.exports = {
  "start": start,
  "stop": stop,
  "pause": pause,
  "domination": domination,
  "intel": intel,
  "bomb": bomb,
  "state": state
}
