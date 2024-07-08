import amqp from 'amqplib';

async function main() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'A-B_queue';

    await channel.assertQueue(queue, { durable: false });

    console.log(' [x] Awaiting RPC requests');

    channel.consume(queue, async function (msg) {
      const receivedNumbers = JSON.parse(msg.content.toString());
      const num1 = receivedNumbers.num1;
      const num2 = receivedNumbers.num2;

      console.log(" [.] sub(%d - %d)", num1, num2);

      const r = sub(num1, num2);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(r.toString()), {
        correlationId: msg.properties.correlationId
      }
      );

      channel.ack(msg);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

function sub(a, b) {
  return a - b;
}

main();

