import amqp from 'amqplib';

async function start() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'client_request';
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    const q1 = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for client request. To exit press CTRL+C');

    await channel.bindQueue(q1.queue, exchange, '');

    channel.consume(q1.queue, (msg) => {
      const receivedNumbers = JSON.parse(msg.content.toString());
      const { num1, num2 } = receivedNumbers;

      console.log(" [.] (%d = %d)", num1, num2);

      const pub_exchange = 'A=B_request';
      channel.assertExchange(pub_exchange, 'fanout', { durable: false });

      channel.publish(pub_exchange, '', Buffer.from(JSON.stringify(receivedNumbers)));
      console.log(" [x] Sent :", receivedNumbers);
    }, { noAck: true });

    const cons_exchange = 'A-B_response';
    await channel.assertExchange(cons_exchange, 'fanout', { durable: false });

    const q2 = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for server A-B response. To exit press CTRL+C');

    await channel.bindQueue(q2.queue, cons_exchange, '');

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

