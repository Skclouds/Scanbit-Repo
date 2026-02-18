import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import BusinessCategory from '../models/BusinessCategory.js';

// Load environment variables
dotenv.config();

// Business categories with their types
const businessCategoriesData = [
  {
    name: "Food Mall",
    description: "Perfect for restaurants, cafés, and food businesses with comprehensive menu management and QR code solutions.",
    icon: "MdRestaurantMenu",
    iconColor: "text-primary",
    layout: "Menu layout",
    isActive: true,
    order: 1,
    businessTypes: [
      { name: "Restaurants", description: "Full-service restaurants with complete menu management", icon: "MdRestaurant", isActive: true, order: 1 },
      { name: "Cafés", description: "Cozy cafés offering breakfast, lunch, and specialty beverages", icon: "MdLocalCafe", isActive: true, order: 2 },
      { name: "Hotels", description: "Hotel restaurants, room service menus, and in-room dining", icon: "MdHotel", isActive: true, order: 3 },
      { name: "Cloud Kitchens", description: "Digital kitchens with online menu management", icon: "MdStorefront", isActive: true, order: 4 },
      { name: "Food Courts / Fast Foods", description: "Quick-service restaurants with fast menu updates", icon: "MdFastfood", isActive: true, order: 5 },
      { name: "Bakeries", description: "Fresh bakeries with daily specials and custom orders", icon: "MdCake", isActive: true, order: 6 },
      { name: "Bars & Pubs", description: "Bars and pubs with drink menus and happy hour specials", icon: "MdLocalBar", isActive: true, order: 7 },
      { name: "Street Food Vendors", description: "Mobile vendors with location-based menus", icon: "MdStorefront", isActive: true, order: 8 },
      { name: "Coffee Shops", description: "Coffee shops with extensive beverage and snack menus", icon: "MdLocalCafe", isActive: true, order: 9 },
      { name: "Ice Cream Shops", description: "Ice cream parlors with flavor listings and custom combinations", icon: "MdIcecream", isActive: true, order: 10 },
      { name: "Juice Bars", description: "Juice bars with ingredient lists and nutritional info", icon: "MdLocalDrink", isActive: true, order: 11 },
      { name: "Tea Houses", description: "Tea houses with tea varieties and brewing guides", icon: "MdStore", isActive: true, order: 12 },
      { name: "Catering Services", description: "Catering companies with event menus and package deals", icon: "MdEvent", isActive: true, order: 13 }
    ]
  },
  {
    name: "Retail / E-Commerce Businesses",
    description: "Ideal for retail stores and e-commerce businesses showcasing products with professional catalogs.",
    icon: "MdShoppingBag",
    iconColor: "text-accent",
    layout: "Product catalog layout",
    isActive: true,
    order: 2,
    businessTypes: [
      { name: "Clothing Stores", description: "Fashion stores with product catalogs and size options", icon: "MdInventory", isActive: true, order: 1 },
      { name: "Furniture Stores", description: "Furniture stores with catalog management and customization", icon: "MdChair", isActive: true, order: 2 },
      { name: "Electronic Shop", description: "Electronics stores with product specifications and pricing", icon: "MdDevices", isActive: true, order: 3 },
      { name: "Toy Shops", description: "Toy stores with age-appropriate categorizations and pricing", icon: "MdToys", isActive: true, order: 4 }
    ]
  },
  {
    name: "Creative & Design",
    description: "Perfect for creative professionals and agencies showcasing their work with stunning portfolios.",
    icon: "MdBrush",
    iconColor: "text-primary",
    layout: "Portfolio layout",
    isActive: true,
    order: 3,
    businessTypes: [
      { name: "Printed products", description: "Print shops showcasing print services and samples", icon: "MdPrint", isActive: true, order: 1 },
      { name: "Logo Designers", description: "Logo designers showcasing their design portfolios", icon: "MdDesignServices", isActive: true, order: 2 },
      { name: "Graphic Designers", description: "Graphic designers displaying their creative work", icon: "MdPalette", isActive: true, order: 3 },
      { name: "Freelancers", description: "Freelancers showcasing services and previous projects", icon: "MdWork", isActive: true, order: 4 },
      { name: "Digital Marketing Agencies", description: "Marketing agencies displaying campaigns and case studies", icon: "MdCampaign", isActive: true, order: 5 }
    ]
  }
];

