import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const Plan = (await import('../models/Plan.js')).default;
const BusinessCategory = (await import('../models/BusinessCategory.js')).default;

// Plan template generator based on category type
const generatePlansForCategory = (categoryName, categoryDescription) => {
  const categoryLower = categoryName.toLowerCase();
  
  // Determine plan configuration based on category
  let planConfig = {
    itemType: 'items',
    scanType: 'QR scans',
    basePrice: 499,
    baseOriginalPrice: 999,
    priceMultiplier: 1,
  };

  // Customize based on category
  if (categoryLower.includes('food') || categoryLower.includes('mall') || categoryLower.includes('restaurant')) {
    planConfig = {
      itemType: 'menu items',
      scanType: 'QR scans',
      basePrice: 499,
      baseOriginalPrice: 999,
      priceMultiplier: 1,
    };
  } else if (categoryLower.includes('retail') || categoryLower.includes('e-commerce') || categoryLower.includes('commerce')) {
    planConfig = {
      itemType: 'products',
      scanType: 'QR scans',
      basePrice: 599,
      baseOriginalPrice: 1199,
      priceMultiplier: 1.2,
    };
  } else if (categoryLower.includes('creative') || categoryLower.includes('design') || categoryLower.includes('portfolio')) {
    planConfig = {
      itemType: 'portfolio items',
      scanType: 'QR scans',
      basePrice: 399,
      baseOriginalPrice: 799,
      priceMultiplier: 0.8,
    };
  } else if (categoryLower.includes('service') || categoryLower.includes('professional')) {
    planConfig = {
      itemType: 'services',
      scanType: 'QR scans',
      basePrice: 449,
      baseOriginalPrice: 899,
      priceMultiplier: 0.9,
    };
  } else if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('wellness')) {
    planConfig = {
      itemType: 'services',
      scanType: 'QR scans',
      basePrice: 699,
      baseOriginalPrice: 1399,
      priceMultiplier: 1.4,
    };
  }

  const { itemType, scanType, basePrice, baseOriginalPrice, priceMultiplier } = planConfig;

  return [
    {
      name: "Starter",
      description: `Perfect for small ${categoryName.toLowerCase()} businesses just starting out. Get essential features and ${scanType.toLowerCase()} to grow your business.`,
      price: Math.round(basePrice * priceMultiplier),
      originalPrice: Math.round(baseOriginalPrice * priceMultiplier),
      duration: 30,
      billingCycle: "monthly",
      isDefault: true,
      features: {
        menuItemsLimit: categoryLower.includes('creative') || categoryLower.includes('design') ? "30" : categoryLower.includes('retail') ? "100" : "50",
        qrScansLimit: categoryLower.includes('creative') || categoryLower.includes('design') ? "500" : categoryLower.includes('retail') ? "2000" : "1000",
        analytics: true,
        customDomain: false,
        prioritySupport: false,
        apiAccess: false,
        customBranding: false
      },
      featuresList: [
        `Up to ${categoryLower.includes('creative') || categoryLower.includes('design') ? '30' : categoryLower.includes('retail') ? '100' : '50'} ${itemType}`,
        `${categoryLower.includes('creative') || categoryLower.includes('design') ? '500' : categoryLower.includes('retail') ? '2,000' : '1,000'} ${scanType} per month`,
        "Basic analytics dashboard",
        `Digital ${categoryLower.includes('retail') ? 'catalog' : categoryLower.includes('creative') ? 'portfolio' : 'menu'} QR code`,
        "Mobile-responsive design",
        "Email support",
        `${categoryLower.includes('retail') ? 'Product' : categoryLower.includes('creative') ? 'Portfolio' : 'Menu'} categories`,
        categoryLower.includes('retail') 
          ? "Product images (up to 3 per product)" 
          : categoryLower.includes('creative') 
            ? "Project images (up to 10 per project)" 
            : "Item images (up to 5 per item)",
        categoryLower.includes('retail') ? "Price management" : categoryLower.includes('creative') ? "Project descriptions" : "Menu sections",
        categoryLower.includes('retail') ? "Stock status display" : categoryLower.includes('creative') ? "Contact form" : "Basic customization"
      ]
    },
    {
      name: "Professional",
      description: `Ideal for growing ${categoryName.toLowerCase()} businesses. Advanced features for better customer engagement and business management.`,
      price: Math.round(basePrice * 2.6 * priceMultiplier),
      originalPrice: Math.round(baseOriginalPrice * 2.5 * priceMultiplier),
      duration: 30,
      billingCycle: "monthly",
      isDefault: false,
      features: {
        menuItemsLimit: categoryLower.includes('creative') || categoryLower.includes('design') ? "150" : categoryLower.includes('retail') ? "500" : "200",
        qrScansLimit: categoryLower.includes('creative') || categoryLower.includes('design') ? "5000" : categoryLower.includes('retail') ? "20000" : "10000",
        analytics: true,
        customDomain: true,
        prioritySupport: true,
        apiAccess: false,
        customBranding: true
      },
      featuresList: [
        `Up to ${categoryLower.includes('creative') || categoryLower.includes('design') ? '150' : categoryLower.includes('retail') ? '500' : '200'} ${itemType}`,
        `${categoryLower.includes('creative') || categoryLower.includes('design') ? '5,000' : categoryLower.includes('retail') ? '20,000' : '10,000'} ${scanType} per month`,
        "Advanced analytics & insights",
        "Custom domain support",
        "Custom branding & logo",
        "Priority email support",
        `Unlimited ${categoryLower.includes('retail') ? 'product' : categoryLower.includes('creative') ? 'portfolio' : 'menu'} categories`,
        `${categoryLower.includes('retail') ? 'Product' : categoryLower.includes('creative') ? 'Project' : 'Item'} images (unlimited)`,
        categoryLower.includes('retail') 
          ? "Product variants & options" 
          : categoryLower.includes('creative') 
            ? "Video portfolio support" 
            : "Menu sections & specials",
        categoryLower.includes('retail') 
          ? "E-commerce integration" 
          : categoryLower.includes('creative') 
            ? "Client testimonials" 
            : "Online ordering integration",
        categoryLower.includes('retail') 
          ? "Shopping cart functionality" 
          : categoryLower.includes('creative') 
            ? "Case study pages" 
            : "Customer reviews & ratings",
        "Social media integration",
        categoryLower.includes('retail') ? "Inventory management" : categoryLower.includes('creative') ? "Blog integration" : "Advanced customization"
      ]
    },
    {
      name: "Enterprise",
      description: `Complete solution for large ${categoryName.toLowerCase()} businesses and chains. All features, integrations, and white-label options included.`,
      price: Math.round(basePrice * 6 * priceMultiplier),
      originalPrice: Math.round(baseOriginalPrice * 6 * priceMultiplier),
      duration: 30,
      billingCycle: "monthly",
      isDefault: false,
      features: {
        menuItemsLimit: "unlimited",
        qrScansLimit: "unlimited",
        analytics: true,
        customDomain: true,
        prioritySupport: true,
        apiAccess: true,
        customBranding: true
      },
      featuresList: [
        `Unlimited ${itemType}`,
        `Unlimited ${scanType}`,
        "Enterprise analytics & reports",
        "Custom domain & SSL",
        "Full custom branding",
        "24/7 priority support",
        "API access & webhooks",
        categoryLower.includes('retail') 
          ? "Multi-store management" 
          : categoryLower.includes('creative') 
            ? "Multi-brand management" 
            : "Multi-location management",
        categoryLower.includes('retail') 
          ? "Advanced inventory system" 
          : categoryLower.includes('creative') 
            ? "Client management system" 
            : "Staff management system",
        categoryLower.includes('retail') 
          ? "Order management system" 
          : categoryLower.includes('creative') 
            ? "Project collaboration tools" 
            : "Inventory tracking",
        categoryLower.includes('retail') 
          ? "Payment gateway integration" 
          : categoryLower.includes('creative') 
            ? "Invoice & billing integration" 
            : "Advanced ordering system",
        categoryLower.includes('retail') 
          ? "Shipping management" 
          : categoryLower.includes('creative') 
            ? "Time tracking integration" 
            : "Loyalty program integration",
        "Marketing automation",
        "White-label solution",
        categoryLower.includes('creative') ? "Team member accounts" : "Advanced integrations"
      ]
    }
  ];
};

