var bomb = require('./bomb');
var domination = require('./domination');
var intel = require('./intel');
var state = require('./state');


function start(cb) {
  return cb(new Error('@todo implement me'));
}


function stop() {
  return cb(new Error('@todo implement me'));
}


function pause() {
  return cb(new Error('@todo implement me'));
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
