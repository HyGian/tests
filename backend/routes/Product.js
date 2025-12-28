const express = require('express');
const productController = require('../controllers/Product');
const { cacheMiddleware, clearCacheMiddleware } = require('../middlewares/cache');

const router = express.Router();

router.get('/all', cacheMiddleware('products', 3600), productController.getProduct);
router.get('/limit/:postId', cacheMiddleware('product_detail', 1800), productController.getProductLimit);
router.get('/sort', cacheMiddleware('products_sort', 900), productController.getProductQR);
router.get('/tim-kiem', cacheMiddleware('products_search', 600), productController.getProductSreach);
router.post('/create/productId', clearCacheMiddleware(['products*']), productController.PostCreatePorduct);
router.post('/delete/productId', clearCacheMiddleware(['products*', 'product_detail*']), productController.PostDeleteProduct);

module.exports = router;