export const resetAndCreatePlans = async (userId = null) => {
  try {
    // Check if already connected
    let isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      // Connect to MongoDB
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/menuqr';
      await mongoose.connect(mongoUri);

    }

    // Fetch all active business categories from database
    const BusinessCategoryModel = (await import('../models/BusinessCategory.js')).default;
    const categories = await BusinessCategoryModel.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    if (categories.length === 0) {
      throw new Error('No active business categories found in database. Please seed business categories first.');
    }


    categories.forEach(cat => {

    });

    // Get master admin user ID (for createdBy field)
    const User = (await import('../models/User.js')).default;
    let masterAdmin = null;
    
    if (userId) {
      masterAdmin = await User.findById(userId);
    }
    
    if (!masterAdmin) {
      masterAdmin = await User.findOne({ 
        $or: [
          { isMasterAdmin: true },
          { email: 'rudranshdevelopment@gmail.com' }
        ]
      });
    }

    if (!masterAdmin) {

    }

    // Delete all existing plans (except custom plans)
    const deleteResult = await Plan.deleteMany({ isCustom: { $ne: true } });

    // Create plans for each category
    let totalCreated = 0;

    for (const category of categories) {

      const plans = generatePlansForCategory(category.name, category.description || '');

      for (const planData of plans) {
        const plan = new Plan({
          ...planData,
          businessCategory: category.name,
          isActive: true,
          isCustom: false,
          createdBy: masterAdmin?._id || null,
          updatedBy: masterAdmin?._id || null,
          currency: 'INR'
        });

        await plan.save();
        totalCreated++;

      }
    }



    categories.forEach(category => {

    });

    // Close connection only if we opened it
    if (!isConnected) {
      await mongoose.connection.close();

    }

    return {
      success: true,
      totalCreated,
      categories: categories.map(cat => ({
        category: cat.name,
        count: 3
      }))
    };

  } catch (error) {

    if (!isConnected) {
      await mongoose.connection.close();
    }
    throw error;
  }
};

// Run the script if called directly via node
// Check if this file is being run directly (not imported)
const isMainModule = process.argv[1] && process.argv[1].includes('resetAndCreatePlans.js');
if (isMainModule) {
  resetAndCreatePlans().then((result) => {

    process.exit(0);
  }).catch((error) => {

    process.exit(1);
  });
}
