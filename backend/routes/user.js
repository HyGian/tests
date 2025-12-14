const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const userController = require('../controllers/user');

const router = express.Router();

router.use(verifyToken);
router.get('/get-current', userController.getCurrent);
router.put('/', userController.updateUserController);
router.post('/Contact', userController.getContactcontroller);

module.exports = router;