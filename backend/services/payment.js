const stripe = require('../config/stripe');
const ShippingAddress = require('../models/shippingaddress');
const Order = require('../models/order');
require('dotenv').config();

const createCheckoutSession = (total) => new Promise(async (resolve, reject) => {
    const { amount, id } = total;
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "vnd",
                        product_data: {
                            name: "WEB_SHOPPING",
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/he-thong/successful/${id}`,
            cancel_url: `${process.env.CLIENT_URL}/he-thong/cancel`,
        });

        const existingRecord = await ShippingAddress.findOne({ postalCode: id });
        
        if (existingRecord) {
            await ShippingAddress.findByIdAndUpdate(
                existingRecord._id,
                {
                    sessionId: session.id,
                    status: 'Order Successful'
                }
            );
        }

        resolve({
            err: session ? 0 : 1,
            msg: session ? 'OK' : 'Failed.',
            response: session
        });
    } catch (error) {
        reject(error);
    }
});

const exportPayments = () => new Promise(async (resolve, reject) => {
    try {
        const payments = await stripe.paymentIntents.list({
            limit: 100,
        });

        const formattedPayments = payments.data.map((payment) => ({
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency.toUpperCase(),
            status: payment.status,
            description: payment.description,
            created: new Date(payment.created * 1000).toISOString(),
        }));

        resolve({
            err: formattedPayments ? 0 : 1,
            msg: formattedPayments ? 'OK' : 'Failed',
            response: formattedPayments
        });
    } catch (error) {
        reject(error);
    }
});

const getPaymentIdServices = (sessionId) => new Promise(async (resolve, reject) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paymentIntentId = session.payment_intent;

        resolve({
            err: paymentIntentId ? 0 : 1,
            msg: paymentIntentId ? 'OK' : 'Failed',
            paymentIntentId
        });
    } catch (error) {
        reject(error);
    }
});

const PostRefundPayment = (postalCode) => new Promise(async (resolve, reject) => {
    try {
        const shippingAddress = await ShippingAddress.findOne({ postalCode });
        
        if (!shippingAddress) {
            return resolve({
                err: 1,
                msg: 'Shipping address not found.'
            });
        }

        await ShippingAddress.findByIdAndUpdate(
            shippingAddress._id,
            { status: 'Cancel' }
        );

        await Order.updateMany(
            { postalCode: postalCode },
            { status: 'Cancel' }
        );

        const session = await stripe.checkout.sessions.retrieve(shippingAddress.sessionId);
        const paymentIntentId = session.payment_intent;
        const refundAmount = Math.floor(session.amount_total * 0.9);

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: refundAmount
        });

        resolve({
            err: refund ? 0 : 1,
            msg: refund ? 'OK' : 'Failed',
            refundId: refund.id,
            refundAmount: refundAmount
        });
    } catch (error) {
        reject(error);
    }
});

module.exports = {
    createCheckoutSession,
    exportPayments,
    getPaymentIdServices,
    PostRefundPayment
};