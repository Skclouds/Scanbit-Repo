import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/menuqr');

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});

    // Create Master Admin User
    const masterAdmin = await User.create({
      name: 'Master Admin',
      email: 'rudranshdevelopment@gmail.com',
      password: 'Vivek@142003',
      role: 'admin'
    });

    // Create Regular Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@menuqr.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create Demo Hotel User first
    const demoUser = await User.create({
      name: 'Garden Café Manager',
      email: 'hotel@demo.com',
      password: 'demo123',
      role: 'restaurant'
    });

    // Create Demo Hotel/Restaurant with owner
    const demoRestaurant = await Restaurant.create({
      name: 'The Garden Café',
      businessType: 'Restaurant',
      email: 'garden@cafe.com',
      phone: '+91 98765 43210',
      address: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      owner: demoUser._id,
      subscription: {
        plan: 'Pro',
        planPrice: 699,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        daysRemaining: 45
      },
      menuItemsLimit: 'Unlimited',
      qrScans: 12540,
      qrScansThisMonth: 2340
    });

    // Update user with restaurant reference
    demoUser.restaurant = demoRestaurant._id;
    await demoUser.save();

    // Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Starters',
        emoji: '🥗',
        restaurant: demoRestaurant._id,
        order: 1
      },
      {
        name: 'Main Course',
        emoji: '🍝',
        restaurant: demoRestaurant._id,
        order: 2
      },
      {
        name: 'Desserts',
        emoji: '🍰',
        restaurant: demoRestaurant._id,
        order: 3
      },
      {
        name: 'Beverages',
        emoji: '🥤',
        restaurant: demoRestaurant._id,
        order: 4
      },
      {
        name: 'Breakfast',
        emoji: '🍳',
        restaurant: demoRestaurant._id,
        order: 5
      }
    ]);

    // Create Menu Items
    const startersCategory = categories.find(c => c.name === 'Starters');
    const mainsCategory = categories.find(c => c.name === 'Main Course');
    const dessertsCategory = categories.find(c => c.name === 'Desserts');
    const beveragesCategory = categories.find(c => c.name === 'Beverages');
    const breakfastCategory = categories.find(c => c.name === 'Breakfast');

    await MenuItem.insertMany([
      // Starters
      {
        name: 'Garden Fresh Salad',
        description: 'Mixed greens, cherry tomatoes, cucumber, and house dressing',
        price: 199,
        category: startersCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: true,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        order: 1
      },
      {
        name: 'Crispy Spring Rolls',
        description: 'Vegetable filled rolls with sweet chili dipping sauce',
        price: 249,
        category: startersCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: true,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        order: 2
      },
      {
        name: 'Chicken Wings',
        description: 'Spicy buffalo wings served with ranch dip',
        price: 349,
        category: startersCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: false,
        isSpicy: true,
        isPopular: true,
        isAvailable: true,
        order: 3
      },
      // Main Course
      {
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomatoes, and basil on signature crust',
        price: 399,
        category: mainsCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: true,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        order: 1
      },
      {
        name: 'Butter Chicken',
        description: 'Tender chicken in a velvety tomato-butter sauce',
        price: 449,
        category: mainsCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: false,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        order: 2
      },
      {
        name: 'Paneer Tikka Masala',
        description: 'Cottage cheese cubes in rich, creamy tomato gravy',
        price: 349,
        category: mainsCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: true,
        isSpicy: true,
        isPopular: false,
        isAvailable: false,
        order: 3
      },
      // Desserts
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with ice cream',
        price: 249,
        category: dessertsCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: true,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        order: 1
      },
      {
        name: 'Gulab Jamun',
        description: 'Traditional Indian sweet dumplings in sugar syrup',
        price: 149,
        category: dessertsCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: true,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        order: 2
      },
      // Beverages
      {
        name: 'Mango Lassi',
        description: 'Creamy yogurt drink blended with fresh mango',
        price: 149,
        category: beveragesCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: true,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        order: 1
      },
      {
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime with soda, your choice of sweet or salted',
        price: 99,
        category: beveragesCategory._id,
        restaurant: demoRestaurant._id,
        isVeg: true,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        order: 2
      }
    ]);













    process.exit(0);
  } catch (error) {

    process.exit(1);
  }
};

seedData();
