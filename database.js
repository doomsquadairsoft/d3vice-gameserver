/*
   Redis database client
 */

var path = require('path');
var nconf = require('nconf');
var redis = require('redis');

nconf.file(path.join(__dirname, 'config.json'));
var redisHost = nconf.get('REDIS_HOST');
var redisPort = nconf.get('REDIS_PORT');


if ((typeof redisHost) === 'undefined') throw new Error('REDIS_HOST not defined in config.json');
if ((typeof redisPort) === 'undefined') throw new Error('REDIS_PORT not defined in config.json');

var red = redis.createClient({host: redisHost, port: redisPort});

module.exports = red;
