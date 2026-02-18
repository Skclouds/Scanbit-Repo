import mongoose from 'mongoose';

const businessCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  icon: {
    type: String,
    default: 'MdStore'
  },
  iconColor: {
    type: String,
    default: 'text-primary'
  },
  description: {
    type: String,
    default: ''
  },
  layout: {
    type: String,
    default: 'Menu layout'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  businessTypes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      default: 'MdStore'
    },
    description: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
businessCategorySchema.index({ isActive: 1, order: 1 });

export default mongoose.model('BusinessCategory', businessCategorySchema);
