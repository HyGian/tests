import express from 'express'
import { addCategory, listCategories, removeCategory, addSubCategory, listSubCategories, removeSubCategory } from '../controllers/category.js'
import adminAuth from '../middleware/adminAuth.js';

const categoryRouter = express.Router();

// Category Routes
categoryRouter.post('/add', adminAuth, addCategory);
categoryRouter.get('/list', listCategories);
categoryRouter.post('/remove', adminAuth, removeCategory);

// SubCategory Routes
categoryRouter.post('/sub/add', adminAuth, addSubCategory);
categoryRouter.get('/sub/list', listSubCategories);
categoryRouter.post('/sub/remove', adminAuth, removeSubCategory);

export default categoryRouter;