import mongoose from 'mongoose';
import FAQ from '../models/FAQ.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Comprehensive FAQs for ScanBit
const faqs = [
  // General FAQs
  {
    question: "What is ScanBit?",
    answer: "ScanBit is a comprehensive digital menu solution that allows restaurants to create, manage, and display their menus through QR codes. Customers can scan the QR code with their smartphones to view your menu instantly, without needing to download any app.",
    category: "general",
    tags: ["scanbit", "overview", "introduction"],
    isPublished: true,
    isFeatured: true,
    order: 1
  },
  {
    question: "How do QR code menus work?",
    answer: "QR code menus work by generating a unique QR code for your restaurant. When customers scan this code with their smartphone camera, they're instantly taken to your digital menu. The menu is hosted online and can be updated in real-time, so changes appear immediately for all customers.",
    category: "general",
    tags: ["qr-code", "how-it-works", "basics"],
    isPublished: true,
    isFeatured: true,
    order: 2
  },
  {
    question: "Do customers need to download an app?",
    answer: "No! Customers don't need to download any app. They simply scan the QR code with their phone's built-in camera (available on iOS 11+ and Android 8+), and the menu opens directly in their web browser.",
    category: "general",
    tags: ["customers", "app", "no-download"],
    isPublished: true,
    isFeatured: true,
    order: 3
  },
  {
    question: "Is ScanBit free to use?",
    answer: "ScanBit offers multiple pricing plans to suit different needs. We have a free plan with basic features, and paid plans with advanced features like custom branding, analytics, and priority support. Check our pricing page for detailed information.",
    category: "general",
    tags: ["pricing", "free", "plans"],
    isPublished: true,
    isFeatured: false,
    order: 4
  },
  {
    question: "Can I use ScanBit for multiple restaurants?",
    answer: "Yes! Depending on your plan, you can manage multiple restaurants from a single account. Each restaurant gets its own unique QR code and menu. Higher-tier plans offer multi-location management features.",
    category: "general",
    tags: ["multiple-restaurants", "multi-location", "management"],
    isPublished: true,
    isFeatured: false,
    order: 5
  },

  // Getting Started / Account FAQs
  {
    question: "How do I create my account?",
    answer: "Creating an account is simple! Visit our sign-up page, enter your email address, create a password, and provide basic information about your restaurant. You'll receive a verification email to activate your account.",
    category: "account",
    tags: ["signup", "registration", "account-creation"],
    isPublished: true,
    isFeatured: true,
    order: 1
  },
  {
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page, enter your email address, and you'll receive a password reset link. Click the link in the email to create a new password. The link expires after 24 hours for security.",
    category: "account",
    tags: ["password", "reset", "security"],
    isPublished: true,
    isFeatured: false,
    order: 2
  },
  {
    question: "Can I change my restaurant name or email?",
    answer: "Yes, you can update your restaurant information at any time. Go to Settings > Account Information to change your restaurant name, email, phone number, and other details. Changes take effect immediately.",
    category: "account",
    tags: ["profile", "settings", "update"],
    isPublished: true,
    isFeatured: false,
    order: 3
  },
  {
    question: "How do I delete my account?",
    answer: "To delete your account, go to Settings > Account Settings > Delete Account. This action is permanent and will delete all your menus, QR codes, and data. Please contact support if you need assistance or want to export your data first.",
    category: "account",
    tags: ["delete", "account", "data"],
    isPublished: true,
    isFeatured: false,
    order: 4
  },

  // Menu Management FAQs
  {
    question: "How do I add items to my menu?",
    answer: "Navigate to Menu Management > Add Item. Fill in the item name, description, price, and category. You can also upload images, add dietary information, and set availability. Click 'Save' to add the item to your menu.",
    category: "features",
    tags: ["menu", "add-items", "management"],
    isPublished: true,
    isFeatured: true,
    order: 1
  },
  {
    question: "Can I organize items into categories?",
    answer: "Absolutely! Categories help organize your menu. Create categories like 'Appetizers', 'Main Courses', 'Desserts', etc. You can drag and drop items between categories or reorder them within categories.",
    category: "features",
    tags: ["categories", "organization", "menu-structure"],
    isPublished: true,
    isFeatured: true,
    order: 2
  },
  {
    question: "How do I update menu prices?",
    answer: "Go to Menu Management, find the item you want to update, click 'Edit', change the price, and save. The new price appears immediately on your digital menu. No need to reprint QR codes!",
    category: "features",
    tags: ["prices", "update", "menu"],
    isPublished: true,
    isFeatured: true,
    order: 3
  },
  {
    question: "Can I mark items as out of stock?",
    answer: "Yes! You can mark any item as 'Unavailable' or 'Out of Stock' with one click. The item will be grayed out on the menu with an 'Out of Stock' label. Simply toggle it back on when the item is available again.",
    category: "features",
    tags: ["availability", "out-of-stock", "inventory"],
    isPublished: true,
    isFeatured: false,
    order: 4
  },
  {
    question: "How do I add images to menu items?",
    answer: "When creating or editing a menu item, click 'Upload Image' in the image section. You can upload JPG, PNG, or WebP images. We recommend images at least 800x600 pixels for best quality. Images are automatically optimized for fast loading.",
    category: "features",
    tags: ["images", "photos", "upload"],
    isPublished: true,
    isFeatured: false,
    order: 5
  },
  {
    question: "Can I add dietary information (vegan, gluten-free, etc.)?",
    answer: "Yes! When editing an item, you can add dietary tags like 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Spicy', etc. These tags appear as badges on your menu, helping customers make informed choices.",
    category: "features",
    tags: ["dietary", "allergens", "tags"],
    isPublished: true,
    isFeatured: false,
    order: 6
  },
  {
    question: "How do I duplicate a menu item?",
    answer: "Find the item you want to duplicate, click the three-dot menu, and select 'Duplicate'. This creates an exact copy that you can then modify. This is great for creating variations of similar items.",
    category: "features",
    tags: ["duplicate", "copy", "menu-items"],
    isPublished: true,
    isFeatured: false,
    order: 7
  },

  // QR Code FAQs
  {
    question: "How do I generate my QR code?",
    answer: "After creating your menu, go to QR Codes section and click 'Generate QR Code'. Your unique QR code is created instantly. You can customize colors, add your logo, and choose from different styles before downloading.",
    category: "features",
    tags: ["qr-code", "generate", "download"],
    isPublished: true,
    isFeatured: true,
    order: 1
  },
  {
    question: "Can I customize my QR code?",
    answer: "Yes! Pro and higher plans allow QR code customization. You can change colors, add your logo, choose frame styles, and adjust error correction levels. Customized QR codes still work perfectly with all smartphones.",
    category: "features",
    tags: ["customize", "branding", "qr-code"],
    isPublished: true,
    isFeatured: true,
    order: 2
  },
  {
    question: "What file formats can I download my QR code in?",
    answer: "You can download your QR code in multiple formats: PNG (for digital use), SVG (vector, scalable), PDF (for printing), and EPS (for professional printing). Each format is optimized for its intended use.",
    category: "features",
    tags: ["download", "formats", "printing"],
    isPublished: true,
    isFeatured: false,
    order: 3
  },
  {
    question: "Do I need to regenerate my QR code when I update my menu?",
    answer: "No! Your QR code stays the same even when you update your menu. The code links to your menu URL, so all changes appear automatically. You only need to regenerate if you want a new design or if you're switching plans.",
    category: "features",
    tags: ["qr-code", "updates", "menu-changes"],
    isPublished: true,
    isFeatured: true,
    order: 4
  },
  {
    question: "What size should I print my QR code?",
    answer: "We recommend printing QR codes at least 2x2 inches (5x5 cm) for easy scanning. The code should be printed clearly with good contrast. Test scan the printed code before placing it on tables to ensure it works properly.",
    category: "features",
    tags: ["printing", "size", "best-practices"],
    isPublished: true,
    isFeatured: false,
    order: 5
  },
  {
    question: "Can I have multiple QR codes for different menus?",
    answer: "Yes! You can create multiple menus (e.g., Breakfast Menu, Lunch Menu, Dinner Menu) and generate separate QR codes for each. This is useful for restaurants that change menus throughout the day.",
    category: "features",
    tags: ["multiple-menus", "qr-codes", "organization"],
    isPublished: true,
    isFeatured: false,
    order: 6
  },

  // Billing & Subscription FAQs
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, UPI, and bank transfers. All payments are processed securely through our payment partners.",
    category: "billing",
    tags: ["payment", "methods", "billing"],
    isPublished: true,
    isFeatured: true,
    order: 1
  },
  {
    question: "How does billing work?",
    answer: "Billing is done on a monthly or annual basis, depending on your plan. You'll be charged automatically at the beginning of each billing cycle. You can view your billing history and download invoices from the Billing section.",
    category: "billing",
    tags: ["billing", "subscription", "payment"],
    isPublished: true,
    isFeatured: true,
    order: 2
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and you'll be charged a prorated amount. Downgrades take effect at the end of your current billing period. Go to Billing > Change Plan to make changes.",
    category: "billing",
    tags: ["upgrade", "downgrade", "plans"],
    isPublished: true,
    isFeatured: true,
    order: 3
  },
  {
    question: "What happens if I cancel my subscription?",
    answer: "If you cancel, you'll continue to have access to your plan features until the end of your current billing period. After that, your account will move to the free plan. Your data and menus are preserved, but some features may be limited.",
    category: "billing",
    tags: ["cancel", "subscription", "downgrade"],
    isPublished: true,
    isFeatured: false,
    order: 4
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for new subscriptions. If you're not satisfied, contact our support team within 30 days of your first payment for a full refund. Refunds for annual plans are prorated based on unused time.",
    category: "billing",
    tags: ["refund", "money-back", "guarantee"],
    isPublished: true,
    isFeatured: false,
    order: 5
  },
  {
    question: "Can I get an invoice for my purchase?",
    answer: "Yes! All invoices are automatically generated and available in your Billing section. You can download PDF invoices at any time. Invoices include all necessary details for accounting and tax purposes.",
    category: "billing",
    tags: ["invoice", "receipt", "billing"],
    isPublished: true,
    isFeatured: false,
    order: 6
  },

  // Technical FAQs
  {
    question: "What browsers are supported?",
    answer: "ScanBit works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. We support the latest two versions of each browser. For the best experience, we recommend using the latest browser version.",
    category: "technical",
    tags: ["browsers", "compatibility", "support"],
    isPublished: true,
    isFeatured: false,
    order: 1
  },
  {
    question: "Do I need an internet connection to use ScanBit?",
    answer: "You need internet to manage your menu and make updates. However, once customers scan the QR code, the menu can work offline if they've visited it before (browser caching). For real-time updates, an internet connection is required.",
    category: "technical",
    tags: ["internet", "offline", "connection"],
    isPublished: true,
    isFeatured: false,
    order: 2
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely! We use industry-standard encryption (SSL/TLS) to protect all data in transit. Your data is stored on secure servers with regular backups. We comply with data protection regulations and never share your information with third parties.",
    category: "technical",
    tags: ["security", "privacy", "data-protection"],
    isPublished: true,
    isFeatured: true,
    order: 3
  },
  {
    question: "Can I export my menu data?",
    answer: "Yes! You can export your menu data in CSV or JSON format from the Settings > Data Export section. This includes all menu items, categories, prices, and settings. Your data always belongs to you.",
    category: "technical",
    tags: ["export", "data", "backup"],
    isPublished: true,
    isFeatured: false,
    order: 4
  },
  {
    question: "What if my QR code isn't scanning?",
    answer: "First, ensure the QR code is printed clearly with good contrast. Make sure it's not damaged or wrinkled. Test with multiple phones. If issues persist, try regenerating the QR code or contact support for assistance.",
    category: "troubleshooting",
    tags: ["qr-code", "scanning", "issues"],
    isPublished: true,
    isFeatured: true,
    order: 1
  },
  {
    question: "Why aren't my menu changes showing up?",
    answer: "Menu changes appear immediately, but customers may need to refresh their browser to see updates. If changes aren't showing: 1) Check that you saved the changes, 2) Clear your browser cache, 3) Try viewing in an incognito/private window.",
    category: "troubleshooting",
    tags: ["updates", "changes", "cache"],
    isPublished: true,
    isFeatured: true,
    order: 2
  },
  {
    question: "My images aren't uploading. What should I do?",
    answer: "Check that your image is in a supported format (JPG, PNG, WebP) and under 10MB. Try compressing the image or using a different browser. If problems persist, contact support with the image details and error message.",
    category: "troubleshooting",
    tags: ["images", "upload", "errors"],
    isPublished: true,
    isFeatured: false,
    order: 3
  },
  {
    question: "I forgot my password. How do I reset it?",
    answer: "Click 'Forgot Password' on the login page and enter your email. You'll receive a password reset link. If you don't receive the email, check your spam folder or contact support. The reset link expires after 24 hours.",
    category: "troubleshooting",
    tags: ["password", "reset", "login"],
    isPublished: true,
    isFeatured: false,
    order: 4
  },

  // Analytics FAQs
  {
    question: "What analytics do you provide?",
    answer: "ScanBit provides comprehensive analytics including: number of scans, unique visitors, popular menu items, peak hours, device types, and geographic data. Higher-tier plans include advanced analytics and custom reports.",
    category: "features",
    tags: ["analytics", "statistics", "reports"],
    isPublished: true,
    isFeatured: true,
    order: 1
  },
  {
    question: "How do I view my menu analytics?",
    answer: "Go to the Analytics section in your dashboard. You'll see an overview of key metrics. Use the date range selector to view data for specific periods. Click on any metric for detailed breakdowns and insights.",
    category: "features",
    tags: ["analytics", "dashboard", "metrics"],
    isPublished: true,
    isFeatured: false,
    order: 2
  },
  {
    question: "Can I export my analytics data?",
    answer: "Yes! You can export analytics data as CSV or PDF reports. Go to Analytics > Reports > Export. This is useful for sharing insights with your team or for record-keeping purposes.",
    category: "features",
    tags: ["analytics", "export", "reports"],
    isPublished: true,
    isFeatured: false,
    order: 3
  }
];

