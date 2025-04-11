const express = require('express');
const { sequelize } = require('./models');
const { start } = require('./rabbitmq/consumer');
require('dotenv').config();

const app = express();
app.use(express.json());

sequelize.sync().then(() => {
    console.log('DB synced');
    app.listen(process.env.PORT, () => {
        console.log(`User Service running on port ${process.env.PORT}`);
        start(); // Start RabbitMQ consumer
    });
});
