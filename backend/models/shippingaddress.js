const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    city: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['await', 'Order Successful', 'Cancel'], 
        default: 'await' 
    },
    postalCode: { type: String, required: true, unique: true },
    sessionId: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('ShippingAddress', shippingAddressSchema);