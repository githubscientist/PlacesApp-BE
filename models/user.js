const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
    },
    places: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Place',
        },
    ],
});

module.exports = mongoose.model('User', userSchema, 'users');