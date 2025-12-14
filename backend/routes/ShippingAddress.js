const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const shippingAddressController = require('../controllers/ShippingAddress');

const router = express.Router();
router.use(verifyToken);

router.post('/ShippingAddress', shippingAddressController.postShippingAddress);

module.exports = router;