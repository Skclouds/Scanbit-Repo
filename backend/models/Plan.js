import mongoose from 'mongoose';


const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  businessCategory: {
    type: String,
    required: [true, 'Business category is required'],
    trim: true
    // Removed enum constraint to allow dynamic categories from database
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: null,
    min: [0, 'Original price cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    default: 30
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  features: {
    menuItemsLimit: {
      type: String,
      default: 'unlimited'
    },
    qrScansLimit: {
      type: String,
      default: 'unlimited'
    },
    analytics: {
      type: Boolean,
      default: true
    },
    customDomain: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    customBranding: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  },
  // Features list for display (array of feature strings)
  featuresList: {
    type: [String],
    default: []
  },
  // Custom Plan Fields
  isCustom: {
    type: Boolean,
    default: false
  },
  assignedToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    overridePrice: {
      type: Number,
      default: null
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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

// Indexes
planSchema.index({ businessCategory: 1, name: 1 }); // Removed unique constraint to allow custom plans with same name
planSchema.index({ isActive: 1 });
planSchema.index({ isDefault: 1 });
planSchema.index({ isCustom: 1 });
planSchema.index({ assignedToUser: 1 });

// Method to get plan by category and name
planSchema.statics.getPlan = async function(category, planName) {
  // First try to get category-specific plan
  let plan = await this.findOne({ 
    businessCategory: category, 
    name: planName, 
    isActive: true,
    isCustom: false // Only get regular plans
  });
  
  // If not found, try to get 'All' category plan
  if (!plan) {
    plan = await this.findOne({ 
      businessCategory: 'All', 
      name: planName, 
      isActive: true,
      isCustom: false // Only get regular plans
    });
  }
  
  return plan;
};

// Method to get effective price (considering custom pricing)
planSchema.methods.getEffectivePrice = function() {
  if (this.customPricing?.enabled) {
    if (this.customPricing.overridePrice !== null) {
      return this.customPricing.overridePrice;
    }
    if (this.customPricing.discountPercent > 0) {
      return this.price * (1 - this.customPricing.discountPercent / 100);
    }
  }
  return this.price;
};

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
