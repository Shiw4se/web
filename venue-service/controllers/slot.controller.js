const Venue = require('../models/venue-model');
const Slot = require('../models/slot.module');

// Створення нового майданчика
async function createVenue(data) {
    try {
        const venue = await Venue.create(data);
        return { status: 201, body: venue };
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }
}

// Отримання всіх майданчиків
async function getAllVenues() {
    try {
        const venues = await Venue.findAll();
        return { status: 200, body: venues };
    } catch (err) {
        return { status: 500, body: { message: err.message } };
    }
}

// Отримання слотів для конкретного майданчика
async function getSlotsByVenueId(venueId) {
    try {
        const slots = await Slot.findAll({
            where: { venueId },
            include: Venue
        });
        return { status: 200, body: slots };
    } catch (err) {
        return { status: 500, body: { message: err.message } };
    }
}

async function createSlot(data) {
    try {
        const slot = await Slot.create(data);
        return { status: 201, body: slot };
    } catch (err) {
        return { status: 400, body: { message: err.message } };
    }
}

async function deleteSlot(id) {
    try {
        const slot = await Slot.findByPk(id);
        if (!slot) {
            return { status: 404, body: { message: 'Slot not found' } };
        }

        await slot.destroy();
        return { status: 200, body: { message: 'Slot deleted' } };
    } catch (err) {
        return { status: 500, body: { message: err.message } };
    }
}

module.exports = {
    createVenue,
    getAllVenues,
    getSlotsByVenueId,
    createSlot,
    deleteSlot,
};
