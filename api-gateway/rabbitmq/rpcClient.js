const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

let channel;

async function connectRabbitMQ() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
}

async function sendRPCRequest(queue, message) {
    const correlationId = uuidv4();
    const replyQueue = await channel.assertQueue('', { exclusive: true });

    return new Promise((resolve) => {
        channel.consume(
            replyQueue.queue,
            (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    const data = JSON.parse(msg.content.toString());
                    resolve(data);
                }
            },
            { noAck: true }
        );

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            correlationId,
            replyTo: replyQueue.queue
        });
    });
}

module.exports = { connectRabbitMQ, sendRPCRequest };
