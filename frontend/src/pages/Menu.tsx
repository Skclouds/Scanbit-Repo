import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import FoodMallMenuPreview from "./FoodMallMenuPreview";
import DemoCatalog from "./DemoCatalog";
import RetailCatalogPreview from "./RetailCatalogPreview";
import CreativeCatalogPreview from "./CreativeCatalogPreview";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";

// Routes to Food Mall menu (same layout for all) or Catalog menu based on business category
const Menu = () => {
  const { restaurantId } = useParams();
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  
  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await api.getMenu(restaurantId);
        
        if (response && response.success) {
          setRestaurantData(response);
          const category = (response.restaurant?.businessCategory || '').trim();
          const typeOrCategory = (response.restaurant?.businessType || response.restaurant?.businessCategory || '').toLowerCase();
          
          // Food Mall category: ALL businesses under this category see the SAME Food Mall demo menu with their own details
          const isFoodMallCategory = category === 'Food Mall' || category.toLowerCase().includes('food mall');
          if (isFoodMallCategory) {
            setBusinessType('restaurant');
            return;
          }
          
          // Retail / E-Commerce category: ALL businesses under this category use professional catalog preview
          const isRetailCategory = category === 'Retail / E-Commerce Businesses' || category.toLowerCase().includes('retail') || category.toLowerCase().includes('e-commerce');
          if (isRetailCategory) {
            setBusinessType('retail');
            return;
          }

          // Creative & Design: use Creative & Design demo-style catalog (same as /industries/creative-design) with business data
          const isCreativeCategory = category === 'Creative & Design' || typeOrCategory.includes('creative') || typeOrCategory.includes('design');
          if (isCreativeCategory) {
            setBusinessType('creative');
            return;
          }
          
          // Other categories: use business type/category to decide layout
          if (
            typeOrCategory.includes('restaurant') ||
            typeOrCategory.includes('food') ||
            typeOrCategory.includes('mall') ||
            typeOrCategory.includes('cafe') ||
            typeOrCategory.includes('café') ||
            typeOrCategory.includes('dining') ||
            typeOrCategory.includes('bakery') ||
            typeOrCategory.includes('bistro') ||
            typeOrCategory.includes('takeaway') ||
            typeOrCategory.includes('cloud kitchen') ||
            typeOrCategory.includes('food court')
          ) {
            setBusinessType('restaurant');
          } else if (
            typeOrCategory.includes('agency') ||
            typeOrCategory.includes('marketing') ||
            typeOrCategory.includes('advert') ||
            typeOrCategory.includes('creative') ||
            typeOrCategory.includes('design') ||
            typeOrCategory.includes('consult') ||
            typeOrCategory.includes('professional') ||
            typeOrCategory.includes('service') ||
            typeOrCategory.includes('legal') ||
            typeOrCategory.includes('account') ||
            typeOrCategory.includes('health') ||
            typeOrCategory.includes('wellness') ||
            typeOrCategory.includes('medical') ||
            typeOrCategory.includes('clinic') ||
            typeOrCategory.includes('spa') ||
            typeOrCategory.includes('yoga')
          ) {
            setBusinessType('catalog');
          } else {
            setBusinessType('catalog');
          }
        } else {
          const category = (response?.restaurant?.businessCategory || '').trim();
          const type = (response?.restaurant?.businessType || '').toLowerCase();
          const combined = `${category} ${type}`.toLowerCase();
          const label = combined.includes('retail') || combined.includes('e-commerce') || combined.includes('store') || combined.includes('shop') ? 'Catalog' :
                       combined.includes('creative') || combined.includes('design') || combined.includes('portfolio') ? 'Portfolio' :
                       combined.includes('professional') || combined.includes('service') || combined.includes('consult') ? 'Services' :
                       combined.includes('health') || combined.includes('wellness') || combined.includes('medical') ? 'Services' :
                       combined.includes('agency') || combined.includes('marketing') ? 'Portfolio' : 'Menu';
          toast.error(response?.message || `${label} not found`);
          setBusinessType(null);
        }
      } catch (error: any) {
        // Try to get label from restaurantData if available
        const category = (restaurantData?.restaurant?.businessCategory || '').trim();
        const type = (restaurantData?.restaurant?.businessType || '').toLowerCase();
        const combined = `${category} ${type}`.toLowerCase();
        const label = combined.includes('retail') || combined.includes('e-commerce') || combined.includes('store') || combined.includes('shop') ? 'catalog' :
                     combined.includes('creative') || combined.includes('design') || combined.includes('portfolio') ? 'portfolio' :
                     combined.includes('professional') || combined.includes('service') || combined.includes('consult') ? 'services' :
                     combined.includes('health') || combined.includes('wellness') || combined.includes('medical') ? 'services' :
                     combined.includes('agency') || combined.includes('marketing') ? 'portfolio' : 'menu';
        toast.error(error.message || `Failed to load ${label}`);
        setBusinessType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, [restaurantId]);

  if (loading) {
    return <ProfessionalLoader fullScreen size="xl" variant="branded" />;
  }

  if (!businessType || !restaurantData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Menu Not Found</h2>
          <p className="text-muted-foreground">
            The restaurant menu you're looking for doesn't exist or hasn't been set up yet.
          </p>
        </div>
      </div>
    );
  }

  // Food/restaurant: Food Mall layout; Retail: retail catalog; Creative & Design: Creative demo-style catalog; Others: generic catalog
  if (businessType === 'restaurant') {
    return <FoodMallMenuPreview restaurantId={restaurantId} initialData={restaurantData} />;
  }
  if (businessType === 'retail') {
    return <RetailCatalogPreview restaurantId={restaurantId} initialData={restaurantData} />;
  }
  if (businessType === 'creative') {
    return <CreativeCatalogPreview restaurantId={restaurantId} initialData={restaurantData} />;
  }
  return <DemoCatalog restaurantId={restaurantId} initialData={restaurantData} />;
};

export default Menu;
