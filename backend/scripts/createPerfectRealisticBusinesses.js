import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';

// Load environment variables
dotenv.config();

const createPerfectRealisticBusinesses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Step 1: Delete all non-admin users and their restaurants

    const nonAdminUsers = await User.find({ role: { $ne: 'admin' } });

    // Delete restaurants first
    const restaurantIds = nonAdminUsers.map(user => user.restaurant).filter(Boolean);
    if (restaurantIds.length > 0) {
      await Restaurant.deleteMany({ _id: { $in: restaurantIds } });

    }
    
    // Delete non-admin users
    const deletedUsers = await User.deleteMany({ role: { $ne: 'admin' } });

    // Step 2: Create perfect realistic Indian businesses using ONLY valid enum values

    const perfectBusinesses = [
      // Food Mall - Restaurants
      {
        name: "Rajesh Kumar",
        email: "rajesh@punjabigrill.com",
        businessName: "Punjabi Grill & Tandoor",
        businessCategory: "Food Mall",
        businessType: "Restaurants",
        phone: "+91 98765 43210",
        address: { street: "Shop No. 15, Connaught Place", city: "New Delhi", state: "Delhi", zipCode: "110001", country: "India" },
        description: "Authentic North Indian cuisine with traditional tandoor specialties and royal dining experience"
      },
      {
        name: "Meera Nair",
        email: "meera@keralakitchen.com",
        businessName: "Kerala Kitchen",
        businessCategory: "Food Mall",
        businessType: "Restaurants",
        phone: "+91 98765 43211",
        address: { street: "MG Road, Near Metro Station", city: "Kochi", state: "Kerala", zipCode: "682016", country: "India" },
        description: "Traditional Kerala cuisine with fresh seafood, coconut-based curries, and authentic spices"
      },
      {
        name: "Arjun Reddy",
        email: "arjun@hyderabadbiryani.com",
        businessName: "Hyderabadi Biryani House",
        businessCategory: "Food Mall",
        businessType: "Restaurants",
        phone: "+91 98765 43212",
        address: { street: "Banjara Hills, Road No. 12", city: "Hyderabad", state: "Telangana", zipCode: "500034", country: "India" },
        description: "Authentic Hyderabadi biryani and Nizami cuisine with traditional dum cooking methods"
      },
      {
        name: "Sanjay Gupta",
        email: "sanjay@gujaratithali.com",
        businessName: "Gujarati Thali House",
        businessCategory: "Food Mall",
        businessType: "Restaurants",
        phone: "+91 98765 43213",
        address: { street: "Law Garden, Near Sardar Patel Stadium", city: "Ahmedabad", state: "Gujarat", zipCode: "380009", country: "India" },
        description: "Traditional Gujarati unlimited thali with authentic homestyle vegetarian cuisine"
      },
      
      // Food Mall - Hotels
      {
        name: "Suresh Patel",
        email: "suresh@rajmahalhotel.com",
        businessName: "Rajmahal Heritage Hotel",
        businessCategory: "Food Mall",
        businessType: "Hotels",
        phone: "+91 98765 43215",
        address: { street: "Near City Palace, Old City", city: "Jaipur", state: "Rajasthan", zipCode: "302002", country: "India" },
        description: "Heritage hotel with royal Rajasthani cuisine, traditional hospitality, and palace-style dining"
      },
      {
        name: "Lakshmi Iyer",
        email: "lakshmi@backwaterresort.com",
        businessName: "Backwater Resort & Spa",
        businessCategory: "Food Mall",
        businessType: "Hotels",
        phone: "+91 98765 43216",
        address: { street: "Kumarakom, Vembanad Lake", city: "Kottayam", state: "Kerala", zipCode: "686563", country: "India" },
        description: "Luxury backwater resort with authentic Kerala cuisine, Ayurvedic spa, and houseboat dining"
      },
      {
        name: "Vikram Singh",
        email: "vikram@hillstationresort.com",
        businessName: "Hill Station Resort",
        businessCategory: "Food Mall",
        businessType: "Hotels",
        phone: "+91 98765 43217",
        address: { street: "Mall Road, Near Christ Church", city: "Shimla", state: "Himachal Pradesh", zipCode: "171001", country: "India" },
        description: "Mountain resort with panoramic views, multi-cuisine restaurant, and cozy fireside dining"
      },
      
      // Food Mall - Cloud Kitchens
      {
        name: "Rohit Agarwal",
        email: "rohit@delhicloudkitchen.com",
        businessName: "Delhi Cloud Kitchen",
        businessCategory: "Food Mall",
        businessType: "Cloud Kitchens",
        phone: "+91 98765 43218",
        address: { street: "Sector 18, Industrial Area", city: "Gurgaon", state: "Haryana", zipCode: "122015", country: "India" },
        description: "Multi-brand cloud kitchen serving North Indian, Chinese, Continental, and street food"
      },
      {
        name: "Anita Desai",
        email: "anita@homefoodexpress.com",
        businessName: "Home Food Express",
        businessCategory: "Food Mall",
        businessType: "Cloud Kitchens",
        phone: "+91 98765 43219",
        address: { street: "Whitefield, ITPL Main Road", city: "Bangalore", state: "Karnataka", zipCode: "560066", country: "India" },
        description: "Homestyle cooking delivered fresh with regional specialties and mom's recipes"
      },
      {
        name: "Pradeep Kumar",
        email: "pradeep@mumbaicloudkitchen.com",
        businessName: "Mumbai Cloud Kitchen",
        businessCategory: "Food Mall",
        businessType: "Cloud Kitchens",
        phone: "+91 98765 43220",
        address: { street: "Andheri East, Near Metro Station", city: "Mumbai", state: "Maharashtra", zipCode: "400069", country: "India" },
        description: "Premium cloud kitchen with Mumbai street food, South Indian, and healthy meal options"
      },
      
      // Food Mall - Food Courts / Fast Foods
      {
        name: "Karan Malhotra",
        email: "karan@chatcorner.com",
        businessName: "Chat Corner",
        businessCategory: "Food Mall",
        businessType: "Food Courts / Fast Foods",
        phone: "+91 98765 43221",
        address: { street: "Phoenix Mall, Food Court Level 3", city: "Pune", state: "Maharashtra", zipCode: "411014", country: "India" },
        description: "Popular chat and fast food counter with Mumbai street food favorites and regional snacks"
      },
      {
        name: "Deepak Gupta",
        email: "deepak@southindianexpress.com",
        businessName: "South Indian Express",
        businessCategory: "Food Mall",
        businessType: "Food Courts / Fast Foods",
        phone: "+91 98765 43222",
        address: { street: "Express Avenue Mall, Food Court", city: "Chennai", state: "Tamil Nadu", zipCode: "600002", country: "India" },
        description: "Quick South Indian meals - dosa, idli, vada, sambhar, and authentic filter coffee"
      },
      {
        name: "Ramesh Chaat",
        email: "ramesh@delhichaat.com",
        businessName: "Delhi Chaat Corner",
        businessCategory: "Food Mall",
        businessType: "Food Courts / Fast Foods",
        phone: "+91 98765 43223",
        address: { street: "Select City Walk Mall, Food Court", city: "New Delhi", state: "Delhi", zipCode: "110017", country: "India" },
        description: "Authentic Delhi street food - golgappa, chaat, kulfi, and traditional snacks"
      },
      
      // Food Mall - Bakeries
      {
        name: "Maria D'Souza",
        email: "maria@goanbakery.com",
        businessName: "Goan Delights Bakery",
        businessCategory: "Food Mall",
        businessType: "Bakeries",
        phone: "+91 98765 43224",
        address: { street: "Calangute Beach Road", city: "Panaji", state: "Goa", zipCode: "403516", country: "India" },
        description: "Traditional Goan bakery with fresh bread, bebinca, Portuguese pastries, and local sweets"
      },
      {
        name: "Ravi Krishnan",
        email: "ravi@chennaisweets.com",
        businessName: "Chennai Sweets & Bakery",
        businessCategory: "Food Mall",
        businessType: "Bakeries",
        phone: "+91 98765 43225",
        address: { street: "T. Nagar, Ranganathan Street", city: "Chennai", state: "Tamil Nadu", zipCode: "600017", country: "India" },
        description: "Traditional South Indian sweets, modern bakery items, and festival special preparations"
      },
      {
        name: "Suresh Mithai",
        email: "suresh@rajasthanimithai.com",
        businessName: "Rajasthani Mithai Bhandar",
        businessCategory: "Food Mall",
        businessType: "Bakeries",
        phone: "+91 98765 43226",
        address: { street: "Johari Bazaar, Near Hawa Mahal", city: "Jaipur", state: "Rajasthan", zipCode: "302002", country: "India" },
        description: "Traditional Rajasthani sweets, ghevar, malpua, and festival specialties"
      },
      
      // Food Mall - Coffee Shops
      {
        name: "Arjun Menon",
        email: "arjun@keralaroasters.com",
        businessName: "Kerala Coffee Roasters",
        businessCategory: "Food Mall",
        businessType: "Coffee Shops",
        phone: "+91 98765 43227",
        address: { street: "MG Road, Near Lulu Mall", city: "Kochi", state: "Kerala", zipCode: "682025", country: "India" },
        description: "Specialty coffee from Kerala plantations with traditional filter coffee and brewing workshops"
      },
      {
        name: "Kavya Rao",
        email: "kavya@bangalorebrew.com",
        businessName: "Bangalore Brew House",
        businessCategory: "Food Mall",
        businessType: "Coffee Shops",
        phone: "+91 98765 43228",
        address: { street: "Brigade Road, Near Forum Mall", city: "Bangalore", state: "Karnataka", zipCode: "560025", country: "India" },
        description: "Artisan coffee roastery with single-origin beans, specialty drinks, and cozy ambiance"
      },
      {
        name: "Chai Master",
        email: "info@chaimaster.com",
        businessName: "Chai Master Coffee House",
        businessCategory: "Food Mall",
        businessType: "Coffee Shops",
        phone: "+91 98765 43229",
        address: { street: "Park Street, Near College Street", city: "Kolkata", state: "West Bengal", zipCode: "700016", country: "India" },
        description: "Traditional tea house with premium Darjeeling, Assam teas, and specialty coffee blends"
      },
      
      // Food Mall - Street Food Vendors (using valid enum)
      {
        name: "Pappu Chaat",
        email: "pappu@streetfood.com",
        businessName: "Pappu's Street Food",
        businessCategory: "Food Mall",
        businessType: "Street Food Vendors",
        phone: "+91 98765 43230",
        address: { street: "Chandni Chowk, Near Red Fort", city: "New Delhi", state: "Delhi", zipCode: "110006", country: "India" },
        description: "Authentic Delhi street food - golgappa, aloo tikki, chole bhature, and kulfi"
      },
      
      // Food Mall - Ice Cream Shops
      {
        name: "Kulfi King",
        email: "info@kulfiking.com",
        businessName: "Kulfi King Ice Cream",
        businessCategory: "Food Mall",
        businessType: "Ice Cream Shops",
        phone: "+91 98765 43231",
        address: { street: "Marine Drive, Near Chowpatty", city: "Mumbai", state: "Maharashtra", zipCode: "400020", country: "India" },
        description: "Traditional kulfi, ice creams, and frozen desserts with authentic Indian flavors"
      },
      
      // Retail / E-Commerce Businesses - Clothing Stores
      {
        name: "Ritu Kumar",
        email: "ritu@ethnicwear.com",
        businessName: "Ethnic Wear Collection",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Clothing Stores",
        phone: "+91 98765 43236",
        address: { street: "Khan Market, Middle Lane", city: "New Delhi", state: "Delhi", zipCode: "110003", country: "India" },
        description: "Designer ethnic wear with traditional Indian clothing, modern fusion, and bridal collections"
      },
      {
        name: "Manish Malhotra",
        email: "manish@designerwear.com",
        businessName: "Designer Wear Boutique",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Clothing Stores",
        phone: "+91 98765 43237",
        address: { street: "Linking Road, Bandra West", city: "Mumbai", state: "Maharashtra", zipCode: "400050", country: "India" },
        description: "High-end designer clothing with custom tailoring, bridal wear, and celebrity fashion"
      },
      {
        name: "Sabyasachi Store",
        email: "info@sabyasachi.com",
        businessName: "Sabyasachi Heritage Store",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Clothing Stores",
        phone: "+91 98765 43238",
        address: { street: "Park Street, Near South City Mall", city: "Kolkata", state: "West Bengal", zipCode: "700016", country: "India" },
        description: "Heritage Indian clothing with handcrafted textiles, vintage designs, and royal collections"
      },
      {
        name: "Fashion Hub",
        email: "info@fashionhub.com",
        businessName: "Fashion Hub Boutique",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Clothing Stores",
        phone: "+91 98765 43239",
        address: { street: "Commercial Street, Brigade Road", city: "Bangalore", state: "Karnataka", zipCode: "560025", country: "India" },
        description: "Trendy fashion boutique with Indo-western wear, casual clothing, and accessories"
      },
      
      // Retail / E-Commerce Businesses - Furniture Stores
      {
        name: "Kishore Furniture",
        email: "kishore@woodcraft.com",
        businessName: "Woodcraft Furniture",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Furniture Stores",
        phone: "+91 98765 43240",
        address: { street: "Peenya Industrial Area, 4th Phase", city: "Bangalore", state: "Karnataka", zipCode: "560058", country: "India" },
        description: "Handcrafted wooden furniture with traditional Indian designs, modern styles, and custom pieces"
      },
      {
        name: "Modern Living",
        email: "info@modernliving.com",
        businessName: "Modern Living Furniture",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Furniture Stores",
        phone: "+91 98765 43241",
        address: { street: "Sector 18, Noida City Centre", city: "Noida", state: "Uttar Pradesh", zipCode: "201301", country: "India" },
        description: "Contemporary furniture with modular designs, space-saving solutions, and home decor"
      },
      {
        name: "Royal Furniture",
        email: "info@royalfurniture.com",
        businessName: "Royal Furniture Palace",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Furniture Stores",
        phone: "+91 98765 43242",
        address: { street: "Karol Bagh, Near Metro Station", city: "New Delhi", state: "Delhi", zipCode: "110005", country: "India" },
        description: "Premium furniture showroom with luxury designs, antique pieces, and royal collections"
      },
      
      // Retail / E-Commerce Businesses - Electronic Shop (using valid enum)
      {
        name: "Vijay Electronics",
        email: "vijay@techworld.com",
        businessName: "Tech World Electronics",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Electronic Shop",
        phone: "+91 98765 43243",
        address: { street: "Nehru Place, Central Market", city: "New Delhi", state: "Delhi", zipCode: "110019", country: "India" },
        description: "Latest electronics and gadgets with competitive prices, warranty, and technical support"
      },
      {
        name: "Digital Hub",
        email: "info@digitalhub.com",
        businessName: "Digital Hub Electronics",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Electronic Shop",
        phone: "+91 98765 43244",
        address: { street: "SP Road, Near Chickpet", city: "Bangalore", state: "Karnataka", zipCode: "560002", country: "India" },
        description: "Computer hardware, mobile phones, electronic accessories, and repair services"
      },
      
      // Retail / E-Commerce Businesses - Toy Shops
      {
        name: "Kids Paradise",
        email: "info@kidsparadise.com",
        businessName: "Kids Paradise Toy Store",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Toy Shops",
        phone: "+91 98765 43245",
        address: { street: "Commercial Street, Near Brigade Road", city: "Bangalore", state: "Karnataka", zipCode: "560025", country: "India" },
        description: "Educational toys, games, children's books, and creative learning materials for all age groups"
      },
      {
        name: "Wonder Toys",
        email: "info@wondertoys.com",
        businessName: "Wonder Toys & Games",
        businessCategory: "Retail / E-Commerce Businesses",
        businessType: "Toy Shops",
        phone: "+91 98765 43246",
        address: { street: "Palladium Mall, Lower Parel", city: "Mumbai", state: "Maharashtra", zipCode: "400013", country: "India" },
        description: "International toy brands, educational games, creative learning tools, and gift items"
      },
      
      // Creative & Design - Printed products (using valid enum)
      {
        name: "Print Master",
        email: "info@printmaster.com",
        businessName: "Print Master Studio",
        businessCategory: "Creative & Design",
        businessType: "Printed products",
        phone: "+91 98765 43247",
        address: { street: "Daryaganj, Near Delhi Gate", city: "New Delhi", state: "Delhi", zipCode: "110002", country: "India" },
        description: "Professional printing services for books, brochures, marketing materials, and custom designs"
      },
      {
        name: "Creative Prints",
        email: "info@creativeprints.com",
        businessName: "Creative Print Solutions",
        businessCategory: "Creative & Design",
        businessType: "Printed products",
        phone: "+91 98765 43248",
        address: { street: "Andheri East, Near Metro Station", city: "Mumbai", state: "Maharashtra", zipCode: "400069", country: "India" },
        description: "Digital printing, packaging design, custom printing solutions, and brand materials"
      },
      
      // Creative & Design - Logo Designers (using valid enum)
      {
        name: "Design Studio",
        email: "info@designstudio.com",
        businessName: "Creative Design Studio",
        businessCategory: "Creative & Design",
        businessType: "Logo Designers",
        phone: "+91 98765 43249",
        address: { street: "Cyber City, DLF Phase 2", city: "Gurgaon", state: "Haryana", zipCode: "122002", country: "India" },
        description: "Professional logo design, brand identity solutions, and corporate branding services"
      },
      {
        name: "Brand Makers",
        email: "info@brandmakers.com",
        businessName: "Brand Makers Design",
        businessCategory: "Creative & Design",
        businessType: "Logo Designers",
        phone: "+91 98765 43250",
        address: { street: "Koramangala, 5th Block", city: "Bangalore", state: "Karnataka", zipCode: "560095", country: "India" },
        description: "Brand design specialists with logo creation, visual identity, and marketing design services"
      },
      
      // Creative & Design - Graphic Designers (using valid enum)
      {
        name: "Visual Arts",
        email: "info@visualarts.com",
        businessName: "Visual Arts Studio",
        businessCategory: "Creative & Design",
        businessType: "Graphic Designers",
        phone: "+91 98765 43251",
        address: { street: "Banjara Hills, Road No. 10", city: "Hyderabad", state: "Telangana", zipCode: "500034", country: "India" },
        description: "Creative graphic design for advertising, web design, print media, and digital marketing"
      },
      {
        name: "Pixel Perfect",
        email: "info@pixelperfect.com",
        businessName: "Pixel Perfect Designs",
        businessCategory: "Creative & Design",
        businessType: "Graphic Designers",
        phone: "+91 98765 43252",
        address: { street: "Sector V, Salt Lake City", city: "Kolkata", state: "West Bengal", zipCode: "700091", country: "India" },
        description: "Digital design agency specializing in UI/UX, graphic design, and creative solutions"
      },
      
      // Creative & Design - Freelancers (using valid enum)
      {
        name: "Freelance Pro",
        email: "info@freelancepro.com",
        businessName: "Freelance Pro Services",
        businessCategory: "Creative & Design",
        businessType: "Freelancers",
        phone: "+91 98765 43253",
        address: { street: "Indiranagar, 100 Feet Road", city: "Bangalore", state: "Karnataka", zipCode: "560038", country: "India" },
        description: "Freelance services for web development, content writing, design, and digital marketing"
      },
      {
        name: "Creative Freelancer",
        email: "info@creativefreelancer.com",
        businessName: "Creative Freelancer Hub",
        businessCategory: "Creative & Design",
        businessType: "Freelancers",
        phone: "+91 98765 43254",
        address: { street: "Powai, Near IIT Bombay", city: "Mumbai", state: "Maharashtra", zipCode: "400076", country: "India" },
        description: "Multi-skilled freelancer offering design, development, marketing, and consulting services"
      },
      
      // Creative & Design - Digital Marketing Agencies (using valid enum)
      {
        name: "Digital Boost",
        email: "info@digitalboost.com",
        businessName: "Digital Boost Marketing",
        businessCategory: "Creative & Design",
        businessType: "Digital Marketing Agencies",
        phone: "+91 98765 43255",
        address: { street: "Connaught Place, Outer Circle", city: "New Delhi", state: "Delhi", zipCode: "110001", country: "India" },
        description: "Full-service digital marketing agency with SEO, social media, PPC, and content marketing"
      },
      {
        name: "Growth Hackers",
        email: "info@growthhackers.com",
        businessName: "Growth Hackers Agency",
        businessCategory: "Creative & Design",
        businessType: "Digital Marketing Agencies",
        phone: "+91 98765 43256",
        address: { street: "HSR Layout, Sector 1", city: "Bangalore", state: "Karnataka", zipCode: "560102", country: "India" },
        description: "Performance marketing agency focused on growth hacking, digital strategies, and ROI optimization"
      }
    ];

    let businessesCreated = 0;
    let businessesSkipped = 0;
    const password = "Demo@123456";


    for (const businessData of perfectBusinesses) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

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
          isActive: true
        });

        // Create restaurant
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
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });

        // Update user with restaurant reference
        await User.findByIdAndUpdate(user._id, { restaurant: restaurant._id });


        businessesCreated++;

      } catch (error) {

        businessesSkipped++;
      }
    }

    // Final Summary




    // Group by category
    const categoryStats = {};
    perfectBusinesses.forEach(business => {
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

// Run the script
createPerfectRealisticBusinesses();