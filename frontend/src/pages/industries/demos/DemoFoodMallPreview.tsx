import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Navigation,
  Menu,
  X,
  MessageCircle,
  Download,
  LayoutGrid,
  List,
  LayoutList,
  Star,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sampleFoodMallBusinessInfo,
  sampleFoodMallCategories,
  sampleFoodMallMenuItems,
} from "./sampleData";
import { safeImageSrc } from "@/lib/imageUtils";

const formatINR = (n: number) => `₹${n}`;

const baseNavLinks = [
  { href: "#menu", label: "Menu" },
  { href: "#gallery", label: "Gallery" },
  { href: "#reviews", label: "Reviews" },
  { href: "#outlets", label: "Outlets" },
  { href: "#contact", label: "Contact" },
];

type VegFilter = "all" | "veg" | "nonveg";
const VEG_FILTER_OPTIONS: { value: VegFilter; label: string; dot: "green" | "red" | "both" }[] = [
  { value: "all", label: "All", dot: "both" },
  { value: "veg", label: "Veg", dot: "green" },
  { value: "nonveg", label: "Non-veg", dot: "red" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "price-low", label: "Price: Low–High" },
  { value: "price-high", label: "Price: High–Low" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
] as const;

type ViewMode = "grid" | "menu" | "list";
const VIEW_OPTIONS: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "menu", label: "Menu", icon: LayoutList },
  { value: "list", label: "List", icon: List },
];

function whatsAppUrl(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}

type FoodMallItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isVeg: boolean;
  isPopular?: boolean;
  imageUrl?: string;
};

