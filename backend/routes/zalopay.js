import express from 'express';
import { createZaloPayUrl, zalopayCallback } from '../controllers/zalopay.js';
import authUser from '../middleware/auth.js';

const zalopayRouter = express.Router();

zalopayRouter.post('/create', authUser, createZaloPayUrl);
zalopayRouter.post('/callback', zalopayCallback); 

export default zalopayRouter;