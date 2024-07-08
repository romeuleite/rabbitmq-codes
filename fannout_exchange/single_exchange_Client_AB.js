import amqp from 'amqplib';

const args = process.argv.slice(2);

const exchange = 'client_request';
const num1 = parseInt(args[0]);
const num2 = parseInt(args[1]);
const numbers = { num1, num2 };

async function start() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'fanout', { durable: false });
    channel.publish(exchange, '', Buffer.from(JSON.stringify(numbers)));
    console.log(" [x] Sent:", numbers);

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

