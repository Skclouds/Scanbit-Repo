import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan.js';

dotenv.config();

const plans = [
  // Food Mall Plans
  {
    name: 'Starter Menu Plan',
    businessCategory: 'Food Mall',
    price: 399,
    originalPrice: 499,
    currency: 'INR',
    billingCycle: 'monthly',
    features: {
      menuItemsLimit: '50',
      qrScansLimit: '1000',
      analytics: true,
      customDomain: false,
      prioritySupport: false,
      apiAccess: false,
      customBranding: true,
    },
    description: 'Perfect for small restaurants and cafes just starting out',
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Growth Menu Plan',
    businessCategory: 'Food Mall',
    price: 599,
    originalPrice: 799,
    currency: 'INR',
    billingCycle: 'monthly',
    features: {
      menuItemsLimit: '200',
      qrScansLimit: '5000',
      analytics: true,
      customDomain: true,
      prioritySupport: true,
      apiAccess: false,
      customBranding: true,
    },
    description: 'Ideal for growing restaurants with expanding menus',
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Pro Restaurant Plan',
    businessCategory: 'Food Mall',
    price: 799,
    originalPrice: 1099,
    currency: 'INR',
    billingCycle: 'monthly',
    features: {
      menuItemsLimit: 'unlimited',
      qrScansLimit: 'unlimited',
      analytics: true,
      customDomain: true,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
    },
    description: 'Complete solution for established restaurants and chains',
    isActive: true,
    isDefault: false,
  },
  // Retail / E-Commerce Plans
  {
    name: 'Basic Catalog Plan',
    businessCategory: 'Retail / E-Commerce Businesses',
    price: 499,
    originalPrice: 649,
    currency: 'INR',
    billingCycle: 'monthly',
    features: {
      menuItemsLimit: '100',
      qrScansLimit: '2000',
      analytics: true,
      customDomain: false,
      prioritySupport: false,
      apiAccess: false,
      customBranding: true,
    },
    description: 'Essential features for small retail stores and online shops',
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Business Catalog Plan',
    businessCategory: 'Retail / E-Commerce Businesses',
    price: 599,
    originalPrice: 799,
    currency: 'INR',
    billingCycle: 'monthly',
    features: {
      menuItemsLimit: '300',
      qrScansLimit: '10000',
      analytics: true,
      customDomain: true,
      prioritySupport: true,
      apiAccess: false,
      customBranding: true,
    },
    description: 'Advanced features for growing retail businesses',
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Retail Pro Catalog Plan',
    businessCategory: 'Retail / E-Commerce Businesses',
    price: 699,
    originalPrice: 999,
    currency: 'INR',
    billingCycle: 'monthly',
    features: {
      menuItemsLimit: 'unlimited',
      qrScansLimit: 'unlimited',
      analytics: true,
      customDomain: true,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
    },
    description: 'Premium solution for large retail operations and e-commerce stores',
    isActive: true,
    isDefault: false,
  },
  // Creative & Design Plans
  {
    name: 'Launch Store Plan',
    businessCategory: 'Creative & Design',
    price: 299,
    originalPrice: 399,
    currency: 'INR',
    billingCycle: 'monthly',
    features: {
      menuItemsLimit: '30',
      qrScansLimit: '500',
      analytics: true,
      customDomain: false,
      prioritySupport: false,
      apiAccess: false,
      customBranding: true,
    },
    description: 'Perfect for freelancers and small creative businesses',
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Growth Store Plan',
    businessCategory: 'Creative & Design',
    price: 499,
    originalPrice: 699,
    currency: 'INR',
    billingCycle: 'monthly',
    features: {
      menuItemsLimit: '150',
      qrScansLimit: '3000',
      analytics: true,
      customDomain: true,
      prioritySupport: true,
      apiAccess: false,
      customBranding: true,
    },
    description: 'Ideal for growing creative agencies and design studios',
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Scale Store Plan',
    businessCategory: 'Creative & Design',
    price: 699,
    originalPrice: 949,
    currency: 'INR',
    billingCycle: 'monthly',
    features: {
      menuItemsLimit: 'unlimited',
      qrScansLimit: 'unlimited',
      analytics: true,
      customDomain: true,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
    },
    description: 'Complete solution for established creative agencies and large design firms',
    isActive: true,
    isDefault: false,
  },
];

async function seedPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scanbit', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing plans (optional - comment out if you want to keep existing)
    // await Plan.deleteMany({});
    // console.log('🗑️  Cleared existing plans');

    // Insert plans
    for (const planData of plans) {
      // Check if plan already exists
      const existingPlan = await Plan.findOne({
        name: planData.name,
        businessCategory: planData.businessCategory,
      });

      if (existingPlan) {
        // Update existing plan
        Object.assign(existingPlan, planData);
        await existingPlan.save();

      } else {
        // Create new plan
        const plan = new Plan(planData);
        await plan.save();

      }
    }


    process.exit(0);
  } catch (error) {

    process.exit(1);
  }
}

seedPlans();
