const User = require('../models/user');
const CustomerSupport = require('../models/customersupport');

const getContact = (payload, userId) => new Promise(async (resolve, reject) => {
    try {
        const existingRecord = await CustomerSupport.findOne({ user: userId });

        let response;

        if (existingRecord) {
            response = await CustomerSupport.findByIdAndUpdate(
                existingRecord._id,
                payload,
                { new: true, runValidators: true }
            );
            
            resolve({
                err: 0,
                msg: 'Customer support record updated successfully.',
                data: response
            });
        } else {
            response = await CustomerSupport.create({
                ...payload,
                user: userId
            });
            
            resolve({
                err: 0,
                msg: 'Customer support record created successfully.',
                data: response
            });
        }
    } catch (error) {
        reject({
            err: 1,
            msg: 'An error occurred while creating or updating the customer support record.',
            error: error.message
        });
    }
});

const getOne = (id) => new Promise(async (resolve, reject) => {
    try {
        const user = await User.findById(id)
            .select('-password');

        resolve({
            err: user ? 0 : 1,
            msg: user ? 'OK' : 'User not found.',
            response: user
        });
    } catch (error) {
        reject(error);
    }
});

const updateuser = (payload, id) => new Promise(async (resolve, reject) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            payload,
            { new: true, runValidators: true }
        ).select('-password');

        resolve({
            err: updatedUser ? 0 : 1,
            msg: updatedUser ? 'User updated successfully.' : 'Failed to update user.',
            response: updatedUser
        });
    } catch (error) {
        reject(error);
    }
});

module.exports = {
    getContact,
    getOne,
    updateuser
};