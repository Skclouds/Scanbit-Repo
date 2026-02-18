import mongoose from 'mongoose';

const bulkEmailLogSchema = new mongoose.Schema({
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  recipientType: {
    type: String,
    enum: ['all', 'users', 'businesses', 'custom'],
    required: true,
  },
  filters: {
    role: { type: String, default: null },
    businessCategory: { type: String, default: null },
    subscriptionStatus: { type: String, default: null },
  },
  total: { type: Number, required: true },
  sent: { type: Number, required: true },
  failed: { type: Number, required: true },
  failedEmails: [{ type: String }],
  attachmentCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

bulkEmailLogSchema.index({ sentBy: 1, createdAt: -1 });
bulkEmailLogSchema.index({ createdAt: -1 });

export default mongoose.model('BulkEmailLog', bulkEmailLogSchema);
