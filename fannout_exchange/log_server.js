import amqp from 'amqplib';

async function start() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'logs';
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    const queueResult = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for logs. To exit press CTRL+C');

    await channel.bindQueue(queueResult.queue, exchange, '');

    channel.consume(queueResult.queue, (msg) => {
      if (msg !== null) {
        const receivedMsg = (msg.content.toString());

        console.log(" [.] State Received:", receivedMsg);
      }
    }, { noAck: true });
  } catch (error) {
    console.error('Error:', error);
  }
}

start();

