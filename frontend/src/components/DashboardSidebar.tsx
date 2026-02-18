import { FiHome, FiMenu, FiTrendingUp, FiUser, FiSettings, FiLogOut, FiShoppingCart, FiHelpCircle, FiMessageSquare, FiBarChart2, FiBell, FiDollarSign, FiDownload, FiUpload, FiCheck, FiImage, FiBook, FiMapPin, FiUsers, FiAward, FiCompass, FiWifiOff, FiStar, FiEdit, FiCopy, FiPackage, FiShoppingBag, FiCreditCard, FiMail, FiShare2, FiTarget, FiLayers, FiBox, FiTag, FiFileText, FiCalendar, FiActivity, FiX } from "react-icons/fi";
import { MdQrCode, MdRestaurantMenu, MdShoppingBag, MdBrush, MdDashboard, MdPayment, MdInventory, MdLocalOffer, MdEvent, MdGroup, MdDescription, MdNotifications, MdIntegrationInstructions, MdReceipt, MdAnalytics, MdPalette, MdReviews, MdPeople, MdWork, MdCampaign, MdStore, MdAssessment, MdDevices, MdTrendingUp, MdBusiness, MdImage } from "react-icons/md";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMemo, useEffect } from "react";
import { env } from "@/lib/api";


interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

