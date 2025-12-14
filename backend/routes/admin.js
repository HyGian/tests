const express = require('express');
const adminController = require('../controllers/admin');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

const router = express.Router();

router.post('/login', adminController.login);
router.get('/infoUser', verifyToken, verifyAdmin, adminController.InfoUser);
router.get('/product', verifyToken, verifyAdmin, adminController.GetproductAdmin);

module.exports = router;