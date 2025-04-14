const express = require('express');
const dotenv = require('dotenv');
const { connectRabbitMQ, authenticateUser, authenticateAdmin  } = require('./rabbitmq/rpcClient');
const userRoutes = require('./routes/user.routes');
const slotRoutes = require('./routes/slots.routes');

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/venue', slotRoutes);
app.use('/api/venue/admin', authenticateAdmin, slotRoutes);

const PORT = process.env.PORT || 3000;

connectRabbitMQ().then(() => {
    app.listen(PORT, () => {
        console.log(`API Gateway running on port ${PORT}`);
    });
});
