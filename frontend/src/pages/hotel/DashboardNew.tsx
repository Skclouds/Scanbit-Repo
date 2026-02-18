import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { getBusinessConfig } from "./sections/menu";

// Layout Components
import HotelSidebar from "./components/layout/HotelSidebar";
import HotelHeader from "./components/layout/HotelHeader";
import HotelContentRouter from "./components/HotelContentRouter";

// Other components
import { AdvertisementLoader } from "@/components/advertisements/AdvertisementLoader";
import Onboarding from "@/components/Onboarding";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  isSpicy: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  itemCount: number;
}

export default function DashboardNew() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // UI State
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data State
  const [restaurant, setRestaurant] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check authentication and load initial data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (!token || userRole !== "user") {
      navigate("/login");
      return;
    }

    fetchInitialData();
  }, [navigate]);

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [restaurantRes, userRes] = await Promise.all([
        api.get("/restaurant/profile"),
        api.get("/user/profile"),
      ]);

      setRestaurant(restaurantRes.data);
      setUser(userRes.data);

      // Check if onboarding is needed
      if (!restaurantRes.data.onboardingCompleted) {
        setShowOnboarding(true);
      }

      // Fetch menu data if needed
      if (activeTab === "menu") {
        await fetchMenuData();
      }
    } catch (error) {

      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuData = async () => {
    try {
      const [menuRes, categoriesRes] = await Promise.all([
        api.get("/menu/items"),
        api.get("/menu/categories"),
      ]);

      setMenuItems(menuRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      const config = getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType);
      const dataLabel = config.pageTitle === 'Menu Management' ? 'menu' : 
                       config.pageTitle === 'Product Catalog' ? 'catalog' :
                       config.pageTitle === 'Portfolio' || config.pageTitle === 'Agency Portfolio' ? 'portfolio' : 'data';
      toast.error(`Failed to load ${dataLabel} data`);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Fetch data specific to the tab if needed
    if (tab === "menu" && menuItems.length === 0) {
      fetchMenuData();
    }
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case "dashboard":
        fetchInitialData();
        break;
      case "menu":
        fetchMenuData();
        break;
      default:
        // Refresh current tab data
        break;
    }
  };

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchInitialData(); // Refresh data after onboarding
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Advertisement Loader */}
      <AdvertisementLoader />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <Onboarding
          isOpen={showOnboarding}
          onClose={handleOnboardingComplete}
          restaurant={restaurant}
        />
      )}

      {/* Sidebar */}
      <HotelSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        businessCategory={restaurant?.businessCategory}
        businessName={restaurant?.name}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <HotelHeader
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          setSidebarOpen={setSidebarOpen}
          businessName={restaurant?.name}
          userName={user?.name}
          userEmail={user?.email}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <HotelContentRouter
            activeTab={activeTab}
            restaurant={restaurant}
            user={user}
            menuItems={menuItems}
            categories={categories}
            onRefresh={handleRefresh}
            onExport={handleExport}
            // Pass additional props that might be needed
            searchQuery={searchQuery}
            setMenuItems={setMenuItems}
            setCategories={setCategories}
            setRestaurant={setRestaurant}
            setUser={setUser}
          />
        </div>
      </div>
    </div>
  );
}