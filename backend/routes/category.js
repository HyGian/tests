const express = require('express');
const categoryController = require('../controllers/category');
const { cacheMiddleware } = require('../middlewares/cache');
const router = express.Router();

router.get('/all', cacheMiddleware('categories_all', 7200), categoryController.getCategories);

module.exports = router;