// Sample users data for each business category
const sampleUsers = [
  // Food Mall Users
  {
    name: "Marco Rossi",
    email: "marco@pizzapalace.com",
    password: "Demo@123456",
    businessName: "Pizza Palace",
    businessCategory: "Food Mall",
    businessType: "Restaurants",
    phone: "+91 98765 43210",
    address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India"
    }
  },
  {
    name: "Sarah Johnson",
    email: "sarah@brewedcoffee.com",
    password: "Demo@123456",
    businessName: "Brewed Coffee House",
    businessCategory: "Food Mall",
    businessType: "Coffee Shops",
    phone: "+91 98765 43211",
    address: {
      street: "456 Coffee Lane",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      country: "India"
    }
  },
  {
    name: "Raj Patel",
    email: "raj@spicehotel.com",
    password: "Demo@123456",
    businessName: "Spice Garden Hotel",
    businessCategory: "Food Mall",
    businessType: "Hotels",
    phone: "+91 98765 43212",
    address: {
      street: "789 Hotel Avenue",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    }
  },
  {
    name: "Lisa Chen",
    email: "lisa@sweetbakery.com",
    password: "Demo@123456",
    businessName: "Sweet Dreams Bakery",
    businessCategory: "Food Mall",
    businessType: "Bakeries",
    phone: "+91 98765 43213",
    address: {
      street: "321 Bakery Street",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001",
      country: "India"
    }
  },
  {
    name: "Ahmed Khan",
    email: "ahmed@cloudkitchen.com",
    password: "Demo@123456",
    businessName: "Khan's Cloud Kitchen",
    businessCategory: "Food Mall",
    businessType: "Cloud Kitchens",
    phone: "+91 98765 43214",
    address: {
      street: "654 Kitchen Hub",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500001",
      country: "India"
    }
  },

  // Retail / E-Commerce Users
  {
    name: "Emma Wilson",
    email: "emma@fashionstore.com",
    password: "Demo@123456",
    businessName: "Emma's Fashion Store",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Clothing Stores",
    phone: "+91 98765 43215",
    address: {
      street: "987 Fashion Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400002",
      country: "India"
    }
  },
  {
    name: "David Brown",
    email: "david@furnitureworld.com",
    password: "Demo@123456",
    businessName: "Furniture World",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Furniture Stores",
    phone: "+91 98765 43216",
    address: {
      street: "147 Furniture Plaza",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600001",
      country: "India"
    }
  },
  {
    name: "Priya Sharma",
    email: "priya@techelectronics.com",
    password: "Demo@123456",
    businessName: "Tech Electronics Hub",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Electronic Shop",
    phone: "+91 98765 43217",
    address: {
      street: "258 Electronics Market",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700001",
      country: "India"
    }
  },
  {
    name: "Michael Davis",
    email: "michael@toystore.com",
    password: "Demo@123456",
    businessName: "Wonder Toys Store",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Toy Shops",
    phone: "+91 98765 43218",
    address: {
      street: "369 Toy Street",
      city: "Ahmedabad",
      state: "Gujarat",
      zipCode: "380001",
      country: "India"
    }
  },

  // Creative & Design Users
  {
    name: "Alex Rodriguez",
    email: "alex@creativestudio.com",
    password: "Demo@123456",
    businessName: "Creative Design Studio",
    businessCategory: "Creative & Design",
    businessType: "Graphic Designers",
    phone: "+91 98765 43219",
    address: {
      street: "741 Design Avenue",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122001",
      country: "India"
    }
  },
  {
    name: "Sophie Martin",
    email: "sophie@logodesigns.com",
    password: "Demo@123456",
    businessName: "Sophie's Logo Designs",
    businessCategory: "Creative & Design",
    businessType: "Logo Designers",
    phone: "+91 98765 43220",
    address: {
      street: "852 Creative Lane",
      city: "Jaipur",
      state: "Rajasthan",
      zipCode: "302001",
      country: "India"
    }
  },
  {
    name: "James Taylor",
    email: "james@printworks.com",
    password: "Demo@123456",
    businessName: "Taylor Print Works",
    businessCategory: "Creative & Design",
    businessType: "Printed products",
    phone: "+91 98765 43221",
    address: {
      street: "963 Print Street",
      city: "Lucknow",
      state: "Uttar Pradesh",
      zipCode: "226001",
      country: "India"
    }
  },
  {
    name: "Maria Garcia",
    email: "maria@freelancedesign.com",
    password: "Demo@123456",
    businessName: "Maria's Freelance Design",
    businessCategory: "Creative & Design",
    businessType: "Freelancers",
    phone: "+91 98765 43222",
    address: {
      street: "159 Freelance Hub",
      city: "Kochi",
      state: "Kerala",
      zipCode: "682001",
      country: "India"
    }
  },
  {
    name: "Robert Kim",
    email: "robert@digitalagency.com",
    password: "Demo@123456",
    businessName: "Digital Marketing Pro",
    businessCategory: "Creative & Design",
    businessType: "Digital Marketing Agencies",
    phone: "+91 98765 43223",
    address: {
      street: "357 Marketing Street",
      city: "Indore",
      state: "Madhya Pradesh",
      zipCode: "452001",
      country: "India"
    }
  }
];

const seedBusinessCategoriesAndUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);


    // Step 1: Seed Business Categories

    let categoriesCreated = 0;
    let categoriesSkipped = 0;

    for (const categoryData of businessCategoriesData) {
      try {
        const existingCategory = await BusinessCategory.findOne({ name: categoryData.name });
        
        if (existingCategory) {

          categoriesSkipped++;
          continue;
        }

        await BusinessCategory.create(categoryData);

        categoriesCreated++;

      } catch (error) {

        categoriesSkipped++;
      }
    }


    // Step 2: Seed Users

    // Check if users already exist
    const existingUsersCount = await User.countDocuments({ 
      email: { $in: sampleUsers.map(u => u.email) } 
    });
    
    if (existingUsersCount > 0) {

    } else {
      // Get business categories to validate business types
      const businessCategories = await BusinessCategory.find({ isActive: true });
      const categoryMap = {};
      businessCategories.forEach(cat => {
        categoryMap[cat.name] = cat.businessTypes.filter(type => type.isActive).map(type => type.name);
      });

      let usersCreated = 0;
      let usersSkipped = 0;

      for (const userData of sampleUsers) {
        try {
          // Validate business type exists in category
          if (!categoryMap[userData.businessCategory]?.includes(userData.businessType)) {

            usersSkipped++;
            continue;
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 12);

          // Create user
          const user = await User.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: 'user',
            businessCategory: userData.businessCategory,
            businessType: userData.businessType,
            phone: userData.phone,
            address: userData.address.street,
            registration_through: 'By admin',
            registered_by_admin: null,
            isActive: true
          });

          // Create restaurant
          const restaurant = await Restaurant.create({
            name: userData.businessName,
            businessCategory: userData.businessCategory,
            businessType: userData.businessType,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            owner: user._id,
            subscription: {
              plan: 'Free',
              planPrice: 0,
              billingCycle: 'monthly',
              status: 'active',
              startDate: new Date(),
              daysRemaining: 7
            },
            menuItemsLimit: 10,
            qrScansLimit: 1000,
            isVerified: true,
            verificationStatus: 'verified'
          });

          // Update user with restaurant reference
          await User.findByIdAndUpdate(user._id, { restaurant: restaurant._id });


          usersCreated++;

        } catch (error) {

          usersSkipped++;
        }
      }


    }

    // Final Summary



    if (categoriesCreated > 0 || existingUsersCount === 0) {








      const categorizedUsers = {};
      sampleUsers.forEach(user => {
        if (!categorizedUsers[user.businessCategory]) {
          categorizedUsers[user.businessCategory] = [];
        }
        categorizedUsers[user.businessCategory].push(user);
      });

      Object.entries(categorizedUsers).forEach(([category, users]) => {

        users.forEach(user => {

        });
      });
    }

  } catch (error) {

    process.exit(1);
  } finally {
    await mongoose.disconnect();

    process.exit(0);
  }
};

// Run the seeding
seedBusinessCategoriesAndUsers();