import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  Search,
  Zap,
  Bell,
  HelpCircle,
  User,
  Settings,
  LogOut,
  ChevronRight,
  QrCode,
  UserPlus,
  Package,
  CreditCard,
  BarChart3,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { navCategories } from "../../utils/constants";
import { env } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AdminTopNavProps {
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentAdmin: any;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  onRefresh: () => void;
  onBusinessSelect?: (business: any) => void;
  onUserSelect?: (user: any) => void;
  performGlobalSearch?: (query: string) => void;
  globalSearchResults?: { businesses: any[]; users: any[] };
}

export const AdminTopNav = ({
  setSidebarOpen,
  activeTab,
  setActiveTab,
  currentAdmin,
  notifications,
  setNotifications,
  onRefresh,
  onBusinessSelect,
  onUserSelect,
  performGlobalSearch,
  globalSearchResults = { businesses: [], users: [] },
}: AdminTopNavProps) => {
  const navigate = useNavigate();
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const clickOutsideRef = useRef<HTMLDivElement>(null);

  // Handle click outside for search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowGlobalSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setGlobalSearchQuery(query);
    if (query.trim() && performGlobalSearch) {
      performGlobalSearch(query);
      setShowGlobalSearch(true);
    } else {
      setShowGlobalSearch(false);
    }
  };

  const getCurrentTabLabel = () => {
    for (const category of navCategories) {
      const item = category.items.find((i) => i.id === activeTab);
      if (item) return item.label;
    }
    return activeTab.replace(/-/g, " ");
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
        {/* Left Section: Mobile Menu + Logo + Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex-shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            {currentAdmin?.profileImage || currentAdmin?.restaurant?.logo ? (
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage
                  src={currentAdmin.profileImage || currentAdmin.restaurant?.logo}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold rounded-lg">
                  <QrCode className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <QrCode className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <span className="font-display text-lg font-bold text-foreground hidden md:block">
              {env.APP_NAME}
            </span>
          </Link>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
              <Link
                to="/admin/dashboard"
                className="hover:text-foreground transition-colors flex-shrink-0"
              >
                Admin
              </Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <span className="text-foreground font-medium truncate capitalize">
                {getCurrentTabLabel()}
              </span>
            </nav>
          </div>
        </div>

        {/* Right Section: Search + Actions + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Global Search - Desktop */}
          <div className="hidden md:block relative global-search-container" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses, users..."
              value={globalSearchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                if (globalSearchQuery.trim()) {
                  setShowGlobalSearch(true);
                }
              }}
              className="pl-10 w-48 lg:w-64 h-9 text-sm"
            />
            {showGlobalSearch && globalSearchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  {globalSearchResults.businesses.length === 0 &&
                  globalSearchResults.users.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No results found
                    </div>
                  ) : (
                    <>
                      {globalSearchResults.businesses.length > 0 && (
                        <div className="mb-2">
                          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                            Businesses
                          </p>
                          {globalSearchResults.businesses.slice(0, 5).map((business: any) => (
                            <button
                              key={business._id || business.id}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                              onClick={() => {
                                if (onBusinessSelect) onBusinessSelect(business);
                                setShowGlobalSearch(false);
                                setGlobalSearchQuery("");
                              }}
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={business.logo || business.ownerImage || undefined}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xs">
                                  {(business.name || "B").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{business.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {business.email}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {globalSearchResults.users.length > 0 && (
                        <div>
                          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                            Users
                          </p>
                          {globalSearchResults.users.slice(0, 5).map((user: any) => (
                            <button
                              key={user._id || user.id}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                              onClick={() => {
                                if (onUserSelect) onUserSelect(user);
                                setShowGlobalSearch(false);
                                setGlobalSearchQuery("");
                              }}
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={
                                    user.profileImage ||
                                    user.restaurant?.ownerImage ||
                                    user.restaurant?.logo ||
                                    undefined
                                  }
                                />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xs">
                                  {(user.name || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setShowMobileSearch(true)}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center gap-2 h-9 px-3"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden lg:inline">Quick Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("users-add")}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add New User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("businesses-pending")}>
                <Package className="w-4 h-4 mr-2" />
                Review Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("subscriptions")}>
                <CreditCard className="w-4 h-4 mr-2" />
                View Subscriptions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("analytics")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-background" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, read: true }))
                      );
                      toast.success("All notifications marked as read");
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                      onClick={() => {
                        if (notification.action) {
                          setActiveTab(notification.action);
                        }
                        setNotifications((prev) =>
                          prev.map((n) =>
                            n.id === notification.id ? { ...n, read: true } : n
                          )
                        );
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex items-start justify-between w-full gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              !notification.read
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="justify-center text-sm"
                    onClick={() => {
                      setActiveTab("notifications");
                      setShowNotifications(false);
                    }}
                  >
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center gap-2 h-9 px-3"
            onClick={() => setActiveTab("support-help")}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden xl:inline">Help</span>
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-secondary transition-colors">
                <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
                  <AvatarImage
                    src={
                      currentAdmin?.profileImage ||
                      currentAdmin?.restaurant?.ownerImage ||
                      currentAdmin?.restaurant?.logo ||
                      undefined
                    }
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm">
                    {(currentAdmin?.name || currentAdmin?.email || "A")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {currentAdmin?.name || "Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {currentAdmin?.email || "admin@example.com"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {currentAdmin?.name || "Admin User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {currentAdmin?.email || "admin@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("admin-profile")}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("support-help")}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    localStorage.removeItem("token");
                    localStorage.removeItem("adminAuth");
                    localStorage.removeItem("hotelAuth");
                    toast.success("Logged out successfully");
                    navigate("/admin/login", { replace: true });
                  } catch (error) {

                    toast.error("Failed to logout");
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
