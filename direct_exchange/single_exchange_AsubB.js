import amqp from 'amqplib';

async function start() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'direct_logs';
    const queueResult = await channel.assertQueue('', { exclusive: true });

    await channel.assertExchange(exchange, 'direct', { durable: false });

    console.log(' [*] Waiting for logs. To exit press CTRL+C');

    await channel.bindQueue(queueResult.queue, exchange, 'A-B');

    channel.consume(queueResult.queue, (msg) => {
      if (msg !== null) {
        const receivedNumbers = JSON.parse(msg.content.toString());
        const num1 = receivedNumbers.num1;
        const num2 = receivedNumbers.num2;

        console.log(" [.] sub(%d - %d)", num1, num2);

        const result = sub(num1, num2);
        console.log(" [x] %s = %d", msg.fields.routingKey, result);

        const operation = 'response';
        channel.publish(exchange, operation, Buffer.from(result.toString()));
        console.log(" [x] Sent %s:", operation, result);
      }
    }, { noAck: true });
  } catch (error) {
    console.error('Error:', error);
  }
}

function sub(a, b) {
  return a - b;
}

start();

