const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Registration attempt:', { name, email });

    // Check if user exists
    const db = req.app.locals.db;
    const existingUser = await User.findByEmail(db, email);
    
    if (existingUser) {
      console.log('Registration failed - User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ name, email, password });
    const result = await user.save(db);
    console.log('User registered successfully:', { id: result.insertedId, email });
    
    // Create JWT token
    const payload = {
      user: {
        id: result.insertedId
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign error:', err);
          throw err;
        }
        console.log('JWT token created for new user:', email);
        res.json({ 
          token,
          user: {
            id: result.insertedId,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    // Check if user exists
    const db = req.app.locals.db;
    const user = await User.findByEmail(db, email);
    
    if (!user) {
      console.log('Login failed - User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      console.log('Login failed - Invalid password:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful:', email);

    // Create JWT token
    const payload = {
      user: {
        id: user._id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign error:', err);
          throw err;
        }
        console.log('JWT token created for user:', email);
        res.json({ 
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 