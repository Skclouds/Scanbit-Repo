import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import BusinessCategory from '../models/BusinessCategory.js';

// Load environment variables
dotenv.config();

// Perfect realistic Indian businesses for the 3 main categories only
const perfectIndianBusinesses = [
  // Food Mall - Multiple business types
  {
    name: "Rajesh Kumar",
    email: "rajesh@punjabigrill.com",
    password: "Demo@123456",
    businessName: "Punjabi Grill & Tandoor",
    businessCategory: "Food Mall",
    businessType: "Restaurants",
    phone: "+91 98765 43210",
    address: {
      street: "Shop No. 15, Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    },
    description: "Authentic North Indian cuisine with traditional tandoor specialties"
  },
  {
    name: "Meera Nair",
    email: "meera@keralakitchen.com",
    password: "Demo@123456",
    businessName: "Kerala Kitchen",
    businessCategory: "Food Mall",
    businessType: "Restaurants",
    phone: "+91 98765 43211",
    address: {
      street: "MG Road, Near Metro Station",
      city: "Kochi",
      state: "Kerala",
      zipCode: "682016",
      country: "India"
    },
    description: "Traditional Kerala cuisine with fresh seafood and coconut-based curries"
  },
  {
    name: "Arjun Reddy",
    email: "arjun@hyderabadbiryani.com",
    password: "Demo@123456",
    businessName: "Hyderabadi Biryani House",
    businessCategory: "Food Mall",
    businessType: "Restaurants",
    phone: "+91 98765 43212",
    address: {
      street: "Banjara Hills, Road No. 12",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500034",
      country: "India"
    },
    description: "Authentic Hyderabadi biryani and Nizami cuisine"
  },
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
  {
    name: "Suresh Patel",
    email: "suresh@rajmahalhotel.com",
    password: "Demo@123456",
    businessName: "Rajmahal Heritage Hotel",
    businessCategory: "Food Mall",
    businessType: "Hotels",
    phone: "+91 98765 43215",
    address: {
      street: "Near City Palace, Old City",
      city: "Jaipur",
      state: "Rajasthan",
      zipCode: "302002",
      country: "India"
    },
    description: "Heritage hotel with royal Rajasthani cuisine and traditional hospitality"
  },
  {
    name: "Lakshmi Iyer",
    email: "lakshmi@backwaterresort.com",
    password: "Demo@123456",
    businessName: "Backwater Resort & Spa",
    businessCategory: "Food Mall",
    businessType: "Hotels",
    phone: "+91 98765 43216",
    address: {
      street: "Kumarakom, Vembanad Lake",
      city: "Kottayam",
      state: "Kerala",
      zipCode: "686563",
      country: "India"
    },
    description: "Luxury backwater resort with authentic Kerala cuisine and Ayurvedic spa"
  },
  {
    name: "Rohit Agarwal",
    email: "rohit@delhicloudkitchen.com",
    password: "Demo@123456",
    businessName: "Delhi Cloud Kitchen",
    businessCategory: "Food Mall",
    businessType: "Cloud Kitchens",
    phone: "+91 98765 43217",
    address: {
      street: "Sector 18, Industrial Area",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122015",
      country: "India"
    },
    description: "Multi-brand cloud kitchen serving North Indian, Chinese, and Continental"
  },
  {
    name: "Anita Desai",
    email: "anita@homefoodexpress.com",
    password: "Demo@123456",
    businessName: "Home Food Express",
    businessCategory: "Food Mall",
    businessType: "Cloud Kitchens",
    phone: "+91 98765 43218",
    address: {
      street: "Whitefield, ITPL Main Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560066",
      country: "India"
    },
    description: "Homestyle cooking delivered fresh with regional specialties"
  },
  {
    name: "Karan Malhotra",
    email: "karan@chatcorner.com",
    password: "Demo@123456",
    businessName: "Chat Corner",
    businessCategory: "Food Mall",
    businessType: "Food Courts / Fast Foods",
    phone: "+91 98765 43219",
    address: {
      street: "Phoenix Mall, Food Court Level 3",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411014",
      country: "India"
    },
    description: "Popular chat and fast food counter with Mumbai street food favorites"
  },
  {
    name: "Deepak Gupta",
    email: "deepak@southindianexpress.com",
    password: "Demo@123456",
    businessName: "South Indian Express",
    businessCategory: "Food Mall",
    businessType: "Food Courts / Fast Foods",
    phone: "+91 98765 43220",
    address: {
      street: "Express Avenue Mall, Food Court",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600002",
      country: "India"
    },
    description: "Quick South Indian meals - dosa, idli, vada, and filter coffee"
  },
  {
    name: "Maria D'Souza",
    email: "maria@goanbakery.com",
    password: "Demo@123456",
    businessName: "Goan Delights Bakery",
    businessCategory: "Food Mall",
    businessType: "Bakeries",
    phone: "+91 98765 43221",
    address: {
      street: "Calangute Beach Road",
      city: "Panaji",
      state: "Goa",
      zipCode: "403516",
      country: "India"
    },
    description: "Traditional Goan bakery with fresh bread, bebinca, and Portuguese pastries"
  },
  {
    name: "Ravi Krishnan",
    email: "ravi@chennaisweets.com",
    password: "Demo@123456",
    businessName: "Chennai Sweets & Bakery",
    businessCategory: "Food Mall",
    businessType: "Bakeries",
    phone: "+91 98765 43222",
    address: {
      street: "T. Nagar, Ranganathan Street",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600017",
      country: "India"
    },
    description: "Traditional South Indian sweets and modern bakery items"
  },
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
  {
    name: "Arjun Menon",
    email: "arjun@keralaroasters.com",
    password: "Demo@123456",
    businessName: "Kerala Coffee Roasters",
    businessCategory: "Food Mall",
    businessType: "Coffee Shops",
    phone: "+91 98765 43227",
    address: {
      street: "MG Road, Near Lulu Mall",
      city: "Kochi",
      state: "Kerala",
      zipCode: "682025",
      country: "India"
    },
    description: "Specialty coffee from Kerala plantations with traditional filter coffee"
  },
  {
    name: "Kavya Rao",
    email: "kavya@bangalorebrew.com",
    password: "Demo@123456",
    businessName: "Bangalore Brew House",
    businessCategory: "Food Mall",
    businessType: "Coffee Shops",
    phone: "+91 98765 43228",
    address: {
      street: "Brigade Road, Near Forum Mall",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560025",
      country: "India"
    },
    description: "Artisan coffee roastery with single-origin beans and brewing workshops"
  },
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

  // Retail / E-Commerce Businesses - Multiple business types
  {
    name: "Ritu Kumar",
    email: "ritu@ethnicwear.com",
    password: "Demo@123456",
    businessName: "Ethnic Wear Collection",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Clothing Stores",
    phone: "+91 98765 43236",
    address: {
      street: "Khan Market, Middle Lane",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110003",
      country: "India"
    },
    description: "Designer ethnic wear with traditional Indian clothing and modern fusion"
  },
  {
    name: "Manish Malhotra",
    email: "manish@designerwear.com",
    password: "Demo@123456",
    businessName: "Designer Wear Boutique",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Clothing Stores",
    phone: "+91 98765 43237",
    address: {
      street: "Linking Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    },
    description: "High-end designer clothing with custom tailoring and bridal wear"
  },
  {
    name: "Sabyasachi Store",
    email: "info@sabyasachi.com",
    password: "Demo@123456",
    businessName: "Sabyasachi Heritage Store",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Clothing Stores",
    phone: "+91 98765 43238",
    address: {
      street: "Park Street, Near South City Mall",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700016",
      country: "India"
    },
    description: "Heritage Indian clothing with handcrafted textiles and vintage designs"
  },
  {
    name: "Kishore Furniture",
    email: "kishore@woodcraft.com",
    password: "Demo@123456",
    businessName: "Woodcraft Furniture",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Furniture Stores",
    phone: "+91 98765 43239",
    address: {
      street: "Peenya Industrial Area, 4th Phase",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560058",
      country: "India"
    },
    description: "Handcrafted wooden furniture with traditional Indian designs"
  },
  {
    name: "Modern Living",
    email: "info@modernliving.com",
    password: "Demo@123456",
    businessName: "Modern Living Furniture",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Furniture Stores",
    phone: "+91 98765 43240",
    address: {
      street: "Sector 18, Noida City Centre",
      city: "Noida",
      state: "Uttar Pradesh",
      zipCode: "201301",
      country: "India"
    },
    description: "Contemporary furniture with modular designs and space-saving solutions"
  },
  {
    name: "Vijay Electronics",
    email: "vijay@techworld.com",
    password: "Demo@123456",
    businessName: "Tech World Electronics",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Electronic Shop",
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
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Electronic Shop",
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
  {
    name: "Kids Paradise",
    email: "info@kidsparadise.com",
    password: "Demo@123456",
    businessName: "Kids Paradise Toy Store",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Toy Shops",
    phone: "+91 98765 43243",
    address: {
      street: "Commercial Street, Near Brigade Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560025",
      country: "India"
    },
    description: "Educational toys, games, and children's books for all age groups"
  },
  {
    name: "Wonder Toys",
    email: "info@wondertoys.com",
    password: "Demo@123456",
    businessName: "Wonder Toys & Games",
    businessCategory: "Retail / E-Commerce Businesses",
    businessType: "Toy Shops",
    phone: "+91 98765 43244",
    address: {
      street: "Palladium Mall, Lower Parel",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400013",
      country: "India"
    },
    description: "International toy brands and educational games for creative learning"
  },

  // Creative & Design - Multiple business types
  {
    name: "Print Master",
    email: "info@printmaster.com",
    password: "Demo@123456",
    businessName: "Print Master Studio",
    businessCategory: "Creative & Design",
    businessType: "Printed products",
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
  {
    name: "Creative Prints",
    email: "info@creativeprints.com",
    password: "Demo@123456",
    businessName: "Creative Print Solutions",
    businessCategory: "Creative & Design",
    businessType: "Printed products",
    phone: "+91 98765 43246",
    address: {
      street: "Andheri East, Near Metro Station",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400069",
      country: "India"
    },
    description: "Digital printing, packaging design, and custom printing solutions"
  },
  {
    name: "Design Studio",
    email: "info@designstudio.com",
    password: "Demo@123456",
    businessName: "Creative Design Studio",
    businessCategory: "Creative & Design",
    businessType: "Logo Designers",
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
  {
    name: "Brand Makers",
    email: "info@brandmakers.com",
    password: "Demo@123456",
    businessName: "Brand Makers Design",
    businessCategory: "Creative & Design",
    businessType: "Logo Designers",
    phone: "+91 98765 43248",
    address: {
      street: "Koramangala, 5th Block",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560095",
      country: "India"
    },
    description: "Brand design specialists with logo creation and visual identity services"
  },
  {
    name: "Visual Arts",
    email: "info@visualarts.com",
    password: "Demo@123456",
    businessName: "Visual Arts Studio",
    businessCategory: "Creative & Design",
    businessType: "Graphic Designers",
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
  {
    name: "Pixel Perfect",
    email: "info@pixelperfect.com",
    password: "Demo@123456",
    businessName: "Pixel Perfect Designs",
    businessCategory: "Creative & Design",
    businessType: "Graphic Designers",
    phone: "+91 98765 43250",
    address: {
      street: "Sector V, Salt Lake City",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700091",
      country: "India"
    },
    description: "Digital design agency specializing in UI/UX and graphic design"
  },
  {
    name: "Freelance Pro",
    email: "info@freelancepro.com",
    password: "Demo@123456",
    businessName: "Freelance Pro Services",
    businessCategory: "Creative & Design",
    businessType: "Freelancers",
    phone: "+91 98765 43251",
    address: {
      street: "Indiranagar, 100 Feet Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560038",
      country: "India"
    },
    description: "Freelance services for web development, content writing, and design"
  },
  {
    name: "Creative Freelancer",
    email: "info@creativefreelancer.com",
    password: "Demo@123456",
    businessName: "Creative Freelancer Hub",
    businessCategory: "Creative & Design",
    businessType: "Freelancers",
    phone: "+91 98765 43252",
    address: {
      street: "Powai, Near IIT Bombay",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400076",
      country: "India"
    },
    description: "Multi-skilled freelancer offering design, development, and marketing services"
  },
  {
    name: "Digital Boost",
    email: "info@digitalboost.com",
    password: "Demo@123456",
    businessName: "Digital Boost Marketing",
    businessCategory: "Creative & Design",
    businessType: "Digital Marketing Agencies",
    phone: "+91 98765 43253",
    address: {
      street: "Connaught Place, Outer Circle",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    },
    description: "Full-service digital marketing agency with SEO, social media, and PPC services"
  },
  {
    name: "Growth Hackers",
    email: "info@growthhackers.com",
    password: "Demo@123456",
    businessName: "Growth Hackers Agency",
    businessCategory: "Creative & Design",
    businessType: "Digital Marketing Agencies",
    phone: "+91 98765 43254",
    address: {
      street: "HSR Layout, Sector 1",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560102",
      country: "India"
    },
    description: "Performance marketing agency focused on growth hacking and digital strategies"
  }
];

const seedPerfectIndianBusinesses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);



    // Get business categories to validate business types
    const businessCategories = await BusinessCategory.find({ isActive: true });
    if (businessCategories.length === 0) {

      return;
    }

    const categoryMap = {};
    businessCategories.forEach(cat => {
      categoryMap[cat.name] = cat.businessTypes.filter(type => type.isActive).map(type => type.name);
    });

    // Check existing businesses
    const existingEmails = await User.find({}, 'email').lean();
    const existingEmailSet = new Set(existingEmails.map(u => u.email));

    // Filter out existing businesses
    const newBusinesses = perfectIndianBusinesses.filter(b => !existingEmailSet.has(b.email));
    


    if (newBusinesses.length === 0) {

      return;
    }

    let businessesCreated = 0;
    let businessesSkipped = 0;


    for (const businessData of newBusinesses) {
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

    // Final Summary




    // Group by category for summary
    const categoryStats = {};
    perfectIndianBusinesses.forEach(business => {
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

    // State-wise distribution
    const stateStats = {};
    perfectIndianBusinesses.forEach(business => {
      const state = business.address.state;
      if (!stateStats[state]) stateStats[state] = 0;
      stateStats[state]++;
    });


    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {

      });








  } catch (error) {

    process.exit(1);
  } finally {
    await mongoose.disconnect();

    process.exit(0);
  }
};

// Run the seeding
seedPerfectIndianBusinesses();