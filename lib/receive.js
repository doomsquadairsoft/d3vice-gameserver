var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'd3vice';
    ch.assertExchange(ex, 'topic', {durable: false});
    ch.assertQueue('', {durable: false}, function(err, q) {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);

      ch.bindQueue(q.queue, ex, 'd3vice.#');

      ch.consume(q.queue, function(msg) {
        console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
      }, {noAck: true});
    });
  });
});
