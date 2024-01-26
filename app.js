const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/userRoutes');

const app = express();

// use the cors middleware
app.use(cors());

// parse JSON bodies into JavaScript objects
app.use(express.json());

// define the endpoints
app.use('/api/users', userRouter);

// define the not found middleware
app.use((req, res, next) => {
    const error = new Error('Could not find this route', 404);
    throw error;
});

// define the error handler middleware
app.use((err, req, res, next) => {
    if(res.headerSent) {
        return next(err);
    }

    res.status(err.code || 500);
    res.json({ message: err.message || 'An unknown error occurred' });
});

module.exports = app;