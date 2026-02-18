import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Advertisement from '../models/Advertisement.js';
import User from '../models/User.js';

// Load environment variables (same as seedPlans.js)
// Make sure to run this script from the backend directory: npm run seed:ads
dotenv.config();

// Verify MONGO_URI is loaded
if (!process.env.MONGO_URI) {







  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  } catch (error) {


    process.exit(1);
  }
};

// Get or create admin user
const getAdminUser = async () => {
  try {
    // Try to find an existing admin user
    let admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {


      throw new Error('Admin user not found. Please create an admin user first.');
    }
    
    return admin;
  } catch (error) {

    throw error;
  }
};

// Create demo advertisements
const seedAdvertisements = async () => {
  try {
    await connectDB();
    
    const admin = await getAdminUser();
    const adminId = admin._id;
    
    // Calculate dates
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 3); // 3 months from now
    
    const demoAds = [
      // 1. Header Banner
      {
        title: 'New Year Special Offer',
        campaignName: 'New Year 2026 Campaign',
        adType: 'header-banner',
        status: 'active',
        priority: 'high',
        headline: '🎉 New Year Special: Get 50% Off on All Plans!',
        subHeadline: 'Limited Time Offer',
        description: 'Start the new year with amazing savings. Upgrade your plan today!',
        ctaButtonText: 'Claim Offer',
        ctaButtonLink: '/pricing',
        ctaType: 'internal',
        backgroundColor: '#1e40af',
        textColor: '#ffffff',
        gradient: {
          enabled: true,
          colors: ['#1e40af', '#3b82f6'],
          direction: 'to-right'
        },
        pageTargeting: ['home', 'menu'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        timezone: 'Asia/Kolkata',
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: null,
          showOncePerSession: false,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'top',
          width: '100%',
          height: '60px',
          zIndex: 1000,
          closeable: true,
          dismissible: true,
          showOnMobile: true,
          showOnDesktop: true
        },
        createdBy: adminId,
        updatedBy: adminId,
        notes: 'Demo header banner for New Year promotion',
        tags: ['promotion', 'new-year', 'header']
      },
      
      // 2. Sticky Top Bar
      {
        title: 'Weekend Sale Announcement',
        campaignName: 'Weekend Sale 2026',
        adType: 'sticky-top-bar',
        status: 'active',
        priority: 'medium',
        headline: '🔥 Weekend Sale: Save up to 40% on Premium Plans',
        subHeadline: 'Valid this weekend only',
        description: 'Don\'t miss out on our weekend special offers!',
        ctaButtonText: 'Shop Now',
        ctaButtonLink: '/pricing',
        ctaType: 'internal',
        backgroundColor: '#dc2626',
        textColor: '#ffffff',
        pageTargeting: ['home', 'menu', 'product-listing'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: true,
          showXTimesPerUser: 3,
          showOncePerSession: false,
          delaySeconds: 2,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'top',
          width: '100%',
          height: '50px',
          zIndex: 999,
          closeable: true,
          dismissible: true,
          showOnMobile: true,
          showOnDesktop: true
        },
        createdBy: adminId,
        updatedBy: adminId,
        notes: 'Demo sticky top bar for weekend sales',
        tags: ['sale', 'weekend', 'sticky']
      },
      
      // 3. Popup Modal
      {
        title: 'Feature Launch Announcement',
        campaignName: 'New Feature Launch',
        adType: 'popup-modal',
        status: 'active',
        priority: 'high',
        headline: '🚀 Exciting New Features Available!',
        subHeadline: 'Enhanced Analytics & Reporting',
        description: 'We\'ve added powerful new analytics tools to help you grow your business. Check them out now!',
        ctaButtonText: 'Explore Features',
        ctaButtonLink: '/features',
        ctaType: 'internal',
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        gradient: {
          enabled: true,
          colors: ['#7c3aed', '#a855f7'],
          direction: 'diagonal'
        },
        pageTargeting: ['home'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: 1,
          showOncePerSession: true,
          delaySeconds: 3,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'center',
          width: '500px',
          height: 'auto',
          zIndex: 10000,
          closeable: true,
          dismissible: true,
          showOnMobile: true,
          showOnDesktop: true
        },
        createdBy: adminId,
        updatedBy: adminId,
        notes: 'Demo popup modal for feature announcements',
        tags: ['feature', 'announcement', 'modal']
      },
      
      // 4. Slide-In Popup
      {
        title: 'Special Discount Offer',
        campaignName: 'Flash Sale Campaign',
        adType: 'slide-in-popup',
        status: 'active',
        priority: 'medium',
        headline: '⚡ Flash Sale: 30% Off Today Only!',
        subHeadline: 'Limited Time Offer',
        description: 'Get instant access to premium features at a discounted price.',
        ctaButtonText: 'Get Discount',
        ctaButtonLink: '/register',
        ctaType: 'internal',
        backgroundColor: '#f59e0b',
        textColor: '#ffffff',
        pageTargeting: ['home', 'menu'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: 2,
          showOncePerSession: false,
          delaySeconds: 5,
          scrollTriggerPercent: 30
        },
        displaySettings: {
          position: 'right',
          width: '350px',
          height: 'auto',
          zIndex: 5000,
          closeable: true,
          dismissible: true,
          showOnMobile: false,
          showOnDesktop: true
        },
        createdBy: adminId,
        updatedBy: adminId,
        notes: 'Demo slide-in popup for flash sales',
        tags: ['flash-sale', 'discount', 'slide-in']
      },
      
      // 5. Announcement Bar
      {
        title: 'System Maintenance Notice',
        campaignName: 'Maintenance Announcement',
        adType: 'announcement-bar',
        status: 'active',
        priority: 'low',
        headline: '⚠️ Scheduled Maintenance: Jan 25, 2:00 AM - 4:00 AM IST',
        subHeadline: 'System will be temporarily unavailable',
        description: 'We\'re performing scheduled maintenance to improve performance. Services will resume shortly.',
        ctaButtonText: 'Learn More',
        ctaButtonLink: '/support',
        ctaType: 'internal',
        backgroundColor: '#f97316',
        textColor: '#ffffff',
        pageTargeting: ['home', 'menu', 'product-listing', 'product-detail'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: null,
          showOncePerSession: false,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'top',
          width: '100%',
          height: 'auto',
          zIndex: 1001,
          closeable: true,
          dismissible: true,
          showOnMobile: true,
          showOnDesktop: true
        },
        createdBy: adminId,
        updatedBy: adminId,
        notes: 'Demo announcement bar for maintenance notices',
        tags: ['maintenance', 'announcement', 'notice']
      },
      
      // 6. Full-Width Banner
      {
        title: 'Festival Special Offer',
        campaignName: 'Festival Sale 2026',
        adType: 'full-width-banner',
        status: 'active',
        priority: 'high',
        headline: '🎊 Festival Special: Celebrate with 60% Off!',
        subHeadline: 'Best deals of the season',
        description: 'Join thousands of businesses already using ScanBit. Start your free trial today!',
        ctaButtonText: 'Start Free Trial',
        ctaButtonLink: '/register',
        ctaType: 'internal',
        backgroundColor: '#10b981',
        textColor: '#ffffff',
        gradient: {
          enabled: true,
          colors: ['#10b981', '#34d399'],
          direction: 'to-right'
        },
        pageTargeting: ['home'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: null,
          showOncePerSession: false,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'top',
          width: '100%',
          height: '200px',
          zIndex: 100,
          closeable: false,
          dismissible: false,
          showOnMobile: true,
          showOnDesktop: true
        },
        createdBy: adminId,
        updatedBy: adminId,
        notes: 'Demo full-width banner for festival promotions',
        tags: ['festival', 'promotion', 'banner']
      },
      
      // 7. CTA Floating Button
      {
        title: 'WhatsApp Support Button',
        campaignName: 'Support CTA Campaign',
        adType: 'cta-floating-button',
        status: 'active',
        priority: 'medium',
        headline: 'Need Help?',
        subHeadline: 'Chat with us on WhatsApp',
        description: 'Get instant support from our team',
        ctaButtonText: '💬 Chat Now',
        ctaButtonLink: 'https://wa.me/916390420225',
        ctaType: 'whatsapp',
        backgroundColor: '#25d366',
        textColor: '#ffffff',
        pageTargeting: ['home', 'menu', 'product-listing', 'product-detail', 'contact'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: null,
          showOncePerSession: false,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'floating',
          width: '60px',
          height: '60px',
          zIndex: 9999,
          closeable: false,
          dismissible: false,
          showOnMobile: true,
          showOnDesktop: true
        },
        createdBy: adminId,
        updatedBy: adminId,
        notes: 'Demo floating CTA button for WhatsApp support',
        tags: ['support', 'whatsapp', 'floating']
      },
      
      // 8. Exit Intent Popup
      {
        title: 'Exit Intent Special Offer',
        campaignName: 'Exit Intent Campaign',
        adType: 'exit-intent-popup',
        status: 'active',
        priority: 'high',
        headline: 'Wait! Don\'t Go Yet! 🎁',
        subHeadline: 'Get 20% Off Your First Month',
        description: 'We hate to see you leave! Here\'s a special discount just for you. Use code: WELCOME20',
        ctaButtonText: 'Claim Discount',
        ctaButtonLink: '/register?promo=WELCOME20',
        ctaType: 'internal',
        backgroundColor: '#ec4899',
        textColor: '#ffffff',
        gradient: {
          enabled: true,
          colors: ['#ec4899', '#f472b6'],
          direction: 'diagonal'
        },
        pageTargeting: ['home', 'menu'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: 1,
          showOncePerSession: true,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'center',
          width: '450px',
          height: 'auto',
          zIndex: 10000,
          closeable: true,
          dismissible: true,
          showOnMobile: false,
          showOnDesktop: true
        },
        createdBy: adminId,
        updatedBy: adminId,
        notes: 'Demo exit intent popup to reduce bounce rate',
        tags: ['exit-intent', 'discount', 'retention']
      }
    ];
    
    // Clear existing demo ads (optional - comment out if you want to keep existing)
    // await Advertisement.deleteMany({ notes: { $regex: /^Demo/ } });
    
    // Insert demo advertisements
    const results = {
      created: [],
      updated: [],
      errors: []
    };
    
    for (const adData of demoAds) {
      try {
        // Check if ad with same title and type already exists
        const existingAd = await Advertisement.findOne({
          title: adData.title,
          adType: adData.adType
        });
        
        if (existingAd) {
          // Update existing ad
          Object.assign(existingAd, adData);
          existingAd.updatedBy = adminId;
          existingAd.updatedAt = new Date();
          await existingAd.save();
          results.updated.push({ title: adData.title, type: adData.adType });

        } else {
          // Create new ad
          const ad = new Advertisement(adData);
          await ad.save();
          results.created.push({ title: adData.title, type: adData.adType });

        }
      } catch (error) {

        results.errors.push({ 
          title: adData.title, 
          type: adData.adType, 
          error: error.message 
        });
      }
    }
    




    if (results.created.length > 0) {

      results.created.forEach(ad => {

      });
    }
    
    if (results.updated.length > 0) {

      results.updated.forEach(ad => {

      });
    }
    
    if (results.errors.length > 0) {

      results.errors.forEach(err => {

      });
    }
    

    process.exit(0);
  } catch (error) {

    process.exit(1);
  }
};

// Run the seeding
seedAdvertisements();
