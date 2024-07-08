import amqp from 'amqplib';

async function main() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'A=B_queue';

    await channel.assertQueue(queue, { durable: false });

    console.log(' [x] Awaiting requests from clients');
    channel.consume(queue, async (msg) => {
      const receivedNumbers = JSON.parse(msg.content.toString());
      const num1 = receivedNumbers.num1;
      const num2 = receivedNumbers.num2;
      console.log(" [x] Calling function isAEqualB A(%d) B:(%d)", num1, num2);

      try {
        const response = await isAEqualToB(receivedNumbers, connection);
        channel.sendToQueue(msg.properties.replyTo,
          Buffer.from(response.toString()), {
          correlationId: msg.properties.correlationId
        });
      } catch (error) {
        console.error("Error in isAEqualToB:", error);
      }

      channel.ack(msg);
    });
  } catch (error) {
    console.error("Connection error:", error);
  }
}

async function isAEqualToB(numbers, connection) {
  const response = await new Promise(async (resolve, reject) => {
    try {
      const secondChannel = await connection.createChannel();
      const q = await secondChannel.assertQueue('', { exclusive: true });
      const correlationId = generateUuid();

      secondChannel.consume(q.queue, (responseMsg) => {
        const subResponse = parseInt(responseMsg.content.toString());
        console.log(" [.] Response from AsubB server is %s", subResponse);
        resolve(subResponse === 0);
      }, { noAck: true });

      console.log(" [x] Forwarding message to AsubB server:", numbers);
      secondChannel.sendToQueue('A-B_queue',
        Buffer.from(JSON.stringify(numbers)), {
        correlationId: correlationId,
        replyTo: q.queue
      });
    } catch (error) {
      reject(error);
    }
  });

  return response;
}

function generateUuid() {
  return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

main();

