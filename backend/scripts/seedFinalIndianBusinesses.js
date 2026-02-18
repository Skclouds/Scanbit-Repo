import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import BusinessCategory from '../models/BusinessCategory.js';

// Load environment variables
dotenv.config();

// Final realistic Indian businesses with EXACT category and type names
const finalIndianBusinesses = [
  // Food Mall - All Business Types (using exact names)
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
    name: "Sandwich King",
    email: "info@sandwichking.com",
    password: "Demo@123456",
    businessName: "Sandwich King",
    businessCategory: "Food Mall",
    businessType: "Sandwich & Wrap Shops",
    phone: "+91 98765 43265",
    address: {
      street: "FC Road, Near Fergusson College",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411005",
      country: "India"
    },
    description: "Gourmet sandwiches and wraps with fresh ingredients and unique flavors"
  },
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
    name: "Tiffin Service",
    email: "info@hometiffin.com",
    password: "Demo@123456",
    businessName: "Home Tiffin Service",
    businessCategory: "Food Mall",
    businessType: "Mess / Tiffin Services",
    phone: "+91 98765 43266",
    address: {
      street: "Koramangala, 6th Block",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560095",
      country: "India"
    },
    description: "Homestyle tiffin service with regional Indian cuisines delivered daily"
  },
  {
    name: "Food Truck Delhi",
    email: "info@foodtruckdelhi.com",
    password: "Demo@123456",
    businessName: "Delhi Food Truck",
    businessCategory: "Food Mall",
    businessType: "Food Trucks",
    phone: "+91 98765 43267",
    address: {
      street: "India Gate, Rajpath",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    },
    description: "Mobile food truck serving fusion Indian street food at various locations"
  },
  {
    name: "Grand Buffet",
    email: "info@grandbuffet.com",
    password: "Demo@123456",
    businessName: "Grand Buffet Restaurant",
    businessCategory: "Food Mall",
    businessType: "Buffet Restaurants",
    phone: "+91 98765 43268",
    address: {
      street: "Banjara Hills, Road No. 1",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500034",
      country: "India"
    },
    description: "All-you-can-eat buffet with international and Indian cuisine varieties"
  },
  {
    name: "BBQ Nation",
    email: "info@bbqnation.com",
    password: "Demo@123456",
    businessName: "BBQ Nation Grill",
    businessCategory: "Food Mall",
    businessType: "BBQ & Grill Houses",
    phone: "+91 98765 43269",
    address: {
      street: "Forum Mall, Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560066",
      country: "India"
    },
    description: "Live grill BBQ restaurant with unlimited grilled food and buffet"
  },
  {
    name: "Donut Delight",
    email: "info@donutdelight.com",
    password: "Demo@123456",
    businessName: "Donut Delight",
    businessCategory: "Food Mall",
    businessType: "Donut & Snack Counters",
    phone: "+91 98765 43270",
    address: {
      street: "Select City Walk Mall",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110017",
      country: "India"
    },
    description: "Fresh donuts, pastries, and quick snacks with coffee and beverages"
  },

  // Retail / E-Commerce businesses - All Business Types (using exact names)
  {
    name: "Ritu Kumar",
    email: "ritu@ethnicwear.com",
    password: "Demo@123456",
    businessName: "Ethnic Wear Collection",
    businessCategory: "Retail / E-Commerce businesses",
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
    name: "Kishore Furniture",
    email: "kishore@woodcraft.com",
    password: "Demo@123456",
    businessName: "Woodcraft Furniture",
    businessCategory: "Retail / E-Commerce businesses",
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
    name: "Kids Paradise",
    email: "info@kidsparadise.com",
    password: "Demo@123456",
    businessName: "Kids Paradise Toy Store",
    businessCategory: "Retail / E-Commerce businesses",
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
    name: "Shoe Palace",
    email: "info@shoepalace.com",
    password: "Demo@123456",
    businessName: "Shoe Palace",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Footwear Stores",
    phone: "+91 98765 43271",
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
  {
    name: "Leather World",
    email: "info@leatherworld.com",
    password: "Demo@123456",
    businessName: "Leather World",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Bags & Accessories Stores",
    phone: "+91 98765 43273",
    address: {
      street: "Linking Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    },
    description: "Premium leather bags, wallets, and accessories for men and women"
  },
  {
    name: "Organic Store",
    email: "info@organicstore.com",
    password: "Demo@123456",
    businessName: "Organic Health Store",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Organic & Health Stores",
    phone: "+91 98765 43274",
    address: {
      street: "Indiranagar, 100 Feet Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560038",
      country: "India"
    },
    description: "Organic food products, health supplements, and natural wellness items"
  },
  {
    name: "Home Decor Plus",
    email: "info@homedecorplus.com",
    password: "Demo@123456",
    businessName: "Home Decor Plus",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Home Décor Stores",
    phone: "+91 98765 43275",
    address: {
      street: "Sector 18, Noida City Centre",
      city: "Noida",
      state: "Uttar Pradesh",
      zipCode: "201301",
      country: "India"
    },
    description: "Modern home décor items, furnishings, and interior design accessories"
  },
  {
    name: "Clean Home",
    email: "info@cleanhome.com",
    password: "Demo@123456",
    businessName: "Clean Home Supplies",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Household & Cleaning Stores",
    phone: "+91 98765 43276",
    address: {
      street: "Karol Bagh, Main Market",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110005",
      country: "India"
    },
    description: "Household cleaning supplies, detergents, and home maintenance products"
  },
  {
    name: "Hardware Hub",
    email: "info@hardwarehub.com",
    password: "Demo@123456",
    businessName: "Hardware Hub",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Hardware Stores",
    phone: "+91 98765 43277",
    address: {
      street: "Chickpet, Main Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560053",
      country: "India"
    },
    description: "Complete hardware solutions for construction, plumbing, and electrical needs"
  },
  {
    name: "Sports Zone",
    email: "info@sportszone.com",
    password: "Demo@123456",
    businessName: "Sports Zone",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Sports & Fitness Stores",
    phone: "+91 98765 43278",
    address: {
      street: "Connaught Place, Outer Circle",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    },
    description: "Sports equipment, fitness gear, and athletic wear for all sports"
  },
  {
    name: "Book World",
    email: "info@bookworld.com",
    password: "Demo@123456",
    businessName: "Book World",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Book & Stationery Stores",
    phone: "+91 98765 43279",
    address: {
      street: "College Street, Near Presidency University",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700073",
      country: "India"
    },
    description: "Books, stationery, and educational materials for students and professionals"
  },
  {
    name: "Golden Jewels",
    email: "info@goldenjewels.com",
    password: "Demo@123456",
    businessName: "Golden Jewels",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Jewellery Stores",
    phone: "+91 98765 43280",
    address: {
      street: "Johari Bazaar, Old City",
      city: "Jaipur",
      state: "Rajasthan",
      zipCode: "302003",
      country: "India"
    },
    description: "Traditional and modern jewelry with certified gold and diamond pieces"
  },
  {
    name: "Vision Care",
    email: "info@visioncare.com",
    password: "Demo@123456",
    businessName: "Vision Care Opticals",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Optical Stores",
    phone: "+91 98765 43281",
    address: {
      street: "Brigade Road, Near Forum Mall",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560025",
      country: "India"
    },
    description: "Eye care services, prescription glasses, and contact lenses"
  },
  {
    name: "Sleep Well",
    email: "info@sleepwell.com",
    password: "Demo@123456",
    businessName: "Sleep Well Mattress",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Mattress & Bedding Stores",
    phone: "+91 98765 43282",
    address: {
      street: "Sector 29, Leisure Valley",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122002",
      country: "India"
    },
    description: "Premium mattresses, pillows, and bedding accessories for better sleep"
  },
  {
    name: "Pet Paradise",
    email: "info@petparadise.com",
    password: "Demo@123456",
    businessName: "Pet Paradise",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Pet Stores",
    phone: "+91 98765 43283",
    address: {
      street: "Bandra West, Hill Road",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    },
    description: "Pet supplies, food, toys, and accessories for dogs, cats, and other pets"
  },
  {
    name: "Flower Power",
    email: "info@flowerpower.com",
    password: "Demo@123456",
    businessName: "Flower Power",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Florists & Gift Shops",
    phone: "+91 98765 43284",
    address: {
      street: "Park Street, Near South City Mall",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700016",
      country: "India"
    },
    description: "Fresh flowers, gift arrangements, and special occasion decorations"
  },
  {
    name: "Time Zone",
    email: "info@timezone.com",
    password: "Demo@123456",
    businessName: "Time Zone Watches",
    businessCategory: "Retail / E-Commerce businesses",
    businessType: "Watch & Sunglass Stores",
    phone: "+91 98765 43285",
    address: {
      street: "Palladium Mall, Lower Parel",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400013",
      country: "India"
    },
    description: "Premium watches, sunglasses, and fashion accessories from top brands"
  },

  // Creative & Design businesses - All Business Types (using exact names)
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
  {
    name: "Package Pro",
    email: "info@packagepro.com",
    password: "Demo@123456",
    businessName: "Package Pro Design",
    businessCategory: "Creative & Design businesses",
    businessType: "Packaging Design Studios",
    phone: "+91 98765 43286",
    address: {
      street: "Andheri East, Near Metro Station",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400069",
      country: "India"
    },
    description: "Creative packaging design for products, brands, and retail packaging"
  },
  {
    name: "Art Studio",
    email: "info@artstudio.com",
    password: "Demo@123456",
    businessName: "Illustration Art Studio",
    businessCategory: "Creative & Design businesses",
    businessType: "Illustration & Art Studios",
    phone: "+91 98765 43287",
    address: {
      street: "Koramangala, 5th Block",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560095",
      country: "India"
    },
    description: "Custom illustrations, artwork, and creative visual content for various media"
  },

  // Portfolio - All Business Types (using exact names)
  {
    name: "Graphic Pro",
    email: "info@graphicpro.com",
    password: "Demo@123456",
    businessName: "Graphic Pro Designer",
    businessCategory: "Portfolio",
    businessType: "Graphic Designers",
    phone: "+91 98765 43288",
    address: {
      street: "Sector V, Salt Lake City",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700091",
      country: "India"
    },
    description: "Professional graphic designer specializing in brand identity and digital design"
  },
  {
    name: "Brand Master",
    email: "info@brandmaster.com",
    password: "Demo@123456",
    businessName: "Brand Master Designer",
    businessCategory: "Portfolio",
    businessType: "Logo & Branding Designers",
    phone: "+91 98765 43289",
    address: {
      street: "Connaught Place, Inner Circle",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    },
    description: "Expert logo and branding designer creating memorable brand identities"
  },
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
  {
    name: "Lens Master",
    email: "info@lensmaster.com",
    password: "Demo@123456",
    businessName: "Lens Master Photography",
    businessCategory: "Portfolio",
    businessType: "Photographers",
    phone: "+91 98765 43290",
    address: {
      street: "Bandra West, Carter Road",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India"
    },
    description: "Professional wedding and portrait photography with creative storytelling"
  },
  {
    name: "Freelance Pro",
    email: "info@freelancepro.com",
    password: "Demo@123456",
    businessName: "Freelance Pro Services",
    businessCategory: "Portfolio",
    businessType: "Freelancers",
    phone: "+91 98765 43251",
    address: {
      street: "Indiranagar, 100 Feet Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560038",
      country: "India"
    },
    description: "Multi-skilled freelancer offering design, development, and marketing services"
  },
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
  {
    name: "Podcast Pro",
    email: "info@podcastpro.com",
    password: "Demo@123456",
    businessName: "Podcast Pro Studio",
    businessCategory: "Portfolio",
    businessType: "Podcasters",
    phone: "+91 98765 43291",
    address: {
      street: "Powai, Near IIT Bombay",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400076",
      country: "India"
    },
    description: "Professional podcast production and audio content creation services"
  },

  // Agencies & Studios - All Business Types (using exact names)
  {
    name: "Digital Boost",
    email: "info@digitalboost.com",
    password: "Demo@123456",
    businessName: "Digital Boost Marketing",
    businessCategory: "Agencies & Studios",
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
    name: "Brand Agency",
    email: "info@brandagency.com",
    password: "Demo@123456",
    businessName: "Brand Identity Agency",
    businessCategory: "Agencies & Studios",
    businessType: "Branding & Identity Agencies",
    phone: "+91 98765 43292",
    address: {
      street: "Banjara Hills, Road No. 12",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500034",
      country: "India"
    },
    description: "Strategic branding and identity development for businesses and startups"
  },
  {
    name: "Web Agency",
    email: "info@webagency.com",
    password: "Demo@123456",
    businessName: "Web Design Agency",
    businessCategory: "Agencies & Studios",
    businessType: "Web Design Agencies",
    phone: "+91 98765 43293",
    address: {
      street: "HSR Layout, Sector 1",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560102",
      country: "India"
    },
    description: "Professional web design and development agency for modern businesses"
  },
  {
    name: "UX Studio",
    email: "info@uxstudio.com",
    password: "Demo@123456",
    businessName: "UX Design Studio",
    businessCategory: "Agencies & Studios",
    businessType: "UI/UX Design Studios",
    phone: "+91 98765 43294",
    address: {
      street: "Cyber City, DLF Phase 1",
      city: "Gurgaon",
      state: "Haryana",
      zipCode: "122002",
      country: "India"
    },
    description: "User experience and interface design studio for digital products"
  },
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
  },
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
  {
    name: "Film Production",
    email: "info@filmproduction.com",
    password: "Demo@123456",
    businessName: "Film Production House",
    businessCategory: "Agencies & Studios",
    businessType: "Film & Media Production",
    phone: "+91 98765 43295",
    address: {
      street: "Andheri West, Oshiwara",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400053",
      country: "India"
    },
    description: "Complete film and media production services for commercials and content"
  },
  {
    name: "Ad Agency",
    email: "info@adagency.com",
    password: "Demo@123456",
    businessName: "Creative Ad Agency",
    businessCategory: "Agencies & Studios",
    businessType: "Advertising Agencies",
    phone: "+91 98765 43296",
    address: {
      street: "Sector 18, Noida City Centre",
      city: "Noida",
      state: "Uttar Pradesh",
      zipCode: "201301",
      country: "India"
    },
    description: "Full-service advertising agency with creative campaigns and media planning"
  }
];

const seedFinalIndianBusinesses = async () => {
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
    const newBusinesses = finalIndianBusinesses.filter(b => !existingEmailSet.has(b.email));
    


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
    finalIndianBusinesses.forEach(business => {
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
    finalIndianBusinesses.forEach(business => {
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
seedFinalIndianBusinesses();