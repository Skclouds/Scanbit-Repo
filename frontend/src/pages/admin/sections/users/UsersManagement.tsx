import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Calendar, 
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  UserPlus,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  Clock,
  MapPin,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Hash,
  Trash2,
  UserCog,
  KeyRound,
  ExternalLink,
  Image,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  CheckCircle2,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  businessCategory?: string;
  businessType?: string;
  phone?: string;
  address?: string;
  bio?: string;
  isActive: boolean;
  isMasterAdmin?: boolean;
  hasAdminAccess?: boolean;
  permissions?: Record<string, boolean>;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  profileImage?: string;
  registration_through?: string;
  registered_by_admin?: {
    _id: string;
    name: string;
    email: string;
  };
  restaurant?: {
    _id: string;
    name: string;
    email?: string;
    businessType?: string;
    businessCategory?: string;
    logo?: string;
    ownerImage?: string;
    profileImage?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    location?: {
      lat?: number;
      lng?: number;
      address?: string;
    };
    businessCardFront?: string;
    businessCardBack?: string;
    businessCard?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
    foodImages?: string[];
    onboardingCompleted?: boolean;
    subscription?: {
      plan: string;
      status: string;
      planPrice?: number;
      startDate?: string;
      endDate?: string;
      daysRemaining?: number;
      billingCycle?: string;
    };
  };
}

