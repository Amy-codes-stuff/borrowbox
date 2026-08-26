const mongoose = require('mongoose');
const User = require('../models/User');
const { findMockUserById, getMockUsers } = require('../services/mockStore');

const demoAuth = async (req, res, next) => {
  try {
    const demoUserId = req.headers['x-demo-user-id'] || req.query.demoUserId;

    // Fall back to Mock Store only if MONGODB_URI is missing
    if (!process.env.MONGODB_URI) {
      if (demoUserId) {
        req.user = findMockUserById(demoUserId);
      } else {
        req.user = getMockUsers()[0];
      }
      return next();
    }

    // Normal Mongoose connection branch (no mock fallbacks)
    if (demoUserId) {
      const user = await User.findById(demoUserId);
      if (user) {
        req.user = user;
        return next();
      }
    }
    
    const firstUser = await User.findOne();
    req.user = firstUser || null;
    next();
  } catch (error) {
    if (!process.env.MONGODB_URI) {
      req.user = findMockUserById(req.headers['x-demo-user-id']);
      next();
    } else {
      next(error);
    }
  }
};

module.exports = demoAuth;

