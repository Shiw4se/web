const { Booking } = require('../models/index');
const { Slot } = require('../../venue-service/models/index');

async function createBooking(data) {


    try {
        // Створюємо бронювання
        const booking = await Booking.create(data);

        const { slot_id } = data;  // Отримуємо slot_id з даних бронювання

        // Оновлюємо слот, щоб він більше не був доступний
        const slot = await Slot.findByPk(slot_id);  // Знайдемо слот за ID
        if (!slot) {
            return { status: 404, body: { message: 'Slot not found' } };
        }

        // Оновлюємо статус доступності слота
        slot.is_available = false;
        await slot.save();  // Зберігаємо зміни в слоті

        return { status: 201, body: booking };
    } catch (err) {
        return { status: 500, body: { message: 'Error creating booking', error: err.message } };
    }
}

// GET /bookings/:userId — отримання всіх бронювань користувача
async function getBookingsByUser(userId) {

    try {
        const bookings = await Booking.findAll({ where: { user_id: userId } });
        return { status: 200, body: bookings };
    } catch (err) {
        return { status: 500, body: { message: 'Error fetching bookings', error: err.message } };
    }
}

// DELETE /bookings/:bookingId — скасування бронювання
async function cancelBooking(bookingId) {
    try {
        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return { status: 404, body: { message: 'Booking not found' } };
        }

        await booking.destroy();

        return { status: 200, body: { message: 'Booking cancelled successfully' }};
    } catch (err) {
        return { status: 500, body: { message: 'Error cancelling booking', error: err.message } };
    }
}

module.exports = {
    createBooking,
    getBookingsByUser,
    cancelBooking
};