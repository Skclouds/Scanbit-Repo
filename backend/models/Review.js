import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  reviewerName: {
    type: String,
    required: [true, 'Reviewer name is required'],
    trim: true
  },
  reviewerEmail: {
    type: String,
    required: [true, 'Reviewer email is required'],
    trim: true,
    lowercase: true
  },
  reviewerMobile: {
    type: String,
    trim: true,
    default: null
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['published', 'pending', 'hidden'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Review', reviewSchema);
