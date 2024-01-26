const express = require('express');
const usersController = require('../controllers/usersController');
const { check } = require('express-validator');
const userRouter = express.Router();

userRouter.post(
    '/signup',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 }),
    ],
    usersController.signup
);
userRouter.post(
    '/login',
    [
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 }),
    ],
    usersController.login
);
userRouter.get('/', usersController.getUsers);

module.exports = userRouter;