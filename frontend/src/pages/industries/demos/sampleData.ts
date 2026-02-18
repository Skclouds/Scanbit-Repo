// Sample data for industry demo previews (Google-style, professional)

// Demo images: Picsum (deterministic by seed) — free, no key, real photos
const PICSUM = (seed: string, w = 400, h = 300) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Food Mall — real food photos from LoremFlickr (Flickr CC), deterministic via lock
const FOOD_IMG = (tags: string, lock: number, w = 400, h = 400) =>
  `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

// Food Mall / Restaurant menu — categories as per business type (veg/non-veg, coffees, cakes, etc.)
export const sampleMenuCategories = [
  { id: "all", name: "All", emoji: "🍽️" },
  { id: "starters", name: "Starters", emoji: "🥗" },
  { id: "mains", name: "Main Course", emoji: "🍛" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
  { id: "beverages", name: "Beverages", emoji: "🥤" },
  { id: "coffees", name: "Coffees", emoji: "☕" },
  { id: "cakes", name: "Cakes", emoji: "🎂" },
];

export const sampleMenuItems = [
  { id: "1", name: "Bruschetta Trio", description: "Toasted bread with tomato, basil & mozzarella. Served with balsamic glaze.", price: 299, categoryId: "starters", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-bruschetta", 400, 400) },
  { id: "2", name: "Paneer Tikka", description: "Grilled cottage cheese with spices & mint chutney. Tandoori style.", price: 349, categoryId: "starters", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-paneer", 400, 400) },
  { id: "3", name: "Chicken Wings", description: "Crispy fried chicken wings with your choice of sauce.", price: 379, categoryId: "starters", isVeg: false, isPopular: true, imageUrl: PICSUM("menu-wings", 400, 400) },
  { id: "4", name: "Butter Chicken", description: "Tender chicken in rich tomato butter gravy. Served with naan or rice.", price: 429, categoryId: "mains", isVeg: false, isPopular: true, imageUrl: PICSUM("menu-butter-chicken", 400, 400) },
  { id: "5", name: "Dal Makhani", description: "Creamy black lentils, slow-cooked with butter and cream.", price: 299, categoryId: "mains", isVeg: true, isPopular: false, imageUrl: PICSUM("menu-dal", 400, 400) },
  { id: "6", name: "Veg Biryani", description: "Fragrant basmati rice with mixed vegetables and spices.", price: 279, categoryId: "mains", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-biryani", 400, 400) },
  { id: "7", name: "Chocolate Lava Cake", description: "Warm cake with molten chocolate centre. Served with vanilla ice cream.", price: 249, categoryId: "desserts", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-lava-cake", 400, 400) },
  { id: "8", name: "Gulab Jamun", description: "Soft milk dumplings in rose-cardamom syrup.", price: 129, categoryId: "desserts", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-gulab", 400, 400) },
  { id: "9", name: "Tiramisu", description: "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone.", price: 299, categoryId: "desserts", isVeg: true, isPopular: false, imageUrl: PICSUM("menu-tiramisu", 400, 400) },
  { id: "10", name: "Fresh Lime Soda", description: "House-made with mint & black salt. Refreshing and cooling.", price: 99, categoryId: "beverages", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-lime", 400, 400) },
  { id: "11", name: "Mango Shake", description: "Thick mango shake with a scoop of ice cream.", price: 179, categoryId: "beverages", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-mango", 400, 400) },
  { id: "12", name: "Iced Tea", description: "Chilled tea with lemon and mint. Perfect for summers.", price: 129, categoryId: "beverages", isVeg: true, isPopular: false, imageUrl: PICSUM("menu-iced-tea", 400, 400) },
  { id: "13", name: "Cappuccino", description: "Double shot espresso with steamed milk and foam.", price: 199, categoryId: "coffees", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-cappuccino", 400, 400) },
  { id: "14", name: "Latte", description: "Smooth espresso with steamed milk. Hot or iced.", price: 219, categoryId: "coffees", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-latte", 400, 400) },
  { id: "15", name: "Cold Coffee", description: "Blended cold coffee with ice cream and chocolate.", price: 229, categoryId: "coffees", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-cold-coffee", 400, 400) },
  { id: "16", name: "Espresso", description: "Single or double shot. Rich and intense.", price: 149, categoryId: "coffees", isVeg: true, isPopular: false, imageUrl: PICSUM("menu-espresso", 400, 400) },
  { id: "17", name: "Red Velvet Cake", description: "Classic red velvet slice with cream cheese frosting.", price: 279, categoryId: "cakes", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-red-velvet", 400, 400) },
  { id: "18", name: "New York Cheesecake", description: "Dense, creamy cheesecake with berry compote.", price: 299, categoryId: "cakes", isVeg: true, isPopular: true, imageUrl: PICSUM("menu-cheesecake", 400, 400) },
  { id: "19", name: "Chocolate Truffle", description: "Rich chocolate cake with ganache and truffle layers.", price: 259, categoryId: "cakes", isVeg: true, isPopular: false, imageUrl: PICSUM("menu-truffle", 400, 400) },
];

export const sampleCatalogItems = [
  { id: "1", title: "Classic White Sneakers", subtitle: "Unisex, all-season", price: 2499, category: "Footwear", type: "Bestseller", rating: 4.8, imageUrl: PICSUM("catalog-sneakers", 400, 400), description: "Premium comfort sneakers for everyday wear. Lightweight, breathable, and available in multiple sizes." },
  { id: "2", title: "Minimalist Backpack", subtitle: "Water-resistant, 20L", price: 1899, category: "Bags", type: "New arrival", rating: 4.6, imageUrl: PICSUM("catalog-backpack", 400, 400), description: "Sleek design with laptop sleeve and multiple compartments. Ideal for work and travel." },
  { id: "3", title: "Wireless Earbuds", subtitle: "30hr battery, ANC", price: 3499, category: "Electronics", type: "Bestseller", rating: 4.7, imageUrl: PICSUM("catalog-earbuds", 400, 400), description: "Active noise cancellation, premium sound. Touch controls and wireless charging case." },
  { id: "4", title: "Cotton Oversized Tee", subtitle: "Organic cotton", price: 899, category: "Apparel", type: "New arrival", rating: 4.5, imageUrl: PICSUM("catalog-tee", 400, 400), description: "100% organic cotton, relaxed fit. Sustainable and comfortable for all-day wear." },
  { id: "5", title: "Smart Watch Pro", subtitle: "Health & fitness tracking", price: 4999, category: "Electronics", type: "Bestseller", rating: 4.9, imageUrl: PICSUM("catalog-watch", 400, 400), description: "Track heart rate, sleep, and workouts. Water-resistant with 7-day battery life." },
  { id: "6", title: "Leather Card Holder", subtitle: "Handcrafted", price: 1299, category: "Accessories", type: "Standard", rating: 4.4, imageUrl: PICSUM("catalog-cardholder", 400, 400), description: "Genuine leather, slim profile. Holds cards and notes with a timeless finish." },
];

export const sampleAgencyProjects = [
  { id: "1", title: "Brand Refresh — TechCorp", tag: "Branding", result: "+40% engagement", imageUrl: PICSUM("agency-branding") },
  { id: "2", title: "Social Campaign — Fashion Week", tag: "Social", result: "2M reach", imageUrl: PICSUM("agency-social") },
  { id: "3", title: "Website Redesign — HealthPlus", tag: "Digital", result: "3x conversions", imageUrl: PICSUM("agency-digital") },
  { id: "4", title: "Product Launch — EcoStore", tag: "Campaign", result: "Sold out in 48hrs", imageUrl: PICSUM("agency-campaign") },
];

// Agency & Studio gallery — professional portfolio images
export const sampleAgencyGallery = [
  { id: "g1", imageUrl: PICSUM("gallery-1", 600, 400), title: "Brand identity — Tech startup", category: "Branding" },
  { id: "g2", imageUrl: PICSUM("gallery-2", 600, 500), title: "Campaign visuals — Fashion Week", category: "Campaign" },
  { id: "g3", imageUrl: PICSUM("gallery-3", 600, 400), title: "Website hero — Health & wellness", category: "Digital" },
  { id: "g4", imageUrl: PICSUM("gallery-4", 600, 500), title: "Packaging design — Organic food", category: "Print" },
  { id: "g5", imageUrl: PICSUM("gallery-5", 600, 400), title: "Social content — Lifestyle brand", category: "Social" },
  { id: "g6", imageUrl: PICSUM("gallery-6", 600, 500), title: "App UI — Fitness platform", category: "Digital" },
  { id: "g7", imageUrl: PICSUM("gallery-7", 600, 400), title: "Logo & stationery — Law firm", category: "Branding" },
  { id: "g8", imageUrl: PICSUM("gallery-8", 600, 500), title: "Editorial layout — Magazine", category: "Print" },
  { id: "g9", imageUrl: PICSUM("gallery-9", 600, 400), title: "Product launch — E-commerce", category: "Campaign" },
];

// Professional Portfolio demo — suits Legal, Consulting, Coaching, B2B
export const samplePortfolioBusinessInfo = {
  name: "Alex Morgan",
  title: "Partner, Legal & Advisory",
  tagline: "Corporate law, compliance, and strategic advisory for businesses and leaders.",
  bio: "15+ years advising listed companies, startups, and boards on corporate law, M&A, regulatory compliance, and governance. Former in-house counsel at a Fortune 500; now partner at Morgan & Associates.",
  address: "Tower A, 12th Floor, Connaught Place, New Delhi 110001",
  phone: "+91 98765 43210",
  whatsapp: "+919876543210",
  email: "alex.morgan@morganadvisory.in",
  website: "www.morganadvisory.in",
  mapQuery: "Tower A Connaught Place New Delhi 110001",
  mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=77.208%2C28.628%2C77.218%2C28.638&layer=mapnik&marker=28.633%2C77.213",
  profileImageUrl: PICSUM("portfolio-profile", 400, 400),
};

export const samplePortfolioPracticeAreas = [
  { id: "1", name: "Corporate Law & M&A", description: "Mergers, acquisitions, due diligence, and corporate restructuring." },
  { id: "2", name: "Regulatory & Compliance", description: "SEBI, RBI, company law, and sector-specific compliance." },
  { id: "3", name: "Governance & Advisory", description: "Board advisory, policies, and governance frameworks." },
  { id: "4", name: "Contracts & Commercial", description: "Commercial contracts, partnerships, and negotiations." },
];

export const samplePortfolioExperience = [
  { id: "1", title: "M&A Advisory — Tech Corp acquisition", category: "Corporate", year: "2024", summary: "Lead legal counsel for cross-border acquisition." },
  { id: "2", title: "Compliance Program — FMCG major", category: "Compliance", year: "2024", summary: "Group-wide compliance and training rollout." },
  { id: "3", title: "Board Advisory — Listed company", category: "Governance", year: "2023", summary: "Governance review and board training." },
  { id: "4", title: "Strategic partnership — Fintech", category: "Commercial", year: "2023", summary: "Structuring and negotiation of JV." },
];

export const samplePortfolioProjects = [
  { id: "1", title: "Due Diligence — Tech M&A", client: "Confidential", year: "2024", role: "Lead Counsel", description: "Full legal due diligence for cross-border acquisition.", url: "", imageUrl: "", technologies: "", deliverables: "DD report, risk matrix", outcome: "Deal closed on schedule." },
  { id: "2", title: "Compliance Framework", client: "FMCG Major", year: "2024", role: "Advisor", description: "Group-wide compliance program design and rollout.", url: "", imageUrl: "", technologies: "", deliverables: "Policies, training", outcome: "Zero non-compliance in audit." },
];

export const samplePortfolioTestimonials = [
  { id: "1", quote: "Alex provided clear, practical advice that helped us close the deal on time.", author: "CFO, Tech startup", role: "M&A client" },
  { id: "2", quote: "Professional, responsive, and deeply knowledgeable on compliance.", author: "Legal Head, FMCG", role: "Compliance engagement" },
];

export const sampleBusinessInfo = {
  name: "The Garden Café",
  tagline: "Fresh • Local • Delicious — Dine-in • Takeaway • Delivery",
  address: "123 Main Street, City 400001",
  phone: "+91 98765 43210",
  email: "hello@sample.com",
  whatsapp: "+919876543210",
  openingHours: "Mon–Sun: 11:00 AM – 11:00 PM",
  website: "www.thegardencafe.in",
  mapQuery: "123 Main Street City 400001",
  mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=72.868%2C19.058%2C72.888%2C19.078&layer=mapnik&marker=19.068%2C72.878",
};

// Reviews for Food Mall / Restaurant menu demo (name, stars, message)
export const sampleMenuReviews = [
  { id: "r1", name: "Priya S.", stars: 5, message: "Amazing food and quick service. The Butter Chicken and Cappuccino are must-tries!" },
  { id: "r2", name: "Rahul M.", stars: 5, message: "Best café in the area. Cozy ambience and the Red Velvet Cake is divine." },
  { id: "r3", name: "Anita K.", stars: 4, message: "Great variety in the menu. Veg options are delicious. Would recommend the Paneer Tikka." },
  { id: "r4", name: "Vikram D.", stars: 5, message: "Consistently good quality. Order online often—always on time and packed well." },
  { id: "r5", name: "Neha R.", stars: 4, message: "Loved the Coffees section. Latte and Cold Coffee are perfect. Friendly staff." },
];

// Product Catalog (Retail) demo — store info with map & contact for floating icons
export const sampleCatalogBusinessInfo = {
  name: "Premium Store",
  tagline: "Curated quality • Fast delivery • Trusted by thousands",
  address: "45 Retail Avenue, Bandra West, Mumbai 400050",
  phone: "+91 98765 43210",
  email: "hello@premiumstore.in",
  whatsapp: "+919876543210",
  openingHours: "Mon–Sat: 10:00 AM – 9:00 PM, Sun: 11:00 AM – 7:00 PM",
  website: "www.premiumstore.in",
  mapQuery: "45 Retail Avenue Bandra West Mumbai 400050",
  mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=72.822%2C19.058%2C72.842%2C19.078&layer=mapnik&marker=19.068%2C72.832",
};

// Food Mall demo — restaurants, cafes, food courts, cloud kitchens, takeaways (all food businesses)
export const sampleFoodMallBusinessInfo = {
  name: "Grand Food Court",
  tagline: "Multi-cuisine • Dine-in • Takeaway • Delivery",
  address: "Level 1, Mall of India, Sector 18, Noida 201301",
  phone: "+91 98765 43210",
  email: "hello@grandfoodcourt.in",
  whatsapp: "+919876543210",
  openingHours: "Mon–Sun: 10:00 AM – 10:00 PM",
  website: "www.grandfoodcourt.in",
  mapQuery: "Mall of India Sector 18 Noida 201301",
  mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=77.318%2C28.568%2C77.338%2C28.588&layer=mapnik&marker=28.578%2C77.328",
  foodImages: [
    FOOD_IMG("food,indian,curry", 201, 600, 400),
    FOOD_IMG("food,cafe,coffee", 202, 600, 400),
    FOOD_IMG("food,chinese,noodles", 203, 600, 400),
    FOOD_IMG("food,dessert,cake", 204, 600, 400),
    PICSUM("gallery-food-mall", 600, 400),
  ],
  socialMedia: {
    facebook: "https://facebook.com/grandfoodcourt",
    instagram: "https://instagram.com/grandfoodcourt",
    twitter: "https://twitter.com/grandfoodcourt",
    website: "https://www.grandfoodcourt.in",
  },
};

export const sampleFoodMallCategories = [
  { id: "all", name: "All", emoji: "🍽️" },
  { id: "north-indian", name: "North Indian", emoji: "🍛" },
  { id: "south-indian", name: "South Indian", emoji: "🥘" },
  { id: "chinese", name: "Chinese", emoji: "🥡" },
  { id: "cafe", name: "Cafe & Beverages", emoji: "☕" },
  { id: "quick-bites", name: "Quick Bites", emoji: "🍔" },
];

export const sampleFoodMallMenuItems = [
  { id: "fm1", name: "Butter Chicken", description: "Tender chicken in rich tomato butter gravy, served with naan.", price: 299, categoryId: "north-indian", isVeg: false, isPopular: true, imageUrl: FOOD_IMG("food,curry,indian", 101, 400, 400) },
  { id: "fm2", name: "Paneer Tikka", description: "Grilled cottage cheese with spices & mint chutney.", price: 249, categoryId: "north-indian", isVeg: true, isPopular: true, imageUrl: FOOD_IMG("food,paneer,indian", 102, 400, 400) },
  { id: "fm3", name: "Dal Makhani", description: "Creamy black lentils, slow-cooked with butter and cream.", price: 199, categoryId: "north-indian", isVeg: true, isPopular: false, imageUrl: FOOD_IMG("food,dal,indian", 103, 400, 400) },
  { id: "fm4", name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling, sambar & chutney.", price: 149, categoryId: "south-indian", isVeg: true, isPopular: true, imageUrl: FOOD_IMG("food,dosa,indian", 104, 400, 400) },
  { id: "fm5", name: "Idli Sambar", description: "Steamed rice cakes with lentil sambar and coconut chutney.", price: 99, categoryId: "south-indian", isVeg: true, isPopular: true, imageUrl: FOOD_IMG("food,idli,indian", 105, 400, 400) },
  { id: "fm6", name: "Vada", description: "Crispy lentil donuts with sambar and chutney.", price: 79, categoryId: "south-indian", isVeg: true, isPopular: false, imageUrl: FOOD_IMG("food,vada,indian", 106, 400, 400) },
  { id: "fm7", name: "Hakka Noodles", description: "Stir-fried noodles with vegetables and soy sauce.", price: 199, categoryId: "chinese", isVeg: true, isPopular: true, imageUrl: FOOD_IMG("food,noodles,chinese", 107, 400, 400) },
  { id: "fm8", name: "Chicken Manchurian", description: "Crispy chicken in spicy-sweet Manchurian sauce.", price: 279, categoryId: "chinese", isVeg: false, isPopular: true, imageUrl: FOOD_IMG("food,chicken,chinese", 108, 400, 400) },
  { id: "fm9", name: "Veg Spring Rolls", description: "Crispy rolls stuffed with vegetables, served with sauce.", price: 149, categoryId: "chinese", isVeg: true, isPopular: false, imageUrl: FOOD_IMG("food,springroll,vegetables", 109, 400, 400) },
  { id: "fm10", name: "Cappuccino", description: "Double shot espresso with steamed milk and foam.", price: 149, categoryId: "cafe", isVeg: true, isPopular: true, imageUrl: FOOD_IMG("food,coffee,cappuccino", 110, 400, 400) },
  { id: "fm11", name: "Fresh Lime Soda", description: "House-made with mint & black salt.", price: 79, categoryId: "cafe", isVeg: true, isPopular: true, imageUrl: FOOD_IMG("food,drink,beverage", 111, 400, 400) },
  { id: "fm12", name: "Chocolate Brownie", description: "Warm brownie with vanilla ice cream.", price: 179, categoryId: "cafe", isVeg: true, isPopular: false, imageUrl: FOOD_IMG("food,brownie,dessert", 112, 400, 400) },
  { id: "fm13", name: "Veg Burger", description: "Crispy patty with lettuce, tomato and mayo.", price: 129, categoryId: "quick-bites", isVeg: true, isPopular: true, imageUrl: FOOD_IMG("food,burger", 113, 400, 400) },
  { id: "fm14", name: "French Fries", description: "Golden crispy fries with seasoning.", price: 99, categoryId: "quick-bites", isVeg: true, isPopular: true, imageUrl: FOOD_IMG("food,fries", 114, 400, 400) },
  { id: "fm15", name: "Pizza Slice", description: "Classic margherita or pepperoni slice.", price: 149, categoryId: "quick-bites", isVeg: false, isPopular: true, imageUrl: FOOD_IMG("food,pizza", 115, 400, 400) },
];

// Agency & Studio demo: professional showcase
export const sampleAgencyBusinessInfo = {
  name: "Studio Nova",
  tagline: "Brand, digital & campaign studio. We help brands stand out.",
  address: "Level 2, Design District, 456 Creative Boulevard, Mumbai 400001",
  phone: "+91 98765 43210",
  email: "hello@studionova.in",
  website: "www.studionova.in",
  mapQuery: "Level 2 Design District 456 Creative Boulevard Mumbai 400001",
  heroImageUrl: PICSUM("agency-hero", 800, 400),
  // OpenStreetMap embed (Mumbai — Design District area), no API key
  mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=72.867%2C19.066%2C72.888%2C19.086&layer=mapnik&marker=19.076%2C72.8777",
};

// Creative & Design businesses: catalog of services/offerings (graphic, logo, print, UI/UX, illustration)
export const CREATIVE_DESIGN_CATEGORIES = [
  { id: "all", name: "All" },
  { id: "logo-branding", name: "Logo & Branding" },
  { id: "print-packaging", name: "Print & Packaging" },
  { id: "digital-ui", name: "Digital & UI/UX" },
  { id: "illustration", name: "Illustration" },
  { id: "social-content", name: "Social & Content" },
] as const;

export type CreativeDesignCategoryId = (typeof CREATIVE_DESIGN_CATEGORIES)[number]["id"];

export const CREATIVE_DESIGN_SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "newest", label: "Newest" },
  { id: "popular", label: "Most Popular" },
  { id: "category-asc", label: "Category: A to Z" },
  { id: "category-desc", label: "Category: Z to A" },
  { id: "item-asc", label: "Item: A to Z" },
  { id: "item-desc", label: "Item: Z to A" },
  { id: "delivery-fast", label: "Delivery: Fastest first" },
  { id: "revisions-most", label: "Revisions: Most first" },
] as const;

export interface CreativeDesignItem {
  id: string;
  title: string;
  categoryId: string;
  shortDesc: string;
  longDesc: string;
  price: number | null;
  imageUrl?: string;
  isPopular: boolean;
  isNew: boolean;
  deliveryDays?: string;
  revisions?: string;
}

export const sampleCreativeDesignItems: CreativeDesignItem[] = [
  {
    id: "1",
    title: "Logo & Brand Identity",
    categoryId: "logo-branding",
    shortDesc: "Custom logo, color palette, and basic brand guidelines.",
    longDesc: "A complete brand identity package: custom logo design (3 concepts), primary and secondary color palette, typography recommendations, and a simple brand guidelines PDF. Ideal for startups and small businesses. Includes 2 revision rounds.",
    price: 14999,
    imageUrl: PICSUM("creative-logo"),
    isPopular: true,
    isNew: false,
    deliveryDays: "7–10 days",
    revisions: "2 rounds",
  },
  {
    id: "2",
    title: "Social Media Pack",
    categoryId: "social-content",
    shortDesc: "10 posts + stories template for Instagram/LinkedIn.",
    longDesc: "10 ready-to-use social creatives (feed + stories) with your brand colors and copy. Includes a reusable Canva-style template. Perfect for product launches or campaigns.",
    price: 4999,
    imageUrl: PICSUM("creative-social"),
    isPopular: true,
    isNew: true,
    deliveryDays: "3–5 days",
    revisions: "1 round",
  },
  {
    id: "3",
    title: "Packaging Design",
    categoryId: "print-packaging",
    shortDesc: "Print-ready packaging design for box or pouch.",
    longDesc: "Professional packaging design for one product (box, pouch, or label). Print-ready files (CMYK, bleed). Optional 3D mockup. Suitable for FMCG, F&B, and gifting.",
    price: 8999,
    imageUrl: PICSUM("creative-packaging"),
    isPopular: false,
    isNew: false,
    deliveryDays: "10–14 days",
    revisions: "2 rounds",
  },
  {
    id: "4",
    title: "Website UI Design",
    categoryId: "digital-ui",
    shortDesc: "Up to 5 key screens, desktop + mobile.",
    longDesc: "UI design for 5 main screens (e.g. Home, About, Services, Contact, one inner page). Desktop and mobile layouts. Style guide and component notes for handoff to developers.",
    price: 24999,
    imageUrl: PICSUM("creative-ui"),
    isPopular: true,
    isNew: false,
    deliveryDays: "14–21 days",
    revisions: "2 rounds",
  },
  {
    id: "5",
    title: "Illustration Set",
    categoryId: "illustration",
    shortDesc: "5 custom illustrations in your style.",
    longDesc: "Five custom illustrations (icons, characters, or scenes) in a consistent style. Delivered in SVG/PNG. Great for apps, books, or marketing.",
    price: null,
    imageUrl: PICSUM("creative-illustration"),
    isPopular: false,
    isNew: true,
    deliveryDays: "7–14 days",
    revisions: "2 rounds",
  },
  {
    id: "6",
    title: "Business Card & Letterhead",
    categoryId: "print-packaging",
    shortDesc: "Print-ready business card + letterhead design.",
    longDesc: "Elegant business card (front + back) and matching letterhead. Print-ready PDF with bleed. Optional envelope design.",
    price: 2999,
    imageUrl: PICSUM("creative-businesscard"),
    isPopular: false,
    isNew: false,
    deliveryDays: "3–5 days",
    revisions: "1 round",
  },
  {
    id: "7",
    title: "Brand Guidelines Book",
    categoryId: "logo-branding",
    shortDesc: "Full brand book: logo usage, colors, typography.",
    longDesc: "Comprehensive brand guidelines: logo lockups, clear space, don'ts, color specs (hex, CMYK, RGB), typography, tone of voice, and application examples. PDF + optional print version.",
    price: 19999,
    imageUrl: PICSUM("creative-brandbook"),
    isPopular: false,
    isNew: false,
    deliveryDays: "14–21 days",
    revisions: "2 rounds",
  },
  {
    id: "8",
    title: "App Icon & Splash",
    categoryId: "digital-ui",
    shortDesc: "App icon (all sizes) + splash screen design.",
    longDesc: "App icon in all required sizes (iOS & Android) and a splash screen. Includes adaptive icon variants. Delivered as PNG and vector.",
    price: 6999,
    imageUrl: PICSUM("creative-appicon"),
    isPopular: false,
    isNew: true,
    deliveryDays: "5–7 days",
    revisions: "2 rounds",
  },
];

// Creative & Design demo business info (for footer, WhatsApp)
export const sampleCreativeDesignBusinessInfo = {
  name: "Pixel Craft Studio",
  tagline: "Logo, brand, print & digital design for businesses.",
  phone: "+91 98765 43210",
  whatsapp: "+919876543210",
  email: "hello@pixelcraft.in",
  address: "Design Hub, 78 Creative Lane, Bangalore 560001",
  mapQuery: "Design Hub 78 Creative Lane Bangalore 560001",
  // OpenStreetMap embed (Bangalore — Design Hub area), no API key
  mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=77.584%2C12.966%2C77.605%2C12.978&layer=mapnik&marker=12.9716%2C77.5946",
};
