import express from 'express';
import { addCoupon, listCoupons, deleteCoupon, toggleCoupon, validateCoupon } from '../controllers/coupon.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const couponRouter = express.Router();

// Admin routes
couponRouter.post('/add', adminAuth, addCoupon);
couponRouter.get('/list', adminAuth, listCoupons);
couponRouter.post('/delete', adminAuth, deleteCoupon);
couponRouter.post('/toggle', adminAuth, toggleCoupon);

// User routes
couponRouter.post('/validate', authUser, validateCoupon);

export default couponRouter;