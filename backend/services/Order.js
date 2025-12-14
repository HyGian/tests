const Order = require('../models/order');
const Product = require('../models/product');
const ShippingAddress = require('../models/shippingaddress');

const postOrderService = (formData, userId) => new Promise(async (resolve, reject) => {
    try {
        const { name, productId, size, quantity, price, imageUrl } = formData;
        const totalPrice = price * quantity;

        const orderItem = {
            product: productId,
            size: size || '',
            quantity,
            price,
            totalPrice,
            imageUrl: imageUrl || '',
            productName: name
        };

        const existingOrder = await Order.findOne({
            user: userId,
            status: 'await'
        });

        let order;
        if (existingOrder) {
            existingOrder.items.push(orderItem);
            await existingOrder.save();
            order = existingOrder;
        } else {
            order = await Order.create({
                user: userId,
                status: 'await',
                items: [orderItem]
            });
        }

        resolve({
            err: order ? 0 : 1,
            msg: order ? 'OK' : 'Failed to post Order.',
            response: order
        });
    } catch (error) {
        reject(error);
    }
});

const getOrderService = (userId) => new Promise(async (resolve, reject) => {
    try {
        const orders = await Order.find({
            user: userId,
            status: 'await'
        })
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 });

        resolve({
            err: orders ? 0 : 1,
            msg: orders ? 'OK' : 'Failed to get Order.',
            response: orders
        });
    } catch (error) {
        reject(error);
    }
});

const updateOrderService = (quantity, orderItemId) => new Promise(async (resolve, reject) => {
    try {
        const order = await Order.findOne({ 'items._id': orderItemId });
        
        if (!order) {
            return resolve({
                err: 1,
                msg: 'Order item not found.'
            });
        }

        const itemIndex = order.items.findIndex(item => item._id.toString() === orderItemId);
        if (itemIndex === -1) {
            return resolve({
                err: 1,
                msg: 'Item not found in order.'
            });
        }

        order.items[itemIndex].quantity = quantity;
        order.items[itemIndex].totalPrice = order.items[itemIndex].price * quantity;
        
        await order.save();

        resolve({
            err: 0,
            msg: 'OK',
            response: order
        });
    } catch (error) {
        reject({
            err: -1,
            msg: 'Failed at updateOrderService: ' + error.message,
        });
    }
});

const deleteOrderService = (orderItemId) => new Promise(async (resolve, reject) => {
    try {
        const order = await Order.findOne({ 'items._id': orderItemId });
        
        if (!order) {
            return resolve({
                err: 1,
                msg: 'Order item not found.'
            });
        }

        order.items = order.items.filter(item => item._id.toString() !== orderItemId);
        
        if (order.items.length === 0) {
            await Order.findByIdAndDelete(order._id);
            return resolve({
                err: 0,
                msg: 'Order deleted successfully.'
            });
        }

        await order.save();
        
        resolve({
            err: 0,
            msg: 'Item deleted successfully.'
        });
    } catch (error) {
        reject({
            err: -1,
            msg: 'Failed at deleteOrderService: ' + error.message,
        });
    }
});

const getShippingAdressService = (postalCode) => new Promise(async (resolve, reject) => {
    try {
        const address = await ShippingAddress.findOne({ postalCode })
            .select('-updatedAt')
            .populate('user', 'name phone');

        resolve({
            err: address ? 0 : 1,
            msg: address ? 'OK' : 'Failed to get shipping address.',
            response: address
        });
    } catch (error) {
        reject(error);
    }
});

const putOrderUser = (userId, postalCode) => new Promise(async (resolve, reject) => {
    try {
        const result = await Order.updateMany(
            { 
                user: userId,
                status: 'await',
                postalCode: null
            },
            { 
                status: 'Order Successful',
                postalCode: postalCode
            }
        );

        resolve({
            err: result.modifiedCount > 0 ? 0 : 1,
            msg: result.modifiedCount > 0 ? 'OK' : 'No orders to update',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        reject(error);
    }
});

const getInfoOrderSuccessful = (userId) => new Promise(async (resolve, reject) => {
    try {
        const orders = await Order.find({
            user: userId,
            status: { $ne: 'await' }
        })
        .populate('items.product', 'name price images')
        .populate('shippingAddress')
        .sort({ createdAt: -1 });

        resolve({
            err: orders ? 0 : 1,
            msg: orders ? 'OK' : 'No orders found',
            response: orders
        });
    } catch (error) {
        reject(error);
    }
});

module.exports = {
    postOrderService,
    getOrderService,
    updateOrderService,
    deleteOrderService,
    getShippingAdressService,
    putOrderUser,
    getInfoOrderSuccessful
};