import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BusinessCategory from '../models/BusinessCategory.js';

dotenv.config();

const seedBusinessCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/menuqr');

    // Clear existing data (optional)
    // await BusinessCategory.deleteMany({});
    // console.log('🗑️  Cleared existing business categories');

    const categories = [
      {
        name: "Food Mall",
        icon: "MdRestaurantMenu",
        iconColor: "text-primary",
        description: "Perfect for food businesses with comprehensive menu management and QR code solutions.",
        layout: "Menu layout",
        order: 1,
        isActive: true,
        businessTypes: [
          { name: "Restaurants", icon: "MdRestaurant", description: "Full-service restaurants with complete menu management", order: 1, isActive: true },
          { name: "Cafés", icon: "MdLocalCafe", description: "Cozy cafés offering breakfast, lunch, and specialty beverages", order: 2, isActive: true },
          { name: "Hotels", icon: "MdHotel", description: "Hotel restaurants, room service menus, and in-room dining", order: 3, isActive: true },
          { name: "Cloud Kitchens", icon: "MdStorefront", description: "Digital kitchens with online menu management", order: 4, isActive: true },
          { name: "Food Courts / Fast Foods", icon: "MdFastfood", description: "Quick-service restaurants with fast menu updates", order: 5, isActive: true },
          { name: "Bakeries", icon: "MdCake", description: "Fresh bakeries with daily specials and custom orders", order: 6, isActive: true },
          { name: "Bars & Pubs", icon: "MdLocalBar", description: "Bars and pubs with drink menus and happy hour specials", order: 7, isActive: true },
          { name: "Street Food Vendors", icon: "MdStorefront", description: "Mobile vendors with location-based menus", order: 8, isActive: true },
          { name: "Coffee Shops", icon: "MdLocalCafe", description: "Coffee shops with extensive beverage and snack menus", order: 9, isActive: true },
          { name: "Ice Cream Shops", icon: "MdIcecream", description: "Ice cream parlors with flavor listings and custom combinations", order: 10, isActive: true },
          { name: "Juice Bars", icon: "MdLocalDrink", description: "Juice bars with ingredient lists and nutritional info", order: 11, isActive: true },
          { name: "Tea Houses", icon: "MdStore", description: "Tea houses with tea varieties and brewing guides", order: 12, isActive: true },
          { name: "Catering Services", icon: "MdEvent", description: "Catering companies with event menus and package deals", order: 13, isActive: true },
        ]
      },
      {
        name: "Retail / E-Commerce Businesses",
        icon: "MdShoppingBag",
        iconColor: "text-accent",
        description: "Ideal for retail stores and e-commerce businesses showcasing products with professional catalogs.",
        layout: "Product catalog layout",
        order: 2,
        isActive: true,
        businessTypes: [
          { name: "Clothing Stores", icon: "MdInventory", description: "Fashion stores with product catalogs and size options", order: 1, isActive: true },
          { name: "Furniture Stores", icon: "MdChair", description: "Furniture stores with catalog management and customization", order: 2, isActive: true },
          { name: "Electronic Shop", icon: "MdDevices", description: "Electronics stores with product specifications and pricing", order: 3, isActive: true },
          { name: "Toy Shops", icon: "MdToys", description: "Toy stores with age-appropriate categorizations and pricing", order: 4, isActive: true },
        ]
      },
      {
        name: "Creative & Design",
        icon: "MdBrush",
        iconColor: "text-primary",
        description: "Perfect for creative professionals and agencies showcasing their work with stunning portfolios.",
        layout: "Portfolio layout",
        order: 3,
        isActive: true,
        businessTypes: [
          { name: "Printed products", icon: "MdPrint", description: "Print shops showcasing print services and samples", order: 1, isActive: true },
          { name: "Logo Designers", icon: "MdDesignServices", description: "Logo designers showcasing their design portfolios", order: 2, isActive: true },
          { name: "Graphic Designers", icon: "MdPalette", description: "Graphic designers displaying their creative work", order: 3, isActive: true },
          { name: "Freelancers", icon: "MdWork", description: "Freelancers showcasing services and previous projects", order: 4, isActive: true },
          { name: "Digital Marketing Agencies", icon: "MdCampaign", description: "Marketing agencies displaying campaigns and case studies", order: 5, isActive: true },
        ]
      }
    ];

    // Create or update categories
    for (const categoryData of categories) {
      const category = await BusinessCategory.findOneAndUpdate(
        { name: categoryData.name },
        categoryData,
        { upsert: true, new: true }
      );

    }



    process.exit(0);
  } catch (error) {

    process.exit(1);
  }
};

seedBusinessCategories();