function ItemDetailModal({
  item,
  open,
  onOpenChange,
  whatsappNumber,
  categoryName,
  showWhatsAppButton = true,
}: {
  item: FoodMallItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsappNumber: string;
  categoryName: string;
  showWhatsAppButton?: boolean;
}) {
  const message = item
    ? `Hi, I'd like to order: **${item.name}** (${categoryName}) - ${formatINR(item.price)}. Please confirm availability.`
    : "";
  const wpLink = whatsAppUrl(whatsappNumber, message);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {item ? (
        <DialogContent className="max-w-[420px] w-[calc(100%-1.5rem)] p-0 gap-0 border-border rounded-2xl overflow-hidden shadow-xl [&>button]:top-3 [&>button]:right-3 [&>button]:rounded-full [&>button]:bg-background/80 [&>button]:backdrop-blur-sm [&>button]:hover:bg-muted">
          {/* Fixed-size image */}
          <div className="w-full h-[220px] sm:h-[240px] bg-muted/50 overflow-hidden shrink-0 flex items-center justify-center">
            {(item.imageUrl || (item as any).image) ? (
              <img src={safeImageSrc(item.imageUrl || (item as any).image)} alt={item.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="w-14 h-14 text-muted-foreground/50" />
              </div>
            )}
          </div>
          {/* Content — fixed layout */}
          <div className="p-5 sm:p-6 flex flex-col min-h-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">{categoryName}</span>
              {item.isPopular && (
                <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  Popular
                </span>
              )}
            </div>
            <DialogHeader className="p-0 mt-2">
              <DialogTitle className="text-xl font-bold tracking-tight text-left">
                {item.name}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-bold text-foreground text-xl">{formatINR(item.price)}</span>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {showWhatsAppButton && whatsappNumber && (
                <a
                  href={wpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white font-semibold py-3.5 px-5 hover:bg-[#20BD5A] active:scale-[0.98] transition-all touch-manipulation min-h-[48px] text-[15px]"
                >
                  <MessageCircle className="w-5 h-5" />
                  Order on WhatsApp
                </a>
              )}
              <Button type="button" variant="outline" className="border-border h-11 rounded-xl" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

interface DemoFoodMallPreviewProps {
  restaurantId?: string;
  businessInfo?: {
    name: string;
    tagline: string;
    logo?: string | null;
    address?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    openingHours?: string;
    website?: string;
    mapQuery?: string;
    mapEmbedUrl?: string | null;
    foodImages?: string[];
    showQuickActions?: boolean;
    showSocialLinks?: boolean;
    businessType?: string | null;
    showWhatsAppButton?: boolean;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
  };
  categories?: Array<{ id: string; name: string; emoji?: string }>;
  menuItems?: FoodMallItem[];
  isLiveMenu?: boolean;
  showWhatsAppButton?: boolean;
  onGiveFeedback?: () => void;
}

/** Business types that don't show All / Veg / Non-veg filter (beverages, desserts, etc.) */
function shouldHideVegFilter(businessType?: string | null): boolean {
  const t = (businessType || "").toLowerCase().trim();
  if (!t) return false;
  const keywords = [
    "café", "cafe", "cafes",
    "coffee", "coffee shop", "coffee shops",
    "ice cream", "ice cream shop", "ice cream shops",
    "juice bar", "juice bars",
    "tea house", "tea houses", "tea shop", "tea shops"
  ];
  return keywords.some((k) => t.includes(k));
}

export function DemoFoodMallPreview(props?: DemoFoodMallPreviewProps) {
  const businessInfo = props?.businessInfo ?? sampleFoodMallBusinessInfo;
  const categories = props?.categories ?? sampleFoodMallCategories;
  const allMenuItems = props?.menuItems ?? sampleFoodMallMenuItems;
  const isLiveMenu = props?.isLiveMenu ?? false;
  const showVegFilter = !shouldHideVegFilter(businessInfo?.businessType);
  const showWhatsAppButton = props?.showWhatsAppButton !== false && (businessInfo?.showWhatsAppButton !== false);
  const onGiveFeedback = props?.onGiveFeedback;

  const [category, setCategory] = useState("all");
  const [vegFilter, setVegFilter] = useState<VegFilter>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodMallItem | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  const restaurantId = props?.restaurantId;
  const foodImages = businessInfo?.foodImages || [];
  const showQuickActions = businessInfo?.showQuickActions !== false;
  const showSocialLinks = businessInfo?.showSocialLinks !== false;
  const showGalleryLink = (foodImages.length > 0 || restaurantId) && !!restaurantId;
  const navLinks = baseNavLinks.filter((l) => l.href !== "#gallery" || showGalleryLink);
  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const items = useMemo(() => {
    let list = category === "all" ? allMenuItems : allMenuItems.filter((i) => i.categoryId === category);
    if (showVegFilter) {
      if (vegFilter === "veg") list = list.filter((i) => i.isVeg);
      if (vegFilter === "nonveg") list = list.filter((i) => !i.isVeg);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          getCategoryName(i.categoryId).toLowerCase().includes(q)
      );
    }
    if (sortBy === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "name-desc") list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === "popular") list = [...list].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    return list;
  }, [category, vegFilter, sortBy, searchQuery, allMenuItems, showVegFilter]);

  const mapQuery = businessInfo.mapQuery || businessInfo.address || businessInfo.name || "";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const phone = businessInfo.phone || "";
  const email = businessInfo.email || "";
  const whatsapp = businessInfo.whatsapp || businessInfo.phone || "";

  const openItemModal = (item: FoodMallItem) => {
    setSelectedItem(item);
    setItemModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col w-full min-h-[100dvh]">
      {/* Header — white background for logo */}
      <header className="sticky top-0 z-40 bg-white border-b border-border supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-border flex items-center justify-center flex-shrink-0 shadow-soft overflow-hidden p-0.5">
              {businessInfo.logo ? (
                <img src={safeImageSrc(businessInfo.logo)} alt="" className="w-full h-full object-contain" />
              ) : (
                <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {businessInfo.name}
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-primary/80 uppercase tracking-wider truncate">
                {businessInfo.tagline || "Food Mall"}
              </p>
            </div>
            <nav className="hidden sm:flex items-center gap-6">
              {navLinks.map(({ href, label }) =>
                href === "#gallery" ? (
                  <Link key={href} to={`/menu/${restaurantId}/gallery`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                ) : href === "#reviews" ? (
                  <Link key={href} to={`/menu/${restaurantId}/reviews`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                ) : (
                  <a key={href} href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </a>
                )
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden md:block relative w-40 lg:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Search dishes"
              />
            </div>
            <button
              type="button"
              className="sm:hidden p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center -mr-1"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className={`md:hidden border-t border-border px-4 py-3 bg-white transition-all duration-200 ${menuOpen ? "shadow-inner" : ""}`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Search dishes, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-border bg-background text-base min-h-[48px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 placeholder:text-muted-foreground"
              aria-label="Search dishes"
            />
          </div>
          {menuOpen && (
            <nav className="flex flex-col gap-1 mt-3 pt-3 border-t border-border">
              {navLinks.map(({ href, label }) =>
                href === "#gallery" ? (
                  <Link key={href} to={`/menu/${restaurantId}/gallery`} className="py-3.5 px-4 rounded-xl text-base font-semibold text-foreground hover:bg-primary/10 active:bg-primary/15 transition-colors touch-manipulation" onClick={() => setMenuOpen(false)}>
                    {label}
                  </Link>
                ) : href === "#reviews" ? (
                  <Link key={href} to={`/menu/${restaurantId}/reviews`} className="py-3.5 px-4 rounded-xl text-base font-semibold text-foreground hover:bg-primary/10 active:bg-primary/15 transition-colors touch-manipulation" onClick={() => setMenuOpen(false)}>
                    {label}
                  </Link>
                ) : (
                  <a key={href} href={href} className="py-3.5 px-4 rounded-xl text-base font-semibold text-foreground hover:bg-primary/10 active:bg-primary/15 transition-colors touch-manipulation" onClick={() => setMenuOpen(false)}>
                    {label}
                  </a>
                )
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Category tabs — scrollable on mobile */}
      <section id="outlets" className="bg-slate-50 border-b border-border px-3 sm:px-6 py-3 sm:py-3">
        <div className="max-w-6xl mx-auto relative">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto overflow-y-hidden pb-1 scroll-smooth touch-pan-x snap-x snap-mandatory scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 sm:px-3 sm:py-2 rounded-xl text-sm sm:text-sm font-semibold transition-all flex-shrink-0 touch-manipulation snap-start min-h-[44px] ${
                  category === cat.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 active:scale-[0.98]"
                }`}
              >
                <span className="text-base sm:text-sm">{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
          {/* Gradient fade hint for scroll on mobile */}
          <div className="sm:hidden absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" aria-hidden />
        </div>
      </section>

      {/* Filters — veg/non-veg toggles, sort, view */}
      <section className="bg-slate-50 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          {showVegFilter && (
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1.5 sm:p-1" role="group" aria-label="Veg / Non-veg filter">
            {VEG_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVegFilter(opt.value)}
                className={`flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 sm:px-3 sm:py-2 rounded-lg text-sm sm:text-sm font-semibold transition-all touch-manipulation min-h-[44px] sm:min-h-[36px] active:scale-[0.98] ${
                  vegFilter === opt.value
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
                aria-pressed={vegFilter === opt.value}
                aria-label={`Show ${opt.label} items`}
              >
                {opt.dot === "both" ? (
                  <span className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" aria-hidden />
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden />
                  </span>
                ) : (
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${opt.dot === "green" ? "bg-green-500" : "bg-red-500"}`}
                    aria-hidden
                  />
                )}
                {opt.label}
              </button>
            ))}
          </div>
          )}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1 sm:w-[160px] min-w-0 h-11 sm:h-9 text-sm border-border bg-card rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
              {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setViewMode(value)}
                  className={`p-2.5 sm:p-2 rounded-lg transition-all touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center active:scale-95 ${
                    viewMode === value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  aria-label={`${label} view`}
                  aria-pressed={viewMode === value}
                  title={label}
                >
                  <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium order-last sm:order-none sm:ml-auto">
            <span className="text-foreground font-semibold">{items.length}</span> item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Menu / items — extra pb on mobile for bottom bar */}
      <main id="menu" className="flex-1 px-4 sm:px-6 py-6 sm:py-10 md:py-12 pb-24 sm:pb-10 md:pb-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-1">Menu</h2>
          <p className="text-sm text-muted-foreground mb-5 sm:mb-8 max-w-xl">{businessInfo.tagline}</p>
          {items.length === 0 ? (
            <div className="text-center py-16 sm:py-20 text-muted-foreground">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <ChefHat className="w-10 h-10 opacity-60" />
              </div>
              <p className="font-semibold text-foreground text-lg">No items found</p>
              <p className="text-sm mt-2 max-w-xs mx-auto">
                {showVegFilter ? "Try a different category, veg/non-veg filter, or search term." : "Try a different category or search term."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border border-border overflow-hidden bg-card hover:border-primary/30 hover:shadow-lg sm:hover:shadow-xl transition-all duration-200 group cursor-pointer focus-within:ring-2 focus-within:ring-primary/30 active:scale-[0.98] rounded-2xl sm:rounded-xl shadow-sm sm:shadow-none"
                  onClick={() => openItemModal(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openItemModal(item);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${item.name}`}
                >
                  <div className="aspect-square bg-muted/50 overflow-hidden flex items-center justify-center">
                    {(item.imageUrl || (item as any).image) ? (
                      <img src={safeImageSrc(item.imageUrl || (item as any).image)} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                      {item.isPopular && (
                        <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">Popular</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base mt-1.5 line-clamp-2 leading-snug">{item.name}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                    <p className="font-bold text-foreground text-base mt-2">{formatINR(item.price)}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : viewMode === "menu" ? (
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border border-border overflow-hidden bg-card hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer focus-within:ring-2 focus-within:ring-primary/30 flex flex-col sm:flex-row rounded-2xl sm:rounded-xl active:scale-[0.99]"
                  onClick={() => openItemModal(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openItemModal(item);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${item.name}`}
                >
                  <div className="w-full sm:w-40 md:w-48 flex-shrink-0 aspect-[4/3] sm:aspect-auto sm:h-32 md:h-36 bg-muted/50 overflow-hidden flex items-center justify-center">
                    {(item.imageUrl || (item as any).image) ? (
                      <img src={safeImageSrc(item.imageUrl || (item as any).image)} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 sm:p-5 flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">{getCategoryName(item.categoryId)}</span>
                      {item.isPopular && (
                        <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Popular</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground text-base sm:text-lg mt-1">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                    <p className="font-bold text-foreground text-base sm:text-lg mt-3">{formatINR(item.price)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-1 border border-border rounded-2xl sm:rounded-xl overflow-hidden bg-card divide-y divide-border">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-4 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-inset rounded-none first:rounded-t-2xl sm:first:rounded-t-xl last:rounded-b-2xl sm:last:rounded-b-xl min-h-[72px] sm:min-h-0 touch-manipulation"
                  onClick={() => openItemModal(item)}
                  aria-label={`View details for ${item.name}`}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted/50 flex-shrink-0 flex items-center justify-center">
                    {(item.imageUrl || (item as any).image) ? (
                      <img src={safeImageSrc(item.imageUrl || (item as any).image)} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{getCategoryName(item.categoryId)}</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{item.name}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="font-bold text-foreground text-sm sm:text-base">{formatINR(item.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!isLiveMenu && (
            <div className="mt-8 sm:mt-10">
              <Button size="lg" className="w-full sm:w-auto gradient-primary text-primary-foreground font-semibold shadow-soft h-12 sm:h-11 px-8 rounded-xl text-base active:scale-[0.98]" asChild>
                <Link to="/register">Get your own food mall menu →</Link>
              </Button>
            </div>
          )}
        </div>
      </main>


      {/* Footer — contact, map (original dark style); logo circle has white background */}
      <footer id="contact" className="gradient-dark text-background mt-auto pl-4 md:pl-28 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-background/20 shadow-soft overflow-hidden p-0.5">
                  {businessInfo.logo ? (
                    <img src={safeImageSrc(businessInfo.logo)} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-background text-lg">{businessInfo.name}</h3>
                  <p className="text-sm text-background/70 mt-0.5">{businessInfo.tagline}</p>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-background/80">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-background/60 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{businessInfo.address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <a href={`tel:${phone}`} className="flex items-center gap-3 hover:text-background transition-colors break-all py-1 -my-1 min-h-[44px] touch-manipulation">
                    <Phone className="w-5 h-5 text-background/60 flex-shrink-0" />
                    {phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <a href={`mailto:${email}`} className="flex items-center gap-3 hover:text-background transition-colors break-all py-1 -my-1 min-h-[44px] touch-manipulation">
                    <Mail className="w-5 h-5 text-background/60 flex-shrink-0" />
                    {email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-background/60 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{businessInfo.openingHours}</span>
                </li>
                {showSocialLinks && businessInfo.website && (
                  <li className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-background/60 flex-shrink-0" />
                    <a href={businessInfo.website.startsWith("http") ? businessInfo.website : `https://${businessInfo.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors break-all">
                      {businessInfo.website.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                )}
              </ul>
              {showSocialLinks && (businessInfo.socialMedia?.facebook || businessInfo.socialMedia?.instagram || businessInfo.socialMedia?.twitter || businessInfo.socialMedia?.linkedin || businessInfo.website) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {businessInfo.socialMedia?.facebook && (
                    <a href={businessInfo.socialMedia.facebook.startsWith("http") ? businessInfo.socialMedia.facebook : `https://${businessInfo.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/80 hover:text-background transition-colors" aria-label="Facebook">
                      <FaFacebook className="w-5 h-5" />
                    </a>
                  )}
                  {businessInfo.socialMedia?.instagram && (
                    <a href={businessInfo.socialMedia.instagram.startsWith("http") ? businessInfo.socialMedia.instagram : `https://${businessInfo.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/80 hover:text-background transition-colors" aria-label="Instagram">
                      <FaInstagram className="w-5 h-5" />
                    </a>
                  )}
                  {businessInfo.socialMedia?.twitter && (
                    <a href={businessInfo.socialMedia.twitter.startsWith("http") ? businessInfo.socialMedia.twitter : `https://${businessInfo.socialMedia.twitter}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/80 hover:text-background transition-colors" aria-label="Twitter">
                      <FaTwitter className="w-5 h-5" />
                    </a>
                  )}
                  {businessInfo.socialMedia?.linkedin && (
                    <a href={businessInfo.socialMedia.linkedin.startsWith("http") ? businessInfo.socialMedia.linkedin : `https://${businessInfo.socialMedia.linkedin}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/80 hover:text-background transition-colors" aria-label="LinkedIn">
                      <FaLinkedin className="w-5 h-5" />
                    </a>
                  )}
                  {businessInfo.website && !businessInfo.socialMedia?.facebook && !businessInfo.socialMedia?.instagram && !businessInfo.socialMedia?.twitter && !businessInfo.socialMedia?.linkedin && (
                    <a href={businessInfo.website.startsWith("http") ? businessInfo.website : `https://${businessInfo.website}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/80 hover:text-background transition-colors" aria-label="Website">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-11 sm:h-10 gap-2 min-h-[44px] sm:min-h-0 rounded-xl touch-manipulation" asChild>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Navigation className="w-4 h-4" />
                    Get directions
                  </a>
                </Button>
                {onGiveFeedback && (
                  <Button 
                    size="sm" 
                    className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-11 sm:h-10 gap-2 min-h-[44px] sm:min-h-0 rounded-xl touch-manipulation" 
                    onClick={onGiveFeedback}
                    type="button"
                  >
                    <Star className="w-4 h-4" />
                    Give Feedback
                  </Button>
                )}
                {!isLiveMenu && (
                  <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-11 sm:h-10 gap-2 min-h-[44px] sm:min-h-0 rounded-xl touch-manipulation" asChild>
                    <Link to="/register" className="gap-2">
                      <ChefHat className="w-4 h-4" />
                      Create your menu
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-xl overflow-hidden border border-background/20 bg-background/5 h-56 sm:h-72 lg:h-80 relative">
                {businessInfo.mapEmbedUrl ? (
                  <iframe
                    title="Food mall location map"
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
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-medium text-background hover:bg-background hover:text-foreground transition-colors">
                  <Navigation className="w-3.5 h-3.5" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-background/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-background/60 text-center sm:text-left">
            <span>© {new Date().getFullYear()} {businessInfo.name}. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Powered by <span className="font-medium text-background/80">ScanBit</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Desktop: floating contact icons (left) — hidden on mobile, controlled by showQuickActions */}
      {showQuickActions && (
      <div className="hidden md:flex fixed bottom-6 left-6 z-30 flex-col gap-2.5" aria-label="Quick actions">
        <a href={`tel:${phone}`} className="flex items-center justify-center w-12 h-12 rounded-full gradient-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/20" aria-label="Call">
          <Phone className="w-5 h-5" />
        </a>
        <a href={`mailto:${email}`} className="flex items-center justify-center w-12 h-12 rounded-full gradient-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/20" aria-label="Email">
          <Mail className="w-5 h-5" />
        </a>
        <a href={whatsAppUrl(whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/20" aria-label="WhatsApp">
          <MessageCircle className="w-5 h-5" />
        </a>
        {isLiveMenu ? (
          <button type="button" onClick={() => window.print()} className="flex items-center justify-center w-12 h-12 rounded-full bg-card border-2 border-border text-foreground shadow-lg hover:scale-105 hover:border-primary/50 active:scale-95 transition-all" aria-label="Download menu" title="Download / Print menu">
            <Download className="w-5 h-5" />
          </button>
        ) : (
          <Link to="/register" className="flex items-center justify-center w-12 h-12 rounded-full bg-card border-2 border-border text-foreground shadow-lg hover:scale-105 hover:border-primary/50 active:scale-95 transition-all" aria-label="Download menu" title="Download menu">
            <Download className="w-5 h-5" />
          </Link>
        )}
      </div>
      )}

      {/* Mobile: bottom bar — Call, Email, WhatsApp, Download Menu, controlled by showQuickActions */}
      {showQuickActions && (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border pt-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" aria-label="Quick actions">
        <div className="max-w-lg mx-auto flex items-center justify-around gap-1">
          <a href={`tel:${phone}`} className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" aria-label="Call">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-md">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Call</span>
          </a>
          <a href={`mailto:${email}`} className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" aria-label="Email">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Email</span>
          </a>
          <a href={whatsAppUrl(whatsapp)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" aria-label="WhatsApp">
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">WhatsApp</span>
          </a>
          {isLiveMenu ? (
            <button type="button" onClick={() => window.print()} className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" aria-label="Download menu">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-md">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">Download</span>
            </button>
          ) : (
            <Link to="/register" className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" aria-label="Download menu">
              <div className="w-10 h-10 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">Menu</span>
            </Link>
          )}
        </div>
      </div>
      )}

      <ItemDetailModal item={selectedItem} open={itemModalOpen} onOpenChange={setItemModalOpen} whatsappNumber={whatsapp} categoryName={selectedItem ? getCategoryName(selectedItem.categoryId) : ""} showWhatsAppButton={showWhatsAppButton} />
    </div>
  );
}
