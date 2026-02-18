import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

import AdminContentRouter from "./components/AdminContentRouter";
// Layout Components
import AdminSidebar from "./components/layout/AdminSidebar";
import AdminHeader from "./components/layout/AdminHeader";
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


export default function AdminDashboardNew() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // UI State - Read activeTab from URL or default to "dashboard"
  const [activeTab, setActiveTab] = useState(searchParams.get("activeTab") || "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync activeTab with URL query parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get("activeTab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when activeTab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ activeTab: newTab });
  };

  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalRevenue: 0,
    totalQRScans: 0,
    activeSubscriptions: 0,
    pendingApprovals: 0,
  });
  const [dashboardChartData, setDashboardChartData] = useState([]);
  const [dashboardRevenueData, setDashboardRevenueData] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Users Data
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "",
    businessCategory: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Businesses Data
  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [businessFilters, setBusinessFilters] = useState({
    search: "",
    businessCategory: "",
    businessType: "",
    verificationStatus: "",
    subscriptionStatus: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [businessesPagination, setBusinessesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Website Settings
  const [websiteSettings, setWebsiteSettings] = useState({});

  // Check authentication
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      const adminAuth = localStorage.getItem("adminAuth");
      const userRole = localStorage.getItem("userRole");
      
      // Strict admin check
      if (!token || !adminAuth || userRole !== "admin") {
        navigate("/admin/login");
        return;
      }
      // Fetch data on mount
      fetchDashboardData();
    };
    
    checkAdmin();
  }, [navigate]);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    try {
      const response = await api.getAdminStats();

      if (response.success && response.data) {
        setDashboardStats({
          totalUsers: response.data.totalUsers || 0,
          totalRestaurants: response.data.totalRestaurants || 0,
          totalRevenue: response.data.monthlyRevenue || 0,
          totalQRScans: response.data.totalQRScans || 0,
          activeSubscriptions: response.data.activeSubscriptions || 0,
          pendingApprovals: response.data.pendingBusinesses || 0,
        });
        
        // Set chart data from planDistribution (for revenue pie chart)
        if (response.data.planDistribution) {
          const chartData = Object.entries(response.data.planDistribution).map(([plan, data]: [string, any]) => ({
            name: plan,
            value: data.revenue || 0, // Revenue for pie chart
            count: data.count || 0 // Count for plan distribution section
          }));
          setDashboardChartData(chartData);
        }
        
        // Set revenue data from plansByBusinessType (for businesses by category bar chart)
        if (response.data.plansByBusinessType) {
          // Aggregate by category (sum all plans per category)
          const categoryData: { [key: string]: { revenue: number; count: number } } = {};
          Object.entries(response.data.plansByBusinessType).forEach(([category, plans]: [string, any]) => {
            categoryData[category] = { revenue: 0, count: 0 };
            Object.entries(plans).forEach(([plan, data]: [string, any]) => {
              categoryData[category].revenue += data.revenue || 0;
              categoryData[category].count += data.count || 0;
            });
          });
          
          const revenueData = Object.entries(categoryData).map(([category, data]) => ({
            name: category,
            value: data.count, // Count of businesses for bar chart
            revenue: data.revenue
          }));
          setDashboardRevenueData(revenueData);
        }
      }
    } catch (error: any) {
      if (error?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("userRole");
        api.setToken(null);
        toast.error("Session expired. Please sign in again.");
        navigate("/login");
        return;
      }
      toast.error("Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        page: usersPagination.page,
        limit: usersPagination.limit,
        search: userFilters.search,
        role: userFilters.role,
        businessCategory: userFilters.businessCategory,
        status: userFilters.status,
        sortBy: userFilters.sortBy,
        sortOrder: userFilters.sortOrder,
        includeAdmins: activeTab === 'users-roles' ? true : false,
      };

      const response = await api.getAdminUsers(params);
      setUsers(response.data);
      setUsersPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Businesses
  const fetchBusinesses = async () => {
    setBusinessesLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        search: string;
        businessCategory: string;
        businessType: string;
        verificationStatus: string;
        subscriptionStatus: string;
        sortBy: string;
        sortOrder: 'asc' | 'desc';
        isArchived?: boolean;
      } = {
        page: businessesPagination.page,
        limit: businessesPagination.limit,
        search: businessFilters.search,
        businessCategory: businessFilters.businessCategory,
        businessType: businessFilters.businessType,
        verificationStatus: businessFilters.verificationStatus,
        subscriptionStatus: businessFilters.subscriptionStatus,
        sortBy: businessFilters.sortBy,
        sortOrder: businessFilters.sortOrder as 'asc' | 'desc',
      };

      // Tab-specific filters
      if (activeTab === "businesses-archived") {
        params.isArchived = true;
      } else if (activeTab === "businesses-pending") {
        params.isArchived = false;
        params.verificationStatus = "pending";
      } else {
        params.isArchived = false;
      }

      const response = await api.getAdminRestaurants(params);
      setBusinesses(response.data);
      setBusinessesPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      toast.error("Failed to load businesses");
    } finally {
      setBusinessesLoading(false);
    }
  };

  // Data fetching based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "dashboard":
        fetchDashboardData();
        break;
      case "users":
      case "users-roles":
      case "users-activity":
        fetchUsers();
        break;
      case "restaurants":
      case "businesses-categories":
      case "businesses-pending":
      case "businesses-archived":
        fetchBusinesses();
        break;
      default:
        break;
    }
  }, [activeTab]);

  // Refetch data when filters change
  useEffect(() => {
    if (["users", "users-roles", "users-activity"].includes(activeTab)) {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [userFilters, usersPagination.page, usersPagination.limit]);

  useEffect(() => {
    if (["restaurants", "businesses-pending", "businesses-archived"].includes(activeTab)) {
      const timer = setTimeout(() => {
        fetchBusinesses();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [businessFilters, businessesPagination.page, businessesPagination.limit]);

  // Reset pagination when filters change
  useEffect(() => {
    if (["users", "users-roles", "users-activity"].includes(activeTab)) {
      setUsersPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [userFilters]);

  useEffect(() => {
    if (["restaurants", "businesses-pending", "businesses-archived"].includes(activeTab)) {
      setBusinessesPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [businessFilters]);

  // Handlers
  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case "view":
          // Implement view user logic
          toast.info("View user functionality coming soon");
          break;
        case "edit":
          // Implement edit user logic
          toast.info("Edit user functionality coming soon");
          break;
        case "activate":
        case "deactivate":
          await api.updateAdminUser(userId, { 
            isActive: action === "activate" 
          });
          toast.success(`User ${action}d successfully`);
          fetchUsers();
          break;
        case "add":
          setActiveTab("users-add");
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleBusinessAction = async (action: string, businessId: string) => {
    try {
      switch (action) {
        case "view":
          // Implement view business logic
          toast.info("View business functionality coming soon");
          break;
        case "edit":
          // Implement edit business logic
          toast.info("Edit business functionality coming soon");
          break;
        case "approve":
          await api.updateAdminRestaurant(businessId, { 
            verificationStatus: "verified",
            isVerified: true 
          });
          toast.success("Business approved successfully");
          fetchBusinesses();
          break;
        case "reject":
          await api.updateAdminRestaurant(businessId, { 
            verificationStatus: "rejected",
            isVerified: false 
          });
          toast.success("Business rejected");
          fetchBusinesses();
          break;
        case "archive":
          await api.updateAdminRestaurant(businessId, { 
            isArchived: true 
          });
          toast.success("Business archived");
          fetchBusinesses();
          break;
        case "export":
          toast.info("Export functionality coming soon");
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} business`);
    }
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case "dashboard":
        fetchDashboardData();
        break;
      case "users":
      case "users-roles":
      case "users-activity":
        fetchUsers();
        break;
      case "restaurants":
      case "businesses-categories":
      case "businesses-pending":
      case "businesses-archived":
        fetchBusinesses();
        break;
      default:
        break;
    }
  };

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("userRole");
    localStorage.removeItem("hotelAuth");
    toast.success("Logged out successfully");
    setShowLogoutConfirm(false);
    navigate("/admin/login", { replace: true });
  };

  const requestLogout = () => setShowLogoutConfirm(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchQuery={searchQuery}
        onRequestLogout={requestLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <AdminHeader
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          setSidebarOpen={setSidebarOpen}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onRequestLogout={requestLogout}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AdminContentRouter
            activeTab={activeTab}
            // Dashboard props
            dashboardStats={dashboardStats}
            dashboardChartData={dashboardChartData}
            dashboardRevenueData={dashboardRevenueData}
            dashboardLoading={dashboardLoading}
            // Users props
            users={users}
            usersLoading={usersLoading}
            userFilters={userFilters}
            usersPagination={usersPagination}
            onUserFiltersChange={setUserFilters}
            onUsersPaginationChange={setUsersPagination}
            onUserAction={handleUserAction}
            onUsersRefresh={fetchUsers}
            // Businesses props
            businesses={businesses}
            businessesLoading={businessesLoading}
            businessFilters={businessFilters}
            businessesPagination={businessesPagination}
            onBusinessFiltersChange={setBusinessFilters}
            onBusinessesPaginationChange={setBusinessesPagination}
            onBusinessAction={handleBusinessAction}
            onBusinessesRefresh={fetchBusinesses}
            // Website props
            websiteSettings={websiteSettings}
            onWebsiteSettingsChange={setWebsiteSettings}
            // Generic handlers
            onRefresh={handleRefresh}
            onExport={handleExport}
          />
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access the admin dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}