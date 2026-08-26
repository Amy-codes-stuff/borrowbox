const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Books', 'Electronics', 'Study', 'Sports', 'Accessories', 'Lab Equipment', 'Other'],
      default: 'Other',
    },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair'],
      default: 'Good',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'borrowed'],
      default: 'available',
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    maxLendingDuration: {
      type: String,
      default: '7 days',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', ItemSchema);
