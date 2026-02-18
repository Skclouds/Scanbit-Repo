/**
 * Menu module business config. Kept in a separate file to avoid circular imports
 * (components must not import from the barrel index that loads them).
 */

export const BUSINESS_CONFIGS = {
  restaurant: {
    categoryLabel: 'Menu Category',
    categoryLabelPlural: 'Menu Categories',
    itemLabel: 'Menu Item',
    itemLabelPlural: 'Menu Items',
    pageTitle: 'Menu Management',
    defaultEmoji: '🍽️',
    icon: 'MdRestaurantMenu',
    categoryPlaceholder: 'e.g., Appetizers, Main Course, Desserts',
    itemNamePlaceholder: 'e.g., Butter Chicken, Caesar Salad',
    itemDescPlaceholder: 'Describe the dish, ingredients, taste...',
    pricePlaceholder: 'Price per serving',
    showVegOption: true,
    showSpicyOption: true,
    showCalories: true,
    showServingSize: true,
    showAllergens: true,
    showPrepTime: true,
    priceLabel: 'Price',
    descriptionLabel: 'Description',
    noCategoriesMessage: 'Create your first menu category to organize your dishes',
    noItemsMessage: 'Add your first menu item to start building your menu',
    addCategoryText: 'Add Menu Category',
    addItemText: 'Add Menu Item',
  },
  retail: {
    categoryLabel: 'Product Category',
    categoryLabelPlural: 'Product Categories',
    itemLabel: 'Product',
    itemLabelPlural: 'Products',
    pageTitle: 'Product Catalog',
    defaultEmoji: '📦',
    icon: 'MdShoppingBag',
    categoryPlaceholder: 'e.g., Electronics, Clothing, Home Decor',
    itemNamePlaceholder: 'e.g., Wireless Headphones, Cotton T-Shirt',
    itemDescPlaceholder: 'Describe the product, features, specifications...',
    pricePlaceholder: 'Selling price',
    showVegOption: false,
    showSpicyOption: false,
    showCalories: false,
    showServingSize: false,
    showAllergens: false,
    showPrepTime: false,
    showStock: true,
    showSKU: true,
    showBrand: true,
    priceLabel: 'Price',
    descriptionLabel: 'Product Description',
    noCategoriesMessage: 'Create your first product category to organize your inventory',
    noItemsMessage: 'Add your first product to start building your catalog',
    addCategoryText: 'Add Product Category',
    addItemText: 'Add Product',
  },
  creative: {
    categoryLabel: 'Service Category',
    categoryLabelPlural: 'Service Categories',
    itemLabel: 'Service',
    itemLabelPlural: 'Services',
    pageTitle: 'Catalog',
    defaultEmoji: '🎨',
    icon: 'MdBrush',
    categoryPlaceholder: 'e.g., Logo Design, Web Design, Illustration',
    itemNamePlaceholder: 'e.g., Brand Identity, Social Media Kit',
    itemDescPlaceholder: 'Describe the service, deliverables, and outcome...',
    pricePlaceholder: 'Starting price',
    showVegOption: false,
    showSpicyOption: false,
    showCalories: false,
    showServingSize: false,
    showAllergens: false,
    showPrepTime: false,
    showClient: true,
    showYear: true,
    showTools: true,
    priceLabel: 'Starting Price',
    descriptionLabel: 'Service Description',
    noCategoriesMessage: 'Create your first service category to organize your offerings',
    noItemsMessage: 'Add your first service to build your catalog',
    addCategoryText: 'Add Service Category',
    addItemText: 'Add Service',
  },
  agency: {
    categoryLabel: 'Service Category',
    categoryLabelPlural: 'Service Categories',
    itemLabel: 'Service',
    itemLabelPlural: 'Services',
    pageTitle: 'Agency Portfolio',
    defaultEmoji: '🚀',
    icon: 'MdBrush',
    categoryPlaceholder: 'e.g., Digital Marketing, SEO, Social Media',
    itemNamePlaceholder: 'e.g., Monthly SEO Package, Ad Campaign',
    itemDescPlaceholder: 'Describe the service, deliverables, and impact...',
    pricePlaceholder: 'Starting price',
    showVegOption: false,
    showSpicyOption: false,
    showCalories: false,
    showServingSize: false,
    showAllergens: false,
    showPrepTime: false,
    showClient: true,
    showDuration: true,
    priceLabel: 'Starting Price',
    descriptionLabel: 'Service Description',
    noCategoriesMessage: 'Create your first service category to organize your agency offerings',
    noItemsMessage: 'Add your first service to start building your professional portfolio',
    addCategoryText: 'Add Service Category',
    addItemText: 'Add Service',
  },
  professional: {
    categoryLabel: 'Service Category',
    categoryLabelPlural: 'Service Categories',
    itemLabel: 'Service',
    itemLabelPlural: 'Services',
    pageTitle: 'Services',
    defaultEmoji: '💼',
    icon: 'MdWork',
    categoryPlaceholder: 'e.g., Consulting, Legal, Accounting',
    itemNamePlaceholder: 'e.g., Business Consultation, Tax Filing',
    itemDescPlaceholder: 'Describe the service, what\'s included, duration...',
    pricePlaceholder: 'Service fee',
    showVegOption: false,
    showSpicyOption: false,
    showCalories: false,
    showServingSize: false,
    showAllergens: false,
    showPrepTime: false,
    showDuration: true,
    showDeliverables: true,
    priceLabel: 'Service Fee',
    descriptionLabel: 'Service Description',
    noCategoriesMessage: 'Create your first service category to organize your offerings',
    noItemsMessage: 'Add your first service to start listing your offerings',
    addCategoryText: 'Add Service Category',
    addItemText: 'Add Service',
  },
  wellness: {
    categoryLabel: 'Wellness Category',
    categoryLabelPlural: 'Wellness Categories',
    itemLabel: 'Service/Treatment',
    itemLabelPlural: 'Services & Treatments',
    pageTitle: 'Wellness Menu',
    defaultEmoji: '🌿',
    icon: 'MdDevices',
    categoryPlaceholder: 'e.g., Spa, Yoga, Medical, Therapy',
    itemNamePlaceholder: 'e.g., Deep Tissue Massage, Consultation',
    itemDescPlaceholder: 'Describe the treatment, benefits, duration...',
    pricePlaceholder: 'Session fee',
    showVegOption: false,
    showSpicyOption: false,
    showCalories: false,
    showServingSize: false,
    showAllergens: false,
    showPrepTime: false,
    showDuration: true,
    showExpertise: true,
    priceLabel: 'Session Fee',
    descriptionLabel: 'Treatment Description',
    noCategoriesMessage: 'Create your first wellness category to organize your services',
    noItemsMessage: 'Add your first service or treatment to start building your menu',
    addCategoryText: 'Add Wellness Category',
    addItemText: 'Add Service/Treatment',
  },
} as const;

