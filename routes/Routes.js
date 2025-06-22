const express = require('express');
const { HandleLogin } = require('../controllers/loginController');
const { HandleCreateUser } = require('../controllers/signUpController');
const router = express.Router();

// Mock login route
router.get('/login', HandleLogin);
router.get('/create-user', HandleCreateUser);


module.exports = router;