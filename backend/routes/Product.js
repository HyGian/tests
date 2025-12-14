const express = require('express');
const productController = require('../controllers/Product');

const router = express.Router();

router.get('/all', productController.getProduct);
router.get('/limit/:postId', productController.getProductLimit);
router.get('/sort', productController.getProductQR);
router.get('/tim-kiem', productController.getProductSreach);
router.post('/create/productId', productController.PostCreatePorduct);
router.post('/delete/productId', productController.PostDeleteProduct);

module.exports = router;