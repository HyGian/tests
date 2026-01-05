const ZaloPayService = require('../services/payment');

const checkout = async (req, res) => {
    try {
        const { amount, postalCode } = req.body;
        
        if (!amount || !postalCode) {
            return res.status(400).json({
                err: 1,
                msg: 'Missing amount or postalCode'
            });
        }

        const result = await ZaloPayService.createOrder(amount, postalCode);
        
        return res.json({
            err: result.success ? 0 : 1,
            msg: result.success ? 'OK' : 'Failed',
            data: result
        });

    } catch (error) {
        console.error('Checkout error:', error.message);
        return res.status(500).json({
            err: -1,
            msg: error.message
        });
    }
};

const checkStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await ZaloPayService.checkStatus(sessionId);
        
        return res.json({
            err: result.status === 'success' ? 0 : 1,
            msg: result.message,
            data: result
        });

    } catch (error) {
        console.error('Check status error:', error.message);
        return res.status(500).json({
            err: -1,
            msg: error.message
        });
    }
};

const refund = async (req, res) => {
    try {
        const { id: postalCode } = req.params;
        const result = await ZaloPayService.refund(postalCode);
        
        return res.json({
            err: result.success ? 0 : 1,
            msg: result.success ? 'Refund successful' : 'Refund failed',
            data: result
        });

    } catch (error) {
        console.error('Refund error:', error.message);
        return res.status(500).json({
            err: -1,
            msg: error.message
        });
    }
};

const callback = async (req, res) => {
    try {
        const { data, mac } = req.body;
        const result = await ZaloPayService.handleCallback(data, mac);
        return res.json(result);

    } catch (error) {
        console.error('Callback error:', error.message);
        return res.status(500).json({
            return_code: -1,
            return_message: error.message
        });
    }
};

module.exports = {
    checkout,
    checkStatus,
    refund,
    callback
};