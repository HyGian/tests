const express = require('express');
const paymentController = require('../controllers/payment');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Public routes
router.post('/zalopay-callback', paymentController.callback);

// Protected routes
router.post('/checkout', verifyToken, paymentController.checkout);
router.get('/status/:sessionId', verifyToken, paymentController.checkStatus);
router.post('/refund/:id', verifyToken, paymentController.refund);

module.exports = router;