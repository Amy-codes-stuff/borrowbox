const mongoose = require('mongoose');
const User = require('../models/User');
const { findMockUserById, getMockUsers } = require('../services/mockStore');

const demoAuth = async (req, res, next) => {
  try {
    const demoUserId = req.headers['x-demo-user-id'] || req.query.demoUserId;

    // Use the mock persona whenever the runtime has selected mock-store mode.
    if (req.app.locals.useMockStore) {
      if (demoUserId) {
        req.user = findMockUserById(demoUserId);
      } else {
        req.user = getMockUsers()[0];
      }
      return next();
    }

    // Normal Mongoose connection branch.
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
    if (req.app.locals.useMockStore) {
      req.user = findMockUserById(req.headers['x-demo-user-id']);
      next();
    } else {
      next(error);
    }
  }
};

module.exports = demoAuth;