type SortField = 'name' | 'email' | 'createdAt' | 'lastLogin' | 'role' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function UsersManagement() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [businessCategory, setBusinessCategory] = useState('all');
  const [registrationMethod, setRegistrationMethod] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [realTotalCount, setRealTotalCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async (overridePage?: number) => {
    try {
      setLoading(true);
      const params: any = {
        page: overridePage !== undefined ? overridePage : page,
        limit,
        search: search || undefined,
        role: role !== 'all' ? role : undefined,
        sortBy: sortField,
        sortOrder: sortOrder,
      };

      const response = await api.getAdminUsers(params);

      if (response.success) {
        let filteredData = response.data || [];
        
        // Store real total count from database (this is the actual count from DB query)
        if (response.pagination) {
          // This is the real total from database based on current query filters
          const dbTotal = response.pagination.total || 0;
          setRealTotalCount(dbTotal);
          setTotal(dbTotal);
        }
        
        // Apply client-side filters
        if (status !== 'all') {
          filteredData = filteredData.filter((user: User) => 
            status === 'active' ? user.isActive : !user.isActive
          );
        }
        
        if (businessCategory !== 'all') {
          filteredData = filteredData.filter((user: User) => 
            user.businessCategory === businessCategory
          );
        }
        
        if (registrationMethod !== 'all') {
          filteredData = filteredData.filter((user: User) => 
            user.registration_through === registrationMethod
          );
        }

        setUsers(filteredData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch real total count from stats on initial load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getAdminStats();
        if (response.success && response.data) {
          // Stats endpoint excludes admins, so we add them if needed
          // For now, use pagination total which is more accurate based on current filters
          // This is just a fallback
        }
      } catch (error) {
        // Silently fail - we'll use pagination total instead
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, role, sortField, sortOrder]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Refetch when status, businessCategory, or registrationMethod changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, businessCategory, registrationMethod]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Reset to first page and refetch
      setPage(1);
      // Call fetchUsers with page 1 explicitly to ensure it uses the correct page
      await fetchUsers(1);
      toast({
        title: 'Success',
        description: 'Users list refreshed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh users',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewDetails = async (userId: string) => {
    try {
      const response = await api.getAdminUser(userId);
      if (response.success && response.data) {
        setSelectedUser(response.data);
        setViewDialogOpen(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch user details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (userId: string) => {
    try {
      const response = await api.getAdminUser(userId);
      if (response.success && response.data) {
        setEditUser(response.data);
        setEditDialogOpen(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch user details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive',
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    
    // Check if user is master admin
    if (editUser.isMasterAdmin || editUser.email === 'rudranshdevelopment@gmail.com') {
      toast({
        title: 'Error',
        description: 'Master Admin account cannot be modified. This account is protected.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone || undefined,
      };

      // Include business details if restaurant exists
      if (editUser.restaurant) {
        updateData.businessName = editUser.restaurant.name;
        updateData.businessType = editUser.businessType || editUser.restaurant.businessType;
        updateData.businessCategory = editUser.businessCategory || editUser.restaurant.businessCategory;
      }

      const response = await api.updateAdminUser(editUser._id, updateData);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'User updated successfully',
        });
        setEditDialogOpen(false);
        setEditUser(null);
        handleRefresh();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (userId: string, user?: User) => {
    // Check if user is master admin
    if (user && (user.isMasterAdmin || user.email === 'rudranshdevelopment@gmail.com')) {
      toast({
        title: 'Error',
        description: 'Master Admin account cannot be modified. This account is protected.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.updateAdminUser(userId, { isActive: true });
      toast({
        title: 'Success',
        description: 'User activated successfully',
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate user',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (userId: string, user?: User) => {
    // Check if user is master admin
    if (user && (user.isMasterAdmin || user.email === 'rudranshdevelopment@gmail.com')) {
      toast({
        title: 'Error',
        description: 'Master Admin account cannot be modified. This account is protected.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.updateAdminUser(userId, { isActive: false });
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate user',
        variant: 'destructive',
      });
    }
  };

  const handleBulkActivate = async () => {
    try {
      const promises = Array.from(selectedUsers).map(id => 
        api.updateAdminUser(id, { isActive: true })
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedUsers.size} user(s) activated successfully`,
      });
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate users',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const promises = Array.from(selectedUsers).map(id => 
        api.updateAdminUser(id, { isActive: false })
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedUsers.size} user(s) deactivated successfully`,
      });
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate users',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await api.deleteAdminUser(userId);
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'User deleted successfully',
        });
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        handleRefresh();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const promises = Array.from(selectedUsers).map(id => 
        api.deleteAdminUser(id)
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedUsers.size} user(s) deleted successfully`,
      });
      setSelectedUsers(new Set());
      setShowBulkActions(false);
      setBulkDeleteDialogOpen(false);
      handleRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete users',
        variant: 'destructive',
      });
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'user', user?: User) => {
    // Check if user is master admin
    if (user && (user.isMasterAdmin || user.email === 'rudranshdevelopment@gmail.com')) {
      toast({
        title: 'Error',
        description: 'Master Admin account cannot be modified. This account is protected.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.updateAdminUser(userId, { role: newRole });
      toast({
        title: 'Success',
        description: `User role changed to ${newRole}`,
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change user role',
        variant: 'destructive',
      });
    }
  };

  const handleAssignPlan = async (userId: string) => {
    // This would open a plan selection dialog
    toast({
      title: 'Info',
      description: 'Plan assignment feature - coming soon',
    });
  };

  const handleViewBusiness = (businessId: string) => {
    // Navigate to business details or open business dialog
    toast({
      title: 'Info',
      description: `View business ${businessId}`,
    });
  };

  const openDeleteDialog = (user: User) => {
    // Check if user is master admin
    if (user.isMasterAdmin || user.email === 'rudranshdevelopment@gmail.com') {
      toast({
        title: 'Error',
        description: 'Master Admin account cannot be deleted. This account is protected.',
        variant: 'destructive',
      });
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const handleExport = () => {
    const headers = [
      "Name", "Email", "Phone", "Role", "Status", "Business Name", 
      "Business Category", "Business Type", "Subscription Plan", 
      "Subscription Status", "Registration Method", "Registered By", 
      "Created At", "Last Login"
    ];
    
    const rows = users.map(user => [
      user.name || "",
      user.email || "",
      user.phone || "",
      user.role || "",
      user.isActive ? "Active" : "Inactive",
      user.restaurant?.name || "No business",
      user.businessCategory || "",
      user.businessType || "",
      user.restaurant?.subscription?.plan || "",
      user.restaurant?.subscription?.status || "",
      user.registration_through || "",
      user.registered_by_admin?.name || "",
      user.createdAt ? new Date(user.createdAt).toLocaleString() : "",
      user.lastLogin ? new Date(user.lastLogin).toLocaleString() : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Success',
      description: 'Users exported successfully',
    });
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } else {
      // Only select users that are not master admin
      const selectableUsers = users.filter(u => !isActionDisabled(u));
      setSelectedUsers(new Set(selectableUsers.map(u => u._id)));
      setShowBulkActions(selectableUsers.length > 0);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'user': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getSubscriptionStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isMasterAdmin = (user: User) => {
    return user.isMasterAdmin || user.email === 'rudranshdevelopment@gmail.com';
  };

  const isActionDisabled = (user: User) => {
    return isMasterAdmin(user);
  };

  // Calculate stats - use real total from database
  const stats = useMemo(() => {
    const totalUsers = realTotalCount || total || 0;
    const active = users.filter(u => u.isActive).length;
    const inactive = users.filter(u => !u.isActive).length;
    const withBusiness = users.filter(u => u.restaurant).length;
    const admins = users.filter(u => u.role === 'admin').length;
    
    return { total: totalUsers, active, inactive, withBusiness, admins };
  }, [users, realTotalCount, total]);

  const totalPages = Math.ceil(total / limit);

  if (loading && users.length === 0) {
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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">All Users</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage all users and their permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setSearchParams({ activeTab: 'users-add' });
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2 text-blue-900 dark:text-blue-100">{stats.total}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {stats.admins} admin{stats.admins !== 1 ? 's' : ''}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-500 dark:text-blue-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Active Users</p>
                <p className="text-3xl font-bold mt-2 text-green-900 dark:text-green-100">{stats.active}</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
                </p>
              </div>
              <UserCheck className="w-10 h-10 text-green-500 dark:text-green-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Inactive Users</p>
                <p className="text-3xl font-bold mt-2 text-orange-900 dark:text-orange-100">{stats.inactive}</p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% of total
                </p>
              </div>
              <UserX className="w-10 h-10 text-orange-500 dark:text-orange-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">With Business</p>
                <p className="text-3xl font-bold mt-2 text-purple-900 dark:text-purple-100">{stats.withBusiness}</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  {stats.total > 0 ? Math.round((stats.withBusiness / stats.total) * 100) : 0}% of total
                </p>
              </div>
              <Building2 className="w-10 h-10 text-purple-500 dark:text-purple-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </CardTitle>
          <CardDescription>Filter users by multiple criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={role} onValueChange={(value) => { setRole(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Business Category</label>
              <Select value={businessCategory} onValueChange={(value) => { setBusinessCategory(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="Food Mall">Food Mall</SelectItem>
                  <SelectItem value="Retail / E-Commerce businesses">Retail / E-Commerce</SelectItem>
                  <SelectItem value="Creative & Design businesses">Creative & Design</SelectItem>
                  <SelectItem value="Portfolio">Portfolio</SelectItem>
                  <SelectItem value="Agencies & Studios">Agencies & Studios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Registration</label>
              <Select value={registrationMethod} onValueChange={(value) => { setRegistrationMethod(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All methods</SelectItem>
                  <SelectItem value="Self by website">Self Registered</SelectItem>
                  <SelectItem value="By admin">Admin Created</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortField} onValueChange={(value) => { setSortField(value as SortField); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="lastLogin">Last Login</SelectItem>
                  <SelectItem value="updatedAt">Last Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort(sortField)}
            >
              {getSortIcon(sortField)}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
            {(search || role !== 'all' || status !== 'all' || businessCategory !== 'all' || registrationMethod !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setRole('all');
                  setStatus('all');
                  setBusinessCategory('all');
                  setRegistrationMethod('all');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle>Users ({total || users.length})</CardTitle>
              <CardDescription className="mt-1">
                Showing {((page - 1) * limit) + 1} to{' '}
                {Math.min(page * limit, total || users.length)} of{' '}
                {total || users.length} users
              </CardDescription>
            </div>
            {showBulkActions && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.size} selected
                </span>
                <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {search || role !== 'all' || status !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by adding a new user'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <Checkbox
                          checked={selectedUsers.size === users.length && users.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="text-left p-3 font-semibold cursor-pointer" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1">
                          User
                          {getSortIcon('name')}
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold cursor-pointer" onClick={() => handleSort('role')}>
                        <div className="flex items-center gap-1">
                          Role
                          {getSortIcon('role')}
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold">Business</th>
                      <th className="text-left p-3 font-semibold">Subscription</th>
                      <th className="text-left p-3 font-semibold cursor-pointer" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center gap-1">
                          Status
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold">Registration</th>
                      <th className="text-left p-3 font-semibold cursor-pointer" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center gap-1">
                          Created
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedUsers.has(user._id)}
                            onCheckedChange={() => toggleUserSelection(user._id)}
                            disabled={isActionDisabled(user)}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <Avatar className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700">
                              <AvatarImage 
                                src={user.profileImage || user.restaurant?.logo || user.restaurant?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <Badge className={`${getRoleColor(user.role)} w-fit`} variant="secondary">
                              <Shield className="w-3 h-3 mr-1" />
                              {user.role}
                            </Badge>
                            {user.isMasterAdmin && (
                              <Badge variant="outline" className="text-xs w-fit bg-yellow-50 text-yellow-800 border-yellow-300">
                                Master Admin
                              </Badge>
                            )}
                            {user.hasAdminAccess && !user.isMasterAdmin && (
                              <Badge variant="outline" className="text-xs w-fit">
                                Admin Access
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {user.restaurant ? (
                            <div className="space-y-1 min-w-[180px]">
                              <div className="font-medium text-sm flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{user.restaurant.name}</span>
                              </div>
                              {user.businessCategory && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {user.businessCategory}
                                </div>
                              )}
                              {user.businessType && (
                                <Badge variant="outline" className="text-xs w-fit">
                                  {user.businessType}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-sm">No business</span>
                          )}
                        </td>
                        <td className="p-3">
                          {user.restaurant?.subscription ? (
                            <div className="space-y-1 min-w-[140px]">
                              <Badge className={`${getSubscriptionStatusColor(user.restaurant.subscription.status)} w-fit`} variant="secondary">
                                {user.restaurant.subscription.plan}
                              </Badge>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {user.restaurant.subscription.status}
                              </div>
                              {user.restaurant.subscription.planPrice !== undefined && (
                                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                  ₹{user.restaurant.subscription.planPrice}/mo
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-sm">No subscription</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge className={`${getStatusColor(user.isActive)} w-fit`} variant="secondary">
                            {user.isActive ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1 min-w-[120px]">
                            <div className="text-sm">
                              {user.registration_through || 'N/A'}
                            </div>
                            {user.registered_by_admin && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                By: {user.registered_by_admin.name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1 min-w-[140px]">
                            <div className="text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            {user.lastLogin && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                Last: {new Date(user.lastLogin).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {isMasterAdmin(user) && (
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                  Master Admin - Actions Disabled
                                </div>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewDetails(user._id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEdit(user._id)}
                                disabled={isActionDisabled(user)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => user.isActive ? handleDeactivate(user._id, user) : handleActivate(user._id, user)}
                                className={user.isActive ? 'text-red-600' : 'text-green-600'}
                                disabled={isActionDisabled(user)}
                              >
                                {user.isActive ? (
                                  <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              {user.role !== 'admin' && !isActionDisabled(user) && (
                                <DropdownMenuItem onClick={() => handleChangeRole(user._id, 'admin', user)}>
                                  <Shield className="w-4 h-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                              {user.role === 'admin' && !user.isMasterAdmin && !isActionDisabled(user) && (
                                <DropdownMenuItem onClick={() => handleChangeRole(user._id, 'user', user)}>
                                  <UserCog className="w-4 h-4 mr-2" />
                                  Remove Admin
                                </DropdownMenuItem>
                              )}
                              {user.restaurant && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewBusiness(user.restaurant!._id)}>
                                    <Building2 className="w-4 h-4 mr-2" />
                                    View Business
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleAssignPlan(user._id)}
                                    disabled={isActionDisabled(user)}
                                  >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Assign Plan
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(user)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                disabled={isActionDisabled(user)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                        <SelectItem value="25">25</SelectItem>
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

      {/* User Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Complete Details</DialogTitle>
            <DialogDescription>All information about {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-20 w-20 border-2 border-slate-200 dark:border-slate-700">
                  <AvatarImage 
                    src={selectedUser.profileImage || selectedUser.restaurant?.logo || selectedUser.restaurant?.profileImage} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-2xl font-bold">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role)} variant="secondary">
                      <Shield className="w-3 h-3 mr-1" />
                      {selectedUser.role}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.isActive)} variant="secondary">
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {selectedUser.isMasterAdmin && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                        Master Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Full Name</label>
                      <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Email Address</label>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedUser.email}
                      </p>
                    </div>
                    {selectedUser.phone && (
                      <div>
                        <label className="text-xs text-muted-foreground">Phone Number</label>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedUser.phone}
                        </p>
                      </div>
                    )}
                    {selectedUser.address && (
                      <div>
                        <label className="text-xs text-muted-foreground">Address</label>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {selectedUser.address}
                        </p>
                      </div>
                    )}
                    {selectedUser.bio && (
                      <div>
                        <label className="text-xs text-muted-foreground">Bio</label>
                        <p className="font-medium">{selectedUser.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">User ID</label>
                      <p className="font-medium font-mono text-xs flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        {selectedUser._id}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedUser._id);
                            toast({
                              title: 'Success',
                              description: 'User ID copied to clipboard',
                            });
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Role</label>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(selectedUser.role)} variant="secondary">
                          {selectedUser.role}
                        </Badge>
                        {selectedUser.isMasterAdmin && (
                          <Badge variant="outline">Master Admin</Badge>
                        )}
                        {selectedUser.hasAdminAccess && !selectedUser.isMasterAdmin && (
                          <Badge variant="outline">Admin Access</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Status</label>
                      <Badge className={getStatusColor(selectedUser.isActive)} variant="secondary">
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Registration Method</label>
                      <p className="font-medium">{selectedUser.registration_through || 'N/A'}</p>
                    </div>
                    {selectedUser.registered_by_admin && (
                      <div>
                        <label className="text-xs text-muted-foreground">Registered By</label>
                        <p className="font-medium">{selectedUser.registered_by_admin.name} ({selectedUser.registered_by_admin.email})</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedUser.restaurant && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Business Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Business Name</label>
                          <p className="font-medium">{selectedUser.restaurant.name}</p>
                        </div>
                        {selectedUser.restaurant.email && (
                          <div>
                            <label className="text-xs text-muted-foreground">Business Email</label>
                            <p className="font-medium">{selectedUser.restaurant.email}</p>
                          </div>
                        )}
                        {selectedUser.businessCategory && (
                          <div>
                            <label className="text-xs text-muted-foreground">Business Category</label>
                            <p className="font-medium">{selectedUser.businessCategory}</p>
                          </div>
                        )}
                        {selectedUser.businessType && (
                          <div>
                            <label className="text-xs text-muted-foreground">Business Type</label>
                            <p className="font-medium">{selectedUser.businessType}</p>
                          </div>
                        )}
                      </div>
                      {selectedUser.restaurant.subscription && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Subscription Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-muted-foreground">Plan</label>
                              <p className="font-medium">{selectedUser.restaurant.subscription.plan}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Status</label>
                              <Badge className={getSubscriptionStatusColor(selectedUser.restaurant.subscription.status)} variant="secondary">
                                {selectedUser.restaurant.subscription.status}
                              </Badge>
                            </div>
                            {selectedUser.restaurant.subscription.planPrice !== undefined && (
                              <div>
                                <label className="text-xs text-muted-foreground">Price</label>
                                <p className="font-medium">₹{selectedUser.restaurant.subscription.planPrice}/month</p>
                              </div>
                            )}
                            {selectedUser.restaurant.subscription.billingCycle && (
                              <div>
                                <label className="text-xs text-muted-foreground">Billing Cycle</label>
                                <p className="font-medium capitalize">{selectedUser.restaurant.subscription.billingCycle}</p>
                              </div>
                            )}
                            {selectedUser.restaurant.subscription.startDate && (
                              <div>
                                <label className="text-xs text-muted-foreground">Start Date</label>
                                <p className="font-medium">{new Date(selectedUser.restaurant.subscription.startDate).toLocaleDateString()}</p>
                              </div>
                            )}
                            {selectedUser.restaurant.subscription.endDate && (
                              <div>
                                <label className="text-xs text-muted-foreground">End Date</label>
                                <p className="font-medium">{new Date(selectedUser.restaurant.subscription.endDate).toLocaleDateString()}</p>
                              </div>
                            )}
                            {selectedUser.restaurant.subscription.daysRemaining !== undefined && (
                              <div>
                                <label className="text-xs text-muted-foreground">Days Remaining</label>
                                <p className="font-medium">{selectedUser.restaurant.subscription.daysRemaining} days</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedUser.restaurant && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <UserCheck className="w-5 h-5" />
                        Onboarding Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Onboarding Status */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selectedUser.restaurant.onboardingCompleted 
                              ? 'bg-green-100 dark:bg-green-900' 
                              : 'bg-yellow-100 dark:bg-yellow-900'
                          }`}>
                            {selectedUser.restaurant.onboardingCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                            ) : (
                              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              Onboarding Status
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {selectedUser.restaurant.onboardingCompleted 
                                ? 'Completed' 
                                : 'In Progress'}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          className={
                            selectedUser.restaurant.onboardingCompleted
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }
                          variant="secondary"
                        >
                          {selectedUser.restaurant.onboardingCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Business Images */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Business Images & Media
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedUser.restaurant.logo && (
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Business Logo</label>
                              <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img
                                  src={selectedUser.restaurant.logo}
                                  alt="Business Logo"
                                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(selectedUser.restaurant!.logo, '_blank')}
                                  onError={(e) => {
                                    e.currentTarget.src = '/logo.svg';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {selectedUser.restaurant.ownerImage && (
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Owner Image</label>
                              <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img
                                  src={selectedUser.restaurant.ownerImage}
                                  alt="Owner Image"
                                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(selectedUser.restaurant!.ownerImage, '_blank')}
                                  onError={(e) => {
                                    e.currentTarget.src = '/logo.svg';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {selectedUser.restaurant.businessCardFront && (
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Business Card (Front)</label>
                              <div className="relative aspect-[1.6] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img
                                  src={selectedUser.restaurant.businessCardFront}
                                  alt="Business Card Front"
                                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(selectedUser.restaurant!.businessCardFront, '_blank')}
                                  onError={(e) => {
                                    e.currentTarget.src = '/logo.svg';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {selectedUser.restaurant.businessCardBack && (
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground">Business Card (Back)</label>
                              <div className="relative aspect-[1.6] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img
                                  src={selectedUser.restaurant.businessCardBack}
                                  alt="Business Card Back"
                                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(selectedUser.restaurant!.businessCardBack, '_blank')}
                                  onError={(e) => {
                                    e.currentTarget.src = '/logo.svg';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedUser.restaurant.foodImages && selectedUser.restaurant.foodImages.length > 0 && (
                          <div className="mt-4">
                            <label className="text-xs text-muted-foreground mb-2 block">Product/Menu Images ({selectedUser.restaurant.foodImages.length})</label>
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                              {selectedUser.restaurant.foodImages.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                  <img
                                    src={img}
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(img, '_blank')}
                                    onError={(e) => {
                                      e.currentTarget.src = '/logo.svg';
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location Information */}
                      {selectedUser.restaurant.location && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Location Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedUser.restaurant.location.address && (
                              <div>
                                <label className="text-xs text-muted-foreground">Address</label>
                                <p className="font-medium">{selectedUser.restaurant.location.address}</p>
                              </div>
                            )}
                            {selectedUser.restaurant.location.lat && selectedUser.restaurant.location.lng && (
                              <div>
                                <label className="text-xs text-muted-foreground">Coordinates</label>
                                <p className="font-medium font-mono text-sm">
                                  {selectedUser.restaurant.location.lat.toFixed(6)}, {selectedUser.restaurant.location.lng.toFixed(6)}
                                </p>
                                <a
                                  href={`https://www.google.com/maps?q=${selectedUser.restaurant.location.lat},${selectedUser.restaurant.location.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View on Google Maps
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Social Media Links */}
                      {selectedUser.restaurant.socialMedia && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Social Media & Links
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedUser.restaurant.socialMedia.facebook && (
                              <a
                                href={selectedUser.restaurant.socialMedia.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                              >
                                <Facebook className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium">Facebook</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                              </a>
                            )}
                            {selectedUser.restaurant.socialMedia.instagram && (
                              <a
                                href={selectedUser.restaurant.socialMedia.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                              >
                                <Instagram className="w-4 h-4 text-pink-600" />
                                <span className="text-sm font-medium">Instagram</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                              </a>
                            )}
                            {selectedUser.restaurant.socialMedia.twitter && (
                              <a
                                href={selectedUser.restaurant.socialMedia.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                              >
                                <Twitter className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium">Twitter</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                              </a>
                            )}
                            {selectedUser.restaurant.socialMedia.linkedin && (
                              <a
                                href={selectedUser.restaurant.socialMedia.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                              >
                                <Linkedin className="w-4 h-4 text-blue-700" />
                                <span className="text-sm font-medium">LinkedIn</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                              </a>
                            )}
                            {selectedUser.restaurant.socialMedia.website && (
                              <a
                                href={selectedUser.restaurant.socialMedia.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                              >
                                <Globe className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-medium">Website</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                              </a>
                            )}
                          </div>
                          {!selectedUser.restaurant.socialMedia.facebook && 
                           !selectedUser.restaurant.socialMedia.instagram && 
                           !selectedUser.restaurant.socialMedia.twitter && 
                           !selectedUser.restaurant.socialMedia.linkedin && 
                           !selectedUser.restaurant.socialMedia.website && (
                            <p className="text-sm text-muted-foreground">No social media links added</p>
                          )}
                        </div>
                      )}

                      {/* Business Address */}
                      {selectedUser.restaurant.address && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Business Address
                          </h4>
                          <div className="space-y-2">
                            {selectedUser.restaurant.address.street && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Street: </span>
                                <span className="font-medium">{selectedUser.restaurant.address.street}</span>
                              </p>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              {selectedUser.restaurant.address.city && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">City: </span>
                                  <span className="font-medium">{selectedUser.restaurant.address.city}</span>
                                </p>
                              )}
                              {selectedUser.restaurant.address.state && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">State: </span>
                                  <span className="font-medium">{selectedUser.restaurant.address.state}</span>
                                </p>
                              )}
                              {selectedUser.restaurant.address.zipCode && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">ZIP Code: </span>
                                  <span className="font-medium">{selectedUser.restaurant.address.zipCode}</span>
                                </p>
                              )}
                              {selectedUser.restaurant.address.country && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Country: </span>
                                  <span className="font-medium">{selectedUser.restaurant.address.country}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Timestamps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Created At</label>
                        <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                      </div>
                      {selectedUser.updatedAt && (
                        <div>
                          <label className="text-xs text-muted-foreground">Last Updated</label>
                          <p className="font-medium">{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                        </div>
                      )}
                      {selectedUser.lastLogin && (
                        <div>
                          <label className="text-xs text-muted-foreground">Last Login</label>
                          <p className="font-medium">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setViewDialogOpen(false);
                if (selectedUser && !isActionDisabled(selectedUser)) {
                  setEditUser(selectedUser);
                  setEditDialogOpen(true);
                }
              }}
              disabled={selectedUser ? isActionDisabled(selectedUser) : false}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information for {editUser?.name}</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    value={editUser.phone || ''}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                {editUser.restaurant && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Business Name</label>
                      <Input
                        value={editUser.restaurant.name}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          restaurant: { ...editUser.restaurant!, name: e.target.value }
                        })}
                        placeholder="Enter business name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Business Category</label>
                      <Select
                        value={editUser.businessCategory || editUser.restaurant.businessCategory || ''}
                        onValueChange={(value) => setEditUser({ ...editUser, businessCategory: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Food Mall">Food Mall</SelectItem>
                          <SelectItem value="Retail / E-Commerce businesses">Retail / E-Commerce</SelectItem>
                          <SelectItem value="Creative & Design businesses">Creative & Design</SelectItem>
                          <SelectItem value="Portfolio">Portfolio</SelectItem>
                          <SelectItem value="Agencies & Studios">Agencies & Studios</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Business Type</label>
                      <Input
                        value={editUser.businessType || editUser.restaurant.businessType || ''}
                        onChange={(e) => setEditUser({ ...editUser, businessType: e.target.value })}
                        placeholder="Enter business type"
                      />
                    </div>
                  </>
                )}
              </div>
              {isMasterAdmin(editUser) && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Master Admin accounts have limited editing capabilities for security reasons.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              setEditUser(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isSaving || (editUser ? isActionDisabled(editUser) : false)}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
              <br /><br />
              This action cannot be undone. This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The user account</li>
                {userToDelete?.restaurant && <li>Associated business/restaurant</li>}
                <li>All related data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDelete(userToDelete._id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUsers.size} user(s)</strong>?
              <br /><br />
              This action cannot be undone. This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All selected user accounts</li>
                <li>Associated businesses/restaurants</li>
                <li>All related data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedUsers.size} User(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}