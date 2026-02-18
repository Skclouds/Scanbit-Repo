import { MdQrCode, MdDownload, MdTrendingUp, MdEvent, MdCheckCircle, MdStar, MdImage, MdShoppingCart, MdPeople, MdInventory, MdDescription, MdNotifications, MdIntegrationInstructions, MdReceipt, MdSchedule, MdLocalOffer, MdLanguage, MdSecurity, MdPayment, MdRestaurantMenu, MdDashboard, MdShoppingBag, MdBrush, MdWork, MdPalette, MdHelpOutline, MdCreditCard, MdLocationOn, MdDevices, MdCampaign, MdReviews, MdBusiness } from "react-icons/md";
import { FiTrendingUp, FiSettings, FiLogOut, FiMenu, FiX, FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiDownload, FiAlertCircle, FiCheckCircle, FiStar, FiImage, FiSearch, FiUser, FiBell } from "react-icons/fi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdvertisementLoader } from "@/components/advertisements/AdvertisementLoader";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import SubscriptionDialog from "@/components/SubscriptionDialog";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { MenuItemDialog } from "@/components/MenuItemDialog";
import { CategoryDialog } from "@/components/CategoryDialog";
import { useState, useEffect, useMemo, useRef } from "react";
import Onboarding from "@/components/Onboarding";
import { Switch } from "@/components/ui/switch";
import { FaLeaf, FaFire } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HiSparkles } from "react-icons/hi";
import { QRCodeSVG } from "qrcode.react";
import { FaStar, FaUtensils } from "react-icons/fa";
import api, { env } from "@/lib/api";
import { DemoPortfolioPreview } from "@/pages/industries/demos/DemoPortfolioPreview";
import { DemoAgencyPreview } from "@/pages/industries/demos/DemoAgencyPreview";
import { safeImageSrc } from "@/lib/imageUtils";
import { toast } from "sonner";
import { getPreviewText } from "./utils/previewText";


import Settings from "./Settings";
import Profile from "./Profile";
import {
  Overview,
  QRCode,
  Analytics,
  SubscriptionSection,
  Promotions,
  Payments,
  Reports,
  MediaLibrary,
  Integrations,
  Support,
  Advertisements,
  Notifications,
  MenuManagement,
  Orders,
  Customers,
  Inventory,
  Reviews,
  Team,
  Marketing,
  Campaigns,
  Transactions,
  Growth,
  BusinessInformation,
  PortfolioForm,
  AgencyPortfolioForm,
  getBusinessConfig,
} from "./sections";


interface MenuItem {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: string | { _id: string; name: string };
  isVeg?: boolean;
  isSpicy?: boolean;
  isPopular?: boolean;
  isAvailable?: boolean;
  image?: string;
  images?: string[];
}

interface Category {
  _id?: string;
  id?: string;
  name: string;
  emoji?: string;
  itemCount?: number;
}

// No placeholder data - only real data from API is used

