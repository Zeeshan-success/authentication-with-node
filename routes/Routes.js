const express = require('express');
const { HandleLogin } = require('../controllers/loginController');
const { HandleCreateUser, HandleResendVerificationCode, HandleVerifyEmail } = require('../controllers/signUpController');
const { handleForgotPassword } = require('../controllers/ForgotPassword');
const { handleResetPassword } = require('../controllers/ResetPassword');
const router = express.Router();

// Mock login route
router.post('/login', HandleLogin);
router.post('/signup', HandleCreateUser);
router.post('/verify-email', HandleVerifyEmail);
router.post('/resend-verification', HandleResendVerificationCode);
router.post('/forgot-password', handleForgotPassword);
router.post('/reset-password/:token', handleResetPassword);


module.exports = router;