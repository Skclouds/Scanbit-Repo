import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Share2,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  LayoutGrid,
  List,
  LayoutList,
  MessageCircle,
  Download,
  FileText,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sampleMenuCategories, sampleMenuItems, sampleBusinessInfo, sampleMenuReviews } from "./sampleData";

const formatINR = (n: number) => `₹${n}`;

const SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "price-low", label: "Price: Low–High" },
  { value: "price-high", label: "Price: High–Low" },
  { value: "category-asc", label: "Category: A–Z" },
  { value: "category-desc", label: "Category: Z–A" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
] as const;

const VEG_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "veg", label: "Veg only" },
  { value: "nonveg", label: "Non-veg only" },
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

type MenuItem = (typeof sampleMenuItems)[number];

function ItemDetailModal({
  item,
  open,
  onOpenChange,
  categoryName,
}: {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
}) {
  const whatsapp = sampleBusinessInfo.whatsapp ?? sampleBusinessInfo.phone;
  const message = item
    ? `Hi, I'd like to order: **${item.name}** (${categoryName}) - ${formatINR(item.price)}. Please confirm.`
    : "";
  const wpLink = whatsAppUrl(whatsapp, message);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {item ? (
        <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto sm:rounded-xl p-0 gap-0 border-border">
          <div className="aspect-square sm:aspect-[4/3] bg-muted/50 overflow-hidden rounded-t-xl">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="p-4 sm:p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">{categoryName}</p>
                {item.isPopular && (
                  <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                    Popular
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-left mt-2">
                {item.name}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
            <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
              <span className="font-bold text-foreground text-lg sm:text-xl">{formatINR(item.price)}</span>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={wpLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white font-semibold py-3 px-5 hover:bg-[#20BD5A] transition-colors touch-manipulation min-h-[48px]"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                WhatsApp me / Order this
              </a>
              <Button type="button" variant="outline" className="border-border" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

export function DemoMenuPreview() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const categories = sampleMenuCategories;
  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const items = useMemo(() => {
    let list = activeCategory === "all" ? sampleMenuItems : sampleMenuItems.filter((i) => i.categoryId === activeCategory);
    if (vegFilter === "veg") list = list.filter((i) => i.isVeg);
    if (vegFilter === "nonveg") list = list.filter((i) => !i.isVeg);
    if (sortBy === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "name-desc") list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === "category-asc") list = [...list].sort((a, b) => getCategoryName(a.categoryId).localeCompare(getCategoryName(b.categoryId)));
    else if (sortBy === "category-desc") list = [...list].sort((a, b) => getCategoryName(b.categoryId).localeCompare(getCategoryName(a.categoryId)));
    else if (sortBy === "popular") list = [...list].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    return list;
  }, [activeCategory, vegFilter, sortBy]);

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item);
    setItemModalOpen(true);
  };

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "mapQuery" in sampleBusinessInfo && sampleBusinessInfo.mapQuery
      ? sampleBusinessInfo.mapQuery
      : sampleBusinessInfo.address
  )}`;

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Header — theme */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">{sampleBusinessInfo.name}</h1>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                Food Mall
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              className="p-2.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-9 sm:min-h-9 flex items-center justify-center"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-9 sm:min-h-9 flex items-center justify-center"
              aria-label="Language"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Category tabs — scrollable on mobile */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-3 border-t border-border">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scroll-smooth touch-pan-x scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex-shrink-0 touch-manipulation ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Filters — veg/non-veg, sort, view mode */}
      <section className="bg-muted/40 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2 sm:gap-4">
          <Select value={vegFilter} onValueChange={(v) => setVegFilter(v as "all" | "veg" | "nonveg")}>
            <SelectTrigger className="w-full sm:w-[130px] min-w-0 h-10 sm:h-9 text-xs sm:text-sm border-border bg-card">
              <SelectValue placeholder="Veg / Non-veg" />
            </SelectTrigger>
            <SelectContent>
              {VEG_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
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
            {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setViewMode(value)}
                className={`p-2 rounded-md transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center sm:min-w-[36px] sm:min-h-[36px] ${
                  viewMode === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Menu items — grid / menu / list */}
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-1">Menu</h2>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8 max-w-xl">{sampleBusinessInfo.tagline}</p>
          {items.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No items match your filters.</p>
              <p className="text-sm mt-1">Try a different category or veg filter.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border border-border overflow-hidden bg-card hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer focus-within:ring-2 focus-within:ring-primary/30"
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
                  <div className="aspect-square bg-muted/50 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                      {item.isPopular && (
                        <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">Popular</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base mt-1 line-clamp-2">{item.name}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                    <p className="font-bold text-foreground text-sm sm:text-base mt-2">{formatINR(item.price)}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : viewMode === "menu" ? (
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border border-border overflow-hidden bg-card hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer focus-within:ring-2 focus-within:ring-primary/30 flex flex-col sm:flex-row"
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
                  <div className="w-full sm:w-40 md:w-48 flex-shrink-0 aspect-square sm:aspect-auto sm:h-32 md:h-36 bg-muted/50 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                        <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">Popular</span>
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
            <div className="space-y-1 border border-border rounded-xl overflow-hidden bg-card divide-y divide-border">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 text-left hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-inset rounded-none first:rounded-t-xl last:rounded-b-xl"
                  onClick={() => openItemModal(item)}
                  aria-label={`View details for ${item.name}`}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
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
          <div className="mt-8 sm:mt-10 text-center">
            <Button size="lg" className="gradient-primary text-primary-foreground font-semibold shadow-soft" asChild>
              <Link to="/register">Get your own menu →</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer — theme gradient-dark: contact, map, download card, menu, directions */}
      <footer className="gradient-dark text-background mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 border border-primary-foreground/20 shadow-soft">
                  <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-background text-lg">{sampleBusinessInfo.name}</h3>
                  <p className="text-sm text-background/70 mt-0.5 break-words">{sampleBusinessInfo.tagline}</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-background/80">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-background/60 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{sampleBusinessInfo.address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-background/60 flex-shrink-0" />
                  <a href={`tel:${sampleBusinessInfo.phone}`} className="hover:text-background transition-colors break-all">
                    {sampleBusinessInfo.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-background/60 flex-shrink-0" />
                  <a href={`mailto:${sampleBusinessInfo.email}`} className="hover:text-background transition-colors break-all">
                    {sampleBusinessInfo.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-background/60 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{sampleBusinessInfo.openingHours}</span>
                </li>
                {"website" in sampleBusinessInfo && sampleBusinessInfo.website && (
                  <li className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-background/60 flex-shrink-0" />
                    <a
                      href={`https://${sampleBusinessInfo.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-background transition-colors break-all"
                    >
                      {sampleBusinessInfo.website}
                    </a>
                  </li>
                )}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" asChild>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Navigation className="w-4 h-4" />
                    Get directions
                  </a>
                </Button>
                <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" asChild>
                  <Link to="/register" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download visiting card
                  </Link>
                </Button>
                <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" asChild>
                  <Link to="/register" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Download menu
                  </Link>
                </Button>
                <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" asChild>
                  <Link to="/register" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Download brochure
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-xl overflow-hidden border border-background/20 bg-background/5 h-64 sm:h-72 lg:h-80 relative">
                {"mapEmbedUrl" in sampleBusinessInfo && sampleBusinessInfo.mapEmbedUrl ? (
                  <iframe
                    title="Location map"
                    src={sampleBusinessInfo.mapEmbedUrl}
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
          <div className="mt-12 pt-8 border-t border-background/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-background/60">
            <span className="break-words">© {new Date().getFullYear()} {sampleBusinessInfo.name}. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Powered by <span className="font-medium text-background/80">ScanBit</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Reviews icon — left side, opens sheet with name, stars, message */}
      <button
        type="button"
        onClick={() => setReviewsOpen(true)}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card border-2 border-border text-foreground shadow-lg hover:scale-105 hover:border-primary/50 active:scale-95 transition-all touch-manipulation"
        aria-label="View reviews"
        title="Reviews"
      >
        <Star className="w-5 h-5 sm:w-5 sm:h-5 fill-amber-400 text-amber-500" />
      </button>

      <Sheet open={reviewsOpen} onOpenChange={setReviewsOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              Reviews
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {sampleMenuReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-border bg-muted/30 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground text-sm">{review.name}</span>
                  <div className="flex items-center gap-0.5" aria-label={`${review.stars} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= review.stars ? "fill-amber-400 text-amber-500" : "fill-muted text-muted-foreground/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.message}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <ItemDetailModal
        item={selectedItem}
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        categoryName={selectedItem ? getCategoryName(selectedItem.categoryId) : ""}
      />
    </div>
  );
}
