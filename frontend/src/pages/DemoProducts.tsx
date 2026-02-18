import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Star, 
  Heart, 
  Share2, 
  ArrowLeft,
  Download,
  MapPin,
  Globe,
  Phone,
  Mail,
  Clock,
  Award,
  QrCode,
  Eye,
  X,
  Search,
  Grid3x3,
  List,
  Image as ImageIcon,
  Package,
  Tag,
  Users,
  Briefcase,
  Palette,
  Camera,
  Code,
  PenTool,
  Video,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  ExternalLink,
  FileText,
  CheckCircle2,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  MessageCircle,
  Send,
  Building2,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Rocket,
  Layers,
  MousePointerClick,
  Megaphone,
  Monitor,
  Smartphone,
  Globe2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TranslationProvider, useTranslation } from "@/hooks/useTranslation";
import { demoProductsTranslations } from "@/translations/demoProducts";

// --- Product Showcase Interface ---
interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  featured?: boolean;
  specifications?: string[];
  availability?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

// --- Portfolio Item Interface ---
interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  year: number;
  services: string[];
  results?: string[];
  featured?: boolean;
  link?: string;
}

// --- Service Interface ---
interface Service {
  id: string;
  name: string;
  description: string;
  icon: any;
  price?: string;
}

// --- Testimonial Interface ---
interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  rating: number;
  comment: string;
}

// --- Mock Data: Products ---
const products: Product[] = [
  {
    id: "p1",
    name: "Premium Leather Collection",
    subtitle: "Handcrafted Excellence",
    category: "Fashion & Apparel",
    description: "Discover our exclusive range of premium leather products, handcrafted by skilled artisans. Each piece is unique, combining traditional craftsmanship with modern design.",
    image: "👜",
    tags: ["Premium", "Handcrafted", "Limited Edition"],
    featured: true,
    specifications: ["100% Genuine Leather", "Handcrafted", "Lifetime Warranty", "Free Shipping"],
    availability: "Available for Order",
    contactInfo: {
      email: "orders@premiumleather.com",
      phone: "+1 (555) 123-4567",
      website: "www.premiumleather.com"
    }
  },
  {
    id: "p2",
    name: "Smart Home Automation System",
    subtitle: "Intelligent Living Solutions",
    category: "Technology",
    description: "Transform your home into a smart living space with our comprehensive automation system. Control lighting, temperature, security, and entertainment from anywhere.",
    image: "🏠",
    tags: ["Smart Home", "IoT", "Automation"],
    featured: true,
    specifications: ["Voice Control", "Mobile App", "Energy Efficient", "24/7 Support"],
    availability: "In Stock",
    contactInfo: {
      email: "sales@smarthome.com",
      phone: "+1 (555) 234-5678",
      website: "www.smarthome.com"
    }
  },
  {
    id: "p3",
    name: "Organic Skincare Line",
    subtitle: "Nature's Best for Your Skin",
    category: "Beauty & Wellness",
    description: "Premium organic skincare products made with natural ingredients. Nourish your skin with our carefully formulated range of cleansers, moisturizers, and serums.",
    image: "✨",
    tags: ["Organic", "Natural", "Cruelty-Free"],
    featured: false,
    specifications: ["100% Organic", "Cruelty-Free", "Vegan", "Eco-Friendly Packaging"],
    availability: "Available",
    contactInfo: {
      email: "info@organicskin.com",
      phone: "+1 (555) 345-6789",
      website: "www.organicskin.com"
    }
  },
  {
    id: "p4",
    name: "Professional Camera Equipment",
    subtitle: "Capture Every Moment",
    category: "Photography",
    description: "Professional-grade camera equipment for photographers and videographers. From lenses to lighting, we have everything you need for your next project.",
    image: "📷",
    tags: ["Professional", "High Quality", "Rental Available"],
    featured: false,
    specifications: ["Professional Grade", "Rental Options", "Expert Consultation", "Warranty Included"],
    availability: "In Stock",
    contactInfo: {
      email: "rentals@cameragear.com",
      phone: "+1 (555) 456-7890",
      website: "www.cameragear.com"
    }
  },
];

