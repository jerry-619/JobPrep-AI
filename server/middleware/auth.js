const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ObjectId } = require('mongodb');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  console.log('Auth Middleware - Token received:', token ? 'Yes' : 'No');

  // Check if no token
  if (!token) {
    console.log('Auth Middleware - No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      // Verify token
      console.log('Auth Middleware - Attempting to verify token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth Middleware - Token verified successfully, user id:', decoded.user.id);
      
      // Get user from database
      const db = req.app.locals.db;
      if (!db) {
        console.log('Auth Middleware - Database connection not available');
        await sleep(RETRY_DELAY);
        retries++;
        continue;
      }

      const user = await User.findById(db, new ObjectId(decoded.user.id));
      
      if (!user) {
        console.log('Auth Middleware - User not found in database for id:', decoded.user.id);
        return res.status(401).json({ 
          message: 'Session expired. Please log in again.',
          code: 'SESSION_EXPIRED'
        });
      }

      console.log('Auth Middleware - User authenticated successfully:', user.email);
      
      // Set user info in request object
      req.user = {
        id: decoded.user.id,
        email: user.email,
        name: user.name
      };
      
      return next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        console.error('Auth Middleware - Token validation error:', err.message);
        return res.status(401).json({ 
          message: 'Session expired. Please log in again.',
          code: 'SESSION_EXPIRED'
        });
      }

      if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        console.error('Auth Middleware - Database error (attempt ' + (retries + 1) + '):', err.message);
        if (retries < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY);
          retries++;
          continue;
        }
      }

      console.error('Auth Middleware - Unexpected error:', err.message);
      return res.status(500).json({ 
        message: 'Authentication error. Please try again.',
        code: 'AUTH_ERROR'
      });
    }
  }

  // If we've exhausted all retries
  console.error('Auth Middleware - Max retries reached for database operation');
  return res.status(503).json({ 
    message: 'Service temporarily unavailable. Please try again in a few moments.',
    code: 'SERVICE_UNAVAILABLE'
  });
}; 