import mongoose from 'mongoose';

/**
 * Business Information - dedicated collection for business profile data.
 * Linked to User (owner) and Restaurant. Serves as source of truth for
 * business details; key fields are synced to Restaurant for backward compatibility.
 */
const businessInformationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    unique: true,
    index: true
  },

  // Core identity
  businessName: {
    type: String,
    trim: true,
    default: null
  },
  tagline: {
    type: String,
    trim: true,
    default: null
  },
  profile: {
    type: String,
    trim: true,
    default: null
  },

  // Contact information
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  whatsapp: {
    type: String,
    trim: true,
    default: null
  },

  // Location & address
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, trim: true, default: null }
  },

  // Opening hours
  openingHours: {
    type: String,
    trim: true,
    default: null
  },
  openingHoursSchedule: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  // Branding & media
  logo: {
    type: String,
    default: null
  },
  businessCardFront: {
    type: String,
    default: null
  },
  businessCardBack: {
    type: String,
    default: null
  },

  // Social & web
  socialMedia: {
    facebook: { type: String, trim: true, default: null },
    instagram: { type: String, trim: true, default: null },
    twitter: { type: String, trim: true, default: null },
    linkedin: { type: String, trim: true, default: null },
    website: { type: String, trim: true, default: null }
  }
}, {
  timestamps: true,
  collection: 'business_information'
});

export default mongoose.model('BusinessInformation', businessInformationSchema);
