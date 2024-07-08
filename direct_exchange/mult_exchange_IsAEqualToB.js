import amqp from 'amqplib';

async function start() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    var consumer_exchange = 'IsAEqualToB';
    await channel.assertExchange(consumer_exchange, 'direct', { durable: false });

    const q1 = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for client request. To exit press CTRL+C');

    await channel.bindQueue(q1.queue, consumer_exchange, 'A=B');

    channel.consume(q1.queue, (msg) => {
      const receivedNumbers = JSON.parse(msg.content.toString());
      const { num1, num2 } = receivedNumbers;

      console.log(" [.] (%d = %d)", num1, num2);

      const publisher_exchange = 'AsubB';
      const operation = 'A-B';
      channel.assertExchange(publisher_exchange, 'direct', { durable: false });
      channel.publish(publisher_exchange, operation, Buffer.from(JSON.stringify(receivedNumbers)));
      console.log(" [x] Sent %s:", operation, receivedNumbers);
    }, { noAck: true });

    const server_reply_exchange = 'AsubBresponse';
    await channel.assertExchange(server_reply_exchange, 'direct', { durable: false });
    
    const q2 = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for server A-B response. To exit press CTRL+C');

    await channel.bindQueue(q2.queue, server_reply_exchange, 'response');

    channel.consume(q2.queue, (msg) => {
      const resultNumber = parseInt(msg.content.toString());

      const response = resultNumber === 0 ? 'true' : 'false';
      console.log(" [.] A = B? (%s)", response);

    }, { noAck: true });

  } catch (error) {
    console.error(error);
  }
}

start();

