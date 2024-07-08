import amqp from 'amqplib';

async function main() {
  try {
    // Conectar ao servidor RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'topic_logs';

    // Declaração do exchange
    await channel.assertExchange(exchange, 'topic', { durable: false });

    // Consumidor para receber requisições do cliente
    const q1 = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for client request. To exit press CTRL+C');

    // Bind da fila ao exchange com a rota 'A=B'
    await channel.bindQueue(q1.queue, exchange, 'A=B');

    // Consumir mensagens da fila
    await channel.consume(q1.queue, async function (msg) {
      const receivedNumbers = JSON.parse(msg.content.toString());
      const num1 = receivedNumbers.num1;
      const num2 = receivedNumbers.num2;

      console.log(` [.] (${num1} = ${num2})`);

      const key = 'A-B';

      // Publicar mensagem de resposta
      await channel.publish(exchange, key, Buffer.from(JSON.stringify(receivedNumbers)));
      console.log(` [x] Sent ${key}:`, receivedNumbers);
    }, { noAck: true });

    // Consumidor para receber respostas do servidor A-B
    const q2 = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for server A-B response. To exit press CTRL+C');

    // Bind da segunda fila ao exchange com a rota 'response'
    await channel.bindQueue(q2.queue, exchange, 'response');

    // Consumir mensagens da segunda fila
    await channel.consume(q2.queue, function (msg) {
      const resultNumber = parseInt(msg.content.toString());

      const response = (resultNumber === 0) ? 'true' : 'false';
      console.log(` [.] A = B? (${response})`);
    }, { noAck: true });

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main();

