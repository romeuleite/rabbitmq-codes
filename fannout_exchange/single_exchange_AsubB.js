import amqp from 'amqplib';

async function start() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const cons_exchange = 'A=B_request';
    await channel.assertExchange(cons_exchange, 'fanout', { durable: false });

    const queueResult = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for logs. To exit press CTRL+C');

    await channel.bindQueue(queueResult.queue, cons_exchange, '');

    channel.consume(queueResult.queue, (msg) => {
      if (msg !== null) {
        const receivedNumbers = JSON.parse(msg.content.toString());
        const num1 = receivedNumbers.num1;
        const num2 = receivedNumbers.num2;

        console.log(" [.] sub(%d - %d)", num1, num2);

        const result = sub(num1, num2);
        console.log(" [x] %s = %d", msg.fields.routingKey, result);

        const pub_exchange = 'A-B_response';
        channel.assertExchange(pub_exchange, 'fanout', { durable: false });

        channel.publish(pub_exchange, '', Buffer.from(result.toString()));
        console.log(" [x] Sent :", result);
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

