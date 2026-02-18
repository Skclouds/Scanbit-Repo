import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  excerpt: {
    type: String,
    trim: true,
    default: '',
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  coverImage: {
    type: String,
    trim: true,
    default: null,
  },
  author: {
    type: String,
    trim: true,
    default: 'ScanBit Team',
  },
  category: {
    type: String,
    trim: true,
    default: 'General',
  },
  tags: {
    type: [String],
    default: [],
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  metaTitle: {
    type: String,
    trim: true,
    default: '',
  },
  metaDescription: {
    type: String,
    trim: true,
    default: '',
  },
});

// slug index created automatically by unique: true on field
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ createdAt: -1 });

blogSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

blogSchema.statics.generateSlug = async function (title) {
  let slug = slugify(title);
  let base = slug;
  let counter = 1;
  let exists = await this.findOne({ slug });
  while (exists) {
    slug = `${base}-${counter}`;
    exists = await this.findOne({ slug });
    counter++;
  }
  return slug;
};

export default mongoose.model('Blog', blogSchema);
