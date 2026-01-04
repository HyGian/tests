const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    header: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema)