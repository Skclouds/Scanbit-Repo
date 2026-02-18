import mongoose from 'mongoose';

/**
 * Persistent OTP storage (MongoDB).
 * Fixes production issues caused by in-memory OTP stores (multi-instance / restarts).
 */
const otpCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['registration', 'login'],
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
    index: true,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
    index: true,
  },
});

// Auto-delete expired OTPs
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpCodeSchema.index({ email: 1, type: 1, createdAt: -1 });

export default mongoose.model('OtpCode', otpCodeSchema);

