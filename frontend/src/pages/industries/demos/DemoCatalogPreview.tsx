import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Star,
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
  Share2,
  LayoutGrid,
  List,
  LayoutList,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { safeImageSrc } from "@/lib/imageUtils";
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
  sampleCatalogItems,
  sampleCatalogBusinessInfo,
} from "./sampleData";

const formatINR = (n: number) => `₹${n}`;

const navLinks = [
  { href: "#catalog", label: "Catalog" },
  { href: "#categories", label: "Categories" },
  { href: "#contact", label: "Contact" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low–High" },
  { value: "price-high", label: "Price: High–Low" },
  { value: "rating", label: "Top Rated" },
  { value: "category-asc", label: "Category: A–Z" },
  { value: "category-desc", label: "Category: Z–A" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
] as const;

const TYPE_OPTIONS = ["all", "Bestseller", "New arrival", "Standard"] as const;

type ViewMode = "grid" | "menu" | "list";
// View options will be dynamically set based on business category
const getViewOptions = (isRetail: boolean): { value: ViewMode; label: string; icon: typeof LayoutGrid }[] => [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "menu", label: isRetail ? "Catalog" : "Menu", icon: LayoutList },
  { value: "list", label: "List", icon: List },
];

/** Normalize to digits only; add India country code if 10 digits. */
function normalizeWhatsAppNumber(phone: string | undefined | null): string {
  if (phone == null || typeof phone !== "string") return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

function whatsAppUrl(phone: string, text?: string) {
  const digits = normalizeWhatsAppNumber(phone);
  if (!digits || digits.length < 10) return null;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}

type CatalogItem = (typeof sampleCatalogItems)[number];

function ProductDetailModal({
  item,
  open,
  onOpenChange,
  whatsappNumber,
  businessName,
  showWhatsAppButton = true,
}: {
  item: CatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsappNumber: string;
  businessName?: string;
  showWhatsAppButton?: boolean;
}) {
  const productImageUrl =
    item && "imageUrl" in item && item.imageUrl ? safeImageSrc(item.imageUrl) : "";
  const message = item
    ? `Hello${businessName ? ` ${businessName}` : ""}!

I'm interested in this product from your catalog:

📦 *${item.title}*
${item.category ? `Category: ${item.category}` : ""}
${"type" in item && item.type && item.type !== "Standard" ? `Type: ${item.type}` : ""}
💰 Price: ${formatINR(item.price)}
${item.rating ? `⭐ Rating: ${item.rating}` : ""}
${item.subtitle ? `\nSummary: ${item.subtitle}` : ""}
${"description" in item && item.description && item.description !== item.subtitle ? `\nDetails: ${item.description}` : ""}
${productImageUrl ? `\nImage: ${productImageUrl}` : ""}

Please share availability, delivery timeline, and any additional variants or offers.

Thank you!`
    : "";
  const wpLink = whatsAppUrl(whatsappNumber, message);
  const hasValidWhatsApp = !!wpLink;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {item ? (
      <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto sm:rounded-xl p-0 gap-0 border-border">
        <div className="aspect-square sm:aspect-[4/3] bg-muted/50 overflow-hidden rounded-t-xl relative">
          {"imageUrl" in item && item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6">
          <DialogHeader>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              {item.category}
              {"type" in item && item.type && item.type !== "Standard" && (
                <span className="ml-2 text-muted-foreground normal-case">• {item.type}</span>
              )}
            </p>
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-left mt-1">
              {item.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">{item.subtitle}</p>
          {"description" in item && item.description && (
            <p className="text-sm text-foreground mt-3 leading-relaxed">
              {item.description}
            </p>
          )}
          <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
            <span className="font-bold text-foreground text-lg sm:text-xl">
              {formatINR(item.price)}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {item.rating} rating
            </span>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {showWhatsAppButton && (hasValidWhatsApp ? (
              <a
                href={wpLink!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white font-semibold py-3 px-5 hover:bg-[#20BD5A] active:bg-[#1DA851] transition-colors touch-manipulation min-h-[48px] shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                WhatsApp Inquiry
              </a>
            ) : (
              <span
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted text-muted-foreground font-medium py-3 px-5 min-h-[48px] cursor-not-allowed"
                title="Add WhatsApp number in Business Information to enable inquiries"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                WhatsApp Inquiry (add number in settings)
              </span>
            ))}
            <Button
              type="button"
              variant="outline"
              className="border-border flex-1 sm:flex-initial"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
      ) : null}
    </Dialog>
  );
}

interface DemoCatalogPreviewProps {
  catalogItems?: typeof sampleCatalogItems;
  businessInfo?: typeof sampleCatalogBusinessInfo;
  isLiveMenu?: boolean;
  showWhatsAppButton?: boolean;
}

export function DemoCatalogPreview({ 
  catalogItems: propCatalogItems, 
  businessInfo: propBusinessInfo,
  isLiveMenu = false,
  showWhatsAppButton: propShowWhatsAppButton = true
}: DemoCatalogPreviewProps = {}) {
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Use provided data or fall back to sample data
  const currentCatalogItems = propCatalogItems || sampleCatalogItems;
  const currentBusinessInfo = propBusinessInfo || sampleCatalogBusinessInfo;
  
  // Determine business category for appropriate labels
  const businessCategory = currentBusinessInfo.businessCategory || currentBusinessInfo.businessType || "";
  const isRetail = businessCategory.toLowerCase().includes('retail') || 
                   businessCategory.toLowerCase().includes('e-commerce') || 
                   businessCategory.toLowerCase().includes('store') || 
                   businessCategory.toLowerCase().includes('shop');
  const isFood = businessCategory.toLowerCase().includes('food') || 
                 businessCategory.toLowerCase().includes('restaurant') || 
                 businessCategory.toLowerCase().includes('cafe');
  const bottomBarLabel = isRetail ? "Catalog" : isFood ? "Menu" : "Catalog";
  
  // Get display options from businessInfo (default to true if not set)
  const showQuickActions = currentBusinessInfo.showQuickActions !== false;
  const showSocialLinks = currentBusinessInfo.showSocialLinks !== false;

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(currentCatalogItems.map((i) => i.category)))],
    [currentCatalogItems]
  );

  const items = useMemo(() => {
    let list = currentCatalogItems;

    // Search: title, subtitle, category
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          ("type" in i && String((i as { type?: string }).type).toLowerCase().includes(q))
      );
    }
    if (category !== "all") list = list.filter((i) => i.category === category);
    if (type !== "all") list = list.filter((i) => "type" in i && (i as { type?: string }).type === type);

    // Sort
    if (sortBy === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sortBy === "category-asc") list = [...list].sort((a, b) => a.category.localeCompare(b.category));
    else if (sortBy === "category-desc") list = [...list].sort((a, b) => b.category.localeCompare(a.category));
    else if (sortBy === "name-asc") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "name-desc") list = [...list].sort((a, b) => b.title.localeCompare(a.title));

    return list;
  }, [category, type, sortBy, searchQuery, currentCatalogItems]);

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentBusinessInfo.mapQuery || "")}`;
  const { phone, email } = currentBusinessInfo;
  const whatsapp = (currentBusinessInfo as { whatsapp?: string }).whatsapp ?? phone ?? "";

  const openProductModal = (item: CatalogItem) => {
    setSelectedProduct(item);
    setProductModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Header — theme */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-border flex items-center justify-center flex-shrink-0 shadow-soft overflow-hidden p-0.5">
              {currentBusinessInfo.logo ? (
                <img src={safeImageSrc(currentBusinessInfo.logo)} alt={currentBusinessInfo.name} className="w-full h-full object-contain" />
              ) : (
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
                {currentBusinessInfo.name}
              </h1>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                {currentBusinessInfo.tagline || "Product Catalog"}
              </p>
            </div>
            <nav className="hidden sm:flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden md:block relative w-40 lg:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Search products"
              />
            </div>
            <button
              type="button"
              className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center -mr-1"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile search + nav */}
        <div className="md:hidden border-t border-border px-4 py-3 bg-card/50">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Search by name, category or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Search products"
            />
          </div>
          {menuOpen && (
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="py-3 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Filters — category, type, sort, search summary */}
      <section id="categories" className="bg-muted/40 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2 sm:gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[140px] min-w-0 h-10 sm:h-9 text-xs sm:text-sm border-border bg-card">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={(v) => setType(v)}>
            <SelectTrigger className="w-full sm:w-[140px] min-w-0 h-10 sm:h-9 text-xs sm:text-sm border-border bg-card">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "All types" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px] min-w-0 h-10 sm:h-9 text-xs sm:text-sm border-border bg-card">
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
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {getViewOptions(isRetail).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setViewMode(value)}
                className={`p-2 rounded-md transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center sm:min-w-[36px] sm:min-h-[36px] ${
                  viewMode === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                aria-label={`${label} view`}
                aria-pressed={viewMode === value}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground ml-0 sm:ml-2 w-full sm:w-auto order-last sm:order-none">
            {items.length} product{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Product grid — extra pb on mobile for bottom bar */}
      <main id="catalog" className="flex-1 px-4 sm:px-6 py-8 sm:py-10 md:py-12 pb-24 md:pb-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-1">Products</h2>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8 max-w-xl">
            {currentBusinessInfo.tagline}
          </p>
          {items.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No products match your filters or search.</p>
              <p className="text-sm mt-1">Try a different category, type, or search term.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border border-border overflow-hidden bg-card hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer focus-within:ring-2 focus-within:ring-primary/30"
                  onClick={() => openProductModal(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openProductModal(item);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${item.title}`}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted/50 overflow-hidden relative">
                      {"imageUrl" in item && item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider truncate">
                        {item.category}
                        {"type" in item && item.type && item.type !== "Standard" && (
                          <span className="text-muted-foreground normal-case"> • {item.type}</span>
                        )}
                      </p>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base mt-0.5 line-clamp-2 break-words">
                        {item.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {item.subtitle}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-2 sm:mt-3">
                        <span className="font-bold text-foreground text-sm sm:text-base truncate">
                          {formatINR(item.price)}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {item.rating}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === "menu" ? (
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border border-border overflow-hidden bg-card hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer focus-within:ring-2 focus-within:ring-primary/30 flex flex-col sm:flex-row"
                  onClick={() => openProductModal(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openProductModal(item);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${item.title}`}
                >
                  <div className="w-full sm:w-40 md:w-48 flex-shrink-0 aspect-square sm:aspect-auto sm:h-32 md:h-36 bg-muted/50 overflow-hidden relative">
                    {"imageUrl" in item && item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                      )}
                  </div>
                  <CardContent className="p-4 sm:p-5 flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">
                      {item.category}
                      {"type" in item && item.type && item.type !== "Standard" && (
                        <span className="text-muted-foreground normal-case"> • {item.type}</span>
                      )}
                    </p>
                    <h3 className="font-semibold text-foreground text-base sm:text-lg mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {item.subtitle}
                    </p>
                    <div className="flex items-center justify-between gap-4 mt-3">
                      <span className="font-bold text-foreground text-base sm:text-lg">
                        {formatINR(item.price)}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {item.rating}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-1 border border-border rounded-xl overflow-hidden bg-card divide-y divide-border">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 text-left hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-inset rounded-none first:rounded-t-xl last:rounded-b-xl"
                  onClick={() => openProductModal(item)}
                  aria-label={`View details for ${item.title}`}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0 relative">
                    {"imageUrl" in item && item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider truncate">
                      {item.category}
                    </p>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="font-bold text-foreground text-sm sm:text-base">
                      {formatINR(item.price)}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] sm:text-xs text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!isLiveMenu && (
            <div className="mt-8 sm:mt-10 text-center">
              <Button size="lg" className="gradient-primary text-primary-foreground font-semibold shadow-soft" asChild>
                <Link to="/register">Get your own catalog →</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer — Professional contact section with map */}
      <footer id="contact" className="gradient-dark text-background mt-auto pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              {/* Business Logo & Name */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-background/20 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden p-0.5">
                  {currentBusinessInfo.logo ? (
                    <img src={safeImageSrc(currentBusinessInfo.logo)} alt={currentBusinessInfo.name} className="w-full h-full object-contain" />
                  ) : (
                    <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-background text-xl sm:text-2xl leading-tight">{currentBusinessInfo.name || "Business Name"}</h3>
                  {currentBusinessInfo.tagline && (
                    <p className="text-sm text-background/70 mt-1.5 leading-relaxed">{currentBusinessInfo.tagline}</p>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-background/90 uppercase tracking-wider">Contact Information</h4>
                <ul className="space-y-3.5 text-sm text-background/80">
                  {currentBusinessInfo.address && (
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-background/60 flex-shrink-0 mt-0.5" />
                      <span className="break-words leading-relaxed">{currentBusinessInfo.address}</span>
                    </li>
                  )}
                  {phone && (
                    <li className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-background/60 flex-shrink-0" />
                      <a 
                        href={`tel:${phone}`} 
                        className="hover:text-background transition-colors break-all min-h-[44px] flex items-center touch-manipulation"
                      >
                        {phone}
                      </a>
                    </li>
                  )}
                  {email && (
                    <li className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-background/60 flex-shrink-0" />
                      <a 
                        href={`mailto:${email}`} 
                        className="hover:text-background transition-colors break-all min-h-[44px] flex items-center touch-manipulation"
                      >
                        {email}
                      </a>
                    </li>
                  )}
                  {whatsapp && (
                    <li className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-background/60 flex-shrink-0" />
                      <a 
                        href={whatsAppUrl(whatsapp)} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-background transition-colors break-all min-h-[44px] flex items-center touch-manipulation"
                      >
                        {whatsapp}
                      </a>
                    </li>
                  )}
                  {currentBusinessInfo.openingHours && (
                    <li className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-background/60 flex-shrink-0 mt-0.5" />
                      <span className="break-words leading-relaxed">{currentBusinessInfo.openingHours}</span>
                    </li>
                  )}
                  {showSocialLinks && currentBusinessInfo.website && (
                    <li className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-background/60 flex-shrink-0" />
                      <a
                        href={currentBusinessInfo.website.startsWith("http") ? currentBusinessInfo.website : `https://${currentBusinessInfo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-background transition-colors break-all min-h-[44px] flex items-center touch-manipulation"
                      >
                        {currentBusinessInfo.website.replace(/^https?:\/\//, "")}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Social Media Links */}
              {showSocialLinks && currentBusinessInfo.socialMedia && (currentBusinessInfo.socialMedia.facebook || currentBusinessInfo.socialMedia.instagram || currentBusinessInfo.socialMedia.twitter || currentBusinessInfo.socialMedia.linkedin) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-background/90 uppercase tracking-wider">Follow Us</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {currentBusinessInfo.socialMedia.facebook && (
                      <a 
                        href={currentBusinessInfo.socialMedia.facebook.startsWith("http") ? currentBusinessInfo.socialMedia.facebook : `https://${currentBusinessInfo.socialMedia.facebook}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-11 h-11 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/80 hover:text-background transition-all hover:scale-110 active:scale-95 touch-manipulation" 
                        aria-label="Facebook"
                      >
                        <FaFacebook className="w-5 h-5" />
                      </a>
                    )}
                    {currentBusinessInfo.socialMedia.instagram && (
                      <a 
                        href={currentBusinessInfo.socialMedia.instagram.startsWith("http") ? currentBusinessInfo.socialMedia.instagram : `https://${currentBusinessInfo.socialMedia.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-11 h-11 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/80 hover:text-background transition-all hover:scale-110 active:scale-95 touch-manipulation" 
                        aria-label="Instagram"
                      >
                        <FaInstagram className="w-5 h-5" />
                      </a>
                    )}
                    {currentBusinessInfo.socialMedia.twitter && (
                      <a 
                        href={currentBusinessInfo.socialMedia.twitter.startsWith("http") ? currentBusinessInfo.socialMedia.twitter : `https://${currentBusinessInfo.socialMedia.twitter}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-11 h-11 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/80 hover:text-background transition-all hover:scale-110 active:scale-95 touch-manipulation" 
                        aria-label="Twitter"
                      >
                        <FaTwitter className="w-5 h-5" />
                      </a>
                    )}
                    {currentBusinessInfo.socialMedia.linkedin && (
                      <a 
                        href={currentBusinessInfo.socialMedia.linkedin.startsWith("http") ? currentBusinessInfo.socialMedia.linkedin : `https://${currentBusinessInfo.socialMedia.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-11 h-11 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/80 hover:text-background transition-all hover:scale-110 active:scale-95 touch-manipulation" 
                        aria-label="LinkedIn"
                      >
                        <FaLinkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  size="sm" 
                  className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-11 sm:h-10 gap-2 min-h-[44px] sm:min-h-0 rounded-xl touch-manipulation font-medium" 
                  asChild
                >
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Navigation className="w-4 h-4" />
                    Get directions
                  </a>
                </Button>
              </div>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-7">
              <div className="rounded-xl overflow-hidden border border-background/20 bg-background/5 h-64 sm:h-72 lg:h-80 relative shadow-lg">
                {currentBusinessInfo.mapEmbedUrl ? (
                  <iframe
                    title="Store location map"
                    src={currentBusinessInfo.mapEmbedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                    <MapPin className="w-16 h-16 text-background/40" />
                    <p className="text-background/60 text-sm text-center max-w-xs font-medium">Map location unavailable</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-background/30 text-background/90 hover:bg-background/10" 
                      asChild
                    >
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
                  className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-lg bg-background/95 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-foreground hover:bg-background transition-all shadow-lg hover:shadow-xl"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Maps
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom — Copyright */}
          <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-background/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-background/60">
            <span className="text-center sm:text-left">
              © {new Date().getFullYear()} {currentBusinessInfo.name || "Business"}. All rights reserved.
            </span>
            <span className="flex items-center gap-1.5 text-center sm:text-right">
              Powered by <span className="font-semibold text-background/80">ScanBit</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Desktop: Floating contact — Call, Email, WhatsApp, Download catalog (left, touch-friendly) */}
      {showQuickActions && (
        <div
          className="hidden md:flex fixed bottom-6 left-6 z-30 flex-col gap-2.5"
          aria-label="Quick actions"
        >
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center w-12 h-12 rounded-full gradient-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/20"
            aria-label="Call"
          >
            <Phone className="w-5 h-5" />
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center justify-center w-12 h-12 rounded-full gradient-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/20"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
          </a>
          <a
            href={whatsAppUrl(whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/20"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          {!isLiveMenu && (
            <Link
              to="/register"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-card border-2 border-border text-foreground shadow-lg hover:scale-105 hover:border-primary/50 active:scale-95 transition-all"
              aria-label="Download catalog"
              title="Download catalog"
            >
              <Download className="w-5 h-5" />
            </Link>
          )}
        </div>
      )}

      {/* Mobile: Professional bottom bar — Call, Email, WhatsApp, Share/Download */}
      {showQuickActions && (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border pt-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" aria-label="Quick actions">
        <div className="max-w-lg mx-auto flex items-center justify-around gap-1">
          <a 
            href={`tel:${phone}`} 
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" 
            aria-label="Call"
          >
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-md">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Call</span>
          </a>
          <a 
            href={`mailto:${email}`} 
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" 
            aria-label="Email"
          >
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Email</span>
          </a>
          <a 
            href={whatsAppUrl(whatsapp)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" 
            aria-label="WhatsApp"
          >
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">WhatsApp</span>
          </a>
          {isLiveMenu ? (
            <button 
              type="button" 
              onClick={() => window.print()}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" 
              aria-label={`Download ${bottomBarLabel}`}
            >
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-md">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">Download</span>
            </button>
          ) : (
            <button 
              type="button" 
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: currentBusinessInfo.name,
                      text: `Check out ${currentBusinessInfo.name}!`,
                      url: window.location.href,
                    });
                  } catch (err) {
                    // User cancelled or error occurred
                  }
                } else {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    // Show visual feedback - could add toast here if needed
                  } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                  }
                }
              }}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation text-foreground hover:bg-muted/70 active:bg-muted transition-colors" 
              aria-label="Share"
            >
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-md">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">Share</span>
            </button>
          )}
        </div>
      </div>
      )}

      <ProductDetailModal
        item={selectedProduct}
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        whatsappNumber={whatsapp}
        businessName={currentBusinessInfo.name}
        showWhatsAppButton={
          propShowWhatsAppButton !== false && 
          (currentBusinessInfo.showWhatsAppButton !== false) &&
          !!whatsapp
        }
      />
    </div>
  );
}
