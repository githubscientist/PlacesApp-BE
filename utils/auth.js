const jwt = require('jsonwebtoken');
const config = require('./config');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    // get the token from the request header
    const token = req.headers.authorization;

    // if there is no token, throw an error
    if (!token) {
        return next(new HttpError('Authentication failed', 401));
    }

    // helper function to get the token from the header
    const getTokenFromHeader = (req) => {
        const authorization = req.headers.authorization;

        if(authorization && authorization.toLowerCase().startsWith('bearer')) {
            return authorization.split(' ')[1];
        }

        return null;
    };

    // verify the token
    try {
        const decodedToken = jwt.verify(getTokenFromHeader(req), config.JWT_SECRET);

        // add the user id to the request
        req.userId = decodedToken.userId;

        // call the next middleware
        next();
    } catch (err) {
        return next(new HttpError('The token is invalid', 401));
    }
}