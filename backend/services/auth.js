const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registerService = async ({ phone, password, name }) => {
    try {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return {
                err: 2,
                msg: 'Phone number has been already used!',
                token: null
            };
        }

        const newUser = new User({
            phone,
            name,
            password
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, phone: newUser.phone },
            process.env.SECRET_KEY,
            { expiresIn: '2d' }
        );

        return {
            err: 0,
            msg: 'Register is successfully!',
            token
        };
    } catch (error) {
        throw error;
    }
};

const loginService = async ({ phone, password }) => {
    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return {
                err: 2,
                msg: 'Phone number not found!',
                token: null
            };
        }

        const isCorrectPassword = await user.comparePassword(password);
        if (!isCorrectPassword) {
            return {
                err: 2,
                msg: 'Password is wrong!',
                token: null
            };
        }

        const token = jwt.sign(
            { id: user._id, phone: user.phone },
            process.env.SECRET_KEY,
            { expiresIn: '2d' }
        );

        return {
            err: 0,
            msg: 'Login is successfully!',
            token
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    registerService,
    loginService
};