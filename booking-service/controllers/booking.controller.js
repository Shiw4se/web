const Booking = require('../models/booking.model');

async function createBooking(data) {
const {user_id, venue_id, slot_id, start_time,end_time, status} = data;

try{
    const booking = await Booking.create({
        id: uuidv4(),
        user_id,
        venue_id,
        slot_id,
        start_time,
        end_time,
        status: status || 'pending',
    });
    return{
        status: 201,
        body: {
            message: 'Booking created successfully.',
            booking,
        },
    };
    } catch (err) {
    return {
        status: 500,
        body: {
            message: 'Error creating booking', error: err.message
        },
    };
  }
}

// GET /bookings/:userId — отримання всіх бронювань користувача
async function getBookingsByUser(userId) {
    try {
        const bookings = await Booking.findAll({ where: { user_id: userId } });

        return {
            status: 200,
            body: bookings,
        };
    } catch (err) {
        return {
            status: 500,
            body: { message: 'Error fetching bookings', error: err.message },
        };
    }
}

// DELETE /bookings/:bookingId — скасування бронювання
async function cancelBooking(bookingId) {
    try {
        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            return {
                status: 404,
                body: { message: 'Booking not found' },
            };
        }

        await booking.destroy();

        return {
            status: 200,
            body: { message: 'Booking cancelled successfully' },
        };
    } catch (err) {
        return {
            status: 500,
            body: { message: 'Error cancelling booking', error: err.message },
        };
    }
}

module.exports = {
    createBooking,
    getBookingsByUser,
    cancelBooking,
};