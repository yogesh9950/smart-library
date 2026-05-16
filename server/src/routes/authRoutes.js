const express = require('express');
const { login, me, register } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireDatabase } = require('../config/db');

const router = express.Router();

router.post('/register', requireDatabase, register);
router.post('/login', requireDatabase, login);
router.get('/me', requireDatabase, protect, me);

module.exports = router;
