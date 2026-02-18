import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Palette,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShoppingCart,
  Heart,
  MessageCircle,
  Navigation,
  Search,
  LayoutGrid,
  List,
  X,
  Layers,
  ArrowUpDown,
  Star,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CREATIVE_DESIGN_CATEGORIES,
  CREATIVE_DESIGN_SORT_OPTIONS,
  sampleCreativeDesignItems,
  sampleCreativeDesignBusinessInfo,
  type CreativeDesignItem,
} from "./sampleData";
import api from "@/lib/api";
import { toast } from "sonner";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
];

function formatPrice(price: number | null) {
  if (price == null) return "Get quote";
  return `₹${price.toLocaleString("en-IN")}`;
}

function whatsAppUrl(phone: string, text: string) {
  const num = phone.replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

function parseDeliveryDays(str: string | undefined): number {
  if (!str) return 999;
  const m = str.match(/\d+/);
  return m ? parseInt(m[0], 10) : 999;
}

function parseRevisions(str: string | undefined): number {
  if (!str) return 0;
  const m = str.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

export interface CreativeCatalogLiveData {
  businessInfo: {
    name: string;
    tagline: string;
    phone: string;
    whatsapp?: string;
    email: string;
    address: string;
    mapQuery: string;
    mapEmbedUrl?: string;
    logo?: string;
    /** Social links shown in footer when showSocialLinks is true */
    socialMedia?: {
      website?: string;
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
      [key: string]: string | undefined;
    };
  };
  categories: { id: string; name: string }[];
  items: CreativeDesignItem[];
  /** Subtitle under tagline (e.g. "Creative & Design — Services & Portfolio" or by business type) */
  heroSubtitle?: string;
  /** When true, hide language dropdown and use business catalog behaviour (cart, checkout) */
  isLiveCatalog?: boolean;
  /** Show social media links in footer (default true when live) */
  showSocialLinks?: boolean;
  /** Restaurant ID for review submission and reviews link (when live catalog) */
  restaurantId?: string;
}

export function DemoCreativeCatalogPreview(props?: { liveData?: CreativeCatalogLiveData }) {
  const liveData = props?.liveData;
  const businessInfo = liveData?.businessInfo ?? sampleCreativeDesignBusinessInfo;
  const categoriesList = liveData?.categories ?? CREATIVE_DESIGN_CATEGORIES;
  const catalogItems = liveData?.items ?? sampleCreativeDesignItems;
  const heroSubtitle = liveData?.heroSubtitle ?? "Creative & Design — Services & Portfolio";
  const isLiveCatalog = liveData?.isLiveCatalog === true;
  const showSocialLinks = liveData?.showSocialLinks !== false;
  const socialMedia = businessInfo?.socialMedia ?? {};
  const restaurantId = liveData?.restaurantId;

  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<CreativeDesignItem | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: "", email: "", mobile: "", address: "", notes: "" });
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", email: "", mobile: "", comment: "", rating: 0 });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const reviewSubmittedRef = useRef(false);
  const reviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reviewStorageKey = restaurantId ? `creative_catalog_review_submitted_${restaurantId}` : null;
  const hasSubmittedReview = reviewStorageKey ? typeof localStorage !== "undefined" && localStorage.getItem(reviewStorageKey) === "1" : false;

  useEffect(() => {
    if (!isLiveCatalog || !restaurantId || hasSubmittedReview) return;
    const schedule = () => {
      reviewTimerRef.current = setTimeout(() => setShowReviewPopup(true), 20000);
    };
    schedule();
    return () => {
      if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
    };
  }, [isLiveCatalog, restaurantId, hasSubmittedReview]);

  const handleReviewPopupClose = (open: boolean) => {
    if (!open) {
      setShowReviewPopup(false);
      if (!reviewSubmittedRef.current && restaurantId && isLiveCatalog && !hasSubmittedReview) {
        reviewTimerRef.current = setTimeout(() => setShowReviewPopup(true), 20000);
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!restaurantId) return;
    if (!reviewForm.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!reviewForm.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error("Please select a rating (1–5 stars)");
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.submitReview(restaurantId, {
        reviewerName: reviewForm.name.trim(),
        reviewerEmail: reviewForm.email.trim().toLowerCase(),
        reviewerMobile: reviewForm.mobile.trim() || undefined,
        comment: reviewForm.comment.trim() || "—",
        rating: reviewForm.rating,
      });
      toast.success("Thank you! Your review has been submitted.");
      reviewSubmittedRef.current = true;
      if (reviewStorageKey) localStorage.setItem(reviewStorageKey, "1");
      setShowReviewPopup(false);
      setReviewForm({ name: "", email: "", mobile: "", comment: "", rating: 0 });
      if (reviewTimerRef.current) {
        clearTimeout(reviewTimerRef.current);
        reviewTimerRef.current = null;
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = category === "all"
      ? [...catalogItems]
      : catalogItems.filter((i) => i.categoryId === category);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.shortDesc.toLowerCase().includes(q) ||
          i.longDesc.toLowerCase().includes(q)
      );
    }
    const getCatName = (id: string) =>
      categoriesList.find((c) => c.id === id)?.name ?? id;
    if (sortBy === "price-asc") list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sortBy === "price-desc") list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sortBy === "newest") list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else if (sortBy === "popular") list = [...list].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    else if (sortBy === "category-asc") list = [...list].sort((a, b) => getCatName(a.categoryId).localeCompare(getCatName(b.categoryId)));
    else if (sortBy === "category-desc") list = [...list].sort((a, b) => getCatName(b.categoryId).localeCompare(getCatName(a.categoryId)));
    else if (sortBy === "item-asc") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "item-desc") list = [...list].sort((a, b) => b.title.localeCompare(a.title));
    else if (sortBy === "delivery-fast") list = [...list].sort((a, b) => parseDeliveryDays(a.deliveryDays) - parseDeliveryDays(b.deliveryDays));
    else if (sortBy === "revisions-most") list = [...list].sort((a, b) => parseRevisions(b.revisions) - parseRevisions(a.revisions));
    return list;
  }, [category, sortBy, searchQuery, catalogItems, categoriesList]);

  const hasActiveFilters = category !== "all" || searchQuery.trim() !== "";
  const clearFilters = () => {
    setCategory("all");
    setSearchQuery("");
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCart = (id: string) => {
    setCartIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessInfo.mapQuery)}`;

  const cartItems = useMemo(
    () => catalogItems.filter((i) => cartIds.has(i.id)),
    [catalogItems, cartIds]
  );

  const buildOrderMessage = () => {
    const lines = [
      `*Order / Enquiry*`,
      `Business: ${businessInfo.name}`,
      ``,
      `*Customer details*`,
      `Name: ${checkoutForm.name}`,
      `Email: ${checkoutForm.email}`,
      `Mobile: ${checkoutForm.mobile}`,
      `Delivery/Address: ${checkoutForm.address || "—"}`,
      checkoutForm.notes ? `Notes: ${checkoutForm.notes}` : "",
      ``,
      `*Items (${cartItems.length})*`,
      ...cartItems.map((i) => {
        const price = i.price != null ? `₹${Number(i.price).toLocaleString("en-IN")}` : "Get quote";
        return `• ${i.title} — ${price}${i.imageUrl ? `\n  ${i.imageUrl}` : ""}`;
      }),
    ];
    return lines.filter(Boolean).join("\n");
  };

  const handleOrderNow = () => {
    const msg = buildOrderMessage();
    const link = whatsAppUrl(businessInfo.whatsapp || businessInfo.phone, msg);
    window.open(link, "_blank");
    setCheckoutOpen(false);
    setCartIds(new Set());
    setCheckoutForm({ name: "", email: "", mobile: "", address: "", notes: "" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Header — theme */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft overflow-hidden">
              {businessInfo.logo ? (
                <img src={businessInfo.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-foreground font-bold text-sm sm:text-base">
                  {(businessInfo.name || "C").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <nav className="hidden sm:flex items-center gap-6">
              <a href="#catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Catalog
              </a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isLiveCatalog && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative h-9 gap-2 border-border"
                  onClick={() => cartItems.length > 0 && setCheckoutOpen(true)}
                  disabled={cartItems.length === 0}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
                <Button
                  size="sm"
                  className="h-9 gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => cartItems.length > 0 && setCheckoutOpen(true)}
                  disabled={cartItems.length === 0}
                >
                  Checkout
                </Button>
              </>
            )}
            {!isLiveCatalog && (
              <>
                <Globe className="w-4 h-4 text-muted-foreground hidden sm:block" aria-hidden />
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[100px] sm:w-[120px] h-9 text-xs sm:text-sm border-border bg-muted/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero — business name & tagline (light soft orange background) */}
      <section className="bg-orange-50/80 border-b border-orange-100 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-soft overflow-hidden">
            {businessInfo.logo ? (
              <img src={businessInfo.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <Palette className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {businessInfo.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl mx-auto">
            {businessInfo.tagline}
          </p>
          <p className="text-muted-foreground/80 mt-1 text-xs sm:text-sm max-w-lg mx-auto">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Catalog toolbar: search, category, sort, view — compact with icons on mobile */}
      <section id="catalog" className="sticky top-[57px] sm:top-[61px] z-30 bg-card border-b border-border px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-6xl mx-auto space-y-2 sm:space-y-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="relative flex-1 min-w-0 max-w-full sm:max-w-md">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 sm:h-9 pl-8 sm:pl-9 pr-3 rounded-md border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 sm:hidden" aria-hidden />
              <span className="hidden sm:inline text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Category</span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8 sm:h-9 w-[100px] sm:w-[140px] md:w-[160px] text-[10px] sm:text-xs border-border bg-background [&>span]:truncate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoriesList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 sm:hidden" aria-hidden />
              <span className="hidden sm:inline text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Sort</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 sm:h-9 w-[100px] sm:w-[160px] md:w-[200px] text-[10px] sm:text-xs border-border bg-background [&>span]:truncate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREATIVE_DESIGN_SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 border border-border rounded-md p-0.5 bg-muted/50 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 sm:p-1.5 rounded ${viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 sm:p-1.5 rounded ${viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 min-h-[24px]">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredAndSorted.length}</span>{" "}
              {filteredAndSorted.length === 1 ? "item" : "items"}
            </p>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 sm:h-8 gap-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground px-2"
                onClick={clearFilters}
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Catalog grid or list — mobile-friendly, no image overflow */}
      <section className="flex-1 px-3 sm:px-6 py-6 sm:py-12 min-w-0">
        <div className="max-w-6xl mx-auto w-full">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredAndSorted.map((item) => {
                const catName = categoriesList.find((c) => c.id === item.categoryId)?.name ?? item.categoryId;
                const isLiked = likedIds.has(item.id);
                const inCart = cartIds.has(item.id);
                const waText = `Hi, I'm interested in "${item.title}". Could you share more details?`;
                const waLink = whatsAppUrl(businessInfo.whatsapp, waText);

                return (
                  <Card
                    key={item.id}
                    className="group border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all bg-card cursor-pointer flex flex-col h-full min-w-0"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="aspect-[4/3] w-full min-h-0 shrink-0 bg-primary/10 flex items-center justify-center relative overflow-hidden rounded-t-lg">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="max-w-full max-h-full w-auto h-auto object-contain object-center" />
                      ) : (
                        <Palette className="w-12 h-12 text-primary/30 flex-shrink-0" />
                      )}
                      {item.isNew && (
                        <span className="absolute top-2 right-2 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5">
                          New
                        </span>
                      )}
                      {item.isPopular && (
                        <span className="absolute top-2 left-2 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5">
                          Popular
                        </span>
                      )}
                    </div>
                    <CardContent className="p-3 sm:p-4 flex-1 flex flex-col min-w-0">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider truncate block">
                        {catName}
                      </span>
                      <h3 className="font-semibold text-foreground mt-1 text-sm sm:text-base line-clamp-2 break-words">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 flex-1 min-h-0 break-words">
                        {item.shortDesc}
                      </p>
                      <p className="font-bold text-primary mt-2 text-sm sm:text-base">
                        {formatPrice(item.price)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 text-xs bg-accent hover:bg-accent/90 text-accent-foreground flex-1 sm:flex-none"
                          asChild
                        >
                          <a href={waLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-border"
                          onClick={() => toggleCart(item.id)}
                        >
                          <ShoppingCart className={`w-4 h-4 ${inCart ? "text-primary" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-border"
                          onClick={() => toggleLike(item.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${isLiked ? "fill-primary text-primary" : ""}`}
                          />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <ul className="space-y-3 w-full min-w-0">
              {filteredAndSorted.map((item) => {
                const catName = categoriesList.find((c) => c.id === item.categoryId)?.name ?? item.categoryId;
                const isLiked = likedIds.has(item.id);
                const inCart = cartIds.has(item.id);
                const waText = `Hi, I'm interested in "${item.title}". Could you share more details?`;
                const waLink = whatsAppUrl(businessInfo.whatsapp, waText);

                return (
                  <Card
                    key={item.id}
                    className="group border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all bg-card cursor-pointer min-w-0"
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-0 flex flex-row min-w-0">
                      {/* Left: image */}
                      <div className="w-24 sm:w-32 flex-shrink-0 aspect-square bg-primary/10 flex items-center justify-center relative overflow-hidden rounded-l-lg">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="max-w-full max-h-full w-auto h-auto object-contain object-center" />
                        ) : (
                          <Palette className="w-8 h-8 sm:w-10 sm:h-10 text-primary/30 flex-shrink-0" />
                        )}
                        {item.isNew && (
                          <span className="absolute top-1 right-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold px-1.5 py-0.5">
                            New
                          </span>
                        )}
                        {item.isPopular && (
                          <span className="absolute top-1 left-1 rounded-full bg-accent text-accent-foreground text-[9px] font-semibold px-1.5 py-0.5">
                            Popular
                          </span>
                        )}
                      </div>
                      {/* Right: content, price, cart */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 p-3 sm:p-4">
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider truncate block">
                            {catName}
                          </span>
                          <h3 className="font-semibold text-foreground mt-0.5 text-sm sm:text-base line-clamp-2 break-words">
                            {item.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-2 break-words">
                            {item.shortDesc}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          <p className="font-bold text-primary text-sm sm:text-base shrink-0">
                            {formatPrice(item.price)}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-border shrink-0"
                              onClick={() => toggleCart(item.id)}
                              title={inCart ? "Remove from cart" : "Add to cart"}
                            >
                              <ShoppingCart className={`w-4 h-4 ${inCart ? "text-primary" : ""}`} />
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 gap-1.5 text-xs bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
                              asChild
                            >
                              <a href={waLink} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-border shrink-0"
                              onClick={() => toggleLike(item.id)}
                              title={isLiked ? "Unlike" : "Like"}
                            >
                              <Heart className={`w-4 h-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Item detail popup — image constrained, no overflow */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">{selectedItem.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 min-w-0">
                <div className="aspect-video w-full max-h-[220px] sm:max-h-[240px] rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-border p-1">
                  {selectedItem.imageUrl ? (
                    <img src={selectedItem.imageUrl} alt="" className="max-w-full max-h-full w-auto h-auto object-contain object-center rounded-lg" />
                  ) : (
                    <Palette className="w-16 h-16 text-primary/30 flex-shrink-0" />
                  )}
                </div>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                  {categoriesList.find((c) => c.id === selectedItem.categoryId)?.name ?? selectedItem.categoryId}
                </span>
                <h2 className="text-xl font-bold text-foreground">{selectedItem.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedItem.longDesc}</p>
                {selectedItem.deliveryDays && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Delivery:</strong> {selectedItem.deliveryDays}
                    {selectedItem.revisions && ` • Revisions: ${selectedItem.revisions}`}
                  </p>
                )}
                <p className="text-lg font-bold text-primary">{formatPrice(selectedItem.price)}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="default"
                    className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                    asChild
                  >
                    <a
                      href={whatsAppUrl(
                        businessInfo.whatsapp,
                        `Hi, I'm interested in "${selectedItem.title}". Could you share more details and availability?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact on WhatsApp
                    </a>
                  </Button>
                  <Button
                    size="default"
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      toggleCart(selectedItem.id);
                      setSelectedItem(null);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {cartIds.has(selectedItem.id) ? "Remove from cart" : "Add to cart"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout popup — professional form + order summary, send via WhatsApp */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout — Order details</DialogTitle>
            <DialogDescription>
              Fill in your details. Order summary will be sent to the business on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="co-name">Name *</Label>
              <Input
                id="co-name"
                placeholder="Your full name"
                value={checkoutForm.name}
                onChange={(e) => setCheckoutForm((f) => ({ ...f, name: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="co-email">Email *</Label>
              <Input
                id="co-email"
                type="email"
                placeholder="email@example.com"
                value={checkoutForm.email}
                onChange={(e) => setCheckoutForm((f) => ({ ...f, email: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="co-mobile">Mobile number *</Label>
              <Input
                id="co-mobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={checkoutForm.mobile}
                onChange={(e) => setCheckoutForm((f) => ({ ...f, mobile: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="co-address">Delivery / Address</Label>
              <Textarea
                id="co-address"
                placeholder="Delivery address or location for order"
                value={checkoutForm.address}
                onChange={(e) => setCheckoutForm((f) => ({ ...f, address: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="co-notes">Notes (optional)</Label>
              <Textarea
                id="co-notes"
                placeholder="Special requests or instructions"
                value={checkoutForm.notes}
                onChange={(e) => setCheckoutForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-sm font-semibold text-foreground">Order summary ({cartItems.length} items)</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {cartItems.map((i) => (
                  <li key={i.id}>
                    {i.title} — {formatPrice(i.price)}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className="w-full h-11 gap-2 bg-primary hover:bg-primary/90"
              onClick={handleOrderNow}
              disabled={!checkoutForm.name.trim() || !checkoutForm.email.trim() || !checkoutForm.mobile.trim() || cartItems.length === 0}
            >
              <MessageCircle className="w-4 h-4" />
              Order now — Send on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review popup — after 20s or via footer "Give review"; re-show after 20s if cancelled; never show again after submit */}
      <Dialog open={showReviewPopup} onOpenChange={handleReviewPopupClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>How was your experience?</DialogTitle>
            <DialogDescription>
              Your feedback helps {businessInfo.name} improve. It only takes a moment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-medium">Rating *</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-8 h-8 sm:w-9 sm:h-9 ${
                        star <= reviewForm.rating ? "fill-amber-400 text-amber-500" : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-name">Name *</Label>
              <Input
                id="review-name"
                placeholder="Your name"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-email">Email *</Label>
              <Input
                id="review-email"
                type="email"
                placeholder="you@example.com"
                value={reviewForm.email}
                onChange={(e) => setReviewForm((f) => ({ ...f, email: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-mobile">Mobile (optional)</Label>
              <Input
                id="review-mobile"
                type="tel"
                placeholder="10-digit number"
                value={reviewForm.mobile}
                onChange={(e) => setReviewForm((f) => ({ ...f, mobile: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-comment">Your review (optional)</Label>
              <Textarea
                id="review-comment"
                placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
            <Button
              className="w-full h-11"
              onClick={handleSubmitReview}
              disabled={reviewSubmitting}
            >
              {reviewSubmitting ? "Submitting..." : "Submit review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer — theme */}
      <footer id="contact" className="gradient-dark text-background mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 border border-primary-foreground/20 shadow-soft overflow-hidden">
                  {businessInfo.logo ? (
                    <img src={businessInfo.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-foreground font-bold text-lg">
                      {(businessInfo.name || "C").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-background text-lg">{businessInfo.name}</h3>
                  <p className="text-sm text-background/70 mt-0.5">{businessInfo.tagline}</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-background/80">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-background/60 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{businessInfo.address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-background/60 flex-shrink-0" />
                  <a href={`tel:${businessInfo.phone}`} className="hover:text-background transition-colors break-all">
                    {businessInfo.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-background/60 flex-shrink-0" />
                  <a href={`mailto:${businessInfo.email}`} className="hover:text-background transition-colors break-all">
                    {businessInfo.email}
                  </a>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                {isLiveCatalog && restaurantId && (
                  <Button
                    size="sm"
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-background border border-amber-400/30 h-10 gap-2"
                    onClick={() => setShowReviewPopup(true)}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    Give review
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2"
                  asChild
                >
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Navigation className="w-4 h-4" />
                    Get directions
                  </a>
                </Button>
                {isLiveCatalog && restaurantId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-background/90 hover:text-background hover:bg-background/10 border border-background/20 h-10 gap-2"
                    asChild
                  >
                    <Link to={`/menu/${restaurantId}/reviews`} className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      View reviews
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-xl overflow-hidden border border-background/20 bg-background/5 h-64 sm:h-72 lg:h-80 relative">
                {businessInfo.mapEmbedUrl ? (
                  <iframe
                    title={`${businessInfo.name} location map`}
                    src={businessInfo.mapEmbedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                    <MapPin className="w-12 h-12 text-background/50" />
                    <p className="text-background/60 text-sm text-center max-w-xs">Map unavailable</p>
                    <Button size="sm" variant="outline" className="border-background/30 text-background/90" asChild>
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <Navigation className="w-4 h-4" />
                        Open in Google Maps
                      </a>
                    </Button>
                  </div>
                )}
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-medium text-background hover:bg-background hover:text-foreground transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
          {showSocialLinks && (socialMedia?.website || socialMedia?.facebook || socialMedia?.instagram || socialMedia?.twitter || socialMedia?.linkedin || socialMedia?.youtube) && (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-background/80">Follow us</span>
              <div className="flex flex-wrap items-center gap-3">
                {socialMedia.website && (
                  <a href={socialMedia.website.startsWith("http") ? socialMedia.website : `https://${socialMedia.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors" aria-label="Website">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.facebook && (
                  <a href={socialMedia.facebook.startsWith("http") ? socialMedia.facebook : `https://facebook.com/${socialMedia.facebook.replace(/^\/+|\/+$/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors" aria-label="Facebook">
                    <FaFacebook className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.instagram && (
                  <a href={socialMedia.instagram.startsWith("http") ? socialMedia.instagram : `https://instagram.com/${socialMedia.instagram.replace(/^\/+|\/+$/g, "").replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors" aria-label="Instagram">
                    <FaInstagram className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.twitter && (
                  <a href={socialMedia.twitter.startsWith("http") ? socialMedia.twitter : `https://twitter.com/${socialMedia.twitter.replace(/^\/+|\/+$/g, "").replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors" aria-label="Twitter">
                    <FaTwitter className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.linkedin && (
                  <a href={socialMedia.linkedin.startsWith("http") ? socialMedia.linkedin : `https://linkedin.com/company/${socialMedia.linkedin.replace(/^\/+|\/+$/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors" aria-label="LinkedIn">
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                )}
                {socialMedia.youtube && (
                  <a href={socialMedia.youtube.startsWith("http") ? socialMedia.youtube : `https://youtube.com/${socialMedia.youtube.replace(/^\/+|\/+$/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors" aria-label="YouTube">
                    <FaYoutube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          )}
          <div className="mt-12 pt-8 border-t border-background/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-background/60">
            <span>© {new Date().getFullYear()} {businessInfo.name}. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Powered by <span className="font-medium text-background/80">ScanBit</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
