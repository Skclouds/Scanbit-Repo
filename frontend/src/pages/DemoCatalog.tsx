import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/lib/api";
import {
  Search,
  Utensils,
  ShoppingBag,
  Palette,
  ArrowRight,
  Star,
  Heart,
  Plus,
  ArrowLeft,
  Bell,
  SlidersHorizontal,
  Download,
  MapPin,
  Globe,
  Share2,
  Filter,
  X,
  CheckCircle2,
  Languages,
  Phone,
  Mail,
  Clock,
  Award,
  QrCode,
  Eye,
  ShoppingCart,
  MessageCircle,
  Navigation,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TranslationProvider, useTranslation } from "@/hooks/useTranslation";
import { demoCatalogTranslations } from "@/translations/demoCatalog";
import { safeImageSrc } from "@/lib/imageUtils";
import LeafletMap from "@/components/LeafletMap";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react";

// --- Enhanced Data Structure ---
interface CatalogItem {
  id: string | number;
  title: string;
  subtitle: string;
  price: number;
  tag: string;
  rating: number;
  reviews: number;
  imageColor: string;
  iconColor: string;
  type: string;
  description?: string;
  inStock?: boolean;
  category?: string;
  location?: string;
  image?: string;
  images?: string[];
  duration?: string;
  client?: string;
  deliverables?: string;
}

