const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    City: { type: String, required: true },
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }
});

module.exports = mongoose.model('Place', placeSchema, 'places');