const express = require('express');
const { check } = require('express-validator');
const placeControllers = require('../controllers/placeControllers');
const auth = require('../utils/auth');

const placesRouter = express.Router();

// define the endpoints
// public routes
placesRouter.get('/user/:uid', placeControllers.getPlacesByUserId);
placesRouter.get('/:pid', placeControllers.getPlaceById);

placesRouter.use(auth);

// protected routes
placesRouter.post(
    '/',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty()
    ],
    placeControllers.createPlace
);
placesRouter.patch('/:pid', [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
], placeControllers.updatePlace);
placesRouter.delete('/:pid', placeControllers.deletePlace);

module.exports = placesRouter;