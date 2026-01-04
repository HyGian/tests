const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    size: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    productName: {
        type: String,
        required: true
    }
}, {
    _id: true, 
    timestamps: false
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ['await', 'Order Successful', 'Cancel', 'Processing', 'Shipped', 'Delivered'],
        default: 'await'
    },
    postalCode: {
        type: String,
        default: ''
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShippingAddress'
    }
}, {
    timestamps: true
});

orderSchema.pre('save', async function () {
    this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
});


orderItemSchema.virtual('calculateTotalPrice').get(function() {
    return this.price * this.quantity;
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema)