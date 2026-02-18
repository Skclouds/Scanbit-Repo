/**
 * Creative & Design catalog preview with real business data.
 * Same layout as ScanBit Demo — Creative & Design; uses restaurant + categories + menu items from API.
 */
import type { CreativeCatalogLiveData } from "@/pages/industries/demos/DemoCreativeCatalogPreview";
import { DemoCreativeCatalogPreview } from "@/pages/industries/demos/DemoCreativeCatalogPreview";
import type { CreativeDesignItem } from "@/pages/industries/demos/sampleData";

function formatAddress(addr: any, locationAddress?: string): string {
  if (locationAddress && String(locationAddress).trim()) return String(locationAddress).trim();
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
    return parts.join(", ");
  }
  return "";
}

function buildMapEmbedUrl(lat?: number | null, lng?: number | null): string | undefined {
  if (lat == null || lng == null || typeof lat !== "number" || typeof lng !== "number") return undefined;
  const delta = 0.01;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function getHeroSubtitle(category?: string, businessType?: string): string {
  const cat = (category || "").trim().toLowerCase();
  const type = (businessType || "").trim().toLowerCase();
  if (cat.includes("creative") || cat.includes("design")) {
    if (type.includes("logo") || type.includes("brand")) return "Logo & Branding — Creative Services";
    if (type.includes("graphic") || type.includes("print")) return "Graphic Design — Print & Digital";
    if (type.includes("ui") || type.includes("ux") || type.includes("digital")) return "Digital & UI/UX — Design Services";
    if (type.includes("illustration")) return "Illustration — Art & Design";
    return "Creative & Design — Services & Portfolio";
  }
  return "Services & Portfolio";
}

function mapMenuResponseToCreativeLiveData(initialData: any): CreativeCatalogLiveData {
  const restaurant = initialData?.restaurant || {};
  const categories = initialData?.categories || [];
  const loc = restaurant?.location || {};
  const addressStr = formatAddress(restaurant?.address, loc?.address);
  const lat = loc?.lat != null ? Number(loc.lat) : null;
  const lng = loc?.lng != null ? Number(loc.lng) : null;
  const mapEmbedUrl =
    restaurant?.portfolioMapEmbedUrl ||
    (lat != null && lng != null ? buildMapEmbedUrl(lat, lng) : undefined);

  const rawTagline = restaurant?.tagline || "";
  const tagline =
    !rawTagline || /fresh|local|delicious/i.test(rawTagline)
      ? "Services & Portfolio — Creative solutions for your brand"
      : rawTagline;

  const businessInfo = {
    name: restaurant?.name || "Creative Business",
    tagline,
    phone: restaurant?.phone || "",
    whatsapp: restaurant?.whatsapp || restaurant?.phone || "",
    email: restaurant?.email || "",
    address: addressStr,
    mapQuery: addressStr || restaurant?.name || "",
    mapEmbedUrl: mapEmbedUrl || undefined,
    logo: restaurant?.logo || undefined,
    socialMedia: restaurant?.socialMedia && typeof restaurant.socialMedia === "object" ? restaurant.socialMedia : undefined,
  };

  const categoryList = [
    { id: "all", name: "All" },
    ...categories.map((c: any) => ({ id: String(c.id), name: c.name || c.emoji ? `${c.emoji || ""} ${c.name || ""}`.trim() : "Category" })),
  ];

  const items: CreativeDesignItem[] = [];
  categories.forEach((cat: any) => {
    const catId = String(cat.id);
    (cat.items || []).forEach((item: any) => {
      items.push({
        id: String(item.id),
        title: item.name || "Item",
        categoryId: catId,
        shortDesc: (item.description || "").slice(0, 160) || "—",
        longDesc: item.description || "—",
        price: item.offerPrice != null ? Number(item.offerPrice) : item.price != null ? Number(item.price) : null,
        imageUrl: item.image || undefined,
        isPopular: !!item.isPopular,
        isNew: false,
      });
    });
  });

  const heroSubtitle = getHeroSubtitle(restaurant?.businessCategory, restaurant?.businessType);

  const restaurantId = restaurant?._id || restaurant?.id || undefined;
  return {
    businessInfo,
    categories: categoryList,
    items,
    heroSubtitle,
    isLiveCatalog: true,
    showSocialLinks: restaurant?.showSocialLinks !== false,
    restaurantId: restaurantId ? String(restaurantId) : undefined,
  };
}

interface CreativeCatalogPreviewProps {
  restaurantId: string;
  initialData: any;
}

export default function CreativeCatalogPreview({ initialData }: CreativeCatalogPreviewProps) {
  const liveData = mapMenuResponseToCreativeLiveData(initialData);
  return <DemoCreativeCatalogPreview liveData={liveData} />;
}
