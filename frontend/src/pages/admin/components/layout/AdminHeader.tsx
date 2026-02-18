import { Menu, Search, Bell, Settings, User, LayoutDashboard, LogOut, ChevronRight, RefreshCw, HelpCircle, MoreVertical, Activity, TrendingUp, Plus, FileText, UserPlus, Building2, BarChart3, CheckCircle2, Clock, Zap, CreditCard, Mail, Download, Upload, Shield, Database, AlertTriangle, Target, Calendar, Package, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";


// Categorized navigation items for breadcrumb lookup
const navCategories = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { icon: null, label: "Dashboard", id: "dashboard" },
    ],
  },
  {
    id: "businesses",
    label: "Businesses",
    items: [
      { icon: null, label: "All Businesses", id: "restaurants" },
      { icon: null, label: "Categories", id: "businesses-categories" },
      { icon: null, label: "Pending Approval", id: "businesses-pending" },
      { icon: null, label: "Archived", id: "businesses-archived" },
    ],
  },
  {
    id: "users",
    label: "User Management",
    items: [
      { icon: null, label: "All Users", id: "users" },
      { icon: null, label: "Add User", id: "users-add" },
      { icon: null, label: "Roles & Permissions", id: "users-roles" },
      { icon: null, label: "User Activity", id: "users-activity" },
    ],
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    items: [
      { icon: null, label: "All Subscriptions", id: "subscriptions" },
      { icon: null, label: "Active Plans", id: "subscriptions-active" },
      { icon: null, label: "Expired Plans", id: "subscriptions-expired" },
      { icon: null, label: "Payment History", id: "subscriptions-payments" },
      { icon: null, label: "Renewals", id: "subscriptions-renewals" },
    ],
  },
  // Add other categories as needed...
];

interface AdminHeaderProps {
  activeTab: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onRequestLogout?: () => void;
}

