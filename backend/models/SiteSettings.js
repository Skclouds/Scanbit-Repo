import mongoose from 'mongoose';


const ColorSchema = new mongoose.Schema({
  primary: { type: String, default: '#ff6b2c' },
  secondary: { type: String, default: '#1f2937' },
  background: { type: String, default: '#ffffff' },
  text: { type: String, default: '#111827' },
}, { _id: false });

const TypographySchema = new mongoose.Schema({
  fontFamily: { type: String, default: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"' },
  baseFontSize: { type: Number, default: 16 },
}, { _id: false });

const LayoutSchema = new mongoose.Schema({
  contentWidth: { type: String, enum: ['boxed', 'full'], default: 'full' },
  headerStyle: { type: String, enum: ['transparent', 'solid'], default: 'solid' },
  footerStyle: { type: String, enum: ['minimal', 'detailed'], default: 'minimal' },
}, { _id: false });

const AnimationSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  durationMs: { type: Number, default: 300 },
}, { _id: false });

const SectionsSchema = new mongoose.Schema({
  showFeatures: { type: Boolean, default: true },
  showPricing: { type: Boolean, default: true },
  showTestimonials: { type: Boolean, default: true },
  showFAQ: { type: Boolean, default: true },
}, { _id: false });

const ExtraMetaTagSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  property: { type: String, trim: true },
  content: { type: String, required: true, trim: true },
}, { _id: false });

const SEOSchema = new mongoose.Schema({
  // Basic
  metaTitle: { type: String, default: '', trim: true, maxlength: 70 },
  metaDescription: { type: String, default: '', trim: true, maxlength: 320 },
  metaKeywords: { type: [String], default: [] },
  canonicalUrl: { type: String, default: '', trim: true },
  author: { type: String, default: '', trim: true },
  themeColor: { type: String, default: '', trim: true },
  locale: { type: String, default: 'en_IN', trim: true },
  // Open Graph
  ogTitle: { type: String, default: '', trim: true },
  ogDescription: { type: String, default: '', trim: true },
  ogImage: { type: String, default: '', trim: true },
  ogImageWidth: { type: Number, default: 1200 },
  ogImageHeight: { type: Number, default: 630 },
  ogType: { type: String, default: 'website', enum: ['website', 'article', 'product', 'profile'] },
  ogSiteName: { type: String, default: '', trim: true },
  ogLocale: { type: String, default: '', trim: true },
  ogUrl: { type: String, default: '', trim: true },
  // Twitter Card
  twitterCard: { type: String, default: 'summary_large_image', enum: ['summary', 'summary_large_image', 'app', 'player'] },
  twitterTitle: { type: String, default: '', trim: true },
  twitterDescription: { type: String, default: '', trim: true },
  twitterImage: { type: String, default: '', trim: true },
  twitterSite: { type: String, default: '', trim: true },
  twitterCreator: { type: String, default: '', trim: true },
  // Robots & indexing
  robotsIndex: { type: String, default: 'index', enum: ['index', 'noindex'] },
  robotsFollow: { type: String, default: 'follow', enum: ['follow', 'nofollow'] },
  robotsExtra: { type: String, default: '', trim: true },
  // Analytics & verification
  googleAnalyticsId: { type: String, default: '', trim: true },
  googleTagManagerId: { type: String, default: '', trim: true },
  googleSiteVerification: { type: String, default: '', trim: true },
  bingSiteVerification: { type: String, default: '', trim: true },
  // Structured data (JSON-LD)
  jsonLdOrganization: { type: String, default: '', trim: true },
  jsonLdWebSite: { type: String, default: '', trim: true },
  jsonLdBreadcrumb: { type: String, default: '', trim: true },
  // Custom meta tags
  extraMetaTags: [ExtraMetaTagSchema],
}, { _id: false });

const GeneralSchema = new mongoose.Schema({
  siteName: { 
    type: String, 
    default: 'Menu Maestro',
    trim: true,
    maxlength: [100, 'Site name cannot exceed 100 characters']
  },
  tagline: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [200, 'Tagline cannot exceed 200 characters']
  },
  siteDescription: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [500, 'Site description cannot exceed 500 characters']
  },
  contactEmail: { 
    type: String, 
    default: '',
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  contactPhone: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  address: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
}, { _id: false });

const SiteSettingsSchema = new mongoose.Schema({
  general: { type: GeneralSchema, default: () => ({}) },
  branding: {
    logoUrl: { type: String, default: '', trim: true },
    darkLogoUrl: { type: String, default: '', trim: true },
    mobileLogoUrl: { type: String, default: '', trim: true },
    footerLogoUrl: { type: String, default: '', trim: true },
    faviconUrl: { type: String, default: '', trim: true },
    appIconUrl: { type: String, default: '', trim: true },
  },
  typography: { type: TypographySchema, default: () => ({}) },
  colors: { type: ColorSchema, default: () => ({}) },
  layout: { type: LayoutSchema, default: () => ({}) },
  media: {
    heroImageUrl: { type: String, default: '', trim: true },
    bannerImageUrl: { type: String, default: '', trim: true },
  },
  animations: { type: AnimationSchema, default: () => ({}) },
  sections: { type: SectionsSchema, default: () => ({}) },
  seo: { type: SEOSchema, default: () => ({}) },
  publish: {
    isDraft: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Single document collection: enforce one settings doc
SiteSettingsSchema.statics.getSingleton = async function () {
  const existing = await this.findOne();
  if (existing) return existing;
  return this.create({});
};

export default mongoose.model('SiteSettings', SiteSettingsSchema);
