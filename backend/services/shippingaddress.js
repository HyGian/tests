const ShippingAddress = require('../models/shippingaddress');
const { v4: uuidv4 } = require('uuid');

const PostShippingAddressService = (userId, payload) => new Promise(async (resolve, reject) => {
    const { name, phone, address } = payload;
    
    try {
        const shippingAddress = await ShippingAddress.create({
            user: userId,
            fullName: name,
            phoneNumber: phone,
            addressLine1: address.district || '',
            addressLine2: address.address || '',
            city: address.city || '',
            status: 'await',
            postalCode: uuidv4().replace(/-/g, '').substring(0, 12)
        });

        resolve({
            err: shippingAddress ? 0 : 1,
            msg: shippingAddress ? 'OK' : 'Failed to create shipping address.',
            response: shippingAddress
        });
    } catch (error) {
        reject(error);
    }
});

module.exports = {
    PostShippingAddressService
};