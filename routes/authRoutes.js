const express = require('express');
const { registerUser, loginUser,verifyEmail  } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validateMiddleware');
const {verifyToken}=require('../middleware/authMiddleware')
const router = express.Router();

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/verify/:token',verifyEmail)

module.exports = router;
