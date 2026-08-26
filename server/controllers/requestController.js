const mongoose = require('mongoose');
const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const {
  getMockRequests,
  createMockRequest,
  updateMockRequestStatus,
} = require('../services/mockStore');

// GET /api/requests
const getRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (!process.env.MONGODB_URI) {
      const requests = getMockRequests(userId, req.query.role);
      return res.json({ success: true, count: requests.length, data: requests });
    }

    const { role } = req.query;
    let query = {};
    if (role === 'sent') {
      query.requester = userId;
    } else if (role === 'received') {
      query.owner = userId;
    } else {
      query.$or = [{ requester: userId }, { owner: userId }];
    }

    const requests = await BorrowRequest.find(query)
      .populate('item')
      .populate('requester', 'name email avatar department')
      .populate('owner', 'name email avatar department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/requests
const createRequest = async (req, res, next) => {
  try {
    const { itemId, requestedDuration, message } = req.body;
    if (!itemId || !requestedDuration) {
      res.status(400);
      throw new Error('Item ID and requested duration are required');
    }

    if (!process.env.MONGODB_URI) {
      const newReq = createMockRequest(itemId, requestedDuration, message, req.user);
      return res.status(201).json({ success: true, data: newReq });
    }

    const requesterId = req.user._id;
    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }

    if (item.owner.toString() === requesterId.toString()) {
      res.status(400);
      throw new Error('You cannot request to borrow your own listed item');
    }

    if (item.status === 'borrowed') {
      res.status(400);
      throw new Error('Item is currently borrowed by another student');
    }

    const existingRequest = await BorrowRequest.findOne({
      item: itemId,
      requester: requesterId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      res.status(400);
      throw new Error(`You already have an active (${existingRequest.status}) request for this item`);
    }

    const borrowRequest = await BorrowRequest.create({
      item: itemId,
      requester: requesterId,
      owner: item.owner,
      requestedDuration,
      message: message || '',
      status: 'pending',
      requestedAt: Date.now()
    });

    const populated = await borrowRequest.populate([
      { path: 'item' },
      { path: 'requester', select: 'name email avatar department' },
      { path: 'owner', select: 'name email avatar department' }
    ]);

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/requests/:id
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'cancelled', 'returned'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status option');
    }

    if (!process.env.MONGODB_URI) {
      const updated = updateMockRequestStatus(req.params.id, status);
      return res.json({ success: true, data: updated });
    }

    const userId = req.user._id;
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      throw new Error('Borrow request not found');
    }

    const isOwner = request.owner.toString() === userId.toString();
    const isRequester = request.requester.toString() === userId.toString();

    if (['approved', 'rejected', 'returned'].includes(status) && !isOwner && !isRequester) {
      res.status(403);
      throw new Error('Not authorized to update this request status');
    }

    const item = await Item.findById(request.item);

    if (status === 'approved') {
      if (item.status === 'borrowed') {
        res.status(400);
        throw new Error('Cannot approve: item is already borrowed by another student');
      }

      request.status = 'approved';
      request.approvedAt = Date.now();
      await request.save();

      item.status = 'borrowed';
      await item.save();

      await BorrowRequest.updateMany(
        { item: request.item, status: 'pending', _id: { $ne: request._id } },
        { status: 'rejected' }
      );
    } 
    else if (status === 'returned') {
      request.status = 'returned';
      request.returnedAt = Date.now();
      await request.save();

      if (item) {
        item.status = 'available';
        await item.save();
      }
    } 
    else if (status === 'rejected' || status === 'cancelled') {
      const wasApproved = request.status === 'approved';
      request.status = status;
      await request.save();

      if (wasApproved && item) {
        item.status = 'available';
        await item.save();
      }
    }

    const updated = await BorrowRequest.findById(request._id).populate([
      { path: 'item' },
      { path: 'requester', select: 'name email avatar department' },
      { path: 'owner', select: 'name email avatar department' }
    ]);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/requests/:id
const deleteRequest = async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.json({ success: true, message: 'Request deleted' });
    }

    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      throw new Error('Borrow request not found');
    }

    await BorrowRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  createRequest,
  updateRequestStatus,
  deleteRequest,
};
