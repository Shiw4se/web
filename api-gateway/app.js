const express = require('express');
const dotenv = require('dotenv');
const path = require('path');  // <- додати path
const { connectRabbitMQ, authenticateUser, authenticateAdmin  } = require('./rabbitmq/rpcClient');
const userRoutes = require('./routes/user.routes');
const slotRoutes = require('./routes/slots.routes');
const BookingRoutes = require('./routes/booking.routes');

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/venue', slotRoutes);
app.use('/api/venue/admin', authenticateAdmin, slotRoutes);
app.use('/api/bookings', authenticateUser, BookingRoutes);

// --- додано для сервування React фронтенду ---
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;

connectRabbitMQ().then(() => {
    app.listen(PORT, () => {
        console.log(`API Gateway running on port ${PORT}`);
    });
});
