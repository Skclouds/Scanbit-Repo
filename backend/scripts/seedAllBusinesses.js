import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import bcrypt from 'bcryptjs';

dotenv.config();

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedAllBusinesses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/menuqr');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Restaurant.deleteMany({});
    // await Category.deleteMany({});
    // await MenuItem.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Create Master Admin User
    const masterAdminPassword = await hashPassword('Vivek@142003');
    const masterAdmin = await User.findOneAndUpdate(
      { email: 'rudranshdevelopment@gmail.com' },
      {
        name: 'Master Admin',
        email: 'rudranshdevelopment@gmail.com',
        password: masterAdminPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );

    // Business configurations with realistic data
    const businesses = [
      // FOOD & BEVERAGE BUSINESSES
      {
        user: {
          name: 'Rajesh Kumar',
          email: 'spicegarden@restaurant.com',
          password: 'SpiceGarden@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Spice Garden Restaurant',
          businessCategory: 'Restaurants',
          businessType: 'Restaurants',
          tagline: 'Authentic Indian Cuisine • Family Dining',
          email: 'info@spicegarden.com',
          phone: '+91 98765 43210',
          address: {
            street: '45 MG Road, Connaught Place',
            city: 'New Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days free trial
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 3420,
          qrScansThisMonth: 890
        },
        categories: [
          { name: 'Appetizers', emoji: '🥟', items: [
            { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 299, isVeg: true, isSpicy: true, isPopular: true },
            { name: 'Chicken Wings', description: 'Spicy buffalo wings', price: 349, isVeg: false, isSpicy: true },
            { name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: 199, isVeg: true }
          ]},
          { name: 'Main Course', emoji: '🍛', items: [
            { name: 'Butter Chicken', description: 'Creamy tomato-based curry', price: 449, isVeg: false, isPopular: true },
            { name: 'Dal Makhani', description: 'Creamy black lentils', price: 249, isVeg: true, isPopular: true },
            { name: 'Biryani', description: 'Fragrant basmati rice with spices', price: 399, isVeg: false }
          ]},
          { name: 'Desserts', emoji: '🍰', items: [
            { name: 'Gulab Jamun', description: 'Sweet dumplings in syrup', price: 149, isVeg: true },
            { name: 'Kulfi', description: 'Traditional Indian ice cream', price: 179, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Priya Sharma',
          email: 'cafebliss@cafe.com',
          password: 'CafeBliss@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Bliss Café',
          businessCategory: 'Cafés',
          businessType: 'Cafés',
          tagline: 'Fresh Coffee • Homemade Pastries • Cozy Ambiance',
          email: 'hello@blisscafe.com',
          phone: '+91 98765 43211',
          address: {
            street: '12 Park Street, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400050',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 2150,
          qrScansThisMonth: 560
        },
        categories: [
          { name: 'Coffee', emoji: '☕', items: [
            { name: 'Espresso', description: 'Strong Italian coffee', price: 120, isVeg: true, isPopular: true },
            { name: 'Cappuccino', description: 'Espresso with steamed milk', price: 150, isVeg: true, isPopular: true },
            { name: 'Latte', description: 'Smooth espresso with milk', price: 160, isVeg: true }
          ]},
          { name: 'Breakfast', emoji: '🥐', items: [
            { name: 'Croissant', description: 'Buttery French pastry', price: 80, isVeg: true },
            { name: 'Eggs Benedict', description: 'Poached eggs on toast', price: 220, isVeg: false },
            { name: 'Avocado Toast', description: 'Fresh avocado on sourdough', price: 180, isVeg: true, isPopular: true }
          ]},
          { name: 'Pastries', emoji: '🧁', items: [
            { name: 'Chocolate Cake', description: 'Rich chocolate layer cake', price: 200, isVeg: true, isPopular: true },
            { name: 'Blueberry Muffin', description: 'Fresh baked muffin', price: 90, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Amit Patel',
          email: 'grandhotel@hotel.com',
          password: 'GrandHotel@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Grand Hotel Restaurant',
          businessCategory: 'Hotels',
          businessType: 'Hotels',
          tagline: 'Luxury Dining • 24/7 Room Service • Fine Cuisine',
          email: 'dining@grandhotel.com',
          phone: '+91 98765 43212',
          address: {
            street: 'Hotel Grand, Marine Drive',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400020',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 4560,
          qrScansThisMonth: 1120
        },
        categories: [
          { name: 'Room Service', emoji: '🛎️', items: [
            { name: 'Club Sandwich', description: 'Triple decker with fries', price: 450, isVeg: false, isPopular: true },
            { name: 'Continental Breakfast', description: 'Full breakfast platter', price: 550, isVeg: false },
            { name: 'Pasta Primavera', description: 'Fresh vegetables pasta', price: 480, isVeg: true }
          ]},
          { name: 'Fine Dining', emoji: '🍽️', items: [
            { name: 'Grilled Salmon', description: 'Atlantic salmon with herbs', price: 850, isVeg: false, isPopular: true },
            { name: 'Vegetarian Thali', description: 'Complete Indian meal', price: 650, isVeg: true },
            { name: 'Wine Selection', description: 'Premium wine collection', price: 1200, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Sneha Reddy',
          email: 'cloudkitchen@food.com',
          password: 'CloudKitchen@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Cloud Kitchen Express',
          businessCategory: 'Cloud Kitchens',
          businessType: 'Cloud Kitchens',
          tagline: 'Fast Delivery • Fresh Food • Online Orders',
          email: 'orders@cloudkitchen.com',
          phone: '+91 98765 43213',
          address: {
            street: 'Unit 15, Industrial Area',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 1890,
          qrScansThisMonth: 450
        },
        categories: [
          { name: 'Quick Bites', emoji: '🍔', items: [
            { name: 'Veg Burger', description: 'Crispy patty with veggies', price: 149, isVeg: true, isPopular: true },
            { name: 'Chicken Burger', description: 'Grilled chicken burger', price: 199, isVeg: false, isPopular: true },
            { name: 'French Fries', description: 'Golden crispy fries', price: 99, isVeg: true }
          ]},
          { name: 'Combo Meals', emoji: '🍱', items: [
            { name: 'Veg Combo', description: 'Burger + Fries + Drink', price: 249, isVeg: true, isPopular: true },
            { name: 'Non-Veg Combo', description: 'Burger + Fries + Drink', price: 299, isVeg: false }
          ]}
        ]
      },
      {
        user: {
          name: 'Vikram Singh',
          email: 'foodcourt@mall.com',
          password: 'FoodCourt@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Mega Food Court',
          businessCategory: 'Food Courts / Fast Foods',
          businessType: 'Food Courts / Fast Foods',
          tagline: 'Multiple Cuisines • Quick Service • Affordable Prices',
          email: 'info@megafoodcourt.com',
          phone: '+91 98765 43214',
          address: {
            street: 'Level 3, Mega Mall',
            city: 'Gurgaon',
            state: 'Haryana',
            zipCode: '122001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 6780,
          qrScansThisMonth: 1890
        },
        categories: [
          { name: 'Fast Food', emoji: '🍟', items: [
            { name: 'Pizza Slice', description: 'Cheese pizza slice', price: 99, isVeg: true, isPopular: true },
            { name: 'Chicken Nuggets', description: '6 piece nuggets', price: 149, isVeg: false },
            { name: 'Onion Rings', description: 'Crispy fried rings', price: 89, isVeg: true }
          ]},
          { name: 'Asian', emoji: '🍜', items: [
            { name: 'Veg Noodles', description: 'Stir fried noodles', price: 179, isVeg: true },
            { name: 'Chicken Fried Rice', description: 'Spiced fried rice', price: 199, isVeg: false, isPopular: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Meera Joshi',
          email: 'sweetbakes@bakery.com',
          password: 'SweetBakes@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Sweet Bakes Bakery',
          businessCategory: 'Bakeries',
          businessType: 'Bakeries',
          tagline: 'Fresh Daily • Custom Orders • Artisan Breads',
          email: 'orders@sweetbakes.com',
          phone: '+91 98765 43215',
          address: {
            street: '28 Baker Street, Koregaon Park',
            city: 'Pune',
            state: 'Maharashtra',
            zipCode: '411001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 2340,
          qrScansThisMonth: 620
        },
        categories: [
          { name: 'Breads', emoji: '🍞', items: [
            { name: 'Sourdough Loaf', description: 'Artisan sourdough bread', price: 120, isVeg: true, isPopular: true },
            { name: 'Multigrain Bread', description: 'Healthy grain bread', price: 100, isVeg: true },
            { name: 'Garlic Bread', description: 'Buttery garlic bread', price: 80, isVeg: true }
          ]},
          { name: 'Cakes', emoji: '🎂', items: [
            { name: 'Chocolate Truffle', description: 'Rich chocolate cake', price: 450, isVeg: true, isPopular: true },
            { name: 'Red Velvet', description: 'Classic red velvet', price: 500, isVeg: true },
            { name: 'Vanilla Sponge', description: 'Light vanilla cake', price: 400, isVeg: true }
          ]},
          { name: 'Pastries', emoji: '🥐', items: [
            { name: 'Croissant', description: 'Buttery French pastry', price: 60, isVeg: true, isPopular: true },
            { name: 'Danish Pastry', description: 'Sweet filled pastry', price: 70, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Rohit Malhotra',
          email: 'pubcorner@bar.com',
          password: 'PubCorner@2024',
          role: 'user'
        },
        restaurant: {
          name: 'The Pub Corner',
          businessCategory: 'Bars & Pubs',
          businessType: 'Bars & Pubs',
          tagline: 'Craft Beers • Live Music • Happy Hours',
          email: 'info@pubcorner.com',
          phone: '+91 98765 43216',
          address: {
            street: '45 Party Street, MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 3450,
          qrScansThisMonth: 890
        },
        categories: [
          { name: 'Beers', emoji: '🍺', items: [
            { name: 'Craft IPA', description: 'Indian Pale Ale', price: 250, isVeg: true, isPopular: true },
            { name: 'Lager', description: 'Crisp golden lager', price: 200, isVeg: true },
            { name: 'Wheat Beer', description: 'Smooth wheat beer', price: 220, isVeg: true }
          ]},
          { name: 'Cocktails', emoji: '🍹', items: [
            { name: 'Mojito', description: 'Fresh mint mojito', price: 350, isVeg: true, isPopular: true },
            { name: 'Old Fashioned', description: 'Classic whiskey cocktail', price: 450, isVeg: true },
            { name: 'Margarita', description: 'Tequila margarita', price: 380, isVeg: true }
          ]},
          { name: 'Bar Snacks', emoji: '🥜', items: [
            { name: 'Chicken Wings', description: 'Spicy buffalo wings', price: 299, isVeg: false, isPopular: true },
            { name: 'Nachos', description: 'Loaded nachos', price: 249, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Lakshmi Nair',
          email: 'streetfood@vendor.com',
          password: 'StreetFood@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Lakshmi Street Food',
          businessCategory: 'Street Food Vendors',
          businessType: 'Street Food Vendors',
          tagline: 'Authentic Street Food • Quick Service • Fresh Daily',
          email: 'orders@streetfood.com',
          phone: '+91 98765 43217',
          address: {
            street: 'Corner of Main Street & Market Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipCode: '600001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 1230,
          qrScansThisMonth: 340
        },
        categories: [
          { name: 'Snacks', emoji: '🍢', items: [
            { name: 'Vada Pav', description: 'Spicy potato fritter in bun', price: 25, isVeg: true, isPopular: true },
            { name: 'Pav Bhaji', description: 'Spiced vegetable curry with bread', price: 80, isVeg: true, isPopular: true },
            { name: 'Dosa', description: 'Crispy rice crepe', price: 60, isVeg: true }
          ]},
          { name: 'Beverages', emoji: '🥤', items: [
            { name: 'Masala Chai', description: 'Spiced Indian tea', price: 20, isVeg: true, isPopular: true },
            { name: 'Fresh Lime Soda', description: 'Refreshing lime drink', price: 30, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Arjun Mehta',
          email: 'coffeebean@shop.com',
          password: 'CoffeeBean@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Coffee Bean Roasters',
          businessCategory: 'Coffee Shops',
          businessType: 'Coffee Shops',
          tagline: 'Premium Coffee • Artisan Roasts • Cozy Ambiance',
          email: 'hello@coffeebean.com',
          phone: '+91 98765 43218',
          address: {
            street: '12 Coffee Lane, Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            zipCode: '500033',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 2890,
          qrScansThisMonth: 720
        },
        categories: [
          { name: 'Coffee', emoji: '☕', items: [
            { name: 'Espresso', description: 'Single origin espresso', price: 100, isVeg: true, isPopular: true },
            { name: 'Cappuccino', description: 'Perfect foam cappuccino', price: 130, isVeg: true, isPopular: true },
            { name: 'Cold Brew', description: 'Smooth cold brew coffee', price: 150, isVeg: true }
          ]},
          { name: 'Snacks', emoji: '🥐', items: [
            { name: 'Chocolate Croissant', description: 'Buttery croissant with chocolate', price: 90, isVeg: true, isPopular: true },
            { name: 'Almond Biscotti', description: 'Crunchy Italian biscotti', price: 70, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Kavita Desai',
          email: 'icecream@parlor.com',
          password: 'IceCream@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Frosty Ice Cream Parlor',
          businessCategory: 'Ice Cream Shops',
          businessType: 'Ice Cream Shops',
          tagline: 'Handmade Ice Cream • 50+ Flavors • Custom Combinations',
          email: 'scoops@frosty.com',
          phone: '+91 98765 43219',
          address: {
            street: '78 Sweet Street, MG Road',
            city: 'Ahmedabad',
            state: 'Gujarat',
            zipCode: '380001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 1670,
          qrScansThisMonth: 420
        },
        categories: [
          { name: 'Ice Cream', emoji: '🍦', items: [
            { name: 'Vanilla', description: 'Classic vanilla ice cream', price: 80, isVeg: true, isPopular: true },
            { name: 'Chocolate Fudge', description: 'Rich chocolate ice cream', price: 90, isVeg: true, isPopular: true },
            { name: 'Strawberry', description: 'Fresh strawberry ice cream', price: 85, isVeg: true }
          ]},
          { name: 'Sundaes', emoji: '🍨', items: [
            { name: 'Hot Fudge Sundae', description: 'Ice cream with hot fudge', price: 150, isVeg: true, isPopular: true },
            { name: 'Banana Split', description: 'Three scoops with banana', price: 180, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Neha Gupta',
          email: 'juicebar@fresh.com',
          password: 'JuiceBar@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Fresh Juice Bar',
          businessCategory: 'Juice Bars',
          businessType: 'Juice Bars',
          tagline: '100% Fresh • No Added Sugar • Nutritional Info',
          email: 'fresh@juicebar.com',
          phone: '+91 98765 43220',
          address: {
            street: '34 Health Street, Sector 18',
            city: 'Noida',
            state: 'Uttar Pradesh',
            zipCode: '201301',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 980,
          qrScansThisMonth: 250
        },
        categories: [
          { name: 'Fresh Juices', emoji: '🥤', items: [
            { name: 'Orange Juice', description: 'Fresh squeezed orange', price: 80, isVeg: true, isPopular: true },
            { name: 'Watermelon Juice', description: 'Cooling watermelon', price: 70, isVeg: true },
            { name: 'Mixed Fruit', description: 'Blend of seasonal fruits', price: 90, isVeg: true, isPopular: true }
          ]},
          { name: 'Smoothies', emoji: '🥤', items: [
            { name: 'Green Detox', description: 'Spinach, kale, apple', price: 120, isVeg: true, isPopular: true },
            { name: 'Berry Blast', description: 'Mixed berries smoothie', price: 110, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Ravi Iyer',
          email: 'teahouse@tea.com',
          password: 'TeaHouse@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Serenity Tea House',
          businessCategory: 'Tea Houses',
          businessType: 'Tea Houses',
          tagline: 'Premium Teas • Brewing Guides • Peaceful Ambiance',
          email: 'info@serenitytea.com',
          phone: '+91 98765 43221',
          address: {
            street: '56 Tea Garden Road',
            city: 'Darjeeling',
            state: 'West Bengal',
            zipCode: '734101',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 1450,
          qrScansThisMonth: 380
        },
        categories: [
          { name: 'Tea Varieties', emoji: '🍵', items: [
            { name: 'Darjeeling Tea', description: 'Premium first flush', price: 150, isVeg: true, isPopular: true },
            { name: 'Assam Tea', description: 'Strong malty flavor', price: 120, isVeg: true },
            { name: 'Green Tea', description: 'Antioxidant rich', price: 100, isVeg: true }
          ]},
          { name: 'Tea Blends', emoji: '🌿', items: [
            { name: 'Masala Chai', description: 'Spiced Indian tea', price: 80, isVeg: true, isPopular: true },
            { name: 'Herbal Tea', description: 'Chamomile & mint blend', price: 90, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Sunita Rao',
          email: 'catering@events.com',
          password: 'Catering@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Elite Catering Services',
          businessCategory: 'Catering Services',
          businessType: 'Catering Services',
          tagline: 'Event Catering • Corporate Events • Custom Menus',
          email: 'events@elitecatering.com',
          phone: '+91 98765 43222',
          address: {
            street: '89 Event Street, Andheri',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400053',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 890,
          qrScansThisMonth: 220
        },
        categories: [
          { name: 'Event Packages', emoji: '🎉', items: [
            { name: 'Wedding Package', description: 'Complete wedding menu', price: 50000, isVeg: false, isPopular: true },
            { name: 'Corporate Lunch', description: 'Business lunch buffet', price: 15000, isVeg: false },
            { name: 'Birthday Party', description: 'Kids party package', price: 8000, isVeg: false }
          ]},
          { name: 'Menu Options', emoji: '🍽️', items: [
            { name: 'Vegetarian Thali', description: 'Complete veg meal', price: 350, isVeg: true, isPopular: true },
            { name: 'Non-Veg Thali', description: 'Complete non-veg meal', price: 450, isVeg: false }
          ]}
        ]
      },
      // RETAIL / E-COMMERCE BUSINESSES
      {
        user: {
          name: 'Anjali Kapoor',
          email: 'fashion@store.com',
          password: 'FashionStore@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Trendy Fashion Store',
          businessCategory: 'Clothing Stores',
          businessType: 'Clothing Stores',
          tagline: 'Latest Trends • Size Options • Fast Delivery',
          email: 'shop@trendyfashion.com',
          phone: '+91 98765 43223',
          address: {
            street: '123 Fashion Avenue, DLF Mall',
            city: 'Gurgaon',
            state: 'Haryana',
            zipCode: '122002',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 2340,
          qrScansThisMonth: 580
        },
        categories: [
          { name: 'Women\'s Wear', emoji: '👗', items: [
            { name: 'Designer Saree', description: 'Silk designer saree', price: 3500, isVeg: true, isPopular: true },
            { name: 'Casual Dress', description: 'Cotton summer dress', price: 1200, isVeg: true },
            { name: 'Formal Suit', description: 'Business formal suit', price: 2500, isVeg: true }
          ]},
          { name: 'Men\'s Wear', emoji: '👔', items: [
            { name: 'Formal Shirt', description: 'Cotton formal shirt', price: 899, isVeg: true, isPopular: true },
            { name: 'Denim Jeans', description: 'Classic fit jeans', price: 1499, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Rohit Agarwal',
          email: 'furniture@store.com',
          password: 'FurnitureStore@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Comfort Furniture Store',
          businessCategory: 'Furniture Stores',
          businessType: 'Furniture Stores',
          tagline: 'Premium Furniture • Customization • Home Delivery',
          email: 'sales@comfortfurniture.com',
          phone: '+91 98765 43224',
          address: {
            street: '45 Furniture Lane, Industrial Area',
            city: 'Noida',
            state: 'Uttar Pradesh',
            zipCode: '201301',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 1120,
          qrScansThisMonth: 280
        },
        categories: [
          { name: 'Living Room', emoji: '🛋️', items: [
            { name: 'Sofa Set', description: '3+2 sofa set', price: 35000, isVeg: true, isPopular: true },
            { name: 'Coffee Table', description: 'Wooden coffee table', price: 8000, isVeg: true },
            { name: 'TV Unit', description: 'Modern TV cabinet', price: 12000, isVeg: true }
          ]},
          { name: 'Bedroom', emoji: '🛏️', items: [
            { name: 'King Size Bed', description: 'Wooden king bed', price: 25000, isVeg: true, isPopular: true },
            { name: 'Wardrobe', description: '4 door wardrobe', price: 18000, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Kiran Mehta',
          email: 'electronics@shop.com',
          password: 'Electronics@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Tech World Electronics',
          businessCategory: 'Electronic Shop',
          businessType: 'Electronic Shop',
          tagline: 'Latest Gadgets • Specifications • Best Prices',
          email: 'sales@techworld.com',
          phone: '+91 98765 43225',
          address: {
            street: '78 Tech Park, Nehru Place',
            city: 'New Delhi',
            state: 'Delhi',
            zipCode: '110019',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 4560,
          qrScansThisMonth: 1120
        },
        categories: [
          { name: 'Smartphones', emoji: '📱', items: [
            { name: 'Premium Smartphone', description: 'Latest flagship phone', price: 45000, isVeg: true, isPopular: true },
            { name: 'Budget Phone', description: 'Affordable smartphone', price: 12000, isVeg: true },
            { name: 'Gaming Phone', description: 'High performance phone', price: 35000, isVeg: true }
          ]},
          { name: 'Laptops', emoji: '💻', items: [
            { name: 'Business Laptop', description: 'Professional laptop', price: 55000, isVeg: true, isPopular: true },
            { name: 'Gaming Laptop', description: 'High-end gaming laptop', price: 85000, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Priya Nair',
          email: 'toys@shop.com',
          password: 'ToyShop@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Happy Toys Shop',
          businessCategory: 'Toy Shops',
          businessType: 'Toy Shops',
          tagline: 'Age-Appropriate Toys • Safe & Fun • Educational',
          email: 'toys@happyshop.com',
          phone: '+91 98765 43226',
          address: {
            street: '34 Kids Street, Mall Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 1890,
          qrScansThisMonth: 470
        },
        categories: [
          { name: 'Ages 0-3', emoji: '🧸', items: [
            { name: 'Soft Toys', description: 'Plush teddy bear', price: 599, isVeg: true, isPopular: true },
            { name: 'Rattle Set', description: 'Baby rattle toys', price: 299, isVeg: true }
          ]},
          { name: 'Ages 4-8', emoji: '🚗', items: [
            { name: 'Remote Car', description: 'RC car with controller', price: 1299, isVeg: true, isPopular: true },
            { name: 'Building Blocks', description: 'Educational blocks', price: 899, isVeg: true }
          ]},
          { name: 'Ages 9+', emoji: '🎮', items: [
            { name: 'Board Game', description: 'Strategy board game', price: 1499, isVeg: true },
            { name: 'Puzzle Set', description: '1000 piece puzzle', price: 799, isVeg: true }
          ]}
        ]
      },
      // CREATIVE & DESIGN
      {
        user: {
          name: 'Amit Shah',
          email: 'printshop@print.com',
          password: 'PrintShop@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Quick Print Services',
          businessCategory: 'Printed products',
          businessType: 'Printed products',
          tagline: 'Print Services • Samples • Fast Turnaround',
          email: 'print@quickservices.com',
          phone: '+91 98765 43227',
          address: {
            street: '12 Print Street, Commercial Area',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 780,
          qrScansThisMonth: 190
        },
        categories: [
          { name: 'Print Services', emoji: '🖨️', items: [
            { name: 'Business Cards', description: 'Premium card printing', price: 500, isVeg: true, isPopular: true },
            { name: 'Flyers', description: 'A4 flyer printing', price: 300, isVeg: true },
            { name: 'Banners', description: 'Large format printing', price: 1500, isVeg: true }
          ]},
          { name: 'Design Services', emoji: '🎨', items: [
            { name: 'Logo Design', description: 'Custom logo creation', price: 2500, isVeg: true, isPopular: true },
            { name: 'Brochure Design', description: 'Professional brochure', price: 2000, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Sneha Patel',
          email: 'logodesigner@design.com',
          password: 'LogoDesign@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Creative Logo Designs',
          businessCategory: 'Logo Designers',
          businessType: 'Logo Designers',
          tagline: 'Portfolio Showcase • Custom Logos • Brand Identity',
          email: 'hello@creativelogos.com',
          phone: '+91 98765 43228',
          address: {
            street: '56 Design Studio, Art District',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400052',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 1230,
          qrScansThisMonth: 310
        },
        categories: [
          { name: 'Logo Portfolio', emoji: '🎨', items: [
            { name: 'Tech Company Logo', description: 'Modern tech logo design', price: 5000, isVeg: true, isPopular: true },
            { name: 'Restaurant Logo', description: 'Food industry branding', price: 4500, isVeg: true },
            { name: 'Fashion Brand Logo', description: 'Elegant fashion logo', price: 5500, isVeg: true }
          ]},
          { name: 'Services', emoji: '💼', items: [
            { name: 'Logo Package', description: 'Logo + variations', price: 8000, isVeg: true, isPopular: true },
            { name: 'Brand Identity', description: 'Complete brand package', price: 15000, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Rahul Desai',
          email: 'graphicdesigner@design.com',
          password: 'GraphicDesign@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Pixel Perfect Graphics',
          businessCategory: 'Graphic Designers',
          businessType: 'Graphic Designers',
          tagline: 'Creative Work • Design Portfolio • Visual Solutions',
          email: 'design@pixelperfect.com',
          phone: '+91 98765 43229',
          address: {
            street: '89 Creative Hub, Design Street',
            city: 'Pune',
            state: 'Maharashtra',
            zipCode: '411001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 1670,
          qrScansThisMonth: 420
        },
        categories: [
          { name: 'Portfolio', emoji: '🖼️', items: [
            { name: 'Brand Identity Project', description: 'Complete brand design', price: 12000, isVeg: true, isPopular: true },
            { name: 'Web Design', description: 'Website UI/UX design', price: 15000, isVeg: true },
            { name: 'Packaging Design', description: 'Product packaging', price: 8000, isVeg: true }
          ]},
          { name: 'Services', emoji: '🎯', items: [
            { name: 'Social Media Graphics', description: 'Instagram/Facebook posts', price: 2000, isVeg: true, isPopular: true },
            { name: 'Print Design', description: 'Brochures, flyers', price: 3000, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Meera Joshi',
          email: 'freelancer@work.com',
          password: 'Freelancer@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Meera Creative Services',
          businessCategory: 'Freelancers',
          businessType: 'Freelancers',
          tagline: 'Services Portfolio • Previous Projects • Custom Work',
          email: 'work@meeracreative.com',
          phone: '+91 98765 43230',
          address: {
            street: 'Remote Work',
            city: 'Remote',
            state: 'India',
            zipCode: '000000',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 890,
          qrScansThisMonth: 220
        },
        categories: [
          { name: 'Services', emoji: '💼', items: [
            { name: 'Web Development', description: 'Custom website development', price: 25000, isVeg: true, isPopular: true },
            { name: 'Content Writing', description: 'SEO content writing', price: 5000, isVeg: true },
            { name: 'Video Editing', description: 'Professional video editing', price: 8000, isVeg: true }
          ]},
          { name: 'Previous Projects', emoji: '📁', items: [
            { name: 'E-commerce Website', description: 'Complete online store', price: 35000, isVeg: true, isPopular: true },
            { name: 'Mobile App Design', description: 'iOS/Android app UI', price: 20000, isVeg: true }
          ]}
        ]
      },
      {
        user: {
          name: 'Vikram Singh',
          email: 'marketing@agency.com',
          password: 'MarketingAgency@2024',
          role: 'user'
        },
        restaurant: {
          name: 'Digital Marketing Pro',
          businessCategory: 'Digital Marketing Agencies',
          businessType: 'Digital Marketing Agencies',
          tagline: 'Campaigns • Case Studies • Growth Strategies',
          email: 'hello@digitalmarketingpro.com',
          phone: '+91 98765 43231',
          address: {
            street: '45 Marketing Tower, Business District',
            city: 'Gurgaon',
            state: 'Haryana',
            zipCode: '122001',
            country: 'India'
          },
          subscription: {
            plan: 'Free',
            planPrice: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            daysRemaining: 7
          },
          menuItemsLimit: 50,
          qrScans: 1450,
          qrScansThisMonth: 360
        },
        categories: [
          { name: 'Campaigns', emoji: '📊', items: [
            { name: 'Social Media Campaign', description: 'Multi-platform campaign', price: 50000, isVeg: true, isPopular: true },
            { name: 'SEO Campaign', description: 'Search engine optimization', price: 30000, isVeg: true },
            { name: 'PPC Campaign', description: 'Pay-per-click advertising', price: 40000, isVeg: true }
          ]},
          { name: 'Case Studies', emoji: '📈', items: [
            { name: 'E-commerce Growth', description: '200% revenue increase', price: 0, isVeg: true, isPopular: true },
            { name: 'Brand Awareness', description: '3x brand visibility', price: 0, isVeg: true }
          ]}
        ]
      }
    ];

    // Create all businesses
    for (const business of businesses) {
      try {
        // Hash password
        const hashedPassword = await hashPassword(business.user.password);
        
        // Create or update user
        const user = await User.findOneAndUpdate(
          { email: business.user.email },
          {
            name: business.user.name,
            email: business.user.email,
            password: hashedPassword,
            role: business.user.role
          },
          { upsert: true, new: true }
        );

        // Create or update restaurant
        const restaurant = await Restaurant.findOneAndUpdate(
          { email: business.restaurant.email },
          {
            ...business.restaurant,
            owner: user._id
          },
          { upsert: true, new: true }
        );

        // Update user with restaurant reference
        user.restaurant = restaurant._id;
        await user.save();

        // Delete existing categories and items for this restaurant
        await Category.deleteMany({ restaurant: restaurant._id });
        await MenuItem.deleteMany({ restaurant: restaurant._id });

        // Create categories and items
        for (let i = 0; i < business.categories.length; i++) {
          const catData = business.categories[i];
          const category = await Category.create({
            name: catData.name,
            emoji: catData.emoji,
            restaurant: restaurant._id,
            order: i + 1,
            isActive: true
          });

          // Create menu items for this category
          for (let j = 0; j < catData.items.length; j++) {
            const itemData = catData.items[j];
            await MenuItem.create({
              name: itemData.name,
              description: itemData.description,
              price: itemData.price,
              category: category._id,
              restaurant: restaurant._id,
              isVeg: itemData.isVeg ?? true,
              isSpicy: itemData.isSpicy ?? false,
              isPopular: itemData.isPopular ?? false,
              isAvailable: true,
              order: j + 1
            });
          }
        }


      } catch (error) {

      }
    }








    process.exit(0);
  } catch (error) {

    process.exit(1);
  }
};

seedAllBusinesses();