interface BusinessInfo {
  name: string;
  logo?: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email: string;
  rating: number;
  totalReviews: number;
  openingHours: string;
  gallery: string[];
  businessCardFront?: string;
  businessCardBack?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const catalogData = {
  food: [],
  retail: [],
  creative: [],
  agency: [],
  professional: [],
  wellness: []
};

const industries = [
  { id: "food", label: "Digital Menu", icon: Utensils, color: "bg-orange-500", shadow: "shadow-orange-200" },
  { id: "retail", label: "Product Catalog", icon: ShoppingBag, color: "bg-blue-600", shadow: "shadow-blue-200" },
  { id: "creative", label: "Creative Portfolio", icon: Palette, color: "bg-purple-600", shadow: "shadow-purple-200" },
  { id: "agency", label: "Agency Portfolio", icon: Palette, color: "bg-indigo-600", shadow: "shadow-indigo-200" },
  { id: "professional", label: "Professional Services", icon: Award, color: "bg-slate-800", shadow: "shadow-slate-200" },
  { id: "wellness", label: "Wellness Menu", icon: Heart, color: "bg-teal-600", shadow: "shadow-teal-200" },
];

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const businessInfo = {
  name: "Premium Marketplace",
  address: "456 Shopping District, Mumbai 400001",
  phone: "+91 98765 43210",
  email: "info@premiummarketplace.com",
  rating: 4.7,
  totalReviews: 3456,
  openingHours: "Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 8:00 PM",
  location: {
    lat: 19.0760,
    lng: 72.8777,
    address: "456 Shopping District, Mumbai"
  }
};

interface DemoCatalogProps {
  restaurantId?: string;
  initialData?: any;
}

const DemoCatalogContent = ({ restaurantId: propRestaurantId, initialData }: DemoCatalogProps) => {
  const { language, setLanguage, t } = useTranslation();
  const { restaurantId: paramRestaurantId } = useParams();
  const restaurantId = propRestaurantId || paramRestaurantId;
  
  const [realCatalogData, setRealCatalogData] = useState<any>(null);
  const [realBusinessInfo, setRealBusinessInfo] = useState<any>(null);
  const [loading, setLoading] = useState(!!restaurantId && !initialData);
  const [sortBy, setSortBy] = useState("popular");
  
  // Use ONLY real user data - no demo/sample data fallback
  const currentCatalogData = realCatalogData || { food: [], retail: [], creative: [], agency: [], professional: [], wellness: [] };
  const currentBusinessInfo = realBusinessInfo || {
    name: "",
    logo: null,
    tagline: "",
    address: "",
    phone: "",
    email: "",
    rating: 0,
    totalReviews: 0,
    openingHours: "",
    gallery: [],
    location: null,
  };
  
  const [activeTab, setActiveTab] = useState("food");
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDownloadCard, setShowDownloadCard] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
  const [showLocation, setShowLocation] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [cart, setCart] = useState<Record<string | number, number>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showCartDialog, setShowCartDialog] = useState(false);

  const getBusinessIcon = () => {
    if (activeTab === 'retail') return <ShoppingBag className="w-5 h-5" />;
    if (activeTab === 'agency') return <Palette className="w-5 h-5" />;
    if (activeTab === 'creative') return <Palette className="w-5 h-5" />;
    if (activeTab === 'professional') return <Award className="w-5 h-5" />;
    if (activeTab === 'wellness') return <Heart className="w-5 h-5" />;
    return <Utensils className="w-5 h-5" />;
  };

  // Get current data based on tab
  const currentItems = currentCatalogData[activeTab as keyof typeof currentCatalogData] || [];
  const activeIndustry = industries.find((i) => i.id === activeTab);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...currentItems].filter((item: CatalogItem) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      items.sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === "price-high") {
      items.sort((a: any, b: any) => b.price - a.price);
    } else if (sortBy === "rating") {
      items.sort((a: any, b: any) => b.rating - a.rating);
    } else if (sortBy === "category") {
      items.sort((a: any, b: any) => (a.category || "").localeCompare(b.category || ""));
    } else if (sortBy === "newest") {
      items.sort((a: any, b: any) => (b.id as number) - (a.id as number));
    }

    return items;
  }, [currentItems, searchQuery, sortBy, selectedCategory]);

  const allCategories = useMemo(() => {
    const cats = new Set(currentItems.map((item: CatalogItem) => item.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [currentItems]);

  const handleAddToCart = (itemId: string | number) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    toast.success("Added to inquiry list");
  };

  const handleWhatsAppInquiry = (item: CatalogItem) => {
    const rawPhone = currentBusinessInfo.whatsapp || currentBusinessInfo.phone;
    const phone = rawPhone.replace(/\D/g, '');
    if (!phone) {
      toast.error("Business phone number not available");
      return;
    }
    
    const message = encodeURIComponent(
      `Hello ${currentBusinessInfo.name},\n\n` +
      `I am interested in your service: *${item.title}*\n` +
      `Price: *${formatINR(item.price)}*\n` +
      `Description: ${item.subtitle}\n\n` +
      `Could you please provide more information about this?`
    );
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleOpenLocation = () => {
    const address = currentBusinessInfo.address;
    const location = currentBusinessInfo.location;
    let url = "";
    
    if (location?.lat && location?.lng) {
      url = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    window.open(url, '_blank');
  };

  const handleGetDirections = () => {
    const address = currentBusinessInfo.address;
    const location = currentBusinessInfo.location;
    let url = "";
    
    if (location?.lat && location?.lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }
    window.open(url, '_blank');
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      toast.error(t('rating.required'));
      return;
    }
    if (!reviewerName || !reviewerEmail) {
      toast.error("Name and email are required");
      return;
    }

    const restaurant = initialData?.restaurant;
    const currentRestaurantId = restaurantId || restaurant?._id || restaurant?.id;
    if (!currentRestaurantId) {
      toast.error("Restaurant ID not found");
      return;
    }

    try {
      const response = await api.submitReview(currentRestaurantId, {
        rating: userRating,
        comment: ratingComment,
        reviewerName,
        reviewerEmail
      });

      if (response.success) {
        toast.success(t('rating.thankYou', { rating: userRating }));
        setShowRating(false);
        setUserRating(0);
        setRatingComment("");
        setReviewerName("");
        setReviewerEmail("");
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    } catch (error: any) {

      toast.error(error.message || "An error occurred while submitting your review");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessInfo.name,
          text: `Check out ${businessInfo.name}!`,
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

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const processData = (data: any) => {
    const transformedData: any = {
      food: [], retail: [], creative: [], agency: [], professional: [], wellness: []
    };
    
    (data.categories || []).forEach((cat: any) => {
      const items = (cat.items || []).map((item: any, idx: number) => ({
        id: item._id || item.id || idx,
        title: item.name,
        subtitle: item.description || '',
        price: item.price,
        tag: item.isPopular ? 'Featured' : '',
        rating: item.rating || 4.8,
        reviews: item.reviews || Math.floor(Math.random() * 50) + 10,
        imageColor: 'bg-slate-50',
        iconColor: 'text-primary',
        type: 'service',
        description: item.description,
        inStock: item.isAvailable !== false,
        category: cat.name,
        image: item.image || item.images?.[0],
        images: item.images || (item.image ? [item.image] : []),
        duration: item.duration,
        client: item.client,
        deliverables: item.deliverables,
      }));
      
      const businessType = (data.restaurant?.businessType || data.restaurant?.businessCategory || '').toLowerCase();
      if (businessType.includes('retail') || businessType.includes('store') || businessType.includes('shop') || businessType.includes('boutique')) {
        transformedData.retail.push(...items);
      } else if (businessType.includes('agency') || businessType.includes('marketing') || businessType.includes('advert')) {
        transformedData.agency.push(...items);
      } else if (businessType.includes('creative') || businessType.includes('design')) {
        transformedData.creative.push(...items);
      } else if (businessType.includes('professional') || businessType.includes('consult') || businessType.includes('legal') || businessType.includes('account') || businessType.includes('service')) {
        transformedData.professional.push(...items);
      } else if (businessType.includes('health') || businessType.includes('wellness') || businessType.includes('medical') || businessType.includes('clinic') || businessType.includes('spa') || businessType.includes('yoga')) {
        transformedData.wellness.push(...items);
      } else {
        transformedData.food.push(...items);
      }
    });
    
    setRealCatalogData(transformedData);
    // Store ONLY user's actual data - no fallback values
    setRealBusinessInfo({
      name: data.restaurant?.name || '',
      logo: data.restaurant?.logo || null,
      tagline: data.restaurant?.tagline || '',
      address: data.restaurant?.location?.address || data.restaurant?.address?.street || data.restaurant?.address || '',
      phone: data.restaurant?.phone || '',
      whatsapp: data.restaurant?.whatsapp || '',
      email: data.restaurant?.email || '',
      rating: data.restaurant?.rating || 0,
      totalReviews: data.restaurant?.totalReviews || 0,
      openingHours: data.restaurant?.openingHours || '',
      gallery: data.restaurant?.foodImages || [],
      businessCardFront: data.restaurant?.businessCardFront || data.restaurant?.businessCard || null,
      businessCardBack: data.restaurant?.businessCardBack || null,
      location: data.restaurant?.location || null,
    });
    
    const businessType = (data.restaurant?.businessType || data.restaurant?.businessCategory || '').toLowerCase();
    if (businessType.includes('retail') || businessType.includes('store') || businessType.includes('shop') || businessType.includes('boutique')) {
      setActiveTab('retail');
    } else if (businessType.includes('agency') || businessType.includes('marketing') || businessType.includes('advert')) {
      setActiveTab('agency');
    } else if (businessType.includes('creative') || businessType.includes('design')) {
      setActiveTab('creative');
    } else if (businessType.includes('professional') || businessType.includes('consult') || businessType.includes('legal') || businessType.includes('account') || businessType.includes('service')) {
      setActiveTab('professional');
    } else if (businessType.includes('health') || businessType.includes('wellness') || businessType.includes('medical') || businessType.includes('clinic') || businessType.includes('spa') || businessType.includes('yoga')) {
      setActiveTab('wellness');
    } else {
      setActiveTab('food');
    }
  };

  // Fetch real catalog data
  useEffect(() => {
    if (restaurantId && !initialData) {
      const fetchCatalog = async () => {
        try {
          setLoading(true);
          const response = await api.getMenu(restaurantId);
          if (response && response.success) {
            processData(response);
          }
        } catch (error) {

        } finally {
          setLoading(false);
        }
      };
      fetchCatalog();
    } else if (initialData) {
      processData(initialData);
      setLoading(false);
    }
  }, [restaurantId, initialData]);

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-20 bg-[#fff8f5]">
      
      {/* Sticky Glass Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentBusinessInfo.logo ? (
                <img src={safeImageSrc(currentBusinessInfo.logo)} alt="Logo" className="w-10 h-10 rounded-xl object-contain border border-slate-100 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {getBusinessIcon()}
                </div>
              )}
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none">{currentBusinessInfo.name}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {activeTab === 'food' ? 'Digital Menu' : 
                   activeTab === 'retail' ? 'Product Catalog' :
                   activeTab === 'agency' ? 'Service Portfolio' :
                   activeTab === 'creative' ? 'Creative Portfolio' :
                   activeTab === 'wellness' ? 'Wellness Menu' : 'Business Catalog'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="p-2.5 rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
                <Share2 size={20} />
              </button>
              <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="p-2.5 rounded-full hover:bg-slate-50 text-slate-500 transition-colors relative">
                <Globe size={20} />
              </button>
              {getCartCount() > 0 && (
                <button onClick={() => setShowCartDialog(true)} className="relative p-2.5 rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
                  <ShoppingCart size={20} />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] font-black bg-primary text-white">
                    {getCartCount()}
                  </Badge>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              {activeTab === 'food' ? 'Our Menu' : 
               activeTab === 'retail' ? 'Collections' :
               activeTab === 'agency' ? 'Our Services' :
               activeTab === 'creative' ? 'Portfolio' :
               activeTab === 'wellness' ? 'Treatments' : 'Catalog'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-slate-900">{currentBusinessInfo.rating}</span>
                <span className="opacity-50">({currentBusinessInfo.totalReviews} Reviews)</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{currentBusinessInfo.openingHours}</span>
              </div>
            </div>
          </div>

          {/* Sorting & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-400"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 h-12 bg-slate-50 border-none rounded-2xl font-bold text-sm">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                {allCategories.map((cat: string) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 h-12 bg-slate-50 border-none rounded-2xl font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Business Highlights Slider */}
      {currentBusinessInfo.gallery && currentBusinessInfo.gallery.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black tracking-tight uppercase">Business Highlights</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => emblaApi?.scrollPrev()}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <ChevronLeftIcon size={20} />
                </button>
                <button 
                  onClick={() => emblaApi?.scrollNext()}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <ChevronRightIcon size={20} />
                </button>
              </div>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-sm" ref={emblaRef}>
            <div className="flex">
              {currentBusinessInfo.gallery.map((url: string, i: number) => (
                <div key={i} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.33%] aspect-video relative group px-2">
                  <div className="w-full h-full rounded-[2rem] overflow-hidden">
                    <img src={safeImageSrc(url)} alt={`Highlight ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Results Found</h3>
              <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-widest">Try adjusting your search query</p>
            </div>
          ) : (
            filteredItems.map((item: CatalogItem) => (
              <Card
                key={item.id}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] cursor-pointer bg-slate-50/50"
                onClick={() => {
                  setSelectedItem(item);
                  setShowItemDialog(true);
                }}
              >
                {/* Card Image Area */}
                <div className="h-72 w-full relative overflow-hidden bg-white">
                  {item.image ? (
                    <img 
                      src={safeImageSrc(item.image)} 
                      alt={item.title} 
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out p-4" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-slate-100 shadow-sm">
                        {getBusinessIcon()}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {item.tag && (
                      <Badge className="bg-white/90 backdrop-blur-md text-[10px] font-black px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest text-slate-900 border-none">
                        {item.tag}
                      </Badge>
                    )}
                  </div>

                  <button 
                    className="absolute top-6 right-6 p-3 bg-white/90 hover:bg-primary hover:text-white rounded-2xl backdrop-blur-md transition-all duration-300 shadow-sm z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success("Added to favorites!");
                    }}
                  >
                    <Heart size={18} />
                  </button>
                </div>

                {/* Card Content Area */}
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{item.category}</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 ml-4">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-amber-700">{item.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed mb-8 h-10">
                    {item.subtitle}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {formatINR(item.price)}
                    </p>
                    <Button
                      size="icon"
                      className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-primary shadow-lg shadow-slate-900/10 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item.id);
                      }}
                    >
                      <Plus size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Business Gallery Section */}
      {/* Removed from bottom, moved above cards */}

      {/* Enhanced Footer Section */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 md:mt-24 pb-8">
        <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 lg:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full blur-3xl -mr-32 md:-mr-48 -mt-32 md:-mt-48" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -ml-24 -mb-24" />
          
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 relative z-10">
            {/* Left side - Contact & Map */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Visit Us</h3>
                <p className="text-slate-400 font-medium text-sm md:text-lg max-w-md mt-2">
                  Experience our professional services at our location.
                </p>
              </div>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Address</p>
                    <p className="font-bold text-slate-200 text-sm md:text-base leading-relaxed">
                      {currentBusinessInfo.address || "Address not available"}
                    </p>
                  </div>
                </div>
                
                {/* Phone */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phone</p>
                    <p className="font-bold text-slate-200 text-sm md:text-base">
                      {currentBusinessInfo.phone ? (
                        <a href={`tel:${currentBusinessInfo.phone}`} className="hover:text-primary transition-colors">
                          {currentBusinessInfo.phone}
                        </a>
                      ) : (
                        <span className="text-slate-500">Not available</span>
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Email */}
                {currentBusinessInfo.email && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
                      <p className="font-bold text-slate-200 text-sm md:text-base truncate">
                        <a href={`mailto:${currentBusinessInfo.email}`} className="hover:text-primary transition-colors">
                          {currentBusinessInfo.email}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Opening Hours */}
                {currentBusinessInfo.openingHours && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hours</p>
                      <p className="font-bold text-slate-200 text-sm md:text-base">{currentBusinessInfo.openingHours}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Section */}
              <div className="pt-4">
                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Find Us On Map
                </h4>
                <div className="h-48 md:h-64 lg:h-72 rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-white/5">
                  {typeof currentBusinessInfo.location?.lat === 'number' && typeof currentBusinessInfo.location?.lng === 'number' && currentBusinessInfo.location.lat !== 0 ? (
                    <LeafletMap 
                      position={{ lat: currentBusinessInfo.location.lat, lng: currentBusinessInfo.location.lng }}
                      address={currentBusinessInfo.address}
                      businessName={currentBusinessInfo.name}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold">Map Location</p>
                        <p className="text-[10px] text-slate-500 mt-1">Use directions button below</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                <Button 
                  onClick={handleGetDirections} 
                  className="flex-1 sm:flex-none h-12 md:h-14 px-6 md:px-8 bg-white text-slate-900 hover:bg-primary hover:text-white font-black rounded-xl md:rounded-2xl transition-all"
                >
                  <Navigation className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Get Directions
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDownloadCard(true)} 
                  className="flex-1 sm:flex-none h-12 md:h-14 px-6 md:px-8 border-white/20 text-white hover:bg-white/10 font-black rounded-xl md:rounded-2xl"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Digital Card
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRating(true)} 
                  className="flex-1 sm:flex-none h-12 md:h-14 px-6 md:px-8 border-white/20 text-white hover:bg-white/10 font-black rounded-xl md:rounded-2xl"
                >
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Write Review
                </Button>
              </div>
            </div>

            {/* Right side - Business Card Preview */}
            <div className="flex flex-col justify-center items-center p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 relative group overflow-hidden">
              {/* Background blur effect */}
              {currentBusinessInfo.logo && (
                <div className="absolute inset-0 opacity-10">
                  <img src={safeImageSrc(currentBusinessInfo.logo)} alt="" className="w-full h-full object-cover blur-3xl scale-150" />
                </div>
              )}
              
              <div className="relative z-10 text-center space-y-5 w-full">
                {/* Logo */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-white p-3 md:p-4 mx-auto shadow-2xl border border-white/20">
                  {currentBusinessInfo.logo ? (
                    <img src={safeImageSrc(currentBusinessInfo.logo)} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl">
                      {getBusinessIcon()}
                    </div>
                  )}
                </div>
                
                {/* Business Name & Tagline */}
                <div>
                  <h4 className="text-lg md:text-2xl font-black tracking-tight text-white">{currentBusinessInfo.name || "Business Name"}</h4>
                  <p className="text-primary font-bold uppercase tracking-widest text-[10px] md:text-xs mt-1.5">
                    {currentBusinessInfo.tagline || "Quality Service"}
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex justify-center gap-8 pt-3 pb-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <p className="text-xl md:text-2xl font-black text-white">{currentBusinessInfo.rating || "4.8"}</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Rating</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <p className="text-xl md:text-2xl font-black text-white">{currentBusinessInfo.totalReviews || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Reviews</p>
                  </div>
                </div>
                
                {/* Quick Contact */}
                <div className="flex justify-center gap-3 pt-3 border-t border-white/10">
                  {currentBusinessInfo.phone && (
                    <a 
                      href={`tel:${currentBusinessInfo.phone}`} 
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary flex items-center justify-center transition-all"
                    >
                      <Phone size={18} className="text-white" />
                    </a>
                  )}
                  {currentBusinessInfo.email && (
                    <a 
                      href={`mailto:${currentBusinessInfo.email}`} 
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary flex items-center justify-center transition-all"
                    >
                      <Mail size={18} className="text-white" />
                    </a>
                  )}
                  {(currentBusinessInfo.whatsapp || currentBusinessInfo.phone) && (
                    <a 
                      href={`https://wa.me/${(currentBusinessInfo.whatsapp || currentBusinessInfo.phone).replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-green-600 flex items-center justify-center transition-all"
                    >
                      <MessageCircle size={18} className="text-white" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-10 md:mt-16 pt-6 md:pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              {currentBusinessInfo.logo && (
                <img src={safeImageSrc(currentBusinessInfo.logo)} alt="" className="w-6 h-6 rounded object-contain bg-white p-0.5" />
              )}
              <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.15em]">
                © {new Date().getFullYear()} {currentBusinessInfo.name || "Business"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-slate-600 text-[10px] font-medium">Powered by</p>
              <span className="text-primary font-black text-xs tracking-tight">ScanBit</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Item Detail Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedItem && (
            <div className="flex flex-col md:flex-row">
              {/* Left: Image Gallery */}
              <div className="md:w-1/2 bg-slate-50 relative">
                <div className="aspect-square w-full flex items-center justify-center bg-white">
                  {selectedItem.image ? (
                    <img 
                      src={safeImageSrc(selectedItem.image)} 
                      alt={selectedItem.title} 
                      className="w-full h-full object-contain p-6" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      {getBusinessIcon()}
                    </div>
                  )}
                </div>
                <div className="absolute top-6 left-6">
                  <Badge className="bg-white/90 backdrop-blur-md text-[10px] font-black px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest text-slate-900 border-none">
                    {selectedItem.category}
                  </Badge>
                </div>
              </div>

              {/* Right: Details */}
              <div className="md:w-1/2 p-10 space-y-8 bg-white">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedItem.title}</h2>
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-amber-700">{selectedItem.rating}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{selectedItem.subtitle}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {selectedItem.description || "No detailed description available for this service."}
                  </p>
                  
                  {/* Dynamic Professional Fields */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {selectedItem.duration && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                        <p className="font-bold text-slate-900">{selectedItem.duration}</p>
                      </div>
                    )}
                    {selectedItem.client && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client</p>
                        <p className="font-bold text-slate-900">{selectedItem.client}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Fee</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">{formatINR(selectedItem.price)}</p>
                    </div>
                    {selectedItem.inStock && (
                      <Badge className="bg-green-500/10 text-green-600 border-none font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full">
                        Available Now
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleWhatsAppInquiry(selectedItem)}
                      className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 transition-all"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Inquire on WhatsApp
                    </Button>
                    <Button 
                      onClick={() => handleAddToCart(selectedItem.id)}
                      className="h-14 w-14 bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-all p-0"
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Inquiry Dialog */}
      <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingCart size={20} />
              </div>
              Inquiry List
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
              Review your selected services before inquiring
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(cart).map(([itemId, count]) => {
              const item = [...(currentCatalogData.food || []), ...(currentCatalogData.retail || []), ...(currentCatalogData.creative || []), ...(currentCatalogData.agency || []), ...(currentCatalogData.professional || []), ...(currentCatalogData.wellness || [])].find(i => i.id.toString() === itemId);
              if (!item) return null;
              return (
                <div key={itemId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-slate-100">
                    {item.image ? (
                      <img src={safeImageSrc(item.image)} alt={item.title} className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        {getBusinessIcon()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 truncate">{item.title}</h4>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">{formatINR(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-1.5 border border-slate-100">
                    <button onClick={() => {
                      setCart(prev => {
                        const newCart = { ...prev };
                        if (newCart[itemId] > 1) newCart[itemId] -= 1;
                        else delete newCart[itemId];
                        return newCart;
                      });
                    }} className="text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                    <span className="font-black text-slate-900 text-sm">{count}</span>
                    <button onClick={() => handleAddToCart(itemId)} className="text-slate-400 hover:text-primary transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Estimated Total</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">
                {formatINR(Object.entries(cart).reduce((total, [itemId, count]) => {
                  const item = [...(currentCatalogData.food || []), ...(currentCatalogData.retail || []), ...(currentCatalogData.creative || []), ...(currentCatalogData.agency || []), ...(currentCatalogData.professional || []), ...(currentCatalogData.wellness || [])].find(i => i.id.toString() === itemId);
                  return total + (item?.price || 0) * count;
                }, 0))}
              </p>
            </div>

            <Button 
              onClick={() => {
                const rawPhone = currentBusinessInfo.whatsapp || currentBusinessInfo.phone;
                const phone = rawPhone.replace(/\D/g, '');
                if (!phone) {
                  toast.error("Business WhatsApp number not available");
                  return;
                }
                
                let itemList = "";
                Object.entries(cart).forEach(([itemId, count]) => {
                  const item = [...(currentCatalogData.food || []), ...(currentCatalogData.retail || []), ...(currentCatalogData.creative || []), ...(currentCatalogData.agency || []), ...(currentCatalogData.professional || []), ...(currentCatalogData.wellness || [])].find(i => i.id.toString() === itemId);
                  if (item) itemList += `- ${item.title} (${count}x) - ${formatINR(item.price * count)}\n`;
                });

                const message = encodeURIComponent(
                  `Hello ${currentBusinessInfo.name},\n\n` +
                  `I would like to inquire about the following services from your portfolio:\n\n` +
                  `${itemList}\n` +
                  `Total Estimated: *${formatINR(Object.entries(cart).reduce((total, [itemId, count]) => {
                    const item = [...(currentCatalogData.food || []), ...(currentCatalogData.retail || []), ...(currentCatalogData.creative || []), ...(currentCatalogData.agency || []), ...(currentCatalogData.professional || []), ...(currentCatalogData.wellness || [])].find(i => i.id.toString() === itemId);
                    return total + (item?.price || 0) * count;
                  }, 0))}*\n\n` +
                  `Could you please provide more details and availability?`
                );
                
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
              }}
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 transition-all text-lg"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Send Inquiry via WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={showLanguageMenu} onOpenChange={setShowLanguageMenu}>
        <DialogContent className="max-w-xs rounded-[2rem] p-6 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-black uppercase tracking-widest text-xs text-slate-400">Select Language</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 mt-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any);
                  setShowLanguageMenu(false);
                  toast.success(`Language changed to ${lang.name}`);
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${
                  language === lang.code ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Card Dialog */}
      <Dialog open={showDownloadCard} onOpenChange={setShowDownloadCard}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-black uppercase tracking-tight text-2xl">Digital Business Card</DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
              
              {/* Real Business Card UI */}
              {currentBusinessInfo.businessCardFront ? (
                <div className="relative z-10 space-y-4">
                  <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg">
                    <img src={safeImageSrc(currentBusinessInfo.businessCardFront)} alt="Business Card Front" className="w-full h-auto object-contain" />
                  </div>
                  {currentBusinessInfo.businessCardBack && (
                    <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg">
                      <img src={safeImageSrc(currentBusinessInfo.businessCardBack)} alt="Business Card Back" className="w-full h-auto object-contain" />
                    </div>
                  )}
                  <div className="pt-4 text-center">
                    <h3 className="font-black text-xl leading-none">{currentBusinessInfo.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Official Business Card</p>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    {currentBusinessInfo.logo ? (
                      <img src={safeImageSrc(currentBusinessInfo.logo)} alt="Logo" className="w-12 h-12 rounded-xl object-contain bg-white p-1" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                        {getBusinessIcon()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-black text-xl leading-none">{currentBusinessInfo.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{currentBusinessInfo.tagline}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <MapPin size={14} className="text-primary" />
                      <span className="line-clamp-1">{currentBusinessInfo.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Phone size={14} className="text-primary" />
                      <span>{currentBusinessInfo.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Mail size={14} className="text-primary" />
                      <span>{currentBusinessInfo.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold">{currentBusinessInfo.rating}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Powered by ScanBit</p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-12 rounded-xl font-black bg-slate-900" onClick={() => {
                const link = document.createElement('a');
                link.href = safeImageSrc(currentBusinessInfo.businessCardFront || currentBusinessInfo.logo || '');
                link.download = `${currentBusinessInfo.name}-Business-Card.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Card download started!");
              }}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button variant="outline" className="h-12 rounded-xl font-black" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-black uppercase tracking-tight text-2xl">Rate Our Experience</DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</p>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Email</p>
                  <input
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Review</p>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share your thoughts with us..."
                  className="w-full p-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-medium focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" className="h-12 rounded-xl font-bold text-slate-400" onClick={() => setShowRating(false)}>Cancel</Button>
              <Button className="h-12 rounded-xl font-black bg-slate-900" onClick={handleSubmitRating} disabled={userRating === 0}>Submit Rating</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrap with TranslationProvider
const DemoCatalog = (props: DemoCatalogProps) => {
  return (
    <TranslationProvider translations={demoCatalogTranslations}>
      <DemoCatalogContent {...props} />
    </TranslationProvider>
  );
};

export default DemoCatalog;