// --- Mock Data: Portfolio Items ---
const portfolioItems: PortfolioItem[] = [
  {
    id: "port1",
    title: "Brand Identity Redesign",
    client: "TechStart Inc.",
    category: "Branding",
    description: "Complete brand identity redesign including logo, color palette, typography, and brand guidelines. Resulted in 40% increase in brand recognition.",
    image: "🎨",
    tags: ["Branding", "Logo Design", "Identity"],
    year: 2024,
    services: ["Logo Design", "Brand Guidelines", "Visual Identity"],
    results: ["40% increase in brand recognition", "Unified brand presence", "Modern, professional look"],
    featured: true,
    link: "https://example.com/case-study-1"
  },
  {
    id: "port2",
    title: "E-Commerce Website Development",
    client: "Fashion Forward",
    category: "Web Development",
    description: "Full-stack e-commerce platform with custom features, payment integration, and admin dashboard. Increased online sales by 250%.",
    image: "💻",
    tags: ["Web Development", "E-Commerce", "Full-Stack"],
    year: 2024,
    services: ["Frontend Development", "Backend Development", "Payment Integration"],
    results: ["250% increase in online sales", "Faster page load times", "Improved user experience"],
    featured: true,
    link: "https://example.com/case-study-2"
  },
  {
    id: "port3",
    title: "Social Media Campaign",
    client: "GreenLife Organics",
    category: "Digital Marketing",
    description: "Comprehensive social media strategy and campaign execution across multiple platforms. Achieved 500% growth in social media engagement.",
    image: "📱",
    tags: ["Social Media", "Marketing", "Content Strategy"],
    year: 2023,
    services: ["Content Creation", "Community Management", "Analytics"],
    results: ["500% growth in engagement", "10K+ new followers", "Increased brand awareness"],
    featured: true,
    link: "https://example.com/case-study-3"
  },
  {
    id: "port4",
    title: "Mobile App Design",
    client: "FitTracker",
    category: "UI/UX Design",
    description: "User-centered mobile app design for fitness tracking. Focused on intuitive navigation and engaging user experience.",
    image: "📲",
    tags: ["UI/UX", "Mobile Design", "App Design"],
    year: 2024,
    services: ["User Research", "Wireframing", "Prototyping", "UI Design"],
    results: ["4.8 app store rating", "High user retention", "Positive user feedback"],
    featured: false,
    link: "https://example.com/case-study-4"
  },
  {
    id: "port5",
    title: "Product Photography",
    client: "Luxury Watches Co.",
    category: "Photography",
    description: "Professional product photography for luxury watch collection. Created stunning visuals for website and marketing materials.",
    image: "⌚",
    tags: ["Photography", "Product", "Commercial"],
    year: 2023,
    services: ["Product Photography", "Post-Production", "Retouching"],
    results: ["Professional product images", "Increased conversion rate", "Enhanced brand perception"],
    featured: false,
    link: "https://example.com/case-study-5"
  },
  {
    id: "port6",
    title: "Content Strategy & Copywriting",
    client: "EduTech Solutions",
    category: "Content",
    description: "Developed comprehensive content strategy and created engaging copy for website, blog, and marketing materials.",
    image: "✍️",
    tags: ["Content Strategy", "Copywriting", "SEO"],
    year: 2024,
    services: ["Content Strategy", "Copywriting", "SEO Optimization"],
    results: ["50% increase in organic traffic", "Higher engagement rates", "Improved search rankings"],
    featured: false,
    link: "https://example.com/case-study-6"
  },
];

