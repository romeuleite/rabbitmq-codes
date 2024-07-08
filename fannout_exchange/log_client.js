import amqp from 'amqplib';

const state = process.argv.slice(2).join(' ');

const exchange = 'logs';

async function start() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'fanout', { durable: false });
    channel.publish(exchange, '', Buffer.from(state));
    console.log(" [x] Sent:", state);

    setTimeout(async () => {
      await channel.close();
      await connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();

