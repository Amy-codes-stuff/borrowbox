const mongoose = require('mongoose');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');
const {
  getMockItems,
  getMockItemById,
  createMockItem,
  updateMockItem,
  deleteMockItem,
} = require('../services/mockStore');

// GET /api/items
const getItems = async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) {
      const items = getMockItems(req.query);
      return res.json({ success: true, count: items.length, data: items });
    }

    const { search, category, condition, status, owner, sort } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    if (owner) {
      query.owner = owner;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'name') {
      sortOptions = { name: 1 };
    }

    const items = await Item.find(query)
      .populate('owner', 'name email avatar department')
      .sort(sortOptions);

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/items/:id
const getItemById = async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) {
      const { item, similarItems } = getMockItemById(req.params.id);
      if (!item) {
        res.status(404);
        throw new Error('Item not found');
      }
      return res.json({ success: true, data: item, similarItems });
    }

    const item = await Item.findById(req.params.id).populate('owner', 'name email avatar department');
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }

    const similarItems = await Item.find({
      category: item.category,
      _id: { $ne: item._id }
    })
      .limit(4)
      .populate('owner', 'name email avatar department');

    res.json({
      success: true,
      data: item,
      similarItems,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/items
const createItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      condition,
      location,
      imageUrl,
      availableFrom,
      maxLendingDuration,
      tags
    } = req.body;

    if (!name || !description || !category || !condition || !location) {
      res.status(400);
      throw new Error('Please fill in all required fields (name, description, category, condition, location)');
    }

    if (!process.env.MONGODB_URI) {
      const newItem = createMockItem(
        {
          name,
          description,
          category,
          condition,
          location,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600',
          availableFrom: availableFrom || new Date(),
          maxLendingDuration: maxLendingDuration || '7 days',
          tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [],
        },
        req.user
      );
      return res.status(201).json({ success: true, data: newItem });
    }

    const ownerId = req.user?._id;
    const item = await Item.create({
      name,
      description,
      category,
      condition,
      location,
      imageUrl: imageUrl || undefined,
      availableFrom: availableFrom || Date.now(),
      maxLendingDuration: maxLendingDuration || '7 days',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [],
      owner: ownerId,
      status: 'available'
    });

    const populatedItem = await item.populate('owner', 'name email avatar department');

    res.status(201).json({
      success: true,
      data: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/items/:id
const updateItem = async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) {
      const updated = updateMockItem(req.params.id, req.body);
      if (!updated) {
        res.status(404);
        throw new Error('Item not found');
      }
      return res.json({ success: true, data: updated });
    }

    let item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }

    if (req.user && item.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to edit this listing');
    }

    const { tags, ...rest } = req.body;
    let formattedTags = item.tags;
    if (tags !== undefined) {
      formattedTags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { ...rest, tags: formattedTags },
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar department');

    res.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/items/:id
const deleteItem = async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) {
      deleteMockItem(req.params.id);
      return res.json({ success: true, message: 'Item removed successfully' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }

    if (req.user && item.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this listing');
    }

    await Item.findByIdAndDelete(req.params.id);
    await BorrowRequest.deleteMany({ item: req.params.id });

    res.json({
      success: true,
      message: 'Item and associated request records removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