// --- Services Offered ---
const services: Service[] = [
  { id: "s1", name: "Brand Identity Design", description: "Complete brand identity packages", icon: Palette },
  { id: "s2", name: "Web Development", description: "Custom websites and web applications", icon: Code },
  { id: "s3", name: "UI/UX Design", description: "User-centered design solutions", icon: MousePointerClick },
  { id: "s4", name: "Digital Marketing", description: "Social media and digital campaigns", icon: Megaphone },
  { id: "s5", name: "Photography", description: "Product and commercial photography", icon: Camera },
  { id: "s6", name: "Content Creation", description: "Copywriting and content strategy", icon: PenTool },
  { id: "s7", name: "Video Production", description: "Promotional and marketing videos", icon: Video },
  { id: "s8", name: "SEO Optimization", description: "Search engine optimization services", icon: TrendingUp },
];

// --- Testimonials ---
const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah Johnson",
    role: "CEO",
    company: "TechStart Inc.",
    image: "👩",
    rating: 5,
    comment: "Outstanding work! The brand redesign exceeded our expectations and has significantly improved our market presence."
  },
  {
    id: "t2",
    name: "Michael Chen",
    role: "Founder",
    company: "Fashion Forward",
    image: "👨",
    rating: 5,
    comment: "The e-commerce platform they built for us transformed our business. Sales have increased dramatically!"
  },
  {
    id: "t3",
    name: "Emily Rodriguez",
    role: "Marketing Director",
    company: "GreenLife Organics",
    image: "👩",
    rating: 5,
    comment: "Their social media strategy was game-changing. We've seen incredible growth in engagement and brand awareness."
  },
];

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const businessInfo = {
  name: "Creative Showcase",
  tagline: "Showcasing Excellence in Products & Portfolio",
  address: "789 Business Avenue, Mumbai 400001",
  phone: "+91 98765 43210",
  email: "info@creativeshowcase.com",
  openingHours: "Mon-Sat: 10:00 AM - 8:00 PM",
  social: {
    instagram: "https://instagram.com/creativeshowcase",
    facebook: "https://facebook.com/creativeshowcase",
    linkedin: "https://linkedin.com/company/creativeshowcase",
    twitter: "https://twitter.com/creativeshowcase",
  }
};

