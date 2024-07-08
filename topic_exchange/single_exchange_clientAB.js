import amqp from 'amqplib';

const args = process.argv.slice(2);

async function publishMessage() {
  const exchange = 'topic_logs';

  const num1 = parseInt(args[0]);
  const num2 = parseInt(args[1]);
  const key = args[2];

  const numbers = {
    num1: num1,
    num2: num2
  };

  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'topic', { durable: false });
    channel.publish(exchange, key, Buffer.from(JSON.stringify(numbers)));
    console.log(" [x] Sent %s:", key, numbers);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(error);
  }
}

publishMessage();

