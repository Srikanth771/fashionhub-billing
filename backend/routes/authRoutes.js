const express = require('express');
const router = express.Router();
const {
  login,
  register,
  getProfile,
  getUsers,
  initDefaultUsers,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/init', initDefaultUsers);
router.get('/me', protect, getProfile);
router.post('/register', protect, adminOnly, register);
router.get('/users', protect, adminOnly, getUsers);

module.exports = router;
