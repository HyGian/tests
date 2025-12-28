const express = require('express');
const socialAuthController = require('../controllers/social');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.get('/google', socialAuthController.googleLogin);
router.get('/google/callback', socialAuthController.googleCallback);
router.get('/facebook', socialAuthController.facebookLogin);
router.get('/facebook/callback', socialAuthController.facebookCallback);
router.post('/link/google', verifyToken, socialAuthController.linkGoogle);
router.post('/link/facebook', verifyToken, socialAuthController.linkFacebook);

module.exports = router;