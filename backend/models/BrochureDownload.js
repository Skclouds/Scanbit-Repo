import mongoose from 'mongoose';

const brochureDownloadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);

brochureDownloadSchema.index({ email: 1, createdAt: -1 });
brochureDownloadSchema.index({ createdAt: -1 });

export default mongoose.model('BrochureDownload', brochureDownloadSchema);