export default function AdminHeader({ 
  activeTab, 
  searchQuery, 
  onSearchChange, 
  setSidebarOpen,
  onRefresh,
  onExport,
  onRequestLogout
}: AdminHeaderProps) {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [userLogo, setUserLogo] = useState<string>("/logo.svg");
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch admin user data and their logo
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const adminAuth = localStorage.getItem("adminAuth");
        const userId = localStorage.getItem("userId");
        
        if (adminAuth) {
          const admin = JSON.parse(adminAuth);
          setAdminUser(admin);
          
          // Fetch user's logo using API
          try {
            // First, get current user to check if they have a restaurant
            const userResponse = await api.getCurrentUser();
            if (userResponse.success) {
              const user = userResponse.user || userResponse.data;
              
              // If user has a restaurant ID, fetch restaurant logo
              if (user?.restaurant) {
                try {
                  const restaurantId = typeof user.restaurant === 'string' ? user.restaurant : user.restaurant._id || user.restaurant.id;
                  if (restaurantId) {
                    const restaurantResponse = await api.getAdminRestaurant(restaurantId);
                    if (restaurantResponse.success && restaurantResponse.data?.logo) {
                      setUserLogo(restaurantResponse.data.logo);
                      return;
                    }
                  }
                } catch (error) {
                  // Continue to next fallback
                }
              }
              
              // Try user profile image
              if (user?.profileImage) {
                setUserLogo(user.profileImage);
                return;
              }
            }
            
            // Try getMyRestaurant as fallback
            try {
              const restaurantResponse = await api.getMyRestaurant();
              if (restaurantResponse.success && restaurantResponse.data?.logo) {
                setUserLogo(restaurantResponse.data.logo);
                return;
              }
            } catch (error) {
              // Continue to next fallback
            }
            
            // Fallback to site logo
            if (settings?.logo) {
              setUserLogo(settings.logo);
            } else {
              // Last resort: use default logo path
              setUserLogo("/logo.svg");
            }
          } catch (error) {
            // Silently handle logo fetch error, use default
            setUserLogo("/logo.svg");
          }
        }
      } catch (error) {
        // Silently handle admin data fetch error
      }
    };

    fetchAdminData();
  }, [settings]);

  const getCurrentTabLabel = () => {
    for (const category of navCategories) {
      const item = category.items.find((i) => i.id === activeTab);
      if (item) return item.label;
    }
    return activeTab.replace(/-/g, " ");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        onRefresh();
      }
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    if (onRequestLogout) {
      onRequestLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("userRole");
      toast.success("Logged out successfully");
      navigate("/admin/login");
    }
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-slate-50 via-slate-50 to-slate-50 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
        {/* Left Section: Mobile Menu + Logo + Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <nav className="flex items-center gap-1.5 text-sm text-slate-600 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('activeTab', 'dashboard');
                  window.history.pushState({}, '', url.toString());
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-slate-900 transition-colors flex-shrink-0 flex items-center gap-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              {activeTab !== 'dashboard' && (
                <>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('activeTab', activeTab);
                      window.history.pushState({}, '', url.toString());
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="text-slate-900 font-medium truncate capitalize hover:underline"
                  >
                    {getCurrentTabLabel()}
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Right Section: Status + Actions + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* System Status */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSystemStatusColor()}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="capitalize">{systemStatus}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>System Status: All systems operational</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users, businesses..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 w-64 bg-white border-slate-200 focus:border-slate-300 focus:ring-slate-200 text-sm"
            />
          </div>

          {/* Action Buttons */}
          <TooltipProvider>
            <div className="flex items-center gap-1">
              {/* Quick Links Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex gap-1 bg-gradient-to-r from-orange-50 to-orange-50 border-orange-200 hover:bg-orange-100"
                  >
                    <Plus className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-semibold text-orange-600">Quick Links</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="flex items-center gap-2 font-semibold text-orange-600">
                    <Zap className="w-4 h-4" />
                    Quick Actions
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Important Quick Actions Only */}
                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('activeTab', 'users-add');
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}>
                    <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Add New User</p>
                      <p className="text-xs text-slate-500">Create user account</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('activeTab', 'businesses-pending');
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pending Approvals</p>
                      <p className="text-xs text-slate-500">Verify businesses</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('activeTab', 'restaurants');
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}>
                    <Building2 className="mr-2 h-4 w-4 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">All Businesses</p>
                      <p className="text-xs text-slate-500">Manage businesses</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('activeTab', 'dashboard');
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}>
                    <BarChart3 className="mr-2 h-4 w-4 text-cyan-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dashboard</p>
                      <p className="text-xs text-slate-500">View analytics</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('activeTab', 'subscriptions');
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}>
                    <CreditCard className="mr-2 h-4 w-4 text-pink-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Subscriptions</p>
                      <p className="text-xs text-slate-500">Manage plans</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('activeTab', 'website-general');
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}>
                    <Settings className="mr-2 h-4 w-4 text-slate-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Settings</p>
                      <p className="text-xs text-slate-500">Configure system</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="hidden sm:flex"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data (Ctrl+R)</TooltipContent>
              </Tooltip>

              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {notificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 px-1 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-xs">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" forceMount>
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Badge variant="secondary" className="text-xs">{notificationCount} new</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {notificationCount > 0 ? (
                    <>
                      <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer" onClick={() => navigate('/admin/dashboard?activeTab=businesses-pending')}>
                        <div className="flex items-start gap-2 w-full">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Pending Approvals</p>
                            <p className="text-xs text-slate-600">5 businesses awaiting review</p>
                            <p className="text-xs text-slate-500 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer" onClick={() => navigate('/admin/dashboard?activeTab=analytics-revenue')}>
                        <div className="flex items-start gap-2 w-full">
                          <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Revenue Milestone</p>
                            <p className="text-xs text-slate-600">₹50,000 monthly target reached</p>
                            <p className="text-xs text-slate-500 mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem disabled className="text-center py-8">
                      <p className="text-sm text-slate-500">No notifications</p>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-slate-600 text-xs justify-center cursor-pointer" onClick={() => navigate('/admin/dashboard?activeTab=notifications')}>
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help & Support */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Help & Support</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TooltipProvider>

          {/* Admin Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-slate-100 transition-colors">
                <Avatar className="h-9 w-9 border-2 border-slate-200">
                  <AvatarImage src={userLogo} alt="User Logo" />
                  <AvatarFallback className="bg-white text-slate-600 border border-slate-200">
                    {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end" forceMount>
              {/* Admin Info */}
              <DropdownMenuLabel className="font-normal py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-slate-200">
                    <AvatarImage src={userLogo} alt="User Logo" />
                    <AvatarFallback className="bg-white text-slate-600 border border-slate-200">
                      {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{adminUser?.name || 'Super Admin'}</p>
                    <p className="text-xs text-slate-600 truncate">{adminUser?.email || 'admin@scanbit.com'}</p>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Active</Badge>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Quick Stats */}
              <div className="px-2 py-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600">Last Login</p>
                    <p className="text-xs font-semibold text-slate-900">Today, 2:45 PM</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600">Session</p>
                    <p className="text-xs font-semibold text-slate-900">2h 30m</p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem className="cursor-pointer" onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('activeTab', 'profile');
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}>
                <User className="mr-2 h-4 w-4 text-blue-600" />
                <span>My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer" onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('activeTab', 'users-activity');
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}>
                <Activity className="mr-2 h-4 w-4 text-purple-600" />
                <span>Activity Log</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer" onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('activeTab', 'website-general');
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}>
                <Settings className="mr-2 h-4 w-4 text-slate-600" />
                <span>Admin Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer" onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('activeTab', 'profile');
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}>
                <Shield className="mr-2 h-4 w-4 text-red-600" />
                <span>Security Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer" onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('activeTab', 'support-help');
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}>
                <HelpCircle className="mr-2 h-4 w-4 text-orange-600" />
                <span>Help & Support</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* System Info */}
              <div className="px-2 py-2">
                <p className="text-xs text-slate-600 font-semibold mb-2">System Info</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-semibold">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Status</span>
                    <span className="font-semibold text-green-600">Connected</span>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search - Shown below header on mobile */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:border-slate-300 text-sm"
          />
        </div>
      </div>

      {/* Optional: Status Bar (can be shown/hidden) */}
      <div className="hidden md:flex items-center justify-between px-4 sm:px-6 py-2 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Real-time Updates: ON</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Last Updated: Just now</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Server Response: <span className="font-semibold text-green-600">45ms</span></span>
        </div>
      </div>
    </header>
  );
}