import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

export const useAdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState<{
    businesses: any[];
    users: any[];
  }>({ businesses: [], users: [] });
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    monthlyRevenue: 0,
    totalQRScans: 0,
    newThisMonth: 0,
    dateRange: "30",
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Current admin
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    profileImage: "",
    timezone: "UTC",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    theme: "light",
  });
  
  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Analytics state
  const [analyticsFilters, setAnalyticsFilters] = useState({
    dateRange: "30",
    businessCategory: "all",
    startDate: "",
    endDate: "",
  });
  const [overviewAnalytics, setOverviewAnalytics] = useState<any>(null);
  const [businessAnalytics, setBusinessAnalytics] = useState<any>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<any>(null);
  const [qrScanAnalytics, setQrScanAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Support state
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportTicketsLoading, setSupportTicketsLoading] = useState(false);
  const [supportTicketsPagination, setSupportTicketsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [ticketFilters, setTicketFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    assignedTo: "all",
    search: "",
  });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketStats, setTicketStats] = useState<any>(null);
  
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<any>(null);
  const [showFAQDialog, setShowFAQDialog] = useState(false);
  const [faqFormData, setFaqFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    tags: [] as string[],
    isPublished: true,
    isFeatured: false,
    order: 0,
  });
  const [faqFilters, setFaqFilters] = useState({
    category: "all",
    search: "",
    featured: "all",
  });
  
  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [userFilters, setUserFilters] = useState({
    role: "all",
    businessCategory: "all",
    businessType: "all",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Restaurants state
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [restaurantsPagination, setRestaurantsPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    pages: 0,
  });
  const [restaurantFilters, setRestaurantFilters] = useState({
    businessCategory: "all",
    businessType: "all",
    subscriptionStatus: "all",
    verificationStatus: "all",
    archived: "active",
  });
  const [restaurantSort, setRestaurantSort] = useState({
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [showRestaurantDialog, setShowRestaurantDialog] = useState(false);

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsPagination, setSubscriptionsPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [subscriptionFilters, setSubscriptionFilters] = useState({
    status: "all",
    plan: "all",
    businessCategory: "all",
  });

  // Payments state
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsPagination, setPaymentsPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  // Renewals state
  const [renewals, setRenewals] = useState<any[]>([]);
  const [renewalsLoading, setRenewalsLoading] = useState(false);

  // Plans state
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    name: "",
    description: "",
    price: 0,
    period: "monthly",
    businessCategory: "Food Mall",
    features: [] as string[],
    isActive: true,
  });

  // Advertisements state
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [advertisementsLoading, setAdvertisementsLoading] = useState(false);
  const [adDashboard, setAdDashboard] = useState<any>(null);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<any>(null);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [adFormData, setAdFormData] = useState({
    title: "",
    description: "",
    type: "banner",
    position: "top",
    ctaType: "link",
    ctaButtonText: "",
    ctaButtonLink: "",
    targetAudience: "all",
    startDate: "",
    endDate: "",
    status: "draft",
    image: "",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
  });

  // System state
  const [serverStatus, setServerStatus] = useState({
    status: "online",
    uptime: "99.9%",
    responseTime: "120ms",
    activeConnections: 0,
    memoryUsage: "45%",
    cpuUsage: "23%",
  });
  const [databaseStats, setDatabaseStats] = useState({
    totalSize: "2.5 GB",
    collections: 12,
    indexes: 28,
    queries: 1250,
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Fetch functions
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.getAdminStats({ dateRange: stats.dateRange || "30" });
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {

      toast.error("Failed to load statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params: any = {
        page: usersPagination.page,
        limit: usersPagination.limit,
      };
      if (userFilters.role !== "all") params.role = userFilters.role;
      if (userFilters.businessCategory !== "all") params.businessCategory = userFilters.businessCategory;
      if (userFilters.businessType !== "all") params.businessType = userFilters.businessType;
      if (userFilters.search) params.search = userFilters.search;
      if (userFilters.sortBy) params.sortBy = userFilters.sortBy;
      if (userFilters.sortOrder) params.sortOrder = userFilters.sortOrder;

      const response = await api.getAdminUsers(params);
      if (response.success) {
        setUsers(response.data || []);
        if (response.pagination) {
          setUsersPagination(response.pagination);
        }
      }
    } catch (error: any) {

      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setRestaurantsLoading(true);
      const params: any = {
        page: restaurantsPagination.page,
        limit: restaurantsPagination.limit,
      };
      
      if (restaurantFilters.businessCategory !== "all") {
        params.businessCategory = restaurantFilters.businessCategory;
      }
      if (restaurantFilters.businessType !== "all") {
        params.businessType = restaurantFilters.businessType;
      }
      if (restaurantFilters.subscriptionStatus !== "all") {
        params.subscriptionStatus = restaurantFilters.subscriptionStatus;
      }
      if (restaurantSort.sortBy) {
        params.sortBy = restaurantSort.sortBy;
      }
      if (restaurantSort.sortOrder) {
        params.sortOrder = restaurantSort.sortOrder;
      }

      // Handle special tabs
      if (activeTab === "businesses-archived") {
        params.isArchived = true;
      } else if (activeTab === "businesses-pending") {
        params.verificationStatus = "pending";
      } else {
        params.verificationStatus =
          restaurantFilters.verificationStatus !== "all"
            ? restaurantFilters.verificationStatus
            : undefined;
        params.isArchived =
          restaurantFilters.archived === "all"
            ? undefined
            : restaurantFilters.archived === "archived"
            ? true
            : false;
      }

      const response = await api.getAdminRestaurants(params);
      if (response.success) {
        setRestaurants(response.data || []);
        if (response.pagination) {
          setRestaurantsPagination(response.pagination);
        }
      }
    } catch (error: any) {

      toast.error("Failed to load restaurants");
    } finally {
      setRestaurantsLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true);
      const params: any = {
        page: subscriptionsPagination.page,
        limit: subscriptionsPagination.limit,
      };
      if (subscriptionFilters.status !== "all") params.status = subscriptionFilters.status;
      if (subscriptionFilters.plan !== "all") params.plan = subscriptionFilters.plan;
      if (subscriptionFilters.businessCategory !== "all") params.businessCategory = subscriptionFilters.businessCategory;

      const response = await api.getAdminSubscriptions(params);
      if (response.success) {
        setSubscriptions(response.data || []);
        if (response.pagination) {
          setSubscriptionsPagination(response.pagination);
        }
      }
    } catch (error: any) {

      toast.error("Failed to load subscriptions");
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const response = await api.getAdminPayments({
        page: paymentsPagination.page,
        limit: paymentsPagination.limit,
      });
      if (response.success) {
        setPayments(response.data || []);
        if (response.pagination) {
          setPaymentsPagination(response.pagination);
        }
      }
    } catch (error: any) {

      toast.error("Failed to load payments");
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchRenewals = async () => {
    try {
      setRenewalsLoading(true);
      const response = await api.getAdminRenewals();
      if (response.success) {
        setRenewals(response.data || []);
      }
    } catch (error: any) {

      toast.error("Failed to load renewals");
    } finally {
      setRenewalsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await api.getAdminPlans();
      if (response.success) {
        setPlans(response.data || []);
      }
    } catch (error: any) {

      toast.error("Failed to load plans");
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchAdvertisements = async () => {
    try {
      setAdvertisementsLoading(true);
      const response = await api.getAdminAdvertisements();
      if (response.success) {
        setAdvertisements(response.data || []);
      }
    } catch (error: any) {

      toast.error("Failed to load advertisements");
    } finally {
      setAdvertisementsLoading(false);
    }
  };

  const fetchAdDashboard = async () => {
    try {
      const response = await api.getAdminAdDashboard();
      if (response.success) {
        setAdDashboard(response.data);
      }
    } catch (error: any) {

    }
  };

  const fetchOverviewAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await api.getOverviewAnalytics({ dateRange: stats.dateRange || "30" });
      if (response.success) {
        setOverviewAnalytics(response.data);
      }
    } catch (error: any) {

      toast.error("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchBusinessAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await api.getBusinessAnalytics({
        dateRange: analyticsFilters.dateRange,
        businessCategory: analyticsFilters.businessCategory
      });
      if (response.success) {
        setBusinessAnalytics(response.data);
      }
    } catch (error: any) {

      toast.error("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchRevenueAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await api.getRevenueAnalytics({ dateRange: analyticsFilters.dateRange });
      if (response.success) {
        setRevenueAnalytics(response.data);
      }
    } catch (error: any) {

      toast.error("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchQRScanAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await api.getQRScanAnalytics({ dateRange: analyticsFilters.dateRange });
      if (response.success) {
        setQrScanAnalytics(response.data);
      }
    } catch (error: any) {

      toast.error("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      setSupportTicketsLoading(true);
      const response = await api.getSupportTickets({
        ...ticketFilters,
        page: supportTicketsPagination.page,
        limit: supportTicketsPagination.limit,
      });
      if (response.success) {
        setSupportTickets(response.data);
        setSupportTicketsPagination(response.pagination);
      }
    } catch (error: any) {

      toast.error("Failed to load tickets");
    } finally {
      setSupportTicketsLoading(false);
    }
  };

  const fetchTicketStats = async () => {
    try {
      const response = await api.getTicketStats({ dateRange: stats.dateRange || "30" });
      if (response.success) {
        setTicketStats(response.data);
      }
    } catch (error: any) {

    }
  };

  const fetchFAQs = async () => {
    try {
      setFaqsLoading(true);
      const response = await api.getFAQs({
        category: faqFilters.category !== "all" ? faqFilters.category : undefined,
        search: faqFilters.search || undefined,
        featured: faqFilters.featured === "true" ? true : faqFilters.featured === "false" ? false : undefined,
      });
      if (response.success) {
        setFaqs(response.data);
      }
    } catch (error: any) {

      toast.error("Failed to load FAQs");
    } finally {
      setFaqsLoading(false);
    }
  };

  // Global search function
  const performGlobalSearch = (query: string) => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      setGlobalSearchResults({ businesses: [], users: [] });
      return;
    }

    const businessResults = restaurants.filter((business: any) => {
      const nameMatch = business.name?.toLowerCase().includes(searchTerm);
      const emailMatch = business.email?.toLowerCase().includes(searchTerm);
      const typeMatch = business.businessType?.toLowerCase().includes(searchTerm);
      const categoryMatch = business.businessCategory?.toLowerCase().includes(searchTerm);
      return nameMatch || emailMatch || typeMatch || categoryMatch;
    });

    const userResults = users.filter((user: any) => {
      const nameMatch = user.name?.toLowerCase().includes(searchTerm);
      const emailMatch = user.email?.toLowerCase().includes(searchTerm);
      const restaurantNameMatch = user.restaurant?.name?.toLowerCase().includes(searchTerm);
      return nameMatch || emailMatch || restaurantNameMatch;
    });

    setGlobalSearchResults({
      businesses: businessResults.slice(0, 10),
      users: userResults.slice(0, 10),
    });
  };

  // Calculate notifications
  const calculateNotifications = () => {
    const notifs: any[] = [];
    
    // Pending businesses
    const pendingCount = restaurants.filter((r: any) => 
      r.verificationStatus === "pending" || (!r.verificationStatus && !r.isVerified)
    ).length;
    if (pendingCount > 0) {
      notifs.push({
        id: "pending-businesses",
        title: `${pendingCount} Business${pendingCount > 1 ? "es" : ""} Pending Approval`,
        message: `${pendingCount} business${pendingCount > 1 ? "es need" : " needs"} verification`,
        time: "Just now",
        read: false,
        action: "businesses-pending",
      });
    }

    // Expired subscriptions
    if (stats.expiredSubscriptions > 0) {
      notifs.push({
        id: "expired-subscriptions",
        title: `${stats.expiredSubscriptions} Expired Subscription${stats.expiredSubscriptions > 1 ? "s" : ""}`,
        message: `${stats.expiredSubscriptions} subscription${stats.expiredSubscriptions > 1 ? "s have" : " has"} expired`,
        time: "Just now",
        read: false,
        action: "subscriptions-expired",
      });
    }

    return notifs;
  };

  // Calculate database stats
  const calculateDatabaseStats = () => {
    setDatabaseStats({
      totalSize: "2.5 GB",
      collections: 12,
      indexes: 28,
      queries: 1250,
    });
  };

  // Calculate audit logs
  const calculateAuditLogs = () => {
    const logs: any[] = [];
    // Add logic to calculate audit logs
    setAuditLogs(logs);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // User actions
  const handleUserAction = async (userId: string, action: "activate" | "deactivate" | "delete") => {
    try {
      if (action === "delete") {
        const response = await api.deleteAdminUser(userId);
        if (response.success) {
          toast.success("User deleted successfully");
          setShowDeleteDialog(false);
          fetchUsers();
        }
      } else {
        const response = await api.updateAdminUser(userId, {
          isActive: action === "activate",
        });
        if (response.success) {
          toast.success(response.message || `User ${action}d successfully`);
          fetchUsers();
        }
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} user`);
    }
  };

  const handleUserRoleChange = async (userId: string, role: "admin" | "user") => {
    try {
      const response = await api.updateAdminUser(userId, { role });
      if (response.success) {
        toast.success(`Role updated to ${role}`);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await api.getAdminUser(userId);
      if (response.success) {
        setSelectedUser(response.data);
        setShowUserDialog(true);
      }
    } catch (error: any) {
      toast.error("Failed to load user details");
    }
  };

  // Chart data
  const chartData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const businessesInMonth = restaurants.filter((r: any) => {
        const created = new Date(r.createdAt);
        return created >= monthStart && created <= monthEnd;
      }).length;
      
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        businesses: businessesInMonth,
        users: users.filter((u: any) => {
          const created = new Date(u.createdAt);
          return created >= monthStart && created <= monthEnd;
        }).length,
      });
    }

    const revenueByMonth = last6Months.map((monthData, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const revenue = restaurants
        .filter((r: any) => {
          const created = new Date(r.createdAt);
          return created >= monthStart && created <= monthEnd && r.subscription?.planPrice;
        })
        .reduce((sum: number, r: any) => sum + (r.subscription?.planPrice || 0), 0);
      
      return {
        ...monthData,
        revenue,
      };
    });

    const categoryData = [
      {
        name: "Food Mall",
        value: restaurants.filter((r: any) => r.businessCategory === "Food Mall").length,
        color: "#3b82f6",
      },
      {
        name: "Retail / E-Commerce",
        value: restaurants.filter((r: any) => r.businessCategory === "Retail / E-Commerce Businesses").length,
        color: "#8b5cf6",
      },
      {
        name: "Creative & Design",
        value: restaurants.filter((r: any) => r.businessCategory === "Creative & Design").length,
        color: "#f59e0b",
      },
    ];

    const planDistribution = {
      Free: { count: 0, revenue: 0 },
      Basic: { count: 0, revenue: 0 },
      Pro: { count: 0, revenue: 0 },
    };
    
    restaurants.forEach((r: any) => {
      const plan = r.subscription?.plan || "Free";
      const price = r.subscription?.planPrice || 0;
      if (plan in planDistribution) {
        planDistribution[plan as keyof typeof planDistribution].count++;
        planDistribution[plan as keyof typeof planDistribution].revenue += price;
      }
    });

    const planData = [
      {
        name: "Free",
        value: planDistribution.Free.count,
        color: "#94a3b8",
      },
      {
        name: "Basic",
        value: planDistribution.Basic.count,
        color: "#3b82f6",
      },
      {
        name: "Pro",
        value: planDistribution.Pro.count,
        color: "#8b5cf6",
      },
    ];

    const topScannedBusinesses = [...restaurants]
      .sort((a: any, b: any) => (b.qrScans || 0) - (a.qrScans || 0))
      .slice(0, 10)
      .map((r: any) => ({
        name: r.name?.substring(0, 20) || "Business",
        scans: r.qrScans || 0,
      }));

    return {
      growthData: last6Months,
      revenueData: revenueByMonth,
      categoryData,
      planData,
      topScannedBusinesses,
    };
  }, [restaurants, users]);

  // Filtered and sorted restaurants
  const filteredRestaurants = restaurants.filter((r: any) =>
    searchQuery
      ? r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const sortedRestaurants = useMemo(() => {
    const list = [...filteredRestaurants];
    if (restaurantSort.sortBy === "name") {
      list.sort((a: any, b: any) => {
        const an = (a.name || "").toLowerCase();
        const bn = (b.name || "").toLowerCase();
        if (an < bn) return restaurantSort.sortOrder === "asc" ? -1 : 1;
        if (an > bn) return restaurantSort.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    } else if (restaurantSort.sortBy === "createdAt") {
      list.sort((a: any, b: any) => {
        const ad = new Date(a.createdAt || 0).getTime();
        const bd = new Date(b.createdAt || 0).getTime();
        return restaurantSort.sortOrder === "asc" ? ad - bd : bd - ad;
      });
    }
    return list;
  }, [filteredRestaurants, restaurantSort.sortBy, restaurantSort.sortOrder]);

  // Business category filters
  const businessCategoryFilters = {
    all: (r: any) => true,
    "Food Mall": (r: any) => r.businessCategory === "Food Mall",
    "Retail / E-Commerce Businesses": (r: any) => r.businessCategory === "Retail / E-Commerce Businesses",
    "Creative & Design": (r: any) => r.businessCategory === "Creative & Design",
  } as const;

  const applyBusinessFilters = (source: any[], options?: { category?: string; pending?: boolean; archived?: boolean }) => {
    return source.filter((r) => {
      if (options?.category && r.businessCategory !== options.category) return false;
      if (options?.pending && r.verificationStatus !== "pending" && !r.isVerified) return false;
      if (options?.archived && !r.isArchived) return false;
      return true;
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return {
    // State
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    globalSearchQuery,
    setGlobalSearchQuery,
    globalSearchResults,
    setGlobalSearchResults,
    showGlobalSearch,
    setShowGlobalSearch,
    showMobileSearch,
    setShowMobileSearch,
    showNotifications,
    setShowNotifications,
    stats,
    setStats,
    statsLoading,
    currentAdmin,
    setCurrentAdmin,
    profileData,
    setProfileData,
    notifications,
    setNotifications,
    analyticsFilters,
    setAnalyticsFilters,
    overviewAnalytics,
    businessAnalytics,
    revenueAnalytics,
    qrScanAnalytics,
    analyticsLoading,
    supportTickets,
    supportTicketsLoading,
    supportTicketsPagination,
    setSupportTicketsPagination,
    ticketFilters,
    setTicketFilters,
    selectedTicket,
    setSelectedTicket,
    showTicketDialog,
    setShowTicketDialog,
    ticketMessage,
    setTicketMessage,
    ticketStats,
    faqs,
    faqsLoading,
    selectedFAQ,
    setSelectedFAQ,
    showFAQDialog,
    setShowFAQDialog,
    faqFormData,
    setFaqFormData,
    faqFilters,
    setFaqFilters,
    users,
    usersLoading,
    usersPagination,
    setUsersPagination,
    userFilters,
    setUserFilters,
    selectedUser,
    setSelectedUser,
    showUserDialog,
    setShowUserDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteLoading,
    setDeleteLoading,
    restaurants,
    restaurantsLoading,
    restaurantsPagination,
    setRestaurantsPagination,
    restaurantFilters,
    setRestaurantFilters,
    restaurantSort,
    setRestaurantSort,
    selectedRestaurant,
    setSelectedRestaurant,
    showRestaurantDialog,
    setShowRestaurantDialog,
    subscriptions,
    subscriptionsLoading,
    subscriptionsPagination,
    setSubscriptionsPagination,
    subscriptionFilters,
    setSubscriptionFilters,
    payments,
    paymentsLoading,
    paymentsPagination,
    setPaymentsPagination,
    renewals,
    renewalsLoading,
    plans,
    plansLoading,
    selectedPlan,
    setSelectedPlan,
    showPlanDialog,
    setShowPlanDialog,
    planFormData,
    setPlanFormData,
    advertisements,
    advertisementsLoading,
    adDashboard,
    selectedAdvertisement,
    setSelectedAdvertisement,
    showAdDialog,
    setShowAdDialog,
    adFormData,
    setAdFormData,
    serverStatus,
    setServerStatus,
    databaseStats,
    auditLogs,
    // Functions
    fetchStats,
    fetchUsers,
    fetchRestaurants,
    fetchSubscriptions,
    fetchPayments,
    fetchRenewals,
    fetchPlans,
    fetchAdvertisements,
    fetchAdDashboard,
    fetchOverviewAnalytics,
    fetchBusinessAnalytics,
    fetchRevenueAnalytics,
    fetchQRScanAnalytics,
    fetchSupportTickets,
    fetchTicketStats,
    fetchFAQs,
    performGlobalSearch,
    calculateNotifications,
    calculateDatabaseStats,
    calculateAuditLogs,
    formatCurrency,
    formatDate,
    handleUserAction,
    handleUserRoleChange,
    handleViewUser,
    handleLogout,
    chartData,
    filteredRestaurants,
    sortedRestaurants,
    businessCategoryFilters,
    applyBusinessFilters,
    navigate,
  };
};
