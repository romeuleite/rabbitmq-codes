import amqp from 'amqplib';

async function start() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'stock_price';

    await channel.assertExchange(exchange, 'topic', { durable: false });

    const q = await channel.assertQueue('', { exclusive: true });

    console.log(' [*] Waiting for logs. To exit press CTRL+C');

    await channel.bindQueue(q.queue, exchange, '*.BBB');

    channel.consume(q.queue, (msg) => {
      const receivedStockPrice = msg.content.toString();
      console.log(" [x] %s Stock price = R$ %s ", msg.fields.routingKey, receivedStockPrice);

    }, { noAck: true });
  } catch (error) {
    console.error("Error:", error);
  }
}

start();

