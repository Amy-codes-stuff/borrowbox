const mongoose = require('mongoose');
const User = require('../models/User');
const { getMockUsers } = require('../services/mockStore');

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) {
      const mockUsers = getMockUsers();
      return res.json({ success: true, count: mockUsers.length, data: mockUsers });
    }

    const users = await User.find().sort({ createdAt: 1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
};
