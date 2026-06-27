const rateLimit = require('express-rate-limit');

// Per-user rate limit: 10 requests per second
// Uses authenticated user ID when available, falls back to IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 50, // 50 requests per minute per user
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise fall back to IP
    return req.user?._id?.toString() || req.ip;
  },
  message: {
    error: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
