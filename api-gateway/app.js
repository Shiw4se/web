const express = require('express');
const dotenv = require('dotenv');
const { connectRabbitMQ } = require('./rabbitmq/rpcClient');
const userRoutes = require('./routes/user.routes');

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;

connectRabbitMQ().then(() => {
    app.listen(PORT, () => {
        console.log(`API Gateway running on port ${PORT}`);
    });
});
