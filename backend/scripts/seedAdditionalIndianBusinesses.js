import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import BusinessCategory from '../models/BusinessCategory.js';

// Load environment variables
dotenv.config();

// Additional realistic Indian businesses for missing business types
const additionalIndianBusinesses = [
  // Food Mall - Cafes (corrected spelling)
  {
    name: "Priya Sharma",
    email: "priya@mumbaiexpresscafe.com",
    password: "Demo@123456",
    businessName: "Mumbai Express Café",
    businessCategory: "Food Mall",
    businessType: "Cafes",
    phone: "+91 98765 43213",
    address: {
      street: "Linking Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    },
    description: "Modern café serving Mumbai street food with a twist and specialty coffee"
  },
  {
    name: "Vikram Singh",
    email: "vikram@hillstationcafe.com",
    password: "Demo@123456",
    businessName: "Hill Station Café",
    businessCategory: "Food Mall",
    businessType: "Cafes",
    phone: "+91 98765 43214",
    address: {
      street: "Mall Road, Near Christ Church",
      city: "Shimla",
      state: "Himachal Pradesh",
      zipCode: "171001",
      country: "India"
    },
    description: "Cozy mountain café with panoramic views and homemade pastries"
  },

  // Food Mall - Bars / Pubs (corrected name)
  {
    name: "Sameer Khan",
    email: "sameer@mumbailounge.com",
    password: "Demo@123456",
    businessName: "Mumbai Lounge & Bar",
    businessCategory: "Food Mall",
    businessType: "Bars / Pubs",
    phone: "+91 98765 43223",
    address: {
      street: "Juhu Beach, Juhu Tara Road",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400049",
      country: "India"
    },
    description: "Beachside lounge with craft cocktails and live music"
  },
  {
    name: "Neha Kapoor",
    email: "neha@delhipub.com",
    password: "Demo@123456",
    businessName: "Delhi Pub & Grill",
    businessCategory: "Food Mall",
    businessType: "Bars / Pubs",
    phone: "+91 98765 43224",
    address: {
      street: "Hauz Khas Village, Main Market",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110016",
      country: "India"
    },
    description: "Trendy pub with craft beers, grilled food, and rooftop seating"
  },

  // Food Mall - Street Food Stalls
  {
    name: "Ramesh Yadav",
    email: "ramesh@delhichaat.com",
    password: "Demo@123456",
    businessName: "Delhi Chaat Wala",
    businessCategory: "Food Mall",
    businessType: "Street Food Stalls",
    phone: "+91 98765 43225",
    address: {
      street: "Chandni Chowk, Near Red Fort",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110006",
      country: "India"
    },
    description: "Authentic Delhi street food - golgappa, aloo tikki, and chole bhature"
  },
  {
    name: "Ganesh Patil",
    email: "ganesh@mumbaistreet.com",
    password: "Demo@123456",
    businessName: "Mumbai Street Food",
    businessCategory: "Food Mall",
    businessType: "Street Food Stalls",
    phone: "+91 98765 43226",
    address: {
      street: "Chowpatty Beach, Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400020",
      country: "India"
    },
    description: "Famous Mumbai street food - vada pav, bhel puri, and pav bhaji"
  },

  // Food Mall - Ice Cream & Dessert Parlors
  {
    name: "Sanjay Kulfi",
    email: "sanjay@delhikulfi.com",
    password: "Demo@123456",
    businessName: "Delhi Kulfi Corner",
    businessCategory: "Food Mall",
    businessType: "Ice Cream & Dessert Parlors",
    phone: "+91 98765 43229",
    address: {
      street: "Karol Bagh, Main Market",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110005",
      country: "India"
    },
    description: "Traditional kulfi and modern ice cream flavors with Indian ingredients"
  },
  {
    name: "Pooja Jain",
    email: "pooja@naturalicecream.com",
    password: "Demo@123456",
    businessName: "Natural Ice Cream Parlor",
    businessCategory: "Food Mall",
    businessType: "Ice Cream & Dessert Parlors",
    phone: "+91 98765 43230",
    address: {
      street: "Juhu Beach, Juhu Chowpatty",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400049",
      country: "India"
    },
    description: "Premium natural ice cream with fresh fruit flavors and no artificial colors"
  },

  // Food Mall - Juice & Smoothie Bars
  {
    name: "Amit Gupta",
    email: "amit@freshsqueeze.com",
    password: "Demo@123456",
    businessName: "Fresh Squeeze Juice Bar",
    businessCategory: "Food Mall",
    businessType: "Juice & Smoothie Bars",
    phone: "+91 98765 43231",
    address: {
      street: "Sector 29, Leisure Valley",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122002",
      country: "India"
    },
    description: "Fresh fruit juices, smoothies, and healthy detox drinks"
  },
  {
    name: "Sunita Devi",
    email: "sunita@ayurvedicjuice.com",
    password: "Demo@123456",
    businessName: "Ayurvedic Juice Center",
    businessCategory: "Food Mall",
    businessType: "Juice & Smoothie Bars",
    phone: "+91 98765 43232",
    address: {
      street: "Rishikesh Road, Near Ganga Aarti",
      city: "Rishikesh",
      state: "Uttarakhand",
      zipCode: "249201",
      country: "India"
    },
    description: "Ayurvedic herbal juices and wellness drinks with medicinal herbs"
  },

  // Food Mall - Tea Shops
  {
    name: "Darjeeling Tea Co.",
    email: "info@darjeelingtea.com",
    password: "Demo@123456",
    businessName: "Darjeeling Tea House",
    businessCategory: "Food Mall",
    businessType: "Tea Shops",
    phone: "+91 98765 43233",
    address: {
      street: "Mall Road, Near Observatory Hill",
      city: "Darjeeling",
      state: "West Bengal",
      zipCode: "734101",
      country: "India"
    },
    description: "Premium Darjeeling tea with mountain views and tea tasting sessions"
  },
  {
    name: "Chai Wala",
    email: "chaiwala@indianchai.com",
    password: "Demo@123456",
    businessName: "Indian Chai House",
    businessCategory: "Food Mall",
    businessType: "Tea Shops",
    phone: "+91 98765 43234",
    address: {
      street: "CP Metro Station, Gate No. 3",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    },
    description: "Traditional Indian chai with regional variations and tea snacks"
  },

  // Food Mall - Pizzerias
  {
    name: "Antonio Rossi",
    email: "antonio@pizzaroma.com",
    password: "Demo@123456",
    businessName: "Pizza Roma",
    businessCategory: "Food Mall",
    businessType: "Pizzerias",
    phone: "+91 98765 43260",
    address: {
      street: "Brigade Road, Near Forum Mall",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560025",
      country: "India"
    },
    description: "Authentic Italian pizzas with wood-fired oven and fresh ingredients"
  },
  {
    name: "Raj Pizza",
    email: "raj@delhipizza.com",
    password: "Demo@123456",
    businessName: "Delhi Pizza Corner",
    businessCategory: "Food Mall",
    businessType: "Pizzerias",
    phone: "+91 98765 43261",
    address: {
      street: "Karol Bagh, Ajmal Khan Road",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110005",
      country: "India"
    },
    description: "Fusion Indian pizzas with local flavors and traditional toppings"
  },

  // Food Mall - Noodle / Asian Food Outlets
  {
    name: "Chen Wei",
    email: "chen@asiannoodles.com",
    password: "Demo@123456",
    businessName: "Asian Noodle House",
    businessCategory: "Food Mall",
    businessType: "Noodle / Asian Food Outlets",
    phone: "+91 98765 43262",
    address: {
      street: "Chinatown, Tangra",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700046",
      country: "India"
    },
    description: "Authentic Chinese noodles, dim sum, and Asian street food"
  },
  {
    name: "Ramen Master",
    email: "info@ramenhouse.com",
    password: "Demo@123456",
    businessName: "Tokyo Ramen House",
    businessCategory: "Food Mall",
    businessType: "Noodle / Asian Food Outlets",
    phone: "+91 98765 43263",
    address: {
      street: "Bandra West, Hill Road",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    },
    description: "Japanese ramen, sushi, and authentic Asian cuisine"
  },

  // Food Mall - Healthy Food / Salad Bars
  {
    name: "Fitness Food",
    email: "info@fitnessfood.com",
    password: "Demo@123456",
    businessName: "Fitness Food Hub",
    businessCategory: "Food Mall",
    businessType: "Healthy Food / Salad Bars",
    phone: "+91 98765 43264",
    address: {
      street: "Cyber City, DLF Phase 3",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122002",
      country: "India"
    },
    description: "Healthy salads, protein bowls, and nutritious meal options"
  },

  // Retail / E-Commerce - Electronic Shops (corrected name)
  {
    name: "Vijay Electronics",
    email: "vijay@techworld.com",
    password: "Demo@123456",
    businessName: "Tech World Electronics",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Electronic Shops",
    phone: "+91 98765 43241",
    address: {
      street: "Nehru Place, Central Market",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110019",
      country: "India"
    },
    description: "Latest electronics and gadgets with competitive prices and warranty"
  },
  {
    name: "Digital Hub",
    email: "info@digitalhub.com",
    password: "Demo@123456",
    businessName: "Digital Hub Electronics",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Electronic Shops",
    phone: "+91 98765 43242",
    address: {
      street: "SP Road, Near Chickpet",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560002",
      country: "India"
    },
    description: "Computer hardware, mobile phones, and electronic accessories"
  },

  // Retail / E-Commerce - Footwear Stores
  {
    name: "Shoe Palace",
    email: "info@shoepalace.com",
    password: "Demo@123456",
    businessName: "Shoe Palace",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Footwear Stores",
    phone: "+91 98765 43270",
    address: {
      street: "Commercial Street, Near Brigade Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560025",
      country: "India"
    },
    description: "Premium footwear collection for men, women, and children"
  },
  {
    name: "Metro Shoes",
    email: "info@metroshoes.com",
    password: "Demo@123456",
    businessName: "Metro Shoes Store",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Footwear Stores",
    phone: "+91 98765 43271",
    address: {
      street: "Linking Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    },
    description: "Trendy footwear with latest fashion and comfortable designs"
  },

  // Retail / E-Commerce - Cosmetic & Beauty Stores
  {
    name: "Beauty World",
    email: "info@beautyworld.com",
    password: "Demo@123456",
    businessName: "Beauty World Cosmetics",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Cosmetic & Beauty Stores",
    phone: "+91 98765 43272",
    address: {
      street: "Khan Market, Middle Lane",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110003",
      country: "India"
    },
    description: "Premium cosmetics, skincare, and beauty products from top brands"
  },

  // Retail / E-Commerce - Jewellery Stores
  {
    name: "Golden Jewels",
    email: "info@goldenjewels.com",
    password: "Demo@123456",
    businessName: "Golden Jewels",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Jewellery Stores",
    phone: "+91 98765 43273",
    address: {
      street: "Johari Bazaar, Old City",
      city: "Jaipur",
      state: "Rajasthan",
      zipCode: "302003",
      country: "India"
    },
    description: "Traditional and modern jewelry with certified gold and diamond pieces"
  },

  // Creative & Design - Printed Design (corrected name)
  {
    name: "Print Master",
    email: "info@printmaster.com",
    password: "Demo@123456",
    businessName: "Print Master Studio",
    businessCategory: "Creative & Design businesses",
    businessType: "Printed Design",
    phone: "+91 98765 43245",
    address: {
      street: "Daryaganj, Near Delhi Gate",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110002",
      country: "India"
    },
    description: "Professional printing services for books, brochures, and marketing materials"
  },

  // Creative & Design - Logo Design (corrected name)
  {
    name: "Design Studio",
    email: "info@designstudio.com",
    password: "Demo@123456",
    businessName: "Creative Design Studio",
    businessCategory: "Creative & Design businesses",
    businessType: "Logo Design",
    phone: "+91 98765 43247",
    address: {
      street: "Cyber City, DLF Phase 2",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122002",
      country: "India"
    },
    description: "Professional logo design and brand identity solutions for businesses"
  },

  // Creative & Design - Graphic Design (corrected name)
  {
    name: "Visual Arts",
    email: "info@visualarts.com",
    password: "Demo@123456",
    businessName: "Visual Arts Studio",
    businessCategory: "Creative & Design businesses",
    businessType: "Graphic Design",
    phone: "+91 98765 43249",
    address: {
      street: "Banjara Hills, Road No. 10",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500034",
      country: "India"
    },
    description: "Creative graphic design for advertising, web design, and print media"
  },

  // Portfolio - Photographers
  {
    name: "Lens Master",
    email: "info@lensmaster.com",
    password: "Demo@123456",
    businessName: "Lens Master Photography",
    businessCategory: "Portfolio",
    businessType: "Photographers",
    phone: "+91 98765 43280",
    address: {
      street: "Connaught Place, Inner Circle",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    },
    description: "Professional wedding and portrait photography with creative storytelling"
  },
  {
    name: "Capture Moments",
    email: "info@capturemoments.com",
    password: "Demo@123456",
    businessName: "Capture Moments Studio",
    businessCategory: "Portfolio",
    businessType: "Photographers",
    phone: "+91 98765 43281",
    address: {
      street: "Bandra West, Carter Road",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    },
    description: "Fashion and commercial photography with modern editing techniques"
  },

  // Portfolio - Web Designers
  {
    name: "Web Craft",
    email: "info@webcraft.com",
    password: "Demo@123456",
    businessName: "Web Craft Solutions",
    businessCategory: "Portfolio",
    businessType: "Web Designers",
    phone: "+91 98765 43282",
    address: {
      street: "Electronic City, Phase 1",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560100",
      country: "India"
    },
    description: "Modern web design and development with responsive and user-friendly interfaces"
  },

  // Portfolio - Coaches & Trainers
  {
    name: "Life Coach Pro",
    email: "info@lifecoachpro.com",
    password: "Demo@123456",
    businessName: "Life Coach Pro",
    businessCategory: "Portfolio",
    businessType: "Coaches & Trainers",
    phone: "+91 98765 43283",
    address: {
      street: "Koramangala, 4th Block",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560034",
      country: "India"
    },
    description: "Personal development coaching and professional training programs"
  },

  // Agencies & Studios - Photography Studios
  {
    name: "Studio Light",
    email: "info@studiolight.com",
    password: "Demo@123456",
    businessName: "Studio Light Photography",
    businessCategory: "Agencies & Studios",
    businessType: "Photography Studios",
    phone: "+91 98765 43284",
    address: {
      street: "Juhu, Versova Link Road",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400061",
      country: "India"
    },
    description: "Professional photography studio with state-of-the-art equipment and lighting"
  },

  // Agencies & Studios - Video Editing & Motion Graphics
  {
    name: "Motion Graphics Pro",
    email: "info@motiongraphics.com",
    password: "Demo@123456",
    businessName: "Motion Graphics Pro",
    businessCategory: "Agencies & Studios",
    businessType: "Video Editing & Motion Graphics",
    phone: "+91 98765 43285",
    address: {
      street: "Film City Road, Goregaon East",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400063",
      country: "India"
    },
    description: "Professional video editing and motion graphics for films and advertisements"
  }
];

const seedAdditionalIndianBusinesses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);


    // Check if businesses already exist
    const existingBusinessesCount = await User.countDocuments({ 
      email: { $in: additionalIndianBusinesses.map(b => b.email) } 
    });
    
    if (existingBusinessesCount > 0) {


      return;
    }

    // Get business categories to validate business types
    const businessCategories = await BusinessCategory.find({ isActive: true });
    if (businessCategories.length === 0) {

      return;
    }

    const categoryMap = {};
    businessCategories.forEach(cat => {
      categoryMap[cat.name] = cat.businessTypes.filter(type => type.isActive).map(type => type.name);
    });

    let businessesCreated = 0;
    let businessesSkipped = 0;


    for (const businessData of additionalIndianBusinesses) {
      try {
        // Validate business type exists in category
        if (!categoryMap[businessData.businessCategory]?.includes(businessData.businessType)) {

          businessesSkipped++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(businessData.password, 12);

        // Create user
        const user = await User.create({
          name: businessData.name,
          email: businessData.email,
          password: hashedPassword,
          role: 'user',
          businessCategory: businessData.businessCategory,
          businessType: businessData.businessType,
          phone: businessData.phone,
          address: businessData.address.street,
          registration_through: 'By admin',
          registered_by_admin: null,
          isActive: true
        });

        // Create restaurant with realistic data
        const restaurant = await Restaurant.create({
          name: businessData.businessName,
          businessCategory: businessData.businessCategory,
          businessType: businessData.businessType,
          email: businessData.email,
          phone: businessData.phone,
          address: businessData.address,
          description: businessData.description,
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
          verificationStatus: 'verified',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });

        // Update user with restaurant reference
        await User.findByIdAndUpdate(user._id, { restaurant: restaurant._id });


        businessesCreated++;

      } catch (error) {

        businessesSkipped++;
      }
    }

    // Summary by category




    // Group by category for summary
    const categoryStats = {};
    additionalIndianBusinesses.forEach(business => {
      if (!categoryStats[business.businessCategory]) {
        categoryStats[business.businessCategory] = {};
      }
      if (!categoryStats[business.businessCategory][business.businessType]) {
        categoryStats[business.businessCategory][business.businessType] = 0;
      }
      categoryStats[business.businessCategory][business.businessType]++;
    });


    Object.entries(categoryStats).forEach(([category, types]) => {

      Object.entries(types).forEach(([type, count]) => {

      });
    });





  } catch (error) {

    process.exit(1);
  } finally {
    await mongoose.disconnect();

    process.exit(0);
  }
};

// Run the seeding
seedAdditionalIndianBusinesses();