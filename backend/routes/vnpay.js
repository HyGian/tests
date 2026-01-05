import express from 'express';
import { createPaymentUrl, vnpayReturn } from '../controllers/vnpay.js';

const vnpayRouter = express.Router();

vnpayRouter.post('/create_payment_url', createPaymentUrl);
vnpayRouter.get('/vnpay_return', vnpayReturn);

export default vnpayRouter;