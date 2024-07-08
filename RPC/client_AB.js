import amqp from 'amqplib';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: client_AB.js num num");
  process.exit(1);
}

const num1 = parseInt(args[0]);
const num2 = parseInt(args[1]);

async function main() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const q = await channel.assertQueue('', { exclusive: true });
    const correlationId = generateUuid();

    const numbers = { num1, num2 };

    console.log(' [x] Requesting A:(%d) = B:(%d)?', numbers.num1, numbers.num2);

    channel.consume(q.queue, (msg) => {
      if (msg.properties.correlationId === correlationId) {
        console.log(' [.] Got %s', msg.content.toString());
        setTimeout(() => {
          connection.close();
          process.exit(0);
        }, 500);
      }
    }, { noAck: true });

    channel.sendToQueue('A=B_queue', Buffer.from(JSON.stringify(numbers)), {
      correlationId: correlationId,
      replyTo: q.queue
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

function generateUuid() {
  return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

main();

