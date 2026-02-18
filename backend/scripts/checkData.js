import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from '../models/Restaurant.js';
import BusinessCategory from '../models/BusinessCategory.js';

dotenv.config();

const checkData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Check business categories
    const categories = await BusinessCategory.find({ isActive: true });

    categories.forEach(cat => {

    });

    // Check restaurants
    const restaurants = await Restaurant.find({ isArchived: { $ne: true } });

    // Group by category
    const byCategory = {};
    restaurants.forEach(restaurant => {
      const category = restaurant.businessCategory || 'Unknown';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(restaurant);
    });

    Object.entries(byCategory).forEach(([category, businesses]) => {

      businesses.slice(0, 3).forEach(business => {

      });
      if (businesses.length > 3) {

      }
    });

    await mongoose.disconnect();

  } catch (error) {

    process.exit(1);
  }
};

checkData();