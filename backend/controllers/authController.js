const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'menswear_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password',
      });
    }

    // Find user with password included
    const user = await User.findOne({ username: username.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact store owner.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user (Cashier or Admin)
// @route   POST /api/auth/register
// @access  Private/Admin
const register = async (req, res, next) => {
  try {
    const { name, username, password, email, role, phone } = req.body;

    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    const user = await User.create({
      name,
      username,
      password,
      email,
      role: role || 'cashier',
      phone,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// @desc    List all users/staff
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-seed default admin & cashier if database is fresh
// @route   POST /api/auth/init
// @access  Public
const initDefaultUsers = async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      return res.json({
        success: true,
        message: 'Users already initialized',
        initialized: false,
      });
    }

    const admin = await User.create({
      name: 'Store Owner',
      username: 'admin',
      password: 'admin123',
      email: 'owner@fashionhub.com',
      role: 'admin',
      phone: process.env.SHOP_PHONE || '6309382716',
    });

    const cashier = await User.create({
      name: 'Cashier Staff',
      username: 'cashier',
      password: 'cashier123',
      email: 'cashier@fashionhub.com',
      role: 'cashier',
      phone: '9876543210',
    });

    res.status(201).json({
      success: true,
      message: 'Default admin and cashier accounts created successfully',
      initialized: true,
      credentials: [
        { role: 'admin', username: 'admin', password: 'admin123' },
        { role: 'cashier', username: 'cashier', password: 'cashier123' },
      ],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getProfile,
  getUsers,
  initDefaultUsers,
};