// Dynamic navigation items based on business type — sync with DashboardSidebar
const getNavItems = (businessCategory?: string, businessType?: string) => {
  const categoryStr = (businessCategory || businessType || '').toLowerCase();
  const isFoodMall = categoryStr.includes('food') || categoryStr.includes('mall') || categoryStr.includes('restaurant') || categoryStr.includes('cafe') || categoryStr.includes('café') || categoryStr.includes('takeaway') || categoryStr.includes('cloud kitchen') || categoryStr.includes('food court') || categoryStr.includes('bakery') || categoryStr.includes('dining');
  const isAgency = categoryStr.includes('agency') || categoryStr.includes('marketing');
  const isRetail = categoryStr.includes('retail') || categoryStr.includes('e-commerce') || categoryStr.includes('store') || categoryStr.includes('shop');
  const isCreative = categoryStr.includes('creative') || categoryStr.includes('design');
  const isWellness = categoryStr.includes('health') || categoryStr.includes('wellness') || categoryStr.includes('medical') || categoryStr.includes('clinic');
  const isProfessional = categoryStr.includes('professional') || categoryStr.includes('service') || categoryStr.includes('consult') || categoryStr.includes('legal');
  const isPortfolio = categoryStr.includes('portfolio');

  let menuLabel = "Menu";
  let menuIcon = MdRestaurantMenu;
  let promoLabel = "Promotions";

  if (isAgency) {
    menuLabel = "Services";
    menuIcon = MdBrush;
    promoLabel = "Campaigns";
  } else if (isRetail) {
    menuLabel = "Products";
    menuIcon = MdShoppingBag;
  } else if (isCreative) {
    menuLabel = "Catalog";
    menuIcon = MdBrush;
  } else if (isWellness) {
    menuLabel = "Treatments";
    menuIcon = MdDevices;
  } else if (isProfessional) {
    menuLabel = "Services";
    menuIcon = MdWork;
  }

  // Creative & Design: show "Portfolio" (catalog) tab, not "Create your portfolio"
  const isPortfolioType = isProfessional || isPortfolio;
  const isCreativeOnly = isCreative && !isPortfolio && !isProfessional;

  // Food Mall — streamlined tabs (no Orders, Reports, Integrations)
  if (isFoodMall) {
    return [
      { icon: MdDashboard, label: "Dashboard", id: "dashboard" },
      { icon: menuIcon, label: menuLabel, id: "menu" },
      { icon: MdQrCode, label: "QR Codes", id: "qr" },
      { icon: FiTrendingUp, label: "Analytics", id: "analytics" },
      { icon: MdReviews, label: "Reviews", id: "reviews" },
      { icon: MdImage, label: "Media Library", id: "mediaLibrary" },
      { icon: MdLocalOffer, label: promoLabel, id: "promotions" },
      { icon: MdCampaign, label: "Marketing", id: "marketing" },
      { icon: MdTrendingUp, label: "Growth", id: "growth" },
      { icon: MdPayment, label: "Payments", id: "payments" },
      { icon: MdReceipt, label: "Transactions", id: "transactions" },
      { icon: MdPayment, label: "Subscription", id: "subscription" },
      { icon: MdBusiness, label: "Business Info", id: "businessInfo" },
      { icon: FiUser, label: "Profile", id: "profile" },
      { icon: FiSettings, label: "Settings", id: "settings" },
      { icon: MdHelpOutline, label: "Support", id: "support" },
    ];
  }

  const createPortfolioNav = isPortfolioType ? [{ icon: MdPalette, label: "Create your portfolio", id: "createPortfolio" }] : [];
  const menuNav = isPortfolioType && !isCreativeOnly ? [] : [{ icon: menuIcon, label: menuLabel, id: "menu" }];
  return [
    { icon: MdDashboard, label: "Dashboard", id: "dashboard" },
    ...menuNav,
    ...createPortfolioNav,
    { icon: MdQrCode, label: "QR Codes", id: "qr" },
    { icon: FiTrendingUp, label: "Analytics", id: "analytics" },
    { icon: MdLocalOffer, label: promoLabel, id: "promotions" },
    { icon: MdPayment, label: "Payments", id: "payments" },
    { icon: MdDescription, label: "Reports", id: "reports" },
    { icon: MdImage, label: "Media Library", id: "mediaLibrary" },
    { icon: MdIntegrationInstructions, label: "Integrations", id: "integrations" },
    { icon: MdHelpOutline, label: "Support", id: "support" },
    { icon: MdPayment, label: "Subscription", id: "subscription" },
    { icon: FiUser, label: "Profile", id: "profile" },
    { icon: FiSettings, label: "Settings", id: "settings" },
  ];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings } = useSiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("🍽️");
  const [logo, setLogo] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const initialFetchDone = useRef(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [preSelectedPlan, setPreSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const hotelAuth = localStorage.getItem("hotelAuth");
    if (!token || !hotelAuth) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);
  
  // QR Customization state
  const [qrCustomization, setQrCustomization] = useState({
    fgColor: "#1f2937",
    bgColor: "#ffffff",
    size: 256,
    level: "H" as "L" | "M" | "Q" | "H",
    includeMargin: true,
    marginSize: 4,
    logoEnabled: true,
    logoSize: 40,
  });

  // New item form state
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    isVeg: true,
    isSpicy: false,
    isPopular: false,
    isAvailable: true,
  });

  // Fetch data from API - defined as a function so it can be passed to child components
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get restaurant data
      const restaurantRes = await api.getMyRestaurant();
      if (restaurantRes.success) {
        setRestaurant(restaurantRes.data);
        // Set logo if available
        if (restaurantRes.data.logo) {
          setLogo(restaurantRes.data.logo);
        }
        // Only show onboarding on initial load if not completed (don't re-open after save business info etc.)
        if (!initialFetchDone.current) {
          initialFetchDone.current = true;
          if (!restaurantRes.data.onboardingCompleted) {
            setShowOnboarding(true);
          }
        }
      }

      // Get categories
      const categoriesRes = await api.getCategories();
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }

      // Get menu items
      const itemsRes = await api.getMenuItems();
      if (itemsRes.success) {
        setMenuItems(itemsRes.data);
      }

      // Get analytics
      const analyticsRes = await api.getDashboardAnalytics();
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Valid tab ids for URL sync (e.g. /dashboard?tab=profile)
  const validTabIds = useMemo(() => new Set(getNavItems(restaurant?.businessCategory, restaurant?.businessType).map((n) => n.id)), [restaurant?.businessCategory, restaurant?.businessType]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Sync activeTab from URL ?tab= (e.g. Profile link from home navbar)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && validTabIds.has(tab)) setActiveTab(tab);
  }, [searchParams, validTabIds]);

  // Show "Choose Your Plan" dialog when user logs in (onboarding already complete)
  useEffect(() => {
    if (loading || !restaurant) return;
    if (restaurant?.onboardingCompleted !== true) return;
    const showPlan = sessionStorage.getItem('showPlanChooserOnLogin');
    if (showPlan !== 'true') return;
    sessionStorage.removeItem('showPlanChooserOnLogin');
    const savedPlan = sessionStorage.getItem('preSelectedPlan');
    if (savedPlan) {
      setPreSelectedPlan(savedPlan);
      sessionStorage.removeItem('preSelectedPlan');
    }
    setTimeout(() => setShowSubscriptionDialog(true), 400);
  }, [loading, restaurant]);

  // Get dynamic navigation items based on business type - memoized to update when restaurant changes
  const navItems = useMemo(() => {
    return getNavItems(restaurant?.businessCategory, restaurant?.businessType);
  }, [restaurant?.businessCategory, restaurant?.businessType]);

  const handleLogout = () => {
    localStorage.removeItem("hotelAuth");
    localStorage.removeItem("token");
    api.setToken(null);
    setShowLogoutConfirm(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const requestLogout = () => setShowLogoutConfirm(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;
      
      await api.updateMenuItem(itemId, {
        isAvailable: !item.isAvailable
      });
      
      // Refresh menu items
      const itemsRes = await api.getMenuItems();
      if (itemsRes.success) {
        setMenuItems(itemsRes.data);
      }
      
      toast.success("Availability updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update availability");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.deleteMenuItem(itemId);
      
      // Refresh menu items
      const itemsRes = await api.getMenuItems();
      if (itemsRes.success) {
        setMenuItems(itemsRes.data);
      }
      
      toast.success("Item deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.price) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      await api.createMenuItem({
        name: newItem.name,
        description: newItem.description || "",
        price: newItem.price,
        category: newItem.category,
        isVeg: newItem.isVeg ?? true,
        isSpicy: newItem.isSpicy ?? false,
        isPopular: newItem.isPopular ?? false,
        isAvailable: newItem.isAvailable ?? true,
      });
      
      // Refresh menu items
      const itemsRes = await api.getMenuItems();
      if (itemsRes.success) {
        setMenuItems(itemsRes.data);
      }
      
      setIsAddingItem(false);
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category: "",
        isVeg: true,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
      });
      toast.success("Added successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to add");
    }
  };

  const handleAddCategory = async (category: any) => {
    try {
      // Refresh categories to get the newly added category
      const categoriesRes = await api.getCategories();
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
      
      setIsAddingCategory(false);
      setEditingCategory(null);
      
      // Show professional success message
      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <div>
            <p className="font-semibold">Successfully Added!</p>
            <p className="text-sm opacity-90">{category.name || 'New entry'} has been added to your catalog</p>
          </div>
        </div>
      , {
        duration: 4000,
        position: 'top-right'
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to add category");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await api.deleteCategory(categoryId);
      
      // Refresh categories and menu items
      const [categoriesRes, itemsRes] = await Promise.all([
        api.getCategories(),
        api.getMenuItems()
      ]);
      
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
      if (itemsRes.success) {
        setMenuItems(itemsRes.data);
      }
      
      setDeletingCategoryId(null);
      
      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <div>
            <p className="font-semibold">Deleted Successfully</p>
            <p className="text-sm opacity-90">The entry has been removed from your catalog</p>
          </div>
        </div>
      , {
        duration: 4000,
        position: 'top-right'
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  // Creative & Design → /catalogue; Agencies & Studios + Professional/Portfolio → /portfolio; Food/Retail → /menu
  const _categoryStr = (restaurant?.businessCategory || restaurant?.businessType || "").toLowerCase();
  const _isCreative = _categoryStr.includes("creative") || _categoryStr.includes("design");
  const _isAgenciesStudios = (restaurant?.businessCategory || "").toLowerCase() === "agencies & studios" || _categoryStr.includes("agency") || _categoryStr.includes("studios");
  const _isPortfolioCategory =
    _isAgenciesStudios ||
    _categoryStr.includes("portfolio") ||
    _categoryStr.includes("professional");
  const basePath = _isCreative ? "catalogue" : _isPortfolioCategory ? "portfolio" : "menu";
  const menuUrl = restaurant?._id || restaurant?.id
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${basePath}/${restaurant._id || restaurant.id}`
    : "";

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) {
      toast.error("QR Code not found");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // Add logo in center if enabled and logo exists
      if (qrCustomization.logoEnabled && logo) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          const logoSize = qrCustomization.logoSize;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          // Draw white background circle for logo
          ctx.fillStyle = qrCustomization.bgColor;
          ctx.beginPath();
          ctx.arc(centerX, centerY, logoSize / 2 + 8, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw logo
          ctx.drawImage(
            logoImg,
            centerX - logoSize / 2,
            centerY - logoSize / 2,
            logoSize,
            logoSize
          );

          // Finalize download
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = `${restaurant?.name || 'menu'}-QR-Code.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
          toast.success("QR Code downloaded successfully!");
        };
        logoImg.onerror = () => {
          // If logo fails to load, just download QR without logo
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = `${restaurant?.name || 'menu'}-QR-Code.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
          toast.success("QR Code downloaded successfully!");
        };
        logoImg.src = logo;
      } else {
        // Download without logo
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${restaurant?.name || 'menu'}-QR-Code.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success("QR Code downloaded successfully!");
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => {
        const itemCategory = typeof item.category === 'object' ? item.category._id : item.category;
        return itemCategory === selectedCategory;
      })
    : menuItems;

  const handleOnboardingComplete = async () => {
    // Refresh restaurant data
    try {
      const restaurantRes = await api.getMyRestaurant();
      if (restaurantRes.success) {
        setRestaurant(restaurantRes.data);
        if (restaurantRes.data.logo) {
          setLogo(restaurantRes.data.logo);
        }
      }
    } catch (error: any) {

    }
    setShowOnboarding(false);
    
    const shouldShowSubscription = sessionStorage.getItem('showSubscriptionAfterOnboarding');
    const shouldShowPlanChooser = sessionStorage.getItem('showPlanChooserOnLogin');
    if (shouldShowSubscription === 'true' || shouldShowPlanChooser === 'true') {
      sessionStorage.removeItem('showSubscriptionAfterOnboarding');
      sessionStorage.removeItem('showPlanChooserOnLogin');
      const savedPlan = sessionStorage.getItem('preSelectedPlan');
      if (savedPlan) {
        setPreSelectedPlan(savedPlan);
        sessionStorage.removeItem('preSelectedPlan');
      }
      setTimeout(() => setShowSubscriptionDialog(true), 500);
    }
  };
  
  // Handle subscription success
  const handleSubscriptionSuccess = async () => {
    setShowSubscriptionDialog(false);
    setPreSelectedPlan(null);
    
    // Refresh restaurant data to get updated subscription info
    try {
      const restaurantRes = await api.getMyRestaurant();
      if (restaurantRes.success) {
        setRestaurant(restaurantRes.data);
      }
    } catch (error: any) {

    }
    
    toast.success("Your subscription has been activated! Enjoy all the features.");
    setActiveTab("subscription");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Restaurant not found</p>
          <Button onClick={handleLogout} className="mt-4">Go to Login</Button>
        </div>
      </div>
    );
  }

  const subscription = restaurant?.subscription || {};
  const isFreePlan = subscription?.plan === "Free" || subscription?.planPrice === 0;
  const isTrialExpired =
    isFreePlan &&
    (subscription?.status === "expired" || (subscription?.daysRemaining ?? 0) <= 0);

  if (isTrialExpired) {
    return (
      <>
        <SubscriptionDialog
          open={showSubscriptionDialog}
          onOpenChange={setShowSubscriptionDialog}
          restaurant={restaurant}
          onSuccess={handleSubscriptionSuccess}
          source="upgrade"
          showTitle={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <MdCreditCard className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Your free trial has ended
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mb-6">
                Choose a plan to continue accessing your dashboard and all features.
              </p>
              <Button
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6 rounded-xl"
                onClick={() => setShowSubscriptionDialog(true)}
              >
                <MdStar className="w-5 h-5 mr-2" />
                Choose a plan
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                Need help? Contact support for assistance.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-slate-500 hover:text-slate-700"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Derive category flags at runtime for rendering content
  const categoryStr = (restaurant.businessCategory || restaurant.businessType || "").toLowerCase();
  const isAgenciesStudios = (restaurant.businessCategory || "").toLowerCase() === "agencies & studios" || categoryStr.includes("agency") || categoryStr.includes("studios");
  const isPortfolioCategory =
    isAgenciesStudios ||
    categoryStr.includes("portfolio") ||
    categoryStr.includes("professional");
  const isCreativeCategory = categoryStr.includes("creative") || categoryStr.includes("design");

  return (
    <>
      <Onboarding
        restaurant={restaurant}
        onComplete={handleOnboardingComplete}
        open={showOnboarding}
      />
      
      {/* Subscription Dialog - shown after onboarding for new users or when manually triggered */}
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        restaurant={restaurant}
        defaultPlan={preSelectedPlan || undefined}
        onSuccess={handleSubscriptionSuccess}
        source="onboarding"
        showTitle={true}
      />

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your dashboard and business data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AdvertisementLoader businessCategory={restaurant?.businessCategory} />
      <div className="min-h-screen min-h-[100dvh] bg-background flex" style={{ backgroundColor: 'hsl(30, 15%, 98%)', color: 'hsl(20, 20%, 10%)' }}>
        {/* Sidebar - Now handles its own positioning and overlay */}
        <DashboardSidebar
          businessCategory={restaurant?.businessCategory}
          businessType={restaurant?.businessType}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (window.innerWidth < 1024) {
              setSidebarOpen(false);
            }
          }}
          onLogout={requestLogout}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
        />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-h-[100dvh] bg-white">
        {/* Professional Top Navigation Bar — mobile-optimized */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-orange-200/30 shadow-sm supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Left Section - Mobile Menu & Brand */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <button 
                  className="lg:hidden p-2.5 -ml-2 rounded-xl hover:bg-orange-100 active:bg-orange-200/50 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center" 
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <FiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                </button>
                {settings?.branding?.logoUrl ? (
                  <img 
                    src={settings.branding.logoUrl} 
                    alt={settings.general?.siteName || env.APP_NAME}
                    className="sm:block lg:hidden h-9 sm:h-10 w-auto object-contain max-w-[140px]"
                  />
                ) : (
                  <div className="flex lg:hidden items-center gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <MdDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="hidden sm:inline text-sm font-bold text-slate-900 truncate max-w-[120px]">
                      {restaurant?.name || env.APP_NAME}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Search (Desktop Only) */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100/50 border border-orange-200 hover:bg-orange-100 transition-colors max-w-xs">
                  <FiSearch className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm flex-1 min-w-0 text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                {/* Preview — Creative → /catalogue, Professional/Portfolio → /portfolio, others → /menu */}
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Link
                    to={
                      isCreativeCategory
                        ? `/catalogue/${restaurant?._id || ''}`
                        : isPortfolioCategory
                        ? `/portfolio/${restaurant?._id || ''}`
                        : `/menu/${restaurant?._id || ''}`
                    }
                    target="_blank"
                  >
                    <FiEye className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {getPreviewText(restaurant?.businessCategory, restaurant?.businessType)}
                    </span>
                    <span className="sm:hidden">Preview</span>
                  </Link>
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative text-slate-900">
                      <FiBell className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex flex-col items-start">
                      <p className="text-sm font-medium">Welcome to {env.APP_NAME}!</p>
                      <p className="text-xs text-slate-600">Get started by setting up your menu</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 sm:px-3 text-slate-900">
                      {restaurant?.logo ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-400 flex-shrink-0">
                          <img src={safeImageSrc(restaurant.logo)} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                          <FiUser className="w-4 h-4 text-orange-700" />
                        </div>
                      )}
                      <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                        {restaurant?.name || "Business"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                      <FiUser className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                      <FiSettings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={requestLogout} className="text-destructive">
                      <FiLogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content — extra bottom padding on mobile for bottom nav bar; prevent horizontal overflow; iOS Safari scroll fix */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 pt-4 sm:pt-6 pb-24 md:pb-6 lg:pb-6 min-w-0 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {activeTab === "dashboard" && (
            <Overview
              restaurant={restaurant}
              menuItems={menuItems}
              categories={categories}
              analytics={analytics}
              onTabChange={setActiveTab}
              formatCurrency={formatCurrency}
            />
          )}

          {/* LEGACY OVERVIEW - TO BE REMOVED */}
          {false && activeTab === "dashboard-legacy" && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {restaurant?.name}! 👋</h2>
                    <p className="text-orange-100">Here's your business performance summary for today</p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur">
                    <MdDashboard className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Subscription Alert */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <MdEvent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm sm:text-base">
                    Your {restaurant?.subscription?.plan || 'Free'} plan {restaurant?.subscription?.endDate ? `renew${restaurant.subscription.daysRemaining > 0 ? 's' : 'ed'} on ${new Date(restaurant.subscription.endDate).toLocaleDateString()}` : 'is active'}
                  </p>
                  <p className="text-sm text-slate-700">
                    {restaurant?.subscription?.daysRemaining || 0} days remaining • {restaurant?.subscription?.status === 'active' ? '✓ Active' : '⚠ Inactive'}
                  </p>
                </div>
                <Button size="sm" onClick={() => setActiveTab("subscription")} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white">Upgrade Plan</Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Menu Items */}
                <div className="bg-white rounded-xl border border-orange-200/50 shadow-sm hover:shadow-md transition-all p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                      <MdRestaurantMenu className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{menuItems.length}</p>
                  <p className="text-sm text-slate-600">
                    {restaurant?.businessCategory === "Retail / E-Commerce Businesses"
                      ? "Products"
                      : restaurant?.businessCategory === "Creative & Design"
                      ? "Services"
                      : "Menu Items"}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Limit: {restaurant?.menuItemsLimit || 'Unlimited'}</p>
                </div>

                {/* QR Scans */}
                <div className="bg-white rounded-xl border border-orange-200/50 shadow-sm hover:shadow-md transition-all p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <MdQrCode className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <FiTrendingUp className="w-3 h-3" />
                      +18%
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    {analytics?.stats?.totalScans?.toLocaleString() || restaurant?.qrScans?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-slate-600">Total QR Scans</p>
                  <p className="text-xs text-slate-500 mt-2">All-time total</p>
                </div>

                {/* This Month */}
                <div className="bg-white rounded-xl border border-orange-200/50 shadow-sm hover:shadow-md transition-all p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <FiTrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                      This Month
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    {analytics?.stats?.thisMonthScans?.toLocaleString() || restaurant?.qrScansThisMonth?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-slate-600">Monthly Scans</p>
                  <p className="text-xs text-slate-500 mt-2">Current month</p>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-xl border border-orange-200/50 shadow-sm hover:shadow-md transition-all p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
                      <MdStar className="w-6 h-6 text-pink-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                      Total
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{categories.length}</p>
                  <p className="text-sm text-slate-600">
                    {restaurant?.businessCategory === "Retail / E-Commerce Businesses" 
                      ? "Product Categories" 
                      : restaurant?.businessCategory === "Creative & Design"
                      ? "Service Categories"
                      : "Menu Categories"}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Organized</p>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <MdCheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{restaurant?.businessCategory === "Creative & Design" ? "Available Services" : "Available Items"}</p>
                    <p className="text-lg font-bold text-slate-900">{menuItems.filter(i => i.isAvailable).length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <FaStar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{restaurant?.businessCategory === "Creative & Design" ? "Popular Services" : "Popular Items"}</p>
                    <p className="text-lg font-bold text-slate-900">{menuItems.filter(i => i.isPopular).length}</p>
                  </div>
                </div>
                {restaurant?.businessCategory === "Creative & Design" ? (
                <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <MdStar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Service Categories</p>
                    <p className="text-lg font-bold text-slate-900">{categories.length}</p>
                  </div>
                </div>
                ) : (
                <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <FaFire className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Spicy Items</p>
                    <p className="text-lg font-bold text-slate-900">{menuItems.filter(i => i.isSpicy).length}</p>
                  </div>
                </div>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab("menu")}
                    className="p-4 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-all flex items-center justify-center mb-3">
                      <MdRestaurantMenu className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {restaurant?.businessCategory === "Creative & Design" ? "Manage Catalog" : "Manage Menu"}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {restaurant?.businessCategory === "Creative & Design" ? "Service categories & services" : "Add or edit items"}
                    </p>
                  </button>

                  <button
                    onClick={() => setActiveTab("qr")}
                    className="p-4 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-all flex items-center justify-center mb-3">
                      <MdQrCode className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">QR Code</h4>
                    <p className="text-xs text-slate-600 mt-1">Download & customize</p>
                  </button>

                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="p-4 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-all flex items-center justify-center mb-3">
                      <FiTrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">Analytics</h4>
                    <p className="text-xs text-slate-600 mt-1">View insights</p>
                  </button>

                  <button
                    onClick={() => setActiveTab("profile")}
                    className="p-4 bg-white rounded-xl border-2 border-green-200 hover:border-green-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 group-hover:bg-green-200 transition-all flex items-center justify-center mb-3">
                      <FiUser className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">Profile</h4>
                    <p className="text-xs text-slate-600 mt-1">Edit business info</p>
                  </button>
                </div>
              </div>

              {/* Popular Items/Services Preview */}
              {menuItems.filter(i => i.isPopular).length > 0 && (
                <div className="bg-white rounded-xl border border-orange-200/50 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FaStar className="w-5 h-5 text-yellow-500" />
                      {restaurant?.businessCategory === "Creative & Design" ? "Popular Services" : "Popular Items"}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("analytics")}>View All →</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems.filter(i => i.isPopular).slice(0, 3).map((item, index) => (
                      <div key={item.id || item._id || `popular-${index}`} className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 overflow-hidden">
                        <div className="aspect-square w-full max-h-24 sm:max-h-28 rounded-lg overflow-hidden bg-white/50 flex items-center justify-center mb-3">
                          {(item.image || item.imageUrl) ? (
                            <img src={safeImageSrc(item.image || item.imageUrl)} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <FaUtensils className="w-8 h-8 text-orange-300" />
                          )}
                        </div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.description || ""}</p>
                        <p className="text-lg font-bold text-orange-600 mt-2">{formatCurrency(item.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "menu" && (
            isPortfolioCategory ? (
              <div className="space-y-6">
                {isAgenciesStudios && (
                  <>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-1">Fill your portfolio</h2>
                      <p className="text-slate-600 text-sm">Complete the steps below to show studio info, featured projects, and gallery on your public portfolio.</p>
                    </div>
                    <AgencyPortfolioForm restaurant={restaurant} onRefresh={fetchData} />
                    <div className="border-t border-slate-200 pt-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Live preview</h3>
                      <p className="text-slate-600 text-sm mb-4">This is how your agency or studio portfolio will look for visitors.</p>
                    </div>
                  </>
                )}
                {!isAgenciesStudios && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      ScanBit Demo — Professional Portfolio
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                      This is how your professional portfolio will look for your visitors.
                    </p>
                  </div>
                </div>
                )}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                  {isAgenciesStudios ? (
                    <DemoAgencyPreview
                      hideCTAs
                      portfolioRestaurantId={restaurant?._id}
                      businessInfo={{
                        name: restaurant?.name || restaurant?.businessName || "Agency",
                        tagline: restaurant?.tagline || "",
                        address: (restaurant as any)?.location?.address || restaurant?.address || "",
                        phone: restaurant?.phone || "",
                        email: restaurant?.email || "",
                        whatsapp: (restaurant as any)?.whatsapp || restaurant?.phone || "",
                        website: (restaurant as any)?.socialMedia?.website ? String((restaurant as any).socialMedia.website).replace(/^https?:\/\//i, "") : undefined,
                        mapQuery: (restaurant as any)?.location?.address || restaurant?.address || restaurant?.name || "",
                        heroImageUrl: (restaurant as any)?.agencyHeroImageUrl || restaurant?.logo || undefined,
                        heroBackgroundUrl: (restaurant as any)?.agencyHeroBackgroundUrl || undefined,
                        mapEmbedUrl: (restaurant as any)?.portfolioMapEmbedUrl || undefined,
                        logoUrl: restaurant?.logo || undefined,
                        socialMedia: (restaurant as any)?.socialMedia ? { facebook: (restaurant as any).socialMedia.facebook, instagram: (restaurant as any).socialMedia.instagram, twitter: (restaurant as any).socialMedia.twitter, linkedin: (restaurant as any).socialMedia.linkedin } : undefined,
                      }}
                      services={Array.isArray((restaurant as any)?.agencyServices) ? (restaurant as any).agencyServices : undefined}
                      projects={(Array.isArray((restaurant as any)?.portfolioProjects) ? (restaurant as any).portfolioProjects : []).map((p: any, i: number) => ({
                        id: p.id || p._id || `p-${i}`,
                        title: p.title || "Project",
                        tag: p.role || p.tag || "Work",
                        result: p.outcome || p.result || "",
                        imageUrl: p.imageUrl,
                      }))}
                      gallery={(Array.isArray((restaurant as any)?.agencyGallery) ? (restaurant as any).agencyGallery : []).map((g: any, i: number) => ({
                        id: g.id || `g-${i}`,
                        imageUrl: typeof g === "string" ? g : (g.imageUrl || ""),
                        title: typeof g === "string" ? "" : (g.title || "Image"),
                        category: typeof g === "string" ? "" : (g.category || ""),
                      }))}
                    />
                  ) : null}
                  {!isAgenciesStudios && (
                  <DemoPortfolioPreview
                    hideCTAs
                    theme={(restaurant as any)?.portfolioTheme || "orange"}
                    resumeUrl={(restaurant as any)?.portfolioResumeUrl || undefined}
                    galleryUrls={Array.isArray((restaurant as any)?.portfolioGallery) ? (restaurant as any).portfolioGallery : []}
                    practiceAreas={Array.isArray((restaurant as any)?.portfolioPracticeAreas) ? (restaurant as any).portfolioPracticeAreas : []}
                    experience={Array.isArray((restaurant as any)?.portfolioExperience) ? (restaurant as any).portfolioExperience : []}
                    testimonials={Array.isArray((restaurant as any)?.portfolioTestimonials) ? (restaurant as any).portfolioTestimonials : []}
                    showQuickActions={(restaurant as any)?.showQuickActions !== false}
                    showSocialLinks={(restaurant as any)?.showSocialLinks !== false}
                    businessInfo={{
                      name: restaurant?.name || "Professional",
                      title: (restaurant as any)?.portfolioTitle || restaurant?.businessType || restaurant?.businessCategory || "Services",
                      tagline: restaurant?.tagline || "",
                      bio: restaurant?.profile || "",
                      profileImageUrl: restaurant?.logo || restaurant?.ownerImage || restaurant?.businessCardFront || "",
                      address: (restaurant as any)?.location?.address || restaurant?.address || "",
                      phone: restaurant?.phone || "",
                      whatsapp: restaurant?.whatsapp || restaurant?.phone || "",
                      email: restaurant?.email || "",
                      website: (restaurant as any)?.socialMedia?.website || "",
                      mapQuery: (restaurant as any)?.location?.address || restaurant?.address || restaurant?.name || "",
                      mapEmbedUrl: (restaurant as any)?.portfolioMapEmbedUrl || null,
                      businessCardFront: (restaurant as any)?.businessCardFront || (restaurant as any)?.businessCard || undefined,
                      socialMedia: (restaurant as any)?.socialMedia || {},
                    }}
                  />
                  )}
                </div>
              </div>
            ) : (
              <MenuManagement
                restaurant={restaurant}
                categories={categories || []}
                menuItems={menuItems || []}
                onCategoriesChange={(cats) => setCategories((cats || []) as Category[])}
                onItemsChange={(items) => setMenuItems((items || []) as MenuItem[])}
                formatCurrency={formatCurrency}
              />
            )
          )}

          {activeTab === "createPortfolio" && <PortfolioForm restaurant={restaurant} />}

          {activeTab === "qr" && (
            <QRCode
              restaurant={restaurant}
              logo={logo}
              menuUrl={menuUrl}
              onRefresh={fetchData}
            />
          )}

          {activeTab === "analytics" && (
            <Analytics restaurant={restaurant} analytics={analytics} />
          )}

          {activeTab === "profile" && (
            <Profile restaurant={restaurant} onUpdate={fetchData} />
          )}

          {activeTab === "businessInfo" && (
            getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType).pageTitle === 'Agency Portfolio' ? (
              <AgencyPortfolioForm restaurant={restaurant} onRefresh={fetchData} />
            ) : (
              <BusinessInformation restaurant={restaurant} onRefresh={fetchData} />
            )
          )}

          {activeTab === "settings" && (
            <Settings restaurant={restaurant} onUpdate={fetchData} />
          )}

          {activeTab === "subscription" && (
            <SubscriptionSection 
              restaurant={restaurant} 
              onUpgrade={() => {
                setPreSelectedPlan(null);
                setShowSubscriptionDialog(true);
              }}
              onRefresh={fetchData}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === "promotions" && (
            <Promotions />
          )}

          {activeTab === "payments" && (
            <div className="mt-20">
              <Payments />
            </div>
          )}

          {activeTab === "reports" && (
            <div className="mt-20">
              <Reports />
            </div>
          )}

          {activeTab === "mediaLibrary" && (
            <MediaLibrary restaurant={restaurant} menuItems={menuItems} onUpdate={fetchData} />
          )}

          {activeTab === "integrations" && (
            <div className="mt-20">
              <Integrations />
            </div>
          )}

          {activeTab === "support" && (
            <div className="mt-20">
              <Support restaurant={restaurant} businessCategory={restaurant?.businessCategory} />
            </div>
          )}

          {activeTab === "advertisements" && (
            <Advertisements restaurant={restaurant} />
          )}

          {activeTab === "notifications" && (
            <Notifications restaurant={restaurant} />
          )}

          {/* New Professional Sections */}
          {activeTab === "orders" && (
            <Orders restaurant={restaurant} formatCurrency={formatCurrency} />
          )}

          {activeTab === "customers" && (
            <Customers restaurant={restaurant} formatCurrency={formatCurrency} />
          )}

          {activeTab === "inventory" && (
            <Inventory restaurant={restaurant} formatCurrency={formatCurrency} />
          )}

          {activeTab === "reviews" && (
            <Reviews restaurant={restaurant} />
          )}

          {activeTab === "team" && (
            <Team restaurant={restaurant} />
          )}

          {activeTab === "marketing" && (
            <Marketing />
          )}

          {activeTab === "campaigns" && (
            <Campaigns restaurant={restaurant} formatCurrency={formatCurrency} />
          )}

          {activeTab === "transactions" && (
            <Transactions restaurant={restaurant} formatCurrency={formatCurrency} />
          )}

          {activeTab === "growth" && (
            <Growth />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar — Dashboard, Menu, QR Code, Profile */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pt-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          aria-label="Main navigation"
        >
          <div className="max-w-lg mx-auto flex items-center justify-around gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation transition-all active:scale-[0.97] ${
                activeTab === "dashboard"
                  ? "text-orange-600 bg-orange-50 dark:bg-orange-950/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-label="Dashboard"
              aria-current={activeTab === "dashboard" ? "page" : undefined}
            >
              <MdDashboard className={`w-6 h-6 ${activeTab === "dashboard" ? "text-orange-600" : ""}`} />
              <span className="text-[10px] font-semibold">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation transition-all active:scale-[0.97] ${
                activeTab === "menu"
                  ? "text-orange-600 bg-orange-50 dark:bg-orange-950/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-label={navItems.find(n => n.id === "menu")?.label || "Menu"}
              aria-current={activeTab === "menu" ? "page" : undefined}
            >
              {(() => {
                const menuItem = navItems.find(n => n.id === "menu");
                const MenuIcon = menuItem?.icon || MdRestaurantMenu;
                return <MenuIcon className={`w-6 h-6 ${activeTab === "menu" ? "text-orange-600" : ""}`} />;
              })()}
              <span className="text-[10px] font-semibold">{navItems.find(n => n.id === "menu")?.label || "Menu"}</span>
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation transition-all active:scale-[0.97] ${
                activeTab === "qr"
                  ? "text-orange-600 bg-orange-50 dark:bg-orange-950/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-label="QR Codes"
              aria-current={activeTab === "qr" ? "page" : undefined}
            >
              <MdQrCode className={`w-6 h-6 ${activeTab === "qr" ? "text-orange-600" : ""}`} />
              <span className="text-[10px] font-semibold">QR Code</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[64px] min-h-[56px] touch-manipulation transition-all active:scale-[0.97] ${
                activeTab === "profile"
                  ? "text-orange-600 bg-orange-50 dark:bg-orange-950/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-label="Profile"
              aria-current={activeTab === "profile" ? "page" : undefined}
            >
              <FiUser className={`w-6 h-6 ${activeTab === "profile" ? "text-orange-600" : ""}`} />
              <span className="text-[10px] font-semibold">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
    </>
  );
};

export default Dashboard;