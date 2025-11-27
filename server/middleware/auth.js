import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';

// Middleware for routes that require authentication
const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Please log in.' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Optional: Verify user still exists and is active
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found. Please log in again.' 
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated. Please contact support.' 
      });
    }
    
    req.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Please log in again.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please log in again.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Authentication failed. Please try again.' 
    });
  }
};

// Middleware for routes that work with or without authentication (guest support)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    // If token is invalid, treat as guest
    req.user = null;
    next();
  }
};

// Legacy compatibility - keep existing exports
const verifyToken = authRequired;
const authenticate = authRequired;
const protect = authRequired; // Add 'protect' alias for achievement routes

export {
  authRequired,
  optionalAuth,
  verifyToken,
  authenticate,
  protect // Export 'protect' as named export
};

// Also export default for flexibility
export default { authRequired, optionalAuth, protect, verifyToken, authenticate };

