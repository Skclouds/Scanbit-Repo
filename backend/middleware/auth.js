import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import { config } from '../config/environment.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    const cookieName = config.cookie?.name || 'token';

    if (req.cookies?.[cookieName]) {
      token = req.cookies[cookieName];
    }
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Refresh user data to ensure we have latest role/permissions
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is master admin (always has access)
      const masterEmail = process.env.MASTER_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
      if (user.isMasterAdmin || (masterEmail && user.email === masterEmail)) {
        return next();
      }

      // Check if user has admin role
      if (roles.includes('admin') && user.role === 'admin') {
        // Also check hasAdminAccess flag if it exists
        if (user.hasAdminAccess !== undefined && !user.hasAdminAccess) {
          return res.status(403).json({
            success: false,
            message: 'Admin access has been revoked. Please contact support.'
          });
        }
        return next();
      }

      // Check if user has any of the required roles
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `User role '${user.role}' is not authorized to access this route`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization check'
      });
    }
  };
};

export const checkRestaurantAccess = async (req, res, next) => {
  try {
    const restaurantId = req.params.id || req.params.restaurantId || req.body.restaurant || req.query.restaurant;

    if (req.user.role === 'admin' || req.user.role === 'masteradmin') {
      return next();
    }

    if (!restaurantId) {
      return next();
    }

    if (req.user.restaurant && req.user.restaurant.toString() === restaurantId.toString()) {
      return next();
    }

    // Fallback: check if restaurant.owner is current user
    const owned = await Restaurant.findOne({ _id: restaurantId, owner: req.user._id }).limit(1);
    if (owned) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this restaurant'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
