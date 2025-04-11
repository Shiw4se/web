﻿const amqp = require('amqplib');
const { register, login } = require('../controllers/user.controller');
require('dotenv').config();

async function start() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(process.env.RPC_QUEUE, { durable: false });
    console.log(`[x] Waiting for RPC requests on ${process.env.RPC_QUEUE}`);

    channel.consume(process.env.RPC_QUEUE, async (msg) => {
        const { action, data } = JSON.parse(msg.content.toString());

        let response;
        if (action === 'register') {
            response = await register(data);
        } else if (action === 'login') {
            response = await login(data);
        } else {
            response = { status: 400, body: { message: 'Unknown action' } };
        }

        channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
        );

        channel.ack(msg);
    });
}

module.exports = { start };