const DemoProductsContent = () => {
  const { language, setLanguage, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"products" | "portfolio">("products");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [showDownloadCard, setShowDownloadCard] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  const categories = activeTab === "products" 
    ? ["all", ...Array.from(new Set(products.map(p => p.category)))]
    : ["all", ...Array.from(new Set(portfolioItems.map(p => p.category)))];

  const filteredItems = activeTab === "products"
    ? products.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : portfolioItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDialog(true);
  };

  const handleOpenPortfolio = (item: PortfolioItem) => {
    setSelectedPortfolio(item);
    setShowPortfolioDialog(true);
  };

  const handleDownloadPortfolio = () => {
    toast.success("Portfolio PDF download started!");
    setShowDownloadCard(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessInfo.name,
          text: businessInfo.tagline,
          url: window.location.href,
        });
        toast.success("Shared successfully!");
      } catch (error) {

      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleOpenLocation = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessInfo.address)}`;
    window.open(url, '_blank');
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! We'll get back to you soon.");
    setContactForm({ name: "", email: "", message: "" });
    setShowContact(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Back Button & Title */}
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="group flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white transition-all duration-300"
              >
                <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:bg-slate-700 transition-colors">
                  <ArrowLeft size={16} className="text-slate-900 group-hover:text-white" />
                </div>
                <span className="text-sm font-semibold">{t('header.back')}</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 hidden md:block" />
              <h1 className="text-lg font-bold tracking-tight hidden md:block">{t('header.title')}</h1>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-3 hover:bg-slate-100 rounded-full transition-all duration-300 active:scale-90 relative"
                title={t('action.share')}
              >
                <Globe size={20} className="text-slate-600" />
              </button>
              <button 
                onClick={handleShare}
                className="p-3 hover:bg-slate-100 rounded-full transition-all duration-300 active:scale-90"
                title={t('action.share')}
              >
                <Share2 size={20} className="text-slate-600" />
              </button>
              <button 
                onClick={() => setShowContact(true)}
                className="p-3 hover:bg-slate-100 rounded-full transition-all duration-300 active:scale-90"
                title="Contact Us"
              >
                <MessageCircle size={20} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Language Dropdown */}
        {showLanguageMenu && (
          <div className="absolute right-4 top-16 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 min-w-[200px]">
            <div className="text-xs font-semibold text-slate-500 px-3 py-2 uppercase tracking-wide">Select Language</div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any);
                  setShowLanguageMenu(false);
                  toast.success(t('language.changed', { lang: lang.name }));
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  language === lang.code 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Business Info Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="font-bold text-2xl text-slate-900 mb-1">{businessInfo.name}</h2>
                <p className="text-sm text-slate-600 mb-3">{businessInfo.tagline}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{businessInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{businessInfo.openingHours}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenLocation}
                  className="gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {t('action.location')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDownloadCard(true)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('action.download')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContact(true)}
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs: Products & Portfolio */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "products"
                ? "bg-primary text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
            <Badge variant="secondary" className="ml-1">
              {products.length}
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "portfolio"
                ? "bg-primary text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Portfolio</span>
            <Badge variant="secondary" className="ml-1">
              {portfolioItems.length}
            </Badge>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === "products" ? "Search products..." : "Search portfolio..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 border border-slate-200 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Section */}
        {activeTab === "products" && (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            : "space-y-4 mb-12"
          }>
            {filteredItems.map((product) => (
              <Card
                key={product.id}
                className={`group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  product.featured ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleOpenProduct(product)}
              >
                <div className={`relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${
                  product.featured ? "bg-gradient-to-br from-primary/30 to-primary/10" : ""
                }`}>
                  <div className="text-6xl">{product.image}</div>
                  {product.featured && (
                    <Badge className="absolute top-4 right-4 bg-primary text-white">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-slate-500 mb-3">{product.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-slate-500">{product.category}</span>
                    <Button size="sm" className="gap-2">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Portfolio Section */}
        {activeTab === "portfolio" && (
          <>
            {/* Services Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Services We Offer</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Card key={service.id} className="hover:shadow-lg transition-all cursor-pointer group">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{service.name}</h3>
                        <p className="text-xs text-slate-500">{service.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Portfolio Grid */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              : "space-y-4 mb-12"
            }>
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={`group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    item.featured ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleOpenPortfolio(item)}
                >
                  <div className={`relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${
                    item.featured ? "bg-gradient-to-br from-primary/30 to-primary/10" : ""
                  }`}>
                    <div className="text-6xl">{item.image}</div>
                    {item.featured && (
                      <Badge className="absolute top-4 right-4 bg-primary text-white">
                        Featured
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-500 mb-1">{item.client}</p>
                        <p className="text-xs text-slate-400">{item.year}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-slate-500">{item.category}</span>
                      <Button size="sm" className="gap-2">
                        View Case Study
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Testimonials Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">What Clients Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 mb-4 italic">"{testimonial.comment}"</p>
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                          {testimonial.image}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{testimonial.name}</p>
                          <p className="text-xs text-slate-500">{testimonial.role}, {testimonial.company}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No items found matching your search.</p>
          </div>
        )}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                <DialogDescription>{selectedProduct.subtitle}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                    <div className="text-8xl">{selectedProduct.image}</div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-slate-600">{selectedProduct.description}</p>
                    </div>
                    {selectedProduct.specifications && (
                      <div>
                        <h3 className="font-semibold mb-2">Specifications</h3>
                        <ul className="space-y-1">
                          {selectedProduct.specifications.map((spec, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              {spec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {selectedProduct.contactInfo && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Get in Touch</h3>
                      <div className="space-y-3">
                        {selectedProduct.contactInfo.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-primary" />
                            <a href={`mailto:${selectedProduct.contactInfo.email}`} className="text-sm text-primary hover:underline">
                              {selectedProduct.contactInfo.email}
                            </a>
                          </div>
                        )}
                        {selectedProduct.contactInfo.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-primary" />
                            <a href={`tel:${selectedProduct.contactInfo.phone}`} className="text-sm text-primary hover:underline">
                              {selectedProduct.contactInfo.phone}
                            </a>
                          </div>
                        )}
                        {selectedProduct.contactInfo.website && (
                          <div className="flex items-center gap-3">
                            <Globe2 className="w-5 h-5 text-primary" />
                            <a href={`https://${selectedProduct.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                              {selectedProduct.contactInfo.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Portfolio Detail Dialog */}
      <Dialog open={showPortfolioDialog} onOpenChange={setShowPortfolioDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPortfolio && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPortfolio.title}</DialogTitle>
                <DialogDescription>{selectedPortfolio.client} • {selectedPortfolio.year}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                  <div className="text-8xl">{selectedPortfolio.image}</div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Project Description</h3>
                  <p className="text-sm text-slate-600">{selectedPortfolio.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Services Provided</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedPortfolio.services.map((service, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  {selectedPortfolio.results && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Results Achieved</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedPortfolio.results.map((result, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              {result}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPortfolio.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                {selectedPortfolio.link && (
                  <Button asChild className="w-full">
                    <a href={selectedPortfolio.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      View Full Case Study
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Download Card Dialog */}
      <Dialog open={showDownloadCard} onOpenChange={setShowDownloadCard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              {t('download.title')}
            </DialogTitle>
            <DialogDescription>
              {t('download.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-white p-6">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm">
                  <Briefcase className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{businessInfo.name}</h3>
                  <p className="text-white/90 text-sm">{businessInfo.tagline}</p>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/70 text-xs mb-1">{t('info.phone')}</p>
                      <p className="font-semibold">{businessInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs mb-1">{t('info.email')}</p>
                      <p className="font-semibold text-xs">{businessInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  toast.success(t('download.saved'));
                  setShowDownloadCard(false);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                {t('download.saveImage')}
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(t('download.copied'));
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t('download.shareLink')}
              </Button>
            </div>
            {activeTab === "portfolio" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDownloadPortfolio}
              >
                <FileText className="w-4 h-4 mr-2" />
                Download Portfolio PDF
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={showLocation} onOpenChange={setShowLocation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {t('location.title')}
            </DialogTitle>
            <DialogDescription>
              {t('location.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">{businessInfo.name}</h3>
                    <p className="text-slate-600 text-sm">{businessInfo.address}</p>
                  </div>
                  <div className="h-48 bg-slate-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="text-sm text-slate-500">{t('location.mapView')}</p>
                      <p className="text-xs text-slate-400 mt-1">{t('location.clickToOpen')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleOpenLocation}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {t('location.openMaps')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(businessInfo.address);
                        toast.success(t('location.addressCopied'));
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${businessInfo.phone}`} className="hover:text-primary">
                        {businessInfo.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{businessInfo.openingHours}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Get in Touch</DialogTitle>
            <DialogDescription>
              Have a question or want to work together? Send us a message!
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Name</label>
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Email</label>
              <Input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Message</label>
              <Textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Tell us about your project..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowContact(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </div>
          </form>
          <div className="pt-4 border-t">
            <p className="text-sm font-semibold mb-3">Or reach us directly:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <a href={`mailto:${businessInfo.email}`} className="text-sm text-primary hover:underline">
                  {businessInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <a href={`tel:${businessInfo.phone}`} className="text-sm text-primary hover:underline">
                  {businessInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <a href={businessInfo.social.instagram} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Instagram className="w-5 h-5 text-pink-500" />
                </a>
                <a href={businessInfo.social.facebook} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Facebook className="w-5 h-5 text-blue-600" />
                </a>
                <a href={businessInfo.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Linkedin className="w-5 h-5 text-blue-700" />
                </a>
                <a href={businessInfo.social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Twitter className="w-5 h-5 text-blue-400" />
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{businessInfo.name}</p>
              <p className="text-xs text-slate-500">Powered by ScanBit</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowContact(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button asChild size="sm">
                <Link to="/register">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with TranslationProvider
const DemoProducts = () => {
  return (
    <TranslationProvider translations={demoProductsTranslations}>
      <DemoProductsContent />
    </TranslationProvider>
  );
};

export default DemoProducts;