interface SidebarProps {
  businessCategory?: string;
  businessType?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  sidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

export const DashboardSidebar = ({
  businessCategory,
  businessType,
  activeTab,
  onTabChange,
  onLogout,
  sidebarOpen = true,
  onCloseSidebar,
}: SidebarProps) => {
  const { settings } = useSiteSettings();
  
  // Comprehensive sidebar — Food Mall gets a dedicated professional layout for all food businesses
  const { navItems, groupedItems } = useMemo(() => {
    const category = (businessCategory || businessType || '').toLowerCase();
    const isFoodMall = category.includes('food') || category.includes('mall') || category.includes('restaurant') || category.includes('cafe') || category.includes('café') || category.includes('takeaway') || category.includes('cloud kitchen') || category.includes('food court') || category.includes('bakery') || category.includes('dining');
    const isAgency = (businessCategory || '').toLowerCase() === 'agencies & studios' || category.includes('agency') || category.includes('marketing') || category.includes('advert') || category.includes('studios');
    const isCreative = category.includes('creative') || category.includes('design');
    const isRetail = category.includes('retail') || category.includes('e-commerce') || category.includes('store') || category.includes('shop') || category.includes('boutique');
    const isWellness = category.includes('health') || category.includes('wellness') || category.includes('medical') || category.includes('clinic') || category.includes('spa') || category.includes('yoga');
    const isProfessional = category.includes('professional') || category.includes('service') || category.includes('consult') || category.includes('legal') || category.includes('account');
    const isPortfolio = category.includes('portfolio');

    // Food Mall — streamlined sidebar (no Orders, Reports, Integrations)
    if (isFoodMall) {
      const items = [
        { icon: MdDashboard, label: "Dashboard", id: "dashboard", description: "Overview & insights" },
        { icon: MdRestaurantMenu, label: "Menu", id: "menu", description: "Dishes, categories & pricing" },
        { icon: MdQrCode, label: "QR Codes", id: "qr", description: "Generate & customize QR codes" },
        { icon: FiTrendingUp, label: "Analytics", id: "analytics", description: "Scans, views & trends" },
        { icon: MdReviews, label: "Reviews", id: "reviews", description: "Customer feedback" },
        { icon: MdImage, label: "Media Library", id: "mediaLibrary", description: "Menu photos & logos" },
        { icon: MdLocalOffer, label: "Promotions", id: "promotions", description: "Offers & combos" },
        { icon: MdCampaign, label: "Marketing", id: "marketing", description: "Growth & engagement" },
        { icon: MdTrendingUp, label: "Growth", id: "growth", description: "Business expansion" },
        { icon: MdPayment, label: "Payments", id: "payments", description: "Payment history" },
        { icon: MdReceipt, label: "Transactions", id: "transactions", description: "Transaction history" },
        { icon: MdPayment, label: "Subscription", id: "subscription", description: "Billing & plan" },
        { icon: MdBusiness, label: "Business Info", id: "businessInfo", description: "Contact, hours, map" },
        { icon: FiUser, label: "Profile", id: "profile", description: "Business profile" },
        { icon: FiSettings, label: "Settings", id: "settings", description: "Configuration" },
        { icon: FiHelpCircle, label: "Support", id: "support", description: "Help & assistance" },
      ];
      const grouped = {
        core: items.filter(i => ['dashboard', 'menu', 'qr', 'analytics'].includes(i.id)),
        operations: items.filter(i => ['reviews', 'mediaLibrary'].includes(i.id)),
        marketing: items.filter(i => ['promotions', 'marketing', 'growth'].includes(i.id)),
        financial: items.filter(i => ['payments', 'transactions', 'subscription'].includes(i.id)),
        settings: items.filter(i => ['businessInfo', 'profile', 'settings', 'support'].includes(i.id)),
      };
      return { navItems: items, groupedItems: grouped };
    }

    // Other business types
    let menuLabel = "Business Catalog";
    let menuIcon = MdInventory;
    let menuDesc = "Manage your offerings";

    if (isAgency) {
      menuLabel = "Portfolio";
      menuIcon = MdBrush;
      menuDesc = "Projects, gallery & services";
    } else if (isRetail) {
      menuLabel = "Product Catalog";
      menuIcon = MdShoppingBag;
      menuDesc = "Manage inventory";
    } else if (isCreative) {
      menuLabel = "Catalog";
      menuIcon = MdBrush;
      menuDesc = "Service categories & services";
    } else if (isWellness) {
      menuLabel = "Wellness Menu";
      menuIcon = MdDevices;
      menuDesc = "Manage treatments";
    } else if (isProfessional) {
      menuLabel = "Service List";
      menuIcon = MdWork;
      menuDesc = "Manage offerings";
    }

    // Creative & Design: show "Creative Portfolio" (catalog); Professional/Portfolio: show "Create your portfolio"
    const isPortfolioType = isProfessional || isPortfolio;
    const isCreativeOnly = isCreative && !isPortfolio && !isProfessional;
    const createPortfolioItem = isPortfolioType
      ? [{ icon: MdPalette, label: "Create your portfolio", id: "createPortfolio", description: "Build your professional portfolio" }]
      : [];
    const menuItem = isPortfolioType && !isCreativeOnly ? [] : [{ icon: menuIcon, label: menuLabel, id: "menu", description: menuDesc }];
    const items = [
      { icon: MdDashboard, label: "Dashboard", id: "dashboard", description: "View overview and insights" },
      ...menuItem,
      ...createPortfolioItem,
      { icon: MdQrCode, label: "QR Codes", id: "qr", description: "Generate and customize QR codes" },
      { icon: FiTrendingUp, label: "Analytics", id: "analytics", description: "Sales and insights" },
      { icon: MdReviews, label: "Reviews", id: "reviews", description: "Customer feedback" },
      { icon: MdTrendingUp, label: "Growth", id: "growth", description: "Business expansion" },
      { icon: MdLocalOffer, label: isAgency ? "Campaigns" : "Promotions", id: "promotions", description: isAgency ? "Manage client campaigns" : "Offers and discounts" },
      { icon: MdCampaign, label: "Marketing", id: "marketing", description: "Growth and engagement" },
      { icon: MdReceipt, label: "Transactions", id: "transactions", description: "History" },
      { icon: MdPayment, label: "Subscription", id: "subscription", description: "Billing and plan" },
      { icon: MdBusiness, label: isAgency ? "Portfolio Setup" : "Business Information", id: "businessInfo", description: isAgency ? "Studio info, projects & gallery" : "Profile, contact, hours, map" },
      { icon: FiUser, label: "Profile", id: "profile", description: "Business info" },
      { icon: FiSettings, label: "Settings", id: "settings", description: "Configuration" },
      { icon: FiHelpCircle, label: "Support", id: "support", description: "Help desk" },
    ];
    const grouped = {
      core: items.filter(i => ['dashboard', 'menu', 'createPortfolio', 'qr', 'analytics'].includes(i.id)),
      operations: items.filter(i => ['reviews'].includes(i.id)),
      marketing: items.filter(i => ['growth', 'promotions', 'marketing'].includes(i.id)),
      financial: items.filter(i => ['transactions', 'subscription'].includes(i.id)),
      settings: items.filter(i => ['businessInfo', 'profile', 'settings', 'support'].includes(i.id)),
    };
    return { navItems: items, groupedItems: grouped };
  }, [businessCategory, businessType]);

  const handleTabChange = (id: string) => {
    onTabChange(id);
    if (window.innerWidth < 1024 && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 lg:w-72",
          "bg-white border-r border-slate-200 flex flex-col",
          "transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header - Brand Identity */}
        <div className="px-6 py-8 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings?.branding?.logoUrl ? (
                <img 
                  src={settings.branding.logoUrl} 
                  alt={settings.general?.siteName || env.APP_NAME}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
                    <MdDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-900 leading-tight">{env.APP_NAME}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Business Suite</p>
                  </div>
                </div>
              )}
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onCloseSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          {(businessCategory || businessType) && (
            <div className="mt-6">
              <div className="px-3 py-2 rounded-lg bg-orange-50 border border-orange-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider truncate">
                  {businessCategory || businessType}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation - Industry Level List */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-8 pb-8">
            {/* Core Section */}
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Core</p>
              {groupedItems.core.map((item) => (
                <NavItemComponent 
                  key={item.id} 
                  item={item} 
                  isActive={activeTab === item.id} 
                  onClick={() => handleTabChange(item.id)} 
                />
              ))}
            </nav>

            {/* Operations Section */}
            {groupedItems.operations.length > 0 && (
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Operations</p>
              {groupedItems.operations.map((item) => (
                <NavItemComponent 
                  key={item.id} 
                  item={item} 
                  isActive={activeTab === item.id} 
                  onClick={() => handleTabChange(item.id)} 
                />
              ))}
            </nav>
            )}

            {/* Marketing Section */}
            {groupedItems.marketing.length > 0 && (
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Marketing & Growth</p>
              {groupedItems.marketing.map((item) => (
                <NavItemComponent 
                  key={item.id} 
                  item={item} 
                  isActive={activeTab === item.id} 
                  onClick={() => handleTabChange(item.id)} 
                />
              ))}
            </nav>
            )}

            {/* Financial Section */}
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Financial</p>
              {groupedItems.financial.map((item) => (
                <NavItemComponent 
                  key={item.id} 
                  item={item} 
                  isActive={activeTab === item.id} 
                  onClick={() => handleTabChange(item.id)} 
                />
              ))}
            </nav>
          </div>
        </ScrollArea>

        {/* Settings Section */}
        <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
          <div className="space-y-1">
            {groupedItems.settings.map((item) => (
              <NavItemComponent 
                key={item.id} 
                item={item} 
                isActive={activeTab === item.id} 
                onClick={() => handleTabChange(item.id)}
                isSmall
              />
            ))}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95 mt-2"
            >
              <FiLogOut className="w-5 h-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/50 text-center">
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              v{env.APP_VERSION || "1.0.0"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

const NavItemComponent = ({ 
  item, 
  isActive, 
  onClick,
  isSmall = false
}: { 
  item: NavItem; 
  isActive: boolean; 
  onClick: () => void;
  isSmall?: boolean;
}) => {
  const Icon = item.icon;
  if (!Icon) return null;
  
  return (
    <button
      onClick={onClick}
      disabled={item.disabled}
      className={cn(
        "w-full flex items-center gap-3 px-3 rounded-xl transition-all duration-200 group relative",
        isSmall ? "py-2" : "py-3",
        isActive
          ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
          : "text-slate-600 hover:bg-orange-50 hover:text-orange-700"
      )}
    >
      {typeof Icon === 'function' || typeof Icon === 'object' ? (
        <Icon className={cn(
          "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
          isActive ? "text-white" : "text-slate-400 group-hover:text-orange-600"
        )} />
      ) : (
        <div className="w-5 h-5 flex-shrink-0 bg-slate-200 rounded-sm" />
      )}
      <div className="flex-1 text-left">
        <p className={cn(
          "text-sm font-bold leading-none",
          isActive ? "text-white" : "text-slate-700"
        )}>{item.label}</p>
        {!isSmall && (
          <p className={cn(
            "text-[10px] mt-1 leading-tight line-clamp-1",
            isActive ? "text-orange-100" : "text-slate-400"
          )}>{item.description}</p>
        )}
      </div>
      {item.badge && (
        <span className={cn(
          "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
          isActive ? "bg-white/20 text-white" : "bg-orange-600 text-white shadow-sm"
        )}>
          {item.badge}
        </span>
      )}
      {isActive && (
        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      )}
    </button>
  );
};

export default DashboardSidebar;
