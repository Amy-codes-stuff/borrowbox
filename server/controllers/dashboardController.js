const mongoose = require('mongoose');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');
const { getMockDashboard } = require('../services/mockStore');

// GET /api/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      const mockDash = getMockDashboard(userId);
      return res.json({ success: true, data: mockDash });
    }

    const itemsListed = await Item.countDocuments({ owner: userId });
    const activeBorrows = await BorrowRequest.countDocuments({
      requester: userId,
      status: 'approved'
    });
    const pendingRequests = await BorrowRequest.countDocuments({
      $or: [{ owner: userId }, { requester: userId }],
      status: 'pending'
    });
    const itemsLent = await BorrowRequest.countDocuments({
      owner: userId,
      status: 'approved'
    });
    const completedBorrows = await BorrowRequest.countDocuments({
      $or: [{ owner: userId }, { requester: userId }],
      status: 'returned'
    });

    const recentRequests = await BorrowRequest.find({
      $or: [{ owner: userId }, { requester: userId }]
    })
      .populate('item', 'name category imageUrl')
      .populate('requester', 'name avatar')
      .populate('owner', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(6);

    const currentBorrowsList = await BorrowRequest.find({
      $or: [{ owner: userId }, { requester: userId }],
      status: 'approved'
    })
      .populate('item')
      .populate('requester', 'name email avatar department')
      .populate('owner', 'name email avatar department');

    res.json({
      success: true,
      data: {
        stats: {
          itemsListed,
          activeBorrows,
          pendingRequests,
          itemsLent,
          completedBorrows
        },
        recentActivity: recentRequests,
        currentBorrows: currentBorrowsList
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
