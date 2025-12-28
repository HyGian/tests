const authRoute = require('./auth');
const categoryRoute = require('./category');
const productRoute = require('./Product');
const userRouter = require('./user');
const orderRoute = require('./Order');
const adminRoute = require('./admin');
const socialAuthRoute = require('./social'); 
const paymentRoute = require('./payment');
const shippingAddressRoute = require('./ShippingAddress');

const initRoutes = (app) => {
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/category', categoryRoute);
    app.use('/api/v1/product', productRoute);
    app.use('/api/v1/user', userRouter);
    app.use('/api/v1/order', orderRoute);
    app.use('/api/v1/admin', adminRoute);
    app.use('/api/v1/payment', paymentRoute);
    app.use('/api/v1/ShippingAddress', shippingAddressRoute);
    
    return app.use('/', (req, res) => {
        res.send('server on...');
    });
};

module.exports = initRoutes;