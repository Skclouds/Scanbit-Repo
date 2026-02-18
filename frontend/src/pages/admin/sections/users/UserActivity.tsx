import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Clock,
  User,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  Settings,
  RefreshCw,
  TrendingUp,
  Users,
  MousePointer,
  FileText,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  CreditCard,
  Building2,
  Shield,
  Mail,
  Phone,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  QrCode,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    profileImage?: string;
    role?: string;
    phone?: string;
  };
  action: string;
  actionType: "login" | "logout" | "create" | "edit" | "delete" | "view" | "payment" | "subscription" | "qr_scan" | "other";
  description: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
  location?: string;
  metadata?: {
    businessName?: string;
    businessId?: string;
    planName?: string;
    amount?: number;
    qrScans?: number;
    [key: string]: any;
  };
}

type SortField = 'timestamp' | 'user' | 'action' | 'actionType';
type SortOrder = 'asc' | 'desc';

export default function UserActivity() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchActivities();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [page, limit, actionFilter, dateFilter, userFilter, sortField, sortOrder]);

  const fetchUsers = async () => {
    try {
      const response = await api.getAdminUsers({ 
        page: 1, 
        limit: 1000,
        includeAdmins: true 
      });
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {

    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch users with lastLogin data
      const usersResponse = await api.getAdminUsers({ 
        page: 1, 
        limit: 1000,
        includeAdmins: true 
      });

      // Fetch payments/subscriptions for payment activities
      let paymentsResponse: any = { success: false, data: [] };
      try {
        paymentsResponse = await api.getAdminPayments({ page: 1, limit: 1000 });
      } catch (error) {

      }

      // Build activity logs from real data
      const activityLogs: ActivityLog[] = [];

      if (usersResponse.success && usersResponse.data) {
        // Add login activities from lastLogin
        usersResponse.data.forEach((user: any) => {
          if (user.lastLogin) {
            activityLogs.push({
              _id: `login-${user._id}-${user.lastLogin}`,
              user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                profileImage: user.profileImage,
                role: user.role,
                phone: user.phone,
              },
              action: "Logged in",
              actionType: "login",
              description: `${user.name} logged into the system`,
              timestamp: user.lastLogin,
              metadata: {
                businessName: user.restaurant?.name || user.businessName,
                businessId: user.restaurant?._id || user.restaurant,
              }
            });
          }

          // Add account creation activity
          if (user.createdAt) {
            activityLogs.push({
              _id: `create-${user._id}-${user.createdAt}`,
              user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                profileImage: user.profileImage,
                role: user.role,
                phone: user.phone,
              },
              action: "Account Created",
              actionType: "create",
              description: `${user.name} created an account`,
              timestamp: user.createdAt,
              metadata: {
                businessName: user.restaurant?.name || user.businessName,
                businessId: user.restaurant?._id || user.restaurant,
                registrationMethod: user.registered_by_admin ? 'Admin' : 'Self',
              }
            });
          }

          // Add profile update activity (if updatedAt is different from createdAt)
          if (user.updatedAt && user.createdAt && new Date(user.updatedAt) > new Date(user.createdAt)) {
            activityLogs.push({
              _id: `edit-${user._id}-${user.updatedAt}`,
              user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                profileImage: user.profileImage,
                role: user.role,
                phone: user.phone,
              },
              action: "Profile Updated",
              actionType: "edit",
              description: `${user.name} updated their profile`,
              timestamp: user.updatedAt,
              metadata: {
                businessName: user.restaurant?.name || user.businessName,
                businessId: user.restaurant?._id || user.restaurant,
              }
            });
          }
        });
      }

      // Add payment activities
      if (paymentsResponse.success && paymentsResponse.data) {
        paymentsResponse.data.forEach((payment: any) => {
          const user = usersResponse.data?.find((u: any) => u._id === payment.user || u.restaurant?._id === payment.restaurant);
          if (user) {
            activityLogs.push({
              _id: `payment-${payment._id}`,
              user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                profileImage: user.profileImage,
                role: user.role,
                phone: user.phone,
              },
              action: payment.status === 'completed' ? "Payment Completed" : payment.status === 'failed' ? "Payment Failed" : "Payment Initiated",
              actionType: "payment",
              description: payment.status === 'completed' 
                ? `Payment of ₹${payment.amount || 0} completed for ${payment.planName || 'subscription'}`
                : payment.status === 'failed'
                ? `Payment of ₹${payment.amount || 0} failed for ${payment.planName || 'subscription'}`
                : `Payment of ₹${payment.amount || 0} initiated for ${payment.planName || 'subscription'}`,
              timestamp: payment.createdAt || payment.paidAt || new Date().toISOString(),
              metadata: {
                businessName: user.restaurant?.name || user.businessName,
                businessId: user.restaurant?._id || user.restaurant,
                planName: payment.planName,
                amount: payment.amount,
                status: payment.status,
              }
            });
          }
        });
      }

      // Sort by timestamp (newest first)
      activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(activityLogs);
      setTotal(activityLogs.length);
    } catch (error) {

      toast({
        title: 'Error',
        description: 'Failed to load user activities',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchActivities();
      toast({
        title: 'Success',
        description: 'Activity log refreshed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh activities',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Email', 'Action', 'Description', 'Type', 'Business'].join(','),
      ...filteredAndSortedActivities.map(activity => [
        new Date(activity.timestamp).toISOString(),
        `"${activity.user.name}"`,
        activity.user.email,
        `"${activity.action}"`,
        `"${activity.description}"`,
        activity.actionType,
        `"${activity.metadata?.businessName || 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user-activity-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: 'Activity log exported successfully',
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "login": return <LogIn className="w-4 h-4" />;
      case "logout": return <LogOut className="w-4 h-4" />;
      case "create": return <Plus className="w-4 h-4" />;
      case "edit": return <Edit className="w-4 h-4" />;
      case "delete": return <Trash2 className="w-4 h-4" />;
      case "view": return <Eye className="w-4 h-4" />;
      case "payment": return <CreditCard className="w-4 h-4" />;
      case "subscription": return <CheckCircle className="w-4 h-4" />;
      case "qr_scan": return <QrCode className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "login": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200";
      case "logout": return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200";
      case "create": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200";
      case "edit": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200";
      case "delete": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200";
      case "view": return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200";
      case "payment": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200";
      case "subscription": return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200";
      case "qr_scan": return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  };

  const getDeviceIcon = (device?: string) => {
    if (!device) return <Monitor className="w-3 h-3" />;
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('mobile') || deviceLower.includes('android') || deviceLower.includes('iphone')) {
      return <Smartphone className="w-3 h-3" />;
    }
    if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
      return <Tablet className="w-3 h-3" />;
    }
    return <Monitor className="w-3 h-3" />;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  // Filter and sort activities
  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Action type filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(activity => activity.actionType === actionFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(activity => activity.user._id === userFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        switch (dateFilter) {
          case 'today':
            return activityDate.toDateString() === now.toDateString();
          case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            return activityDate.toDateString() === yesterday.toDateString();
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return activityDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return activityDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'user':
          aValue = a.user.name.toLowerCase();
          bValue = b.user.name.toLowerCase();
          break;
        case 'action':
          aValue = a.action.toLowerCase();
          bValue = b.action.toLowerCase();
          break;
        case 'actionType':
          aValue = a.actionType;
          bValue = b.actionType;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [activities, searchQuery, actionFilter, dateFilter, userFilter, sortField, sortOrder]);

  // Pagination
  const paginatedActivities = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredAndSortedActivities.slice(start, end);
  }, [filteredAndSortedActivities, page, limit]);

  const totalPages = Math.ceil(filteredAndSortedActivities.length / limit);

  // Stats
  const stats = useMemo(() => {
    const uniqueUsers = new Set(activities.map(a => a.user._id));
    const today = new Date().toDateString();
    const todayActivities = activities.filter(a => new Date(a.timestamp).toDateString() === today);
    const uniqueIPs = new Set(activities.map(a => a.ipAddress).filter(Boolean));

    return {
      total: activities.length,
      uniqueUsers: uniqueUsers.size,
      todayActivities: todayActivities.length,
      uniqueIPs: uniqueIPs.size,
    };
  }, [activities]);

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Activity</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor user actions and system events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={activities.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Activities</p>
                <p className="text-3xl font-bold mt-2 text-green-900 dark:text-green-100">{stats.total}</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  All time records
                </p>
              </div>
              <Activity className="w-10 h-10 text-green-500 dark:text-green-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Users</p>
                <p className="text-3xl font-bold mt-2 text-blue-900 dark:text-blue-100">{stats.uniqueUsers}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {activities.length > 0 ? Math.round((stats.uniqueUsers / activities.length) * 100) : 0}% of activities
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-500 dark:text-blue-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Today's Actions</p>
                <p className="text-3xl font-bold mt-2 text-purple-900 dark:text-purple-100">{stats.todayActivities}</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  {stats.total > 0 ? Math.round((stats.todayActivities / stats.total) * 100) : 0}% of total
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500 dark:text-purple-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Unique IPs</p>
                <p className="text-3xl font-bold mt-2 text-orange-900 dark:text-orange-100">{stats.uniqueIPs}</p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Different locations
                </p>
              </div>
              <MousePointer className="w-10 h-10 text-orange-500 dark:text-orange-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Sorting
          </CardTitle>
          <CardDescription>Filter and sort activities by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={actionFilter} onValueChange={(value) => { setActionFilter(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="qr_scan">QR Scan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={userFilter} onValueChange={(value) => { setUserFilter(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.slice(0, 50).map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={dateFilter} onValueChange={(value) => { setDateFilter(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortField} onValueChange={(value: any) => { setSortField(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp">Date</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="actionType">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <Button
                variant="outline"
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  setPage(1);
                }}
                className="w-full justify-start gap-2"
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>
          {(searchQuery || actionFilter !== 'all' || dateFilter !== 'all' || userFilter !== 'all') && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActionFilter('all');
                  setDateFilter('all');
                  setUserFilter('all');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Activity Log
              </CardTitle>
              <CardDescription className="mt-1">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, filteredAndSortedActivities.length)} of{' '}
                {filteredAndSortedActivities.length} activities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No activities found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || actionFilter !== 'all' || dateFilter !== 'all' || userFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No activity data available'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedActivities.map((activity, index) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-lg border ${getActionColor(activity.actionType)}`}>
                        {getActionIcon(activity.actionType)}
                      </div>
                      {index < paginatedActivities.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-2 min-h-[40px]" />
                      )}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Avatar className="w-6 h-6 border border-slate-200 dark:border-slate-700">
                              <AvatarImage 
                                src={activity.user.profileImage || activity.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${activity.user.name}`} 
                              />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{activity.user.name}</span>
                            {activity.user.role === 'admin' && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            <Badge className={`${getActionColor(activity.actionType)}`} variant="secondary">
                              {activity.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{activity.description}</p>
                          {activity.metadata?.businessName && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
                              <Building2 className="w-3 h-3" />
                              <span>{activity.metadata.businessName}</span>
                            </div>
                          )}
                          {activity.metadata?.amount && (
                            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mb-2 font-medium">
                              <CreditCard className="w-3 h-3" />
                              <span>₹{activity.metadata.amount}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {activity.user.email}
                            </span>
                            {activity.user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {activity.user.phone}
                              </span>
                            )}
                            {activity.device && (
                              <span className="flex items-center gap-1">
                                {getDeviceIcon(activity.device)}
                                {activity.device}
                              </span>
                            )}
                            {activity.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </span>
                            )}
                            {activity.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {activity.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                          <div className="font-medium">{new Date(activity.timestamp).toLocaleDateString()}</div>
                          <div>{new Date(activity.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Items per page:</span>
                    <Select value={String(limit)} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm px-4">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}