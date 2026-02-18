import mongoose from 'mongoose';


const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  businessCategory: {
    type: String,
    trim: true,
    default: null
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true,
    default: null
  },
  tagline: {
    type: String,
    trim: true,
    default: null
  },
  openingHours: {
    type: String,
    trim: true,
    default: null
  },
  openingHoursSchedule: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  profile: {
    type: String,
    trim: true,
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  logo: {
    type: String,
    default: null
  },
  subscription: {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null
    },
    plan: {
      type: String,
      default: 'Free'
    },
    planPrice: {
      type: Number,
      default: 0
    },
    originalPrice: {
      type: Number,
      default: null
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    daysRemaining: {
      type: Number,
      default: 0
    },
    autopayEnabled: {
      type: Boolean,
      default: true
    }
  },
  menuItemsLimit: {
    type: String,
    default: '10'
  },
  qrScans: {
    type: Number,
    default: 0
  },
  qrScansThisMonth: {
    type: Number,
    default: 0
  },
  // Business lifecycle & moderation
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Will be set after user creation
  },
  ownerImage: {
    type: String,
    default: null
  },
  location: {
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    },
    address: String
  },
  businessCardFront: {
    type: String,
    default: null
  },
  businessCardBack: {
    type: String,
    default: null
  },
  businessCard: {
    type: String,
    default: null
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    website: String
  },
  foodImages: [{
    type: String
  }],
  // Portfolio-specific assets
  portfolioGallery: [{
    type: String
  }],
  portfolioResumeUrl: {
    type: String,
    default: null
  },
  // Portfolio display fields (used by /portfolio/:restaurantId)
  portfolioTitle: {
    type: String,
    trim: true,
    default: null
  },
  portfolioMapEmbedUrl: {
    type: String,
    trim: true,
    default: null
  },
  portfolioTheme: {
    type: String,
    trim: true,
    default: 'orange'
  },
  // Portfolio structured content (used by professional portfolio preview)
  portfolioPracticeAreas: [
    {
      id: String,
      name: String,
      description: String,
    }
  ],
  portfolioExperience: [
    {
      id: String,
      title: String,
      category: String,
      year: String,
      summary: String,
    }
  ],
  portfolioProjects: [
    {
      id: String,
      title: String,
      client: String,
      year: String,
      role: String,
      description: String,
      url: String,
      imageUrl: String,
      technologies: String,
      deliverables: String,
      outcome: String,
    }
  ],
  portfolioTestimonials: [
    {
      id: String,
      quote: String,
      author: String,
      role: String,
    }
  ],
  // Agency & Studio portfolio (Agencies & Studios category)
  agencyHeroImageUrl: { type: String, default: null, trim: true },
  agencyHeroBackgroundUrl: { type: String, default: null, trim: true },
  agencyServices: [{ type: String, trim: true }],
  agencyGallery: [
    {
      id: String,
      imageUrl: String,
      title: String,
      category: String,
    }
  ],
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  showQuickActions: {
    type: Boolean,
    default: true
  },
  showSocialLinks: {
    type: Boolean,
    default: true
  },
  showWhatsAppButton: {
    type: Boolean,
    default: true
  },
  customSlug: {
    type: String,
    trim: true,
    lowercase: true,
    default: null,
    sparse: true
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
  timestamps: true,
  collection: 'restaurants'
});

restaurantSchema.index({ customSlug: 1 }, { unique: true, sparse: true });

// Calculate days remaining and update status before save
restaurantSchema.pre('save', function(next) {
  if (this.subscription.endDate) {
    const today = new Date();
    const endDate = new Date(this.subscription.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.subscription.daysRemaining = diffDays > 0 ? diffDays : 0;
    
    // Auto-expire subscription if end date has passed and status is still active
    if (diffDays <= 0 && this.subscription.status === 'active') {
      this.subscription.status = 'expired';
    }
  }
  next();
});

// Static method to check and update expired subscriptions
restaurantSchema.statics.updateExpiredSubscriptions = async function() {
  const now = new Date();
  const result = await this.updateMany(
    {
      'subscription.endDate': { $lt: now },
      'subscription.status': 'active'
    },
    {
      $set: {
        'subscription.status': 'expired',
        'subscription.daysRemaining': 0
      }
    }
  );
  return result;
};

// Instance method to check if subscription is expired
restaurantSchema.methods.isSubscriptionExpired = function() {
  if (!this.subscription.endDate) return false;
  const now = new Date();
  const endDate = new Date(this.subscription.endDate);
  return now > endDate || this.subscription.status === 'expired';
};

// Instance method to check if subscription is expiring soon (within 3 days)
restaurantSchema.methods.isSubscriptionExpiringSoon = function() {
  if (!this.subscription.endDate) return false;
  const now = new Date();
  const endDate = new Date(this.subscription.endDate);
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  return daysRemaining > 0 && daysRemaining <= 3;
};

export default mongoose.model('Restaurant', restaurantSchema);