// Knowledge Base Articles
const knowledgeBaseArticles = [
  {
    title: "Getting Started with ScanBit: A Complete Guide",
    slug: "getting-started-complete-guide",
    description: "Learn everything you need to know to get started with ScanBit, from account creation to publishing your first menu.",
    content: `# Getting Started with ScanBit: A Complete Guide

Welcome to ScanBit! This comprehensive guide will walk you through everything you need to know to get your digital menu up and running.

## Step 1: Create Your Account

1. Visit the ScanBit sign-up page
2. Enter your email address and create a secure password
3. Provide your restaurant's basic information:
   - Restaurant name
   - Business type
   - Contact information
4. Verify your email address by clicking the link in your inbox

## Step 2: Complete Your Restaurant Profile

After signing up, complete your restaurant profile:

- **Business Information**: Add your restaurant name, address, phone number, and email
- **Operating Hours**: Set your opening and closing times
- **Logo**: Upload your restaurant logo (recommended size: 500x500px)
- **Cover Image**: Add a cover image for your menu page
- **Social Media**: Link your social media profiles

## Step 3: Create Your First Menu

### Adding Categories

1. Go to **Menu Management** > **Categories**
2. Click **Add Category**
3. Enter category name (e.g., "Appetizers", "Main Courses", "Desserts")
4. Add a description (optional)
5. Upload a category image (optional)
6. Save the category

### Adding Menu Items

1. Navigate to **Menu Management** > **Items**
2. Click **Add Item**
3. Fill in the item details:
   - **Name**: Item name (e.g., "Caesar Salad")
   - **Description**: Detailed description of the item
   - **Price**: Set the price
   - **Category**: Select the appropriate category
   - **Image**: Upload a high-quality image (recommended: 800x600px)
   - **Dietary Tags**: Add tags like "Vegetarian", "Vegan", "Gluten-Free"
   - **Availability**: Set if item is available or out of stock
4. Click **Save**

### Organizing Your Menu

- Drag and drop items to reorder within categories
- Move items between categories by editing the item
- Use the search function to quickly find items

## Step 4: Customize Your Menu Design

1. Go to **Settings** > **Menu Customization**
2. Choose your color scheme
3. Select fonts and text styles
4. Customize layout options
5. Preview your changes
6. Save when satisfied

## Step 5: Generate Your QR Code

1. Navigate to **QR Codes** section
2. Click **Generate QR Code**
3. Customize your QR code (Pro plans):
   - Choose colors
   - Add your logo
   - Select frame style
4. Download in your preferred format:
   - PNG for digital use
   - PDF for printing
   - SVG for scalable graphics

## Step 6: Print and Display

1. Print your QR code at least 2x2 inches (5x5 cm)
2. Ensure good print quality and contrast
3. Place QR codes on:
   - Tables
   - Counter displays
   - Window stickers
   - Takeout menus
4. Test scan before placing

## Step 7: Monitor and Optimize

- Check your analytics regularly
- Monitor popular items
- Update menu based on customer feedback
- Keep prices current
- Mark items out of stock when needed

## Tips for Success

- **Keep it updated**: Regular updates keep customers engaged
- **Use high-quality images**: Good photos increase orders
- **Write clear descriptions**: Help customers make informed choices
- **Organize logically**: Group items in intuitive categories
- **Test regularly**: Scan your QR code to ensure it works

## Next Steps

- Explore advanced features in your plan
- Set up analytics tracking
- Customize your branding
- Create multiple menus for different times
- Integrate with your POS system (if available)

Congratulations! You're now ready to offer a modern, contactless dining experience to your customers.`,
    category: "getting-started",
    tags: ["getting-started", "tutorial", "guide", "basics"],
    isPublished: true,
    isFeatured: true,
    order: 1,
    readingTime: 10
  },
  {
    title: "Menu Management Best Practices",
    slug: "menu-management-best-practices",
    description: "Learn professional tips and best practices for managing your digital menu effectively.",
    content: `# Menu Management Best Practices

Effective menu management is key to a successful digital menu. Here are proven best practices to help you create and maintain an outstanding menu experience.

## Menu Organization

### Category Structure

Create a logical category structure:
- **Appetizers/Starters**
- **Soups & Salads**
- **Main Courses/Entrees**
- **Sides**
- **Desserts**
- **Beverages**
- **Specials** (if applicable)

### Item Ordering

- Place popular items at the top of each category
- Group similar items together
- Use subcategories for large menus
- Highlight specials and featured items

## Content Quality

### Item Names

- Use clear, descriptive names
- Avoid abbreviations customers might not understand
- Include key ingredients in the name when relevant
- Keep names concise but informative

### Descriptions

Write compelling descriptions that:
- Highlight unique ingredients
- Mention preparation methods
- Note portion sizes when relevant
- Include allergen information
- Create appetite appeal

**Example:**
❌ "Chicken dish"
✅ "Grilled Free-Range Chicken Breast - Marinated in herbs and spices, served with roasted vegetables and garlic mashed potatoes"

### Pricing Strategy

- Display prices clearly
- Use consistent formatting (e.g., $12.99 or $13)
- Consider psychological pricing
- Update prices promptly when costs change
- Show value clearly (e.g., "Large - $15.99")

## Visual Elements

### Photography

**Best Practices:**
- Use natural lighting when possible
- Show items from appealing angles
- Include props that enhance the dish
- Maintain consistent style across all photos
- Use high-resolution images (minimum 800x600px)
- Optimize file sizes for fast loading

**What to Avoid:**
- Blurry or dark photos
- Inconsistent styling
- Overly edited images
- Low-resolution photos

### Image Organization

- Use one primary image per item
- Consider adding multiple angles for premium items
- Keep image aspect ratios consistent
- Use alt text for accessibility

## Availability Management

### Real-Time Updates

- Mark items out of stock immediately
- Update availability before service starts
- Use automated inventory if integrated
- Communicate shortages clearly

### Seasonal Items

- Create separate menus for seasonal offerings
- Use tags to highlight seasonal items
- Update descriptions to reflect seasonality
- Remove items when out of season

## Menu Optimization

### Performance Metrics

Track and analyze:
- Most viewed items
- Items with highest engagement
- Items that need better descriptions
- Categories that perform best

### A/B Testing

- Test different item descriptions
- Try different category names
- Experiment with item ordering
- Compare image styles

## Maintenance Schedule

### Daily Tasks

- Update availability
- Check for price changes
- Review new orders/feedback
- Monitor analytics

### Weekly Tasks

- Review and update descriptions
- Check image quality
- Analyze performance metrics
- Update specials

### Monthly Tasks

- Comprehensive menu review
- Update seasonal items
- Refresh images if needed
- Analyze customer feedback
- Review pricing strategy

## Common Mistakes to Avoid

1. **Outdated Information**: Keep prices and availability current
2. **Poor Images**: Invest in quality photography
3. **Vague Descriptions**: Be specific and appealing
4. **Poor Organization**: Use logical categories
5. **Ignoring Analytics**: Use data to improve
6. **Inconsistent Updates**: Maintain regular schedule
7. **Missing Information**: Include dietary tags and allergens

## Advanced Tips

### Menu Psychology

- Place high-margin items prominently
- Use descriptive language that sells
- Create urgency with "Limited Time" tags
- Highlight chef's recommendations

### Multi-Language Support

- Consider translations for diverse customer base
- Use clear icons for universal understanding
- Test readability in different languages

### Accessibility

- Include allergen information
- Use clear, readable fonts
- Provide detailed descriptions
- Consider dietary restrictions

## Conclusion

Effective menu management is an ongoing process. Regular updates, quality content, and attention to detail will help you create a menu that not only informs but also entices customers to order more.

Remember: Your digital menu is often the first impression customers have of your food. Make it count!`,
    category: "menu-management",
    tags: ["menu", "management", "best-practices", "tips"],
    isPublished: true,
    isFeatured: true,
    order: 1,
    readingTime: 12
  },
  {
    title: "QR Code Setup and Printing Guide",
    slug: "qr-code-setup-printing-guide",
    description: "Complete guide to generating, customizing, and printing QR codes for your restaurant.",
    content: `# QR Code Setup and Printing Guide

Your QR code is the gateway to your digital menu. This guide covers everything you need to know about creating, customizing, and printing effective QR codes.

## Generating Your QR Code

### Basic Generation

1. Navigate to **QR Codes** in your dashboard
2. Select the menu you want to link
3. Click **Generate QR Code**
4. Your unique QR code is created instantly
5. Download in your preferred format

### QR Code Types

ScanBit supports different QR code formats:
- **Static QR Code**: Links directly to your menu (most common)
- **Dynamic QR Code**: Allows tracking and analytics (Pro plans)
- **Custom QR Code**: Branded with your logo and colors (Pro+ plans)

## Customization Options

### Color Customization

**Best Practices:**
- Use high contrast colors (dark code on light background or vice versa)
- Ensure colors don't interfere with scanning
- Test with multiple phones before printing
- Maintain at least 30% contrast difference

**Color Combinations:**
- ✅ Black on white (most reliable)
- ✅ Dark blue on light gray
- ✅ Dark green on cream
- ❌ Red on pink (low contrast)
- ❌ Light gray on white (too similar)

### Logo Integration

**Guidelines:**
- Logo should be centered
- Keep logo size to 30% of QR code area maximum
- Use high-resolution logo (minimum 300 DPI)
- Ensure logo doesn't cover error correction area
- Test scanning after adding logo

### Frame Styles

Choose from various frame styles:
- **Minimal**: Clean, simple border
- **Rounded**: Soft, modern corners
- **Decorative**: Ornate borders for premium feel
- **Custom**: Upload your own frame design

## File Formats Explained

### PNG (Portable Network Graphics)

**Best for:**
- Digital displays
- Social media
- Email signatures
- Website embedding

**Specifications:**
- Resolution: 300 DPI minimum
- Size: 2x2 inches minimum
- Format: RGB color mode

### PDF (Portable Document Format)

**Best for:**
- Professional printing
- Vector quality at any size
- Print shops
- Archival purposes

**Specifications:**
- Vector-based (scalable)
- Print-ready format
- CMYK color mode for printing

### SVG (Scalable Vector Graphics)

**Best for:**
- Web use
- Unlimited scaling
- Logo integration
- Digital displays

**Specifications:**
- Vector format
- Small file size
- Perfect for responsive design

### EPS (Encapsulated PostScript)

**Best for:**
- Professional printing
- Large format printing
- Signage
- Marketing materials

**Specifications:**
- Industry standard
- High quality
- Print shop compatible

## Printing Guidelines

### Size Requirements

**Minimum Sizes:**
- Table tents: 2x2 inches (5x5 cm)
- Window stickers: 3x3 inches (7.5x7.5 cm)
- Posters: 4x4 inches (10x10 cm)
- Large displays: 6x6 inches (15x15 cm)

**Distance Considerations:**
- Close range (1-2 feet): 2x2 inches minimum
- Medium range (3-5 feet): 3x3 inches minimum
- Long range (6+ feet): 4x4 inches minimum

### Print Quality

**Essential Requirements:**
- High resolution (300 DPI minimum)
- Sharp, clear edges
- Good contrast
- No pixelation or blur
- Accurate colors

### Material Selection

**Table Tents:**
- Cardstock (80-100 lb)
- Laminated for durability
- Water-resistant coating

**Window Stickers:**
- Vinyl with adhesive backing
- Weather-resistant
- UV protection

**Posters:**
- Heavy paper or cardstock
- Matte or semi-gloss finish
- Laminated if exposed to elements

**Permanent Displays:**
- Acrylic or metal
- Professional mounting
- Weatherproof if outdoor

## Placement Strategies

### Table Placement

- Center of table for easy access
- Multiple codes for large tables
- Consider customer line of sight
- Avoid areas that get wet or dirty

### Counter Placement

- Eye level for standing customers
- Multiple locations for busy counters
- Well-lit areas
- Protected from spills

### Window/Exterior

- Visible from outside
- Protected from weather
- At comfortable viewing height
- Well-lit for evening visibility

### Takeout Areas

- Near ordering counter
- Multiple locations
- Clear signage directing to code
- Backup codes if primary fails

## Testing Your QR Code

### Pre-Print Testing

1. **Digital Test**: Scan from screen
2. **Print Test**: Print sample and scan
3. **Distance Test**: Scan from various distances
4. **Lighting Test**: Test in different lighting
5. **Device Test**: Test with multiple phones

### Common Issues

**Problem: Code won't scan**
- **Solution**: Increase size, improve contrast, check print quality

**Problem: Code scans but menu doesn't load**
- **Solution**: Check internet connection, verify menu is published

**Problem: Code looks blurry**
- **Solution**: Use higher resolution, check printer settings

**Problem: Colors don't match**
- **Solution**: Use CMYK for printing, calibrate printer

## Maintenance

### Regular Checks

- Test scan monthly
- Replace damaged codes immediately
- Update if menu URL changes
- Clean codes regularly
- Check visibility in different lighting

### Backup Strategy

- Keep digital copies of all QR codes
- Have backup printed codes ready
- Store codes in multiple locations
- Document placement locations

## Advanced Tips

### Multiple Codes

Create different codes for:
- Different menus (breakfast, lunch, dinner)
- Different languages
- Special promotions
- Loyalty programs
- Online ordering

### Analytics Integration

- Track scans per location
- Monitor peak scanning times
- Identify most effective placements
- Measure campaign effectiveness

### Marketing Integration

- Add QR codes to:
  - Business cards
  - Receipts
  - Marketing materials
  - Social media posts
  - Email signatures

## Troubleshooting

### Code Not Scanning

1. Check print quality
2. Ensure adequate size
3. Verify contrast
4. Test with different phones
5. Check for damage or wear

### Menu Not Loading

1. Verify menu is published
2. Check internet connection
3. Test URL directly
4. Clear browser cache
5. Contact support if persistent

## Conclusion

A well-designed, properly printed QR code is essential for your digital menu success. Follow these guidelines to ensure your customers can easily access your menu, leading to better customer experience and increased orders.

Remember: Your QR code is often the first interaction customers have with your digital menu. Make it count!`,
    category: "qr-codes",
    tags: ["qr-code", "printing", "setup", "guide"],
    isPublished: true,
    isFeatured: true,
    order: 1,
    readingTime: 15
  },
  {
    title: "Understanding Your Analytics Dashboard",
    slug: "understanding-analytics-dashboard",
    description: "Learn how to interpret and use your menu analytics to improve your restaurant's performance.",
    content: `# Understanding Your Analytics Dashboard

Analytics provide valuable insights into how customers interact with your digital menu. This guide explains all the metrics and how to use them effectively.

## Key Metrics Overview

### Scan Statistics

**Total Scans**: Total number of times your QR code has been scanned
- Track overall menu engagement
- Compare day-to-day performance
- Identify trends over time

**Unique Visitors**: Number of distinct customers who accessed your menu
- Understand customer reach
- Calculate scan-to-visitor ratio
- Measure menu effectiveness

**Return Visitors**: Customers who have scanned your code multiple times
- Indicates customer loyalty
- Shows menu usefulness
- Helps identify regular customers

### Time-Based Analytics

**Peak Hours**: Times when most customers scan your menu
- Optimize staffing schedules
- Plan menu updates
- Identify busy periods

**Day of Week Analysis**: Which days see the most activity
- Plan specials and promotions
- Adjust menu offerings
- Optimize marketing efforts

**Time Spent**: Average time customers spend viewing your menu
- Measure engagement level
- Identify if menu is too long/short
- Gauge customer interest

### Menu Performance

**Most Viewed Items**: Items customers view most frequently
- Identify popular dishes
- Highlight bestsellers
- Plan inventory

**Least Viewed Items**: Items that receive little attention
- Consider menu optimization
- Review descriptions and images
- Decide on removal or promotion

**Category Performance**: Which categories perform best
- Understand customer preferences
- Optimize menu structure
- Plan category promotions

### Device Analytics

**Device Types**: Breakdown by mobile, tablet, desktop
- Understand customer behavior
- Optimize for most-used devices
- Plan technical improvements

**Browser Statistics**: Which browsers customers use
- Ensure compatibility
- Test on popular browsers
- Address technical issues

### Geographic Data

**Location Insights**: Where scans originate (if enabled)
- Understand customer base
- Plan location-based marketing
- Identify new market opportunities

## Using Analytics for Decision Making

### Menu Optimization

1. **Identify Underperformers**
   - Review least viewed items
   - Check if descriptions need improvement
   - Consider removing or repositioning

2. **Promote Popular Items**
   - Feature top performers prominently
   - Create specials around popular items
   - Use success stories in marketing

3. **Category Analysis**
   - Strengthen weak categories
   - Balance menu offerings
   - Create category-specific promotions

### Operational Insights

1. **Staffing Optimization**
   - Use peak hour data for scheduling
   - Prepare for busy periods
   - Optimize service delivery

2. **Inventory Management**
   - Stock popular items adequately
   - Reduce waste on slow items
   - Plan seasonal adjustments

3. **Marketing Strategy**
   - Target high-engagement times
   - Focus on popular items in ads
   - Use data for promotional campaigns

## Advanced Analytics Features

### Custom Reports

Create reports for:
- Specific date ranges
- Item performance comparisons
- Category analysis
- Trend identification

### Export Options

Export data in:
- CSV format for spreadsheet analysis
- PDF for presentations
- JSON for technical analysis

### Automated Insights

Receive automated:
- Weekly performance summaries
- Alerts for significant changes
- Recommendations for improvement
- Trend notifications

## Best Practices

1. **Regular Review**: Check analytics weekly
2. **Compare Periods**: Compare week-over-week, month-over-month
3. **Act on Insights**: Use data to make decisions
4. **Share with Team**: Keep staff informed
5. **Set Goals**: Track progress toward objectives

## Common Questions

**Q: Why do my scan numbers fluctuate?**
A: Normal variations occur based on customer traffic, promotions, and seasonality.

**Q: How accurate are the metrics?**
A: Metrics are based on actual scans and menu views, providing accurate insights.

**Q: Can I track individual customers?**
A: We respect privacy - analytics are aggregated and anonymous.

## Conclusion

Regularly reviewing and acting on your analytics will help you optimize your menu, improve customer experience, and increase business performance.`,
    category: "analytics",
    tags: ["analytics", "dashboard", "metrics", "insights"],
    isPublished: true,
    isFeatured: true,
    order: 1,
    readingTime: 10
  },
  {
    title: "Account Settings and Profile Management",
    slug: "account-settings-profile-management",
    description: "Complete guide to managing your account settings, profile, and preferences.",
    content: `# Account Settings and Profile Management

This guide covers all aspects of managing your ScanBit account, from basic profile information to advanced settings.

## Profile Information

### Restaurant Details

**Basic Information:**
- Restaurant name
- Business type
- Contact information
- Address and location
- Operating hours

**Best Practices:**
- Keep information current
- Use consistent branding
- Include all relevant details
- Verify contact information regularly

### Business Profile

**Logo Upload:**
- Recommended size: 500x500px
- Formats: PNG, JPG, SVG
- Use high-resolution images
- Maintain aspect ratio

**Cover Image:**
- Recommended size: 1920x1080px
- Use high-quality images
- Reflect your restaurant's atmosphere
- Update seasonally if desired

**Description:**
- Write compelling restaurant description
- Include cuisine type and specialties
- Mention awards or recognition
- Keep it concise but informative

## Account Security

### Password Management

**Strong Passwords:**
- Minimum 8 characters
- Mix of letters, numbers, symbols
- Avoid common words
- Don't reuse passwords

**Password Reset:**
- Use "Forgot Password" feature
- Check email (including spam)
- Link expires after 24 hours
- Contact support if issues persist

### Two-Factor Authentication

**Enable 2FA:**
- Go to Security settings
- Enable two-factor authentication
- Use authenticator app
- Save backup codes

**Benefits:**
- Enhanced account security
- Protection against unauthorized access
- Peace of mind
- Industry best practice

## Notification Settings

### Email Notifications

Configure notifications for:
- Menu updates
- New orders (if applicable)
- System updates
- Security alerts
- Marketing communications

### In-App Notifications

Manage:
- Dashboard alerts
- Update reminders
- Performance insights
- Feature announcements

## Privacy Settings

### Data Sharing

Control:
- Analytics data sharing
- Marketing communications
- Third-party integrations
- Data export options

### Account Visibility

Manage:
- Public profile visibility
- Menu accessibility
- Contact information display
- Social media links

## Integration Settings

### Social Media

Link accounts:
- Facebook
- Instagram
- Twitter
- LinkedIn
- Other platforms

### Third-Party Services

Integrate with:
- POS systems
- Payment processors
- Reservation systems
- Delivery platforms

## Subscription Management

### Plan Details

View:
- Current plan
- Features included
- Usage limits
- Billing cycle

### Upgrade/Downgrade

Process:
- Compare plans
- Select new plan
- Review changes
- Confirm upgrade/downgrade

### Billing Information

Manage:
- Payment methods
- Billing address
- Invoice preferences
- Auto-renewal settings

## Data Management

### Export Data

Export:
- Menu data
- Analytics reports
- Customer data (if applicable)
- Settings and preferences

### Backup Settings

Configure:
- Automatic backups
- Backup frequency
- Storage location
- Retention period

### Data Deletion

Options:
- Delete specific data
- Archive old information
- Complete account deletion
- Data export before deletion

## Preferences

### Language Settings

Choose:
- Interface language
- Menu language
- Support language
- Regional settings

### Display Preferences

Customize:
- Date format
- Time format
- Currency
- Measurement units

### Theme Settings

Select:
- Light theme
- Dark theme
- Auto (system preference)

## Team Management

### User Roles

Assign:
- Admin access
- Editor permissions
- Viewer access
- Custom roles

### Access Control

Manage:
- Team member access
- Permission levels
- Activity logs
- Access history

## Troubleshooting

### Common Issues

**Can't update profile:**
- Check required fields
- Verify image formats
- Clear browser cache
- Try different browser

**Password reset not working:**
- Check email spam folder
- Verify email address
- Wait for email (may take a few minutes)
- Contact support

**Settings not saving:**
- Check internet connection
- Refresh page
- Clear browser cache
- Try incognito mode

## Best Practices

1. **Regular Updates**: Keep profile current
2. **Security First**: Use strong passwords and 2FA
3. **Backup Data**: Export regularly
4. **Review Settings**: Check monthly
5. **Team Access**: Manage permissions carefully

## Conclusion

Proper account management ensures your ScanBit experience is secure, efficient, and tailored to your needs. Regular review and updates keep everything running smoothly.`,
    category: "account-settings",
    tags: ["account", "settings", "profile", "management"],
    isPublished: true,
    isFeatured: false,
    order: 1,
    readingTime: 8
  },
  {
    title: "Troubleshooting Common Issues",
    slug: "troubleshooting-common-issues",
    description: "Solutions to common problems and issues you might encounter while using ScanBit.",
    content: `# Troubleshooting Common Issues

This comprehensive guide helps you resolve common issues and problems with ScanBit.

## QR Code Issues

### QR Code Won't Scan

**Possible Causes:**
- Poor print quality
- Insufficient size
- Low contrast
- Damage or wear
- Lighting issues

**Solutions:**
1. Re-print with higher quality
2. Increase QR code size (minimum 2x2 inches)
3. Ensure high contrast (dark on light)
4. Replace damaged codes
5. Test in different lighting

**Prevention:**
- Use high-resolution files
- Print on quality materials
- Laminate for protection
- Keep backup codes ready

### QR Code Scans But Menu Doesn't Load

**Possible Causes:**
- Internet connection issues
- Menu not published
- Browser cache problems
- Server issues

**Solutions:**
1. Check internet connection
2. Verify menu is published
3. Clear browser cache
4. Try different browser
5. Contact support if persistent

## Menu Display Issues

### Menu Not Updating

**Possible Causes:**
- Changes not saved
- Browser cache
- Publishing issues
- Sync delays

**Solutions:**
1. Verify changes were saved
2. Clear browser cache
3. Check menu publish status
4. Wait a few minutes for sync
5. Refresh page

### Images Not Loading

**Possible Causes:**
- Large file sizes
- Unsupported formats
- Upload errors
- Server issues

**Solutions:**
1. Compress images before upload
2. Use supported formats (JPG, PNG, WebP)
3. Re-upload images
4. Check file size limits
5. Contact support if needed

### Formatting Problems

**Possible Causes:**
- Browser compatibility
- Cache issues
- Display settings

**Solutions:**
1. Try different browser
2. Clear cache and cookies
3. Check display settings
4. Update browser
5. Report to support

## Account Issues

### Can't Log In

**Possible Causes:**
- Incorrect password
- Account locked
- Email not verified
- Browser issues

**Solutions:**
1. Reset password
2. Check email for verification
3. Clear browser data
4. Try incognito mode
5. Contact support

### Password Reset Not Working

**Possible Causes:**
- Email not received
- Expired link
- Wrong email address

**Solutions:**
1. Check spam folder
2. Verify email address
3. Request new reset link
4. Wait a few minutes
5. Contact support

### Account Access Issues

**Possible Causes:**
- Permission problems
- Account suspension
- Technical issues

**Solutions:**
1. Check account status
2. Verify permissions
3. Contact account admin
4. Reach out to support

## Performance Issues

### Slow Loading

**Possible Causes:**
- Large images
- Slow internet
- Server load
- Browser issues

**Solutions:**
1. Optimize images
2. Check internet speed
3. Try different browser
4. Clear cache
5. Report to support

### Features Not Working

**Possible Causes:**
- Browser compatibility
- JavaScript disabled
- Outdated browser
- Cache issues

**Solutions:**
1. Update browser
2. Enable JavaScript
3. Clear cache
4. Try different browser
5. Check feature availability

## Data Issues

### Data Not Saving

**Possible Causes:**
- Internet connection
- Browser issues
- Form errors
- Server problems

**Solutions:**
1. Check connection
2. Verify all required fields
3. Save frequently
4. Try different browser
5. Contact support

### Lost Data

**Possible Causes:**
- Accidental deletion
- Sync issues
- Account problems

**Solutions:**
1. Check trash/deleted items
2. Restore from backup
3. Check activity log
4. Contact support immediately

## Payment Issues

### Payment Not Processing

**Possible Causes:**
- Card declined
- Payment gateway issues
- Account problems

**Solutions:**
1. Verify card information
2. Try different payment method
3. Check account status
4. Contact billing support

### Billing Questions

**Possible Causes:**
- Plan confusion
- Billing cycle
- Payment method

**Solutions:**
1. Review plan details
2. Check billing history
3. Update payment method
4. Contact billing support

## Getting Help

### When to Contact Support

Contact support for:
- Persistent technical issues
- Account problems
- Billing questions
- Feature requests
- Security concerns

### Providing Information

When contacting support, include:
- Description of issue
- Steps to reproduce
- Screenshots if possible
- Browser and device info
- Error messages

### Support Channels

- Email support
- Live chat (if available)
- Support tickets
- Knowledge base
- Community forum

## Prevention Tips

1. **Regular Backups**: Export data regularly
2. **Keep Updated**: Use latest browser versions
3. **Test Regularly**: Scan QR codes frequently
4. **Monitor Performance**: Check analytics
5. **Stay Informed**: Read update notices

## Conclusion

Most issues can be resolved quickly with these troubleshooting steps. If problems persist, don't hesitate to contact our support team for assistance.`,
    category: "troubleshooting",
    tags: ["troubleshooting", "issues", "problems", "solutions"],
    isPublished: true,
    isFeatured: true,
    order: 1,
    readingTime: 12
  }
];

// Function to populate FAQs and Knowledge Base
async function populateData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {

      process.exit(1);
    }

    await mongoose.connect(mongoUri);

    // Get admin user (or create a system user for createdBy)
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {

    }

    const userId = adminUser ? adminUser._id : null;

    // Populate FAQs

    let faqCount = 0;
    for (const faqData of faqs) {
      // Check if FAQ already exists
      const existingFAQ = await FAQ.findOne({ question: faqData.question });
      if (!existingFAQ) {
        const faq = new FAQ({
          ...faqData,
          createdBy: userId
        });
        await faq.save();
        faqCount++;

      } else {

      }
    }

    // Populate Knowledge Base Articles

    let articleCount = 0;
    for (const articleData of knowledgeBaseArticles) {
      // Check if article already exists
      const existingArticle = await KnowledgeBase.findOne({ slug: articleData.slug });
      if (!existingArticle) {
        const article = new KnowledgeBase({
          ...articleData,
          createdBy: userId
        });
        await article.save();
        articleCount++;

      } else {

      }
    }


    process.exit(0);
  } catch (error) {

    process.exit(1);
  }
}

// Run the script
populateData();
