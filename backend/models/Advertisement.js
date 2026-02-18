import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Advertisement title is required'],
    trim: true
  },
  campaignName: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  adType: {
    type: String,
    required: [true, 'Ad type is required'],
    enum: [
      'header-banner',
      'sticky-top-bar',
      'popup-modal',
      'slide-in-popup',
      'announcement-bar',
      'full-width-banner',
      'cta-floating-button',
      'exit-intent-popup'
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'scheduled', 'paused', 'expired', 'archived'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },

  // Content
  headline: {
    type: String,
    required: [true, 'Headline is required'],
    trim: true
  },
  subHeadline: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  ctaButtonText: {
    type: String,
    default: 'Learn More',
    trim: true
  },
  ctaButtonLink: {
    type: String,
    required: [true, 'CTA link is required'],
    trim: true
  },
  ctaType: {
    type: String,
    enum: ['internal', 'external', 'whatsapp', 'payment', 'contact'],
    default: 'internal'
  },
  backgroundColor: {
    type: String,
    default: '#3b82f6'
  },
  textColor: {
    type: String,
    default: '#ffffff'
  },
  image: {
    type: String,
    default: null
  },
  video: {
    type: String,
    default: null
  },
  gradient: {
    enabled: {
      type: Boolean,
      default: false
    },
    colors: {
      type: [String],
      default: []
    },
    direction: {
      type: String,
      enum: ['to-right', 'to-left', 'to-bottom', 'to-top', 'diagonal'],
      default: 'to-right'
    }
  },

  // Targeting
  pageTargeting: {
    type: [String],
    required: [true, 'At least one page must be selected'],
    enum: [
      'all',
      'home',
      'menu',
      'product-listing',
      'product-detail',
      'cart',
      'checkout',
      'portfolio',
      'contact',
      'custom'
    ]
  },
  customUrls: {
    type: [String],
    default: []
  },
  businessCategoryTargeting: {
    type: [String],
    default: ['all'],
    enum: ['all', 'Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design']
  },

  // Scheduling
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  schedulingRules: {
    showOnlyOnWeekends: {
      type: Boolean,
      default: false
    },
    showOnlyOnDates: {
      type: [Date],
      default: []
    },
    showXTimesPerUser: {
      type: Number,
      default: null // null = unlimited
    },
    showOncePerSession: {
      type: Boolean,
      default: false
    },
    delaySeconds: {
      type: Number,
      default: 0
    },
    scrollTriggerPercent: {
      type: Number,
      default: null // null = no scroll trigger
    }
  },

  // Display Settings
  displaySettings: {
    position: {
      type: String,
      enum: ['top', 'bottom', 'center', 'left', 'right', 'floating'],
      default: 'top'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: 'auto'
    },
    zIndex: {
      type: Number,
      default: 1000
    },
    closeable: {
      type: Boolean,
      default: true
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    showOnMobile: {
      type: Boolean,
      default: true
    },
    showOnDesktop: {
      type: Boolean,
      default: true
    }
  },

  // Analytics
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date,
      default: null
    },
    lastClicked: {
      type: Date,
      default: null
    }
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Indexes for performance
advertisementSchema.index({ status: 1, startDate: 1, endDate: 1 });
advertisementSchema.index({ adType: 1 });
advertisementSchema.index({ businessCategoryTargeting: 1 });
advertisementSchema.index({ pageTargeting: 1 });
advertisementSchema.index({ createdAt: -1 });

// Virtual for CTR (Click-Through Rate)
advertisementSchema.virtual('ctr').get(function() {
  if (this.analytics.impressions === 0) return 0;
  return ((this.analytics.clicks / this.analytics.impressions) * 100).toFixed(2);
});

// Virtual for isActive
advertisementSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Method to increment impression
advertisementSchema.methods.incrementImpression = function() {
  this.analytics.impressions += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

// Method to increment click
advertisementSchema.methods.incrementClick = function() {
  this.analytics.clicks += 1;
  this.analytics.lastClicked = new Date();
  return this.save();
};

// Method to check if ad should be displayed
advertisementSchema.methods.shouldDisplay = function(page, businessCategory, userSession) {
  // Check status
  if (this.status !== 'active') return false;
  
  // Check date range
  const now = new Date();
  if (this.startDate > now || this.endDate < now) return false;
  
  // Check page targeting
  if (!this.pageTargeting.includes(page) && !this.pageTargeting.includes('custom')) {
    return false;
  }
  
  // Check custom URLs if custom is selected
  if (this.pageTargeting.includes('custom') && this.customUrls.length > 0) {
    // This would need URL matching logic
  }
  
  // Check business category targeting
  if (!this.businessCategoryTargeting.includes('all') && 
      !this.businessCategoryTargeting.includes(businessCategory)) {
    return false;
  }
  
  // Check scheduling rules
  if (this.schedulingRules.showOnlyOnWeekends) {
    const day = now.getDay();
    if (day !== 0 && day !== 6) return false; // Not Saturday or Sunday
  }
  
  if (this.schedulingRules.showOncePerSession && userSession?.hasSeenAd) {
    return false;
  }
  
  return true;
};

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

export default Advertisement;
