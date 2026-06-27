const express = require('express');
const { signup, login, getUsers } = require('../controllers/authController');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/users', authenticate, apiLimiter, getUsers);

module.exports = router;
