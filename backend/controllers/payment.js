const paymentService = require('../services/payment');

const checkout = async (req, res, next) => {
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
            err: 1,
            msg: 'Invalid amount'
        });
    }

    try {
        const response = await paymentService.createCheckoutSession(req.body);
        return res.status(201).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at payment controller',
            error: error.message
        });
    }
};

const exportPayments = async (req, res, next) => {
    try {
        const response = await paymentService.exportPayments();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at payment controller',
            error: error.message
        });
    }
};

const getPaymentIntentId = async (req, res, next) => {
    const { sessionId } = req.params;

    if (!sessionId) {
        return res.status(400).json({
            err: 1,
            msg: 'Session ID is required'
        });
    }

    try {
        const response = await paymentService.getPaymentIdServices(sessionId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at payment controller',
            error: error.message
        });
    }
};

const refundPayment = async (req, res, next) => {
    const { id: postalCode } = req.params;

    if (!postalCode) {
        return res.status(400).json({
            err: 1,
            msg: 'Postal code is required'
        });
    }

    try {
        const response = await paymentService.PostRefundPayment(postalCode);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            err: -1,
            msg: 'Failed at payment controller',
            error: error.message
        });
    }
};

module.exports = {
    checkout,
    exportPayments,
    getPaymentIntentId,
    refundPayment
};