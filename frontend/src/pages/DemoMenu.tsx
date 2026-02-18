import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/lib/api";
import { 
  ArrowLeft, 
  Flame, 
  Star, 
  Plus, 
  Minus, 
  ChefHat,
  Download,
  MapPin,
  Globe,
  Share2,
  Heart,
  Phone,
  Mail,
  Clock,
  Award,
  Users,
  QrCode,
  X,
  CheckCircle2,
  ChevronDown,
  Languages,
  MessageCircle,
  Navigation,
  MessageSquare,
  ArrowRight,
  SlidersHorizontal,
  Filter,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TranslationProvider, useTranslation } from "@/hooks/useTranslation";
import { demoMenuTranslations } from "@/translations/demoMenu";
import { safeImageSrc } from "@/lib/imageUtils";
import LeafletMap from "@/components/LeafletMap";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react";

// --- Types ---
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isVeg: boolean;
  isSpicy?: boolean;
  isPopular?: boolean;
  rating?: number;
  reviews?: number;
  prepTime?: string;
  calories?: number;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  items: MenuItem[];
}

interface RestaurantInfo {
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
  cuisine: string;
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

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

// --- Helper Component: Veg/Non-Veg Symbol ---
const DietIndicator = ({ isVeg }: { isVeg: boolean }) => (
  <div className={`w-4 h-4 border-[2px] flex items-center justify-center rounded-[4px] flex-shrink-0 ${isVeg ? 'border-green-600' : 'border-red-600'}`}>
    <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
  </div>
);

interface DemoMenuProps {
  restaurantId?: string;
  initialData?: any;
}

const DemoMenuContent = ({ restaurantId: propRestaurantId, initialData }: DemoMenuProps) => {
  const { language, setLanguage, t } = useTranslation();
  const { restaurantId: paramRestaurantId } = useParams();
  const restaurantId = propRestaurantId || paramRestaurantId;
  
  const [realMenuData, setRealMenuData] = useState<any>(null);
  const [realRestaurantInfo, setRealRestaurantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(!!restaurantId && !initialData);
  
  // Use real data or fall back to demo data
  const currentMenuData = realMenuData || [];
  const currentRestaurantInfo = realRestaurantInfo || {
    name: "Loading...",
    tagline: "Please wait",
    address: "",
    phone: "",
    email: "",
    rating: 4.8,
    totalReviews: 0,
    openingHours: "",
    cuisine: ""
  };
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showDownloadCard, setShowDownloadCard] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  const processData = (data: any) => {
    const transformedCategories = (data.categories || []).map((cat: any) => ({
      id: cat.id || cat._id,
      name: cat.name,
      emoji: cat.emoji || '🍽️',
      items: (cat.items || []).map((item: any) => ({
        id: item.id || item._id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        offerPrice: item.offerPrice,
        isVeg: item.isVeg ?? true,
        isSpicy: item.isSpicy ?? false,
        isPopular: item.isPopular ?? false,
        rating: item.rating || 4.8,
        reviews: item.reviews || Math.floor(Math.random() * 50) + 10,
        prepTime: item.prepTime,
        calories: item.calories,
        image: item.image || item.images?.[0],
      }))
    }));
    
    setRealMenuData(transformedCategories);
    setRealRestaurantInfo({
      name: data.restaurant?.name || 'Restaurant',
      logo: data.restaurant?.logo,
      tagline: data.restaurant?.tagline || 'Fresh • Local • Delicious',
      address: data.restaurant?.address || data.restaurant?.location?.address || '',
      phone: data.restaurant?.phone || '',
      whatsapp: data.restaurant?.whatsapp || '',
      email: data.restaurant?.email || '',
      rating: data.restaurant?.rating ?? 4.8,
      totalReviews: data.restaurant?.totalReviews ?? 124,
      openingHours: data.restaurant?.openingHours || '',
      cuisine: data.restaurant?.businessType || 'Multi-Cuisine',
      gallery: data.restaurant?.foodImages || [],
      businessCardFront: data.restaurant?.businessCardFront || data.restaurant?.businessCard,
      businessCardBack: data.restaurant?.businessCardBack,
      location: data.restaurant?.location,
    });
    
    if (transformedCategories.length > 0) {
      setActiveCategory(transformedCategories[0].id);
    }
  };

  useEffect(() => {
    if (restaurantId && !initialData) {
      const fetchMenu = async () => {
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
      fetchMenu();
    } else if (initialData) {
      processData(initialData);
      setLoading(false);
    }
  }, [restaurantId, initialData]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    toast.success("Added to inquiry list");
  };

  const handleWhatsAppInquiry = (item: MenuItem) => {
    const rawPhone = currentRestaurantInfo.whatsapp || currentRestaurantInfo.phone;
    const phone = rawPhone.replace(/\D/g, '');
    if (!phone) {
      toast.error("Restaurant phone number not available");
      return;
    }
    
    const message = encodeURIComponent(
      `Hello ${currentRestaurantInfo.name},\n\n` +
      `I am interested in ordering: *${item.name}*\n` +
      `Price: *${formatINR(item.price)}*\n` +
      `Description: ${item.description}\n\n` +
      `Could you please confirm if this is available?`
    );
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleGetDirections = () => {
    const address = currentRestaurantInfo.address;
    const location = currentRestaurantInfo.location;
    let url = "";
    
    if (location?.lat && location?.lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentRestaurantInfo.name,
          text: `Check out ${currentRestaurantInfo.name} menu!`,
          url: window.location.href,
        });
      } catch (error) {

      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
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

    const currentRestaurantId = restaurantId || (currentRestaurantInfo as any)?.id || (currentRestaurantInfo as any)?._id;
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

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  // Opened at /demo-menu with no data — show how to see the real menu
  if (!restaurantId && !initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f5] p-4">
        <div className="max-w-md w-full text-center space-y-6 rounded-2xl bg-white p-8 shadow-lg border border-slate-100">
          <h1 className="text-xl font-bold text-slate-900">View your business menu</h1>
          <p className="text-slate-600 text-sm">
            This page only shows your menu when opened with your <strong>menu link</strong>. Do not use <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">/demo-menu</code>.
          </p>
          <p className="text-slate-600 text-sm">
            Use this URL instead: <br />
            <code className="mt-2 inline-block bg-slate-100 px-3 py-2 rounded-lg text-sm break-all">
              /menu/YOUR_RESTAURANT_ID
            </code>
          </p>
          <p className="text-slate-500 text-xs">
            Get your link from the dashboard: QR Codes or “View menu” — e.g. <code className="bg-slate-100 px-1 rounded">http://localhost:5174/menu/697a6041c72fd98667de76c9</code>
          </p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f5]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-32 bg-[#fff8f5]">
      
      {/* Enhanced Header with Actions */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-white py-4'}`}>
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              {currentRestaurantInfo.logo ? (
                <img src={safeImageSrc(currentRestaurantInfo.logo)} alt="Logo" className="w-10 h-10 rounded-xl object-contain border border-slate-100 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ChefHat className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none">{currentRestaurantInfo.name}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Digital Menu</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="p-2.5 rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
                <Share2 size={20} />
              </button>
              <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="p-2.5 rounded-full hover:bg-slate-50 text-slate-500 transition-colors relative">
                <Globe size={20} />
              </button>
            </div>
          </div>

          {/* Categories Scroller */}
          {currentMenuData.length > 0 && (
          <div className="mt-4 border-b border-slate-100 overflow-x-auto no-scrollbar pb-0">
            <div className="flex gap-6 pr-4 w-max">
              {currentMenuData.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`relative pb-3 px-1 transition-all duration-300 ${
                    activeCategory === category.id 
                      ? "text-primary scale-105" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-black uppercase tracking-widest whitespace-nowrap">
                    <span className="text-lg">{category.emoji}</span>
                    {category.name}
                  </span>
                  {activeCategory === category.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary),0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="container max-w-4xl mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
              {currentMenuData.find((c: any) => c.id === activeCategory)?.name || 'Our Menu'}
            </h2>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-slate-900">{currentRestaurantInfo.rating}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span>{currentRestaurantInfo.tagline}</span>
            </div>
          </div>
          
          {/* Veg Toggle & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-[1.5rem] border border-slate-100">
              <div className={`w-3 h-3 rounded-full ${vegOnly ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-200'}`} />
              <Label htmlFor="veg-toggle-hero" className="text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer">Veg Only</Label>
              <Switch
                id="veg-toggle-hero"
                checked={vegOnly}
                onCheckedChange={setVegOnly}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 h-12 bg-slate-50 border-none rounded-[1.5rem] font-bold text-xs uppercase tracking-widest">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                <SelectItem value="all">All Categories</SelectItem>
                {currentMenuData.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-12 bg-slate-50 border-none rounded-[1.5rem] font-bold text-xs uppercase tracking-widest">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="price-low">Price: Low-High</SelectItem>
                <SelectItem value="price-high">Price: High-Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Business Highlights Slider */}
      {currentRestaurantInfo.gallery && currentRestaurantInfo.gallery.length > 0 && (
        <div className="container max-w-4xl mx-auto px-4 mb-12">
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
              {currentRestaurantInfo.gallery.map((url: string, i: number) => (
                <div key={i} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] aspect-video relative group px-2">
                  <div className="w-full h-full rounded-[2rem] overflow-hidden">
                    <img src={safeImageSrc(url)} alt={`Highlight ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Menu Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-12">
          {currentMenuData
            .filter((cat: any) => selectedCategory === "all" ? (!activeCategory || cat.id === activeCategory) : cat.id === selectedCategory)
            .map((category: any) => {
              let filteredItems = category.items.filter((item: any) => !vegOnly || item.isVeg);
              
              if (sortBy === "price-low") {
                filteredItems.sort((a: any, b: any) => a.price - b.price);
              } else if (sortBy === "price-high") {
                filteredItems.sort((a: any, b: any) => b.price - a.price);
              } else if (sortBy === "rating") {
                filteredItems.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
              } else if (sortBy === "popular") {
                filteredItems.sort((a: any, b: any) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
              }

              if (filteredItems.length === 0) return null;

              return (
                <div key={category.id} className="space-y-6">
                  <div className="grid gap-6">
                    {filteredItems.map((item: any) => (
                      <Card key={item.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-slate-50/50">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {/* Item Image */}
                            <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden bg-white">
                              {item.image ? (
                                <img src={safeImageSrc(item.image)} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-100">
                                  <ChefHat className="w-16 h-16" />
                                </div>
                              )}
                              <div className="absolute top-4 left-4">
                                <DietIndicator isVeg={item.isVeg} />
                              </div>
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-4 mb-2">
                                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                  <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">{formatINR(item.price)}</p>
                                </div>
                                <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-4">{item.description}</p>
                                
                                <div className="flex flex-wrap gap-2">
                                  {item.isPopular && <Badge className="bg-amber-500/10 text-amber-600 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">Bestseller</Badge>}
                                  {item.isSpicy && <Badge className="bg-red-500/10 text-red-600 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">Spicy</Badge>}
                                  {item.prepTime && <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border-slate-200 text-slate-400">{item.prepTime}</Badge>}
                                </div>
                              </div>

                              <div className="mt-6 flex items-center gap-3">
                                <Button 
                                  onClick={() => handleWhatsAppInquiry(item)}
                                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-600/10 transition-all"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Order on WhatsApp
                                </Button>
                                <Button 
                                  onClick={() => handleAddToCart(item.id)}
                                  className="h-12 w-12 bg-slate-900 text-white font-black rounded-xl shadow-lg shadow-slate-900/10 transition-all p-0"
                                >
                                  <Plus className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      {/* Business Gallery Section */}
      {/* Removed from bottom, moved above menu */}

      {/* Footer — professional full-width footer */}
      <footer className="mt-20 w-full bg-slate-900 text-slate-300" key={currentRestaurantInfo?.name ?? "footer"}>
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Brand & contact column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-start gap-4">
                {currentRestaurantInfo?.logo ? (
                  <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 p-2 flex-shrink-0 overflow-hidden">
                    <img src={safeImageSrc(currentRestaurantInfo.logo)} alt="" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-7 h-7 text-slate-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-white tracking-tight">{currentRestaurantInfo?.name || "Business"}</h3>
                  {(currentRestaurantInfo?.tagline || currentRestaurantInfo?.cuisine) && (
                    <p className="text-sm text-slate-400 mt-0.5">{currentRestaurantInfo.tagline || currentRestaurantInfo.cuisine}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Contact & hours</h4>
                <ul className="space-y-3.5 text-sm">
                  {currentRestaurantInfo?.address ? (
                    <li className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 leading-relaxed">{currentRestaurantInfo.address}</span>
                    </li>
                  ) : null}
                  {currentRestaurantInfo?.phone ? (
                    <li className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <a href={`tel:${currentRestaurantInfo.phone}`} className="text-slate-300 hover:text-white transition-colors">
                        {currentRestaurantInfo.phone}
                      </a>
                    </li>
                  ) : null}
                  {currentRestaurantInfo?.email ? (
                    <li className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <a href={`mailto:${currentRestaurantInfo.email}`} className="text-slate-300 hover:text-white transition-colors truncate">
                        {currentRestaurantInfo.email}
                      </a>
                    </li>
                  ) : null}
                  {currentRestaurantInfo?.openingHours ? (
                    <li className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 leading-relaxed">{currentRestaurantInfo.openingHours}</span>
                    </li>
                  ) : null}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleGetDirections} size="sm" className="rounded-lg h-10 px-4 bg-white text-slate-900 hover:bg-slate-100 font-medium">
                  <Navigation className="w-4 h-4 mr-2" /> Get directions
                </Button>
                {(currentRestaurantInfo?.whatsapp || currentRestaurantInfo?.phone) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg h-10 px-4 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-medium"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${(currentRestaurantInfo.whatsapp || currentRestaurantInfo.phone).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowDownloadCard(true)} className="rounded-lg h-10 px-4 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-medium">
                  <Download className="w-4 h-4 mr-2" /> Digital card
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowRating(true)} className="rounded-lg h-10 px-4 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-medium">
                  <Star className="w-4 h-4 mr-2 fill-amber-400/80 text-amber-400" /> Review
                </Button>
              </div>
            </div>

            {/* Map column */}
            <div className="lg:col-span-7">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Location</h4>
              <div className="h-64 sm:h-72 lg:h-80 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                {typeof currentRestaurantInfo?.location?.lat === "number" && typeof currentRestaurantInfo?.location?.lng === "number" ? (
                  <LeafletMap
                    position={{ lat: currentRestaurantInfo.location.lat, lng: currentRestaurantInfo.location.lng }}
                    address={currentRestaurantInfo.address}
                    businessName={currentRestaurantInfo.name}
                    height="100%"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-500 text-sm px-4">
                    <MapPin className="w-12 h-12 text-slate-600" />
                    <span className="text-center">Location not set. Get directions using your preferred maps app.</span>
                    <Button variant="outline" size="sm" onClick={handleGetDirections} className="mt-1 border-slate-600 text-slate-300 hover:bg-slate-800">
                      Open in maps
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-700/80 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} {currentRestaurantInfo?.name || "Business"}. All rights reserved.</span>
            <span>Powered by <strong className="text-slate-400">ScanBit</strong></span>
          </div>
        </div>
      </footer>

      {/* Floating Action Bar */}
      {getCartCount() > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
          <Button onClick={() => setShowCartDialog(true)} className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl shadow-2xl flex items-center justify-between px-6 group active:scale-95 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-black">{getCartCount()}</div>
              <span className="uppercase tracking-widest text-xs">View Inquiry</span>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}

      {/* Modals */}
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
              Review your selected items before inquiring
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(cart).map(([itemId, count]) => {
              const item = currentMenuData.flatMap((c: any) => c.items).find((i: any) => i.id.toString() === itemId);
              if (!item) return null;
              return (
                <div key={itemId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-slate-100">
                    {item.image ? (
                      <img src={safeImageSrc(item.image)} alt={item.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <ChefHat size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 truncate">{item.name}</h4>
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
                  const item = currentMenuData.flatMap((c: any) => c.items).find((i: any) => i.id.toString() === itemId);
                  return total + (item?.price || 0) * count;
                }, 0))}
              </p>
            </div>

            <Button 
              onClick={() => {
                const rawPhone = currentRestaurantInfo.whatsapp || currentRestaurantInfo.phone;
                const phone = rawPhone.replace(/\D/g, '');
                if (!phone) {
                  toast.error("Business WhatsApp number not available");
                  return;
                }
                
                let itemList = "";
                Object.entries(cart).forEach(([itemId, count]) => {
                  const item = currentMenuData.flatMap((c: any) => c.items).find((i: any) => i.id.toString() === itemId);
                  if (item) itemList += `- ${item.name} (${count}x) - ${formatINR(item.price * count)}\n`;
                });

                const message = encodeURIComponent(
                  `Hello ${currentRestaurantInfo.name},\n\n` +
                  `I would like to inquire about the following items from your menu:\n\n` +
                  `${itemList}\n` +
                  `Total Estimated: *${formatINR(Object.entries(cart).reduce((total, [itemId, count]) => {
                    const item = currentMenuData.flatMap((c: any) => c.items).find((i: any) => i.id.toString() === itemId);
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

      <Dialog open={showDownloadCard} onOpenChange={setShowDownloadCard}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-black uppercase tracking-tight text-2xl">Digital Business Card</DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
              
              {/* Real Business Card UI */}
              {currentRestaurantInfo.businessCardFront ? (
                <div className="relative z-10 space-y-4">
                  <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg">
                    <img src={safeImageSrc(currentRestaurantInfo.businessCardFront)} alt="Business Card Front" className="w-full h-auto object-contain" />
                  </div>
                  {currentRestaurantInfo.businessCardBack && (
                    <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg">
                      <img src={safeImageSrc(currentRestaurantInfo.businessCardBack)} alt="Business Card Back" className="w-full h-auto object-contain" />
                    </div>
                  )}
                  <div className="pt-4 text-center">
                    <h3 className="font-black text-xl leading-none">{currentRestaurantInfo.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Official Business Card</p>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    {currentRestaurantInfo.logo ? (
                      <img src={safeImageSrc(currentRestaurantInfo.logo)} alt="Logo" className="w-12 h-12 rounded-xl object-contain bg-white p-1" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                        <ChefHat className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-black text-xl leading-none">{currentRestaurantInfo.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{currentRestaurantInfo.tagline}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <MapPin size={14} className="text-primary" />
                      <span className="line-clamp-1">{currentRestaurantInfo.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Phone size={14} className="text-primary" />
                      <span>{currentRestaurantInfo.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Mail size={14} className="text-primary" />
                      <span>{currentRestaurantInfo.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold">{currentRestaurantInfo.rating}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Powered by ScanBit</p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-12 rounded-xl font-black bg-slate-900" onClick={() => {
                const link = document.createElement('a');
                link.href = safeImageSrc(currentRestaurantInfo.businessCardFront || currentRestaurantInfo.logo || '');
                link.download = `${currentRestaurantInfo.name}-Business-Card.png`;
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
const DemoMenu = (props: DemoMenuProps) => {
  return (
    <TranslationProvider translations={demoMenuTranslations}>
      <DemoMenuContent {...props} />
    </TranslationProvider>
  );
};

export default DemoMenu;
