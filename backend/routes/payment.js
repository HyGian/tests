const express = require('express');
const paymentController = require('../controllers/payment');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/checkout', verifyToken, paymentController.checkout);
router.get('/amount', verifyToken, paymentController.exportPayments);
router.get('/:sessionId', verifyToken, paymentController.getPaymentIntentId); // ← SỬA
router.post('/refund/:id', verifyToken, paymentController.refundPayment); // ← SỬA

module.exports = router;