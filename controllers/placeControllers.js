const Place = require('../models/place');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const config = require('../utils/config');
const mongoose = require('mongoose');
const User = require('../models/user');

const getPlacesByUserId = async (req, res, next) => { 
    // get the user id from the request parameters
    const userId = req.params.uid;

    // find the places with the user id
    let places;

    try {
        places = await Place.find({ creator: userId });

        // if no places are found, throw an error
        if (!places || places.length === 0) {
            return next(new HttpError('Could not find places for the provided user id', 404));
        }

        // return the places
        res.json({ places: places.map(place => place.toObject({getters: true})) });
    } catch (err) {
        const error = new HttpError('Fetching places failed, please try again later', 500);
        return next(error);
    }
};
const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place', 500);
        return next(error);
    }

    // if no place is found, throw an error
    if(!place) {
        return next(new HttpError('Could not find a place for the provided id', 404));
    }

    // return the place
    res.json({ place: place.toObject({ getters: true }) });
};
 
const createPlace = async (req, res, next) => { 
    // validate the request body
    const errors = validationResult(req);

    // if there are errors, throw an error
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    try {
        // get the userid from the request
        const userId = req.userId;

        // get the request body
        const { title, description, address } = req.body;

        // create a new place
        const place = new Place({
            title,
            description,
            address,
            creator: userId
        });

        const sess = await mongoose.startSession();
        sess.startTransaction();
        // save the place
        let result = await place.save();

        // save the place id to the user
        const user = await User.findById(userId);

        user.places.push(result._id);

        await user.save();

        await sess.commitTransaction();

        // return the place
        res.status(201).json({ place: result.toObject({ getters: true }) });
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500);
        return next(error);
    }
};
const updatePlace = async (req, res, next) => { 
    // validate the request body
    const errors = validationResult(req);

    // if there are errors, throw an error
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    // get the place id from the request parameters
    const placeId = req.params.pid;

    // get the request body
    const { title, description, address } = req.body;

    // find the place
    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    // if the user is not the creator of the place, throw an error that the user is not authorized
    if (place.creator.toString() !== req.userId) {
        const error = new HttpError('You are not allowed to edit this place', 401);
        return next(error);
    }

    // update the place
    place.title = title;
    place.description = description;
    place.address = address;

    // save the place in the database
    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    // return the place
    res.status(200).json({ place: place.toObject({ getters: true }) });
};
const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }

    // if there is no place, throw an error
    if (!place) {
        return next(new HttpError('Could not find place for this id', 404));
    }

    // if the user is not the creator of the place, throw an error that the user is not authorized
    if (place.creator.id !== req.userId) {
        const error = new HttpError('You are not allowed to delete this place', 401);
        return next(error);
    }

    // delete the place
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }

    // return a response
    res.status(200).json({ message: 'Deleted place' });
};

exports.getPlacesByUserId = getPlacesByUserId;
exports.getPlaceById = getPlaceById;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;