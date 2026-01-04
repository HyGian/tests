const mongoose = require('mongoose');

const customerSupportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.CustomerSupport || mongoose.model('CustomerSupport', customerSupportSchema);