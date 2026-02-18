import mongoose from 'mongoose';

const qrScanSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for analytics queries
qrScanSchema.index({ restaurant: 1, scannedAt: -1 });

export default mongoose.model('QRScan', qrScanSchema);
