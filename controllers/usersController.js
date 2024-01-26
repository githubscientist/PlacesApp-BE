const HttpError = require('../models/http-error');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const signup = async (req, res, next) => {

    // check if there are any validation errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    try {
        // get the name, email, password from the request body
        const { name, email, password } = req.body;

        // check if the user already exists
        const user = await User.findOne({ email: email });

        // if user exists, throw an error
        if (user) {
            return next(new HttpError('User already exists', 422));
        }

        // if the user does not exist, create a new user

        // hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // create a new user object
        const newUser = new User({
            name,
            email,
            password: passwordHash,
            places: []
        });

        // save the new user to the database
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await newUser.save({ session: sess });
            await sess.commitTransaction();

            // send a response
            res.status(201).json({ user: newUser.toObject({ getters: true }) });
        } catch (err) {
            const error = new HttpError('Something went wrong, could not complete signup', 500);
            return next(error);
        }

    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later', 500);
        return next(error);
    }
}

const login = async (req, res, next) => {
    // check if there are any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    // get the email and password from the request body
    const { email, password } = req.body;

    // check if the user exists in the database
    const user = await User.findOne({ email: email });

    // if the user does not exist, throw an error
    if (!user) {
        return next(new HttpError('No such user found, could not log you in', 401));
    }

    // if the user exists, check if the password matches the password in the database
    const isValidPassword = await bcrypt.compare(password, user.password);

    // if the password does not match, throw an error
    if (!isValidPassword) {
        return next(new HttpError('Invalid password, could not log you in', 401));
    }

    // if the password matches, generate a token and return it
    const token = jwt.sign({
        userId: user._id,
        email: user.email
    }, config.JWT_SECRET, { expiresIn: '1h' });

    // send a response
    res.json({ message: 'user logged in' ,userId: user._id, email: user.email, token: token });
}
    
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, '-password');
        res.json({ users: users.map(user => user.toObject({ getters: true })) });
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later', 500);
        return next(error);
    }
}
    
exports.signup = signup;
exports.login = login;
exports.getUsers = getUsers;