export type BusinessType = keyof typeof BUSINESS_CONFIGS;
export type BusinessConfig = typeof BUSINESS_CONFIGS[BusinessType];

export const getBusinessConfig = (businessCategory?: string, businessType?: string): BusinessConfig => {
  const category = (businessCategory || '').toLowerCase();
  const type = (businessType || '').toLowerCase();
  const combined = `${category} ${type}`;
  if (
    category === 'agencies & studios' ||
    combined.includes('agency') ||
    combined.includes('marketing') ||
    combined.includes('advert') ||
    combined.includes('studios')
  ) {
    return BUSINESS_CONFIGS.agency;
  }
  if (combined.includes('creative') || combined.includes('design')) {
    return BUSINESS_CONFIGS.creative;
  }
  if (combined.includes('retail') || combined.includes('e-commerce') || combined.includes('store') || combined.includes('shop') || combined.includes('boutique')) {
    return BUSINESS_CONFIGS.retail;
  }
  if (combined.includes('professional') || combined.includes('consult') || combined.includes('legal') || combined.includes('account') || combined.includes('service')) {
    return BUSINESS_CONFIGS.professional;
  }
  if (combined.includes('health') || combined.includes('wellness') || combined.includes('medical') || combined.includes('clinic') || combined.includes('spa') || combined.includes('yoga')) {
    return BUSINESS_CONFIGS.wellness;
  }
  return BUSINESS_CONFIGS.restaurant;
};

export const getBusinessType = (businessCategory?: string, businessType?: string): BusinessType => {
  const config = getBusinessConfig(businessCategory, businessType);
  if (config === BUSINESS_CONFIGS.agency) return 'agency';
  if (config === BUSINESS_CONFIGS.creative) return 'creative';
  if (config === BUSINESS_CONFIGS.retail) return 'retail';
  if (config === BUSINESS_CONFIGS.professional) return 'professional';
  if (config === BUSINESS_CONFIGS.wellness) return 'wellness';
  return 'restaurant';
};
