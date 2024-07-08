import amqp from 'amqplib';

async function start() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'topic_logs';

    await channel.assertExchange(exchange, 'topic', { durable: false });

    const q = await channel.assertQueue('', { exclusive: true });

    console.log(' [*] Waiting for logs. To exit press CTRL+C');

    await channel.bindQueue(q.queue, exchange, 'A-B');

    channel.consume(q.queue, (msg) => {
      const receivedNumbers = JSON.parse(msg.content.toString());
      const num1 = receivedNumbers.num1;
      const num2 = receivedNumbers.num2;

      console.log(" [.] sub(%d - %d)", num1, num2);

      const r = sub(num1, num2);
      console.log(" [x] %s = %d", msg.fields.routingKey, r);

      const key = 'response';

      channel.publish(exchange, key, Buffer.from(r.toString()));
      console.log(" [x] Sent %s:", key, r);
    }, { noAck: true });
  } catch (error) {
    console.error("Error:", error);
  }
}

function sub(a, b) {
  return a - b;
}

start();

