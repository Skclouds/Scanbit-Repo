import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MdDashboard, 
  MdRestaurantMenu, 
  MdQrCode, 
  MdLocalOffer, 
  MdPayment, 
  MdDescription, 
  MdImage, 
  MdIntegrationInstructions, 
  MdHelpOutline,
  MdShoppingBag,
  MdBrush,
  MdWork,
  MdPalette
} from "react-icons/md";
import { FiTrendingUp, FiSettings, FiLogOut, FiUser, FiX } from "react-icons/fi";
import { useSiteSettings } from "@/context/SiteSettingsContext";

// Dynamic navigation items based on business type
const getNavItems = (businessCategory?: string) => {
  const baseItems = [
    { icon: MdDashboard, label: "Dashboard", id: "dashboard" },
    { icon: MdQrCode, label: "QR Codes", id: "qr" },
    { icon: FiTrendingUp, label: "Analytics", id: "analytics" },
    { icon: MdPayment, label: "Subscription", id: "subscription" },
    { icon: FiUser, label: "Profile", id: "profile" },
    { icon: FiSettings, label: "Settings", id: "settings" },
  ];

  // Add business-type-specific items
  if (businessCategory === "Food Mall") {
    return [
      { icon: MdDashboard, label: "Dashboard", id: "dashboard" },
      { icon: MdRestaurantMenu, label: "Menu", id: "menu" },
      { icon: MdQrCode, label: "QR Codes", id: "qr" },
      { icon: FiTrendingUp, label: "Analytics", id: "analytics" },
      { icon: MdLocalOffer, label: "Promotions", id: "promotions" },
      { icon: MdPayment, label: "Payments", id: "payments" },
      { icon: MdDescription, label: "Reports", id: "reports" },
      { icon: MdImage, label: "Media", id: "mediaLibrary" },
      { icon: MdIntegrationInstructions, label: "Integrations", id: "integrations" },
      { icon: MdHelpOutline, label: "Support", id: "support" },
      { icon: MdPayment, label: "Subscription", id: "subscription" },
      { icon: FiUser, label: "Profile", id: "profile" },
      { icon: FiSettings, label: "Settings", id: "settings" },
    ];
  } else if (businessCategory === "Retail / E-Commerce Businesses") {
    return [
      { icon: MdDashboard, label: "Dashboard", id: "dashboard" },
      { icon: MdShoppingBag, label: "Products", id: "menu" },
      { icon: MdQrCode, label: "QR Codes", id: "qr" },
      { icon: FiTrendingUp, label: "Analytics", id: "analytics" },
      { icon: MdLocalOffer, label: "Promotions", id: "promotions" },
      { icon: MdPayment, label: "Payments", id: "payments" },
      { icon: MdDescription, label: "Reports", id: "reports" },
      { icon: MdImage, label: "Media", id: "mediaLibrary" },
      { icon: MdIntegrationInstructions, label: "Integrations", id: "integrations" },
      { icon: MdHelpOutline, label: "Support", id: "support" },
      { icon: MdPayment, label: "Subscription", id: "subscription" },
      { icon: FiUser, label: "Profile", id: "profile" },
      { icon: FiSettings, label: "Settings", id: "settings" },
    ];
  } else if (businessCategory === "Creative & Design") {
    return [
      { icon: MdDashboard, label: "Dashboard", id: "dashboard" },
      { icon: MdBrush, label: "Portfolio", id: "menu" },
      { icon: MdQrCode, label: "QR Codes", id: "qr" },
      { icon: FiTrendingUp, label: "Analytics", id: "analytics" },
      { icon: MdWork, label: "Projects", id: "promotions" },
      { icon: MdPayment, label: "Payments", id: "payments" },
      { icon: MdDescription, label: "Reports", id: "reports" },
      { icon: MdImage, label: "Media", id: "mediaLibrary" },
      { icon: MdIntegrationInstructions, label: "Integrations", id: "integrations" },
      { icon: MdHelpOutline, label: "Support", id: "support" },
      { icon: MdPayment, label: "Subscription", id: "subscription" },
      { icon: FiUser, label: "Profile", id: "profile" },
      { icon: FiSettings, label: "Settings", id: "settings" },
    ];
  }

  return baseItems;
};

interface HotelSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  businessCategory?: string;
  businessName?: string;
}

export default function HotelSidebar({ 
  activeTab, 
  onTabChange, 
  sidebarOpen, 
  setSidebarOpen,
  businessCategory,
  businessName
}: HotelSidebarProps) {
  const { settings } = useSiteSettings();
  const navItems = getNavItems(businessCategory);

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src={settings?.branding?.logoUrl || "/logo.png"}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {businessName || settings?.branding?.siteName || "ScanBit"}
                </h1>
                <p className="text-xs text-gray-500">Business Dashboard</p>
              </div>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-6 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === item.id
                      ? "bg-orange-100 text-orange-900 font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <Link
              to="/login"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}