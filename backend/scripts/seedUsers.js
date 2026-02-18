import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import BusinessCategory from '../models/BusinessCategory.js';

// Load environment variables
dotenv.config();

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

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if users already exist
    const existingUsersCount = await User.countDocuments({ 
      email: { $in: sampleUsers.map(u => u.email) } 
    });
    
    if (existingUsersCount > 0) {


      process.exit(0);
    }


    // Get business categories to validate business types
    const businessCategories = await BusinessCategory.find({ isActive: true });
    const categoryMap = {};
    businessCategories.forEach(cat => {
      categoryMap[cat.name] = cat.businessTypes.filter(type => type.isActive).map(type => type.name);
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of sampleUsers) {
      try {
        // Validate business type exists in category
        if (!categoryMap[userData.businessCategory]?.includes(userData.businessType)) {

          skippedCount++;
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
          registered_by_admin: null, // Will be set to actual admin ID in production
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
            daysRemaining: 7 // 7-day trial
          },
          menuItemsLimit: 10,
          qrScansLimit: 1000,
          isVerified: true,
          verificationStatus: 'verified'
        });

        // Update user with restaurant reference
        await User.findByIdAndUpdate(user._id, { restaurant: restaurant._id });


        createdCount++;

      } catch (error) {

        skippedCount++;
      }
    }




    if (createdCount > 0) {



      sampleUsers.slice(0, 5).forEach(user => {

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
seedUsers();