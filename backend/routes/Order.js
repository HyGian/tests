const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const orderController = require('../controllers/order');

const router = express.Router();
router.use(verifyToken);

router.post('/', orderController.postOrder);
router.get('/shopping-cart', orderController.getOrder);
router.delete('/:orderitemsId', orderController.DeleteOrder);
router.put('/:orderItemId', orderController.UpdateOrder);
router.get('/:id', orderController.ShippingAdress);
router.put('/Update/:id', orderController.putOrderUser);
router.get('/InfoOrder/InfoOrderSuccsessfull', orderController.InfoOrderSuccessful);

module.exports = router;