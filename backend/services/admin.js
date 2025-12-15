const Admin = require('../models/admin');
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const loginService = ({ phone, password }) => new Promise(async (resolve, reject) => {
    try {
        const admin = await Admin.findOne({ phone });

        if (!admin) {
            return resolve({
                err: 2,
                msg: 'Phone number not found!',
                token: null
            });
        }

        const isCorrectPassword = await admin.comparePassword(password);

        if (!isCorrectPassword) {
            return resolve({
                err: 2,
                msg: 'Password is wrong!',
                token: null
            });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                phone: admin.phone,
                role: 'admin'
            },
            process.env.SECRET_KEY,
            { expiresIn: '2d' }
        );

        resolve({
            err: 0,
            msg: 'Login is successfully!',
            token
        });

    } catch (error) {
        reject(error);
    }
});

const InfoUser = () => new Promise(async (resolve, reject) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        resolve({
            err: users ? 0 : 1,
            msg: users ? 'OK' : 'Failed',
            response: users
        });
    } catch (error) {
        reject(error);
    }
});

const GetproductServiceAdmin = () => new Promise(async (resolve, reject) => {
    try {
        const products = await Product.find({})
            .populate('category', 'header description')
            .sort({ createdAt: -1 });

        resolve({
            err: products ? 0 : 1,
            msg: products ? 'OK' : 'Failed',
            response: products
        });
    } catch (error) {
        reject(error);
    }
});

const getOrderAdminService = () => new Promise(async (resolve, reject) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name phone email')
            .populate('items.product', 'name price')
            .populate('shippingAddress')
            .sort({ createdAt: -1 });

        resolve({
            err: orders ? 0 : 1,
            msg: orders ? 'OK' : 'Failed',
            response: orders
        });
    } catch (error) {
        reject(error);
    }
});


const updateOrderStatus = (orderId, status) => new Promise(async (resolve, reject) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return resolve({
                err: 1,
                msg: 'Order not found',
                response: null
            });
        }

        order.status = status;
        await order.save();

        resolve({
            err: 0,
            msg: 'Update status success',
            response: order
        });
    } catch (error) {
        reject(error);
    }
});

module.exports = {
    loginService,
    InfoUser,
    GetproductServiceAdmin,
    getOrderAdminService,
    updateOrderStatus
};