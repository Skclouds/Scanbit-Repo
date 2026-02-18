import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FiMenu, 
  FiSearch, 
  FiBell, 
  FiSettings, 
  FiUser, 
  FiLogOut,
  FiRefreshCw,
  FiDownload
} from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface HotelHeaderProps {
  activeTab: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  businessName?: string;
  userName?: string;
  userEmail?: string;
  onRefresh?: () => void;
  onExport?: () => void;
}

export default function HotelHeader({ 
  activeTab, 
  searchQuery, 
  onSearchChange, 
  setSidebarOpen,
  businessName,
  userName,
  userEmail,
  onRefresh,
  onExport
}: HotelHeaderProps) {
  const { settings } = useSiteSettings();

  const getTabTitle = () => {
    const tabTitles: { [key: string]: string } = {
      dashboard: "Dashboard",
      menu: "Menu Management",
      qr: "QR Codes",
      analytics: "Analytics",
      promotions: "Promotions",
      payments: "Payments",
      reports: "Reports",
      mediaLibrary: "Media Library",
      integrations: "Integrations",
      support: "Support",
      subscription: "Subscription",
      profile: "Profile",
      settings: "Settings"
    };
    return tabTitles[activeTab] || activeTab.replace(/-/g, " ");
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 backdrop-blur-sm border-b border-orange-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
        {/* Left Section: Mobile Menu + Logo + Title */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex-shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle menu"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {/* Logo - Hidden on mobile and desktop, shown only on tablet */}
          <Link
            to="/"
            className="hidden sm:flex lg:hidden items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <img
              src={settings?.branding?.logoUrl || "/logo.png"}
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          </Link>

          {/* Page Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {getTabTitle()}
              </h1>
              {businessName && (
                <p className="text-sm text-gray-600 truncate">
                  {businessName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Search + Actions + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Search - Hidden on mobile */}
          <div className="hidden md:block relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-orange-200 focus:border-orange-300"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="hidden sm:flex"
              >
                <FiRefreshCw className="w-4 h-4" />
              </Button>
            )}
            
            {onExport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="hidden sm:flex"
              >
                <FiDownload className="w-4 h-4" />
              </Button>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <FiBell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName || 'User'}`} />
                  <AvatarFallback className="bg-orange-100 text-orange-900">
                    {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FiUser className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FiSettings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <FiLogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search - Shown below header on mobile */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-orange-200 focus:border-orange-300"
          />
        </div>
      </div>
    </header>
  );
}