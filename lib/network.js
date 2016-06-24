var amqp = require('amqplib/callback_api');


/**
 * broadcast a message to a named queue
 *
 * @param {string} routingKey - Name of the channel (bind/queue) to publish to
 * @param {string} message - the message to send
 * @param {onBroadcastedCallback} cb
 */
var broadcast = function broadcast(routingKey, message, cb) {
        if (typeof routingKey === 'undefined' || typeof message === 'undefined' ||
            typeof cb === 'undefined') {
            throw new Error('params are required! broadcast(routingKey, message, cb)');
        }

        if (typeof routingKey !== 'string')
            throw new Error('first param must be {string} routingKey. got a ' +
                typeof routingKey);

        if (typeof message !== 'string')
            throw new Error('Second param must be {string} message. got a ' +
                typeof message);

        if (typeof cb !== 'function')
            throw new Error(
                'third param must be a callback function. got a ' + typeof cb);


        amqp.connect('amqp://localhost', function(err, conn) {
            conn.createChannel(function(err, ch) {
                var ex = 'd3vice';
                ch.assertExchange(ex, 'topic', {
                    durable: false
                });
                // empty string on second param means we don't want to send the message
                // to any specific queue. We want only to publish it to our logs exchange
                ch.publish(ex, routingKey, new Buffer(message));
                setTimeout(function() {
                    conn.close()
                }, 500);

                return cb(null);
            });
        });
    }
    /**
     * @callback {onBroadcastedCallback}
     * @param {Error} err
     */






module.exports = {
    broadcast: broadcast
}
