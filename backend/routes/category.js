const express = require('express');
const categoryController = require('../controllers/category');

const router = express.Router();

router.get('/all', categoryController.getCategories);

module.exports = router;