import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import { DemoCatalogPreview } from "@/pages/industries/demos/DemoCatalogPreview";

interface RetailCatalogPreviewProps {
  restaurantId?: string;
  initialData?: any;
}

// Transform real business data to DemoCatalogPreview format
function transformToCatalogFormat(apiData: {
  restaurant: any;
  categories: Array<{ id: string; name: string; emoji?: string; items: any[] }>;
}) {
  const r = apiData.restaurant || {};
  const addr = r.location?.address || r.address || "";
  const mapQuery = addr || (r.name || "");

  // Transform menu items to catalog items (products)
  const catalogItems = (apiData.categories || []).flatMap((cat) =>
    (cat.items || []).map((item: any, idx: number) => ({
      id: String(item._id || item.id || `${cat.id || 'cat'}-${idx}`),
      title: item.name || "Product",
      subtitle: item.description || item.subtitle || "",
      price: Number(item.offerPrice ?? item.price ?? 0),
      category: cat.name || "Products",
      type: item.isPopular ? "Bestseller" : item.isNew ? "New arrival" : "Standard",
      rating: Number(item.rating || 4.5),
      imageUrl: item.image || item.images?.[0] || undefined,
      description: item.description || item.subtitle || "",
    }))
  );

  // Transform business info - ONLY use actual user data, no sample fallbacks
  const businessInfo = {
    name: r.name || "",
    tagline: r.tagline || "",
    logo: r.logo || null,
    address: addr || "",
    phone: r.phone || "",
    email: r.email || "",
    whatsapp: r.whatsapp || r.phone || "",
    openingHours: r.openingHours || "",
    website: r.website || r.socialMedia?.website || "",
    mapQuery: mapQuery || "",
    mapEmbedUrl: r.location?.lat && r.location?.lng
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${(r.location.lng - 0.01)}%2C${(r.location.lat - 0.01)}%2C${(r.location.lng + 0.01)}%2C${(r.location.lat + 0.01)}&layer=mapnik&marker=${r.location.lat}%2C${r.location.lng}`
      : null,
    socialMedia: r.socialMedia || {},
    showWhatsAppButton: r.showWhatsAppButton !== false, // Default to true if not set
    showQuickActions: r.showQuickActions !== false, // Default to true if not set
    showSocialLinks: r.showSocialLinks !== false, // Default to true if not set
    businessCategory: r.businessCategory || "",
    businessType: r.businessType || "",
  };

  return {
    catalogItems: catalogItems, // Only user's actual products, no sample fallback
    businessInfo,
  };
}

export default function RetailCatalogPreview({ restaurantId: propRestaurantId, initialData }: RetailCatalogPreviewProps) {
  const { restaurantId: paramRestaurantId } = useParams();
  const restaurantId = propRestaurantId || paramRestaurantId;
  
  const [loading, setLoading] = useState(!!restaurantId && !initialData);
  const [catalogItems, setCatalogItems] = useState<any[]>([]); // Start with empty array - only user's data
  const [businessInfo, setBusinessInfo] = useState<any>({
    name: "",
    tagline: "",
    logo: null,
    address: "",
    phone: "",
    email: "",
    whatsapp: "",
    openingHours: "",
    website: "",
    mapQuery: "",
    mapEmbedUrl: null,
    socialMedia: {},
    showWhatsAppButton: true,
    businessCategory: "",
    businessType: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId && !initialData) {
        return;
      }

      try {
        setLoading(true);
        const data = initialData || await api.getMenu(restaurantId!);
        
        if (data && data.success) {
          const transformed = transformToCatalogFormat({
            restaurant: data.restaurant,
            categories: data.categories || [],
          });
          
          setCatalogItems(transformed.catalogItems);
          setBusinessInfo(transformed.businessInfo);
        } else {
          toast.error(data?.message || "Failed to load catalog");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load catalog");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, initialData]);

  if (loading) {
    return <ProfessionalLoader fullScreen size="xl" variant="branded" />;
  }

  // Use DemoCatalogPreview with real business data - hide promotional buttons for live menus
  return <DemoCatalogPreview 
    catalogItems={catalogItems} 
    businessInfo={businessInfo} 
    isLiveMenu={true}
    showWhatsAppButton={businessInfo.showWhatsAppButton !== false}
  />;
}
