import amqp from 'amqplib';

const args = process.argv.slice(2);

async function publishMessage() {
  const exchange = 'stock_price';

  const stock_price = args[0];
  const key = args[1];

  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'topic', { durable: false });
    channel.publish(exchange, key, Buffer.from(stock_price));
    console.log(" [x] Sent %s:", key, stock_price);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(error);
  }
}

publishMessage();

