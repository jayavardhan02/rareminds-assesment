const { verifyToken } = require('../utils/auth');
const { User } = require('../models');

/**
 * Authentication Middleware
 * Extracts JWT from the Authorization header and verifies it.
 * Populates req.user with the authenticated user's database document.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token and extract decoded payload
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Find user in database to ensure they still exist and are valid
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Attach user to request object for use in controllers/other middlewares
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { authenticate };
