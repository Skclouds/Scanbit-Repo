import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield, RefreshCw, Users, Crown, Search, CheckCircle2, Settings,
  Building2, CreditCard, BarChart3, Megaphone, MessageSquare, Globe, Package,
  Filter, ArrowUpDown, ArrowUp, ArrowDown, Mail, Phone, Calendar, Clock,
  UserCog, XCircle, CheckCircle, MoreVertical, Eye, Edit, ChevronLeft,
  ChevronsLeft, ChevronRight, ChevronsRight, UserCheck, UserX, Archive,
  TrendingUp, TrendingDown, Receipt, Plus, QrCode, BookOpen, Star, Send,
  Briefcase, Activity, UserPlus, Play, Pause, Target
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Comprehensive permission interface matching all admin dashboard menu items
interface UserPermissions extends Record<string, boolean | undefined> {
  // Dashboard
  viewDashboard?: boolean;
  
  // Businesses
  viewBusinesses?: boolean;
  viewBusinessCategories?: boolean;
  viewPendingBusinesses?: boolean;
  viewArchivedBusinesses?: boolean;
  createBusiness?: boolean;
  editBusiness?: boolean;
  deleteBusiness?: boolean;
  approveBusinesses?: boolean;
  archiveBusinesses?: boolean;
  manageBusinessCategories?: boolean;
  
  // Users
  viewUsers?: boolean;
  addUser?: boolean;
  editUsers?: boolean;
  deleteUsers?: boolean;
  manageRoles?: boolean;
  viewUserActivity?: boolean;
  
  // Subscriptions
  viewSubscriptions?: boolean;
  viewActiveSubscriptions?: boolean;
  viewExpiredSubscriptions?: boolean;
  viewPaymentHistory?: boolean;
  viewRenewals?: boolean;
  manageSubscriptions?: boolean;
  processRefunds?: boolean;
  
  // Plans
  viewPlans?: boolean;
  createPlans?: boolean;
  editPlans?: boolean;
  deletePlans?: boolean;
  manageCustomPlans?: boolean;
  viewUsersCustomPlans?: boolean;
  assignPlans?: boolean;
  
  // Advertisements
  viewAdsDashboard?: boolean;
  createAds?: boolean;
  viewActiveAds?: boolean;
  viewPausedAds?: boolean;
  viewScheduledAds?: boolean;
  viewDraftAds?: boolean;
  viewAdAnalytics?: boolean;
  manageAdSettings?: boolean;
  
  // Analytics
  viewAnalytics?: boolean;
  viewBusinessAnalytics?: boolean;
  viewRevenueAnalytics?: boolean;
  viewQRAnalytics?: boolean;
  exportReports?: boolean;
  
  // Support
  viewHelpDesk?: boolean;
  viewSupportTickets?: boolean;
  manageKnowledgeBase?: boolean;
  manageFAQs?: boolean;
  viewSupportAnalytics?: boolean;
  
  // Website Customization
  manageGeneralSettings?: boolean;
  manageLogoBranding?: boolean;
  manageTypography?: boolean;
  manageColorsTheme?: boolean;
  manageLayoutStructure?: boolean;
  manageImagesMedia?: boolean;
  manageAnimationsEffects?: boolean;
  manageSectionsComponents?: boolean;
  manageSEO?: boolean;
  previewPublish?: boolean;
  manageOurServices?: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  profileImage?: string;
  isActive: boolean;
  isMasterAdmin?: boolean;
  hasAdminAccess?: boolean;
  businessName?: string;
  businessCategory?: string;
  businessType?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  permissions?: UserPermissions;
  restaurant?: {
    name?: string;
  };
}

type SortField = 'name' | 'email' | 'role' | 'permissions' | 'createdAt' | 'lastLogin';
type SortOrder = 'asc' | 'desc';

// Permission categories matching actual admin dashboard structure
const permissionCategories = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    color: "blue",
    menuItemId: "dashboard",
    permissions: [
      { 
        key: "viewDashboard", 
        label: "View Dashboard", 
        description: "Access main dashboard and overview statistics",
        menuItemId: "dashboard"
      },
    ]
  },
  {
    id: "businesses",
    label: "Businesses",
    icon: Building2,
    color: "purple",
    menuItemId: "restaurants",
    permissions: [
      { 
        key: "viewBusinesses", 
        label: "All Businesses", 
        description: "View all businesses and their details",
        menuItemId: "restaurants"
      },
      { 
        key: "viewBusinessCategories", 
        label: "Business Categories", 
        description: "View and manage business categories",
        menuItemId: "businesses-categories"
      },
      { 
        key: "viewPendingBusinesses", 
        label: "Pending Approval", 
        description: "View businesses pending approval",
        menuItemId: "businesses-pending"
      },
      { 
        key: "viewArchivedBusinesses", 
        label: "Archived Businesses", 
        description: "View archived businesses",
        menuItemId: "businesses-archived"
      },
      { 
        key: "createBusiness", 
        label: "Create Business", 
        description: "Add new businesses to the system",
        menuItemId: null
      },
      { 
        key: "editBusiness", 
        label: "Edit Business", 
        description: "Modify business information and settings",
        menuItemId: null
      },
      { 
        key: "deleteBusiness", 
        label: "Delete Business", 
        description: "Remove businesses from the system",
        menuItemId: null
      },
      { 
        key: "approveBusinesses", 
        label: "Approve Businesses", 
        description: "Approve pending business registrations",
        menuItemId: null
      },
      { 
        key: "archiveBusinesses", 
        label: "Archive Businesses", 
        description: "Archive and restore businesses",
        menuItemId: null
      },
      { 
        key: "manageBusinessCategories", 
        label: "Manage Categories", 
        description: "Create and manage business categories",
        menuItemId: null
      },
    ]
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    color: "green",
    menuItemId: "users",
    permissions: [
      { 
        key: "viewUsers", 
        label: "All Users", 
        description: "View all users and their profiles",
        menuItemId: "users"
      },
      { 
        key: "addUser", 
        label: "Add User", 
        description: "Add new users to the system",
        menuItemId: "users-add"
      },
      { 
        key: "manageRoles", 
        label: "Roles & Permissions", 
        description: "Assign roles and permissions to users",
        menuItemId: "users-roles"
      },
      { 
        key: "viewUserActivity", 
        label: "User Activity", 
        description: "Monitor user activity and logs",
        menuItemId: "users-activity"
      },
      { 
        key: "editUsers", 
        label: "Edit Users", 
        description: "Modify user information and settings",
        menuItemId: null
      },
      { 
        key: "deleteUsers", 
        label: "Delete Users", 
        description: "Remove users from the system",
        menuItemId: null
      },
    ]
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    color: "orange",
    menuItemId: "subscriptions",
    permissions: [
      { 
        key: "viewSubscriptions", 
        label: "All Subscriptions", 
        description: "View all subscription plans and status",
        menuItemId: "subscriptions"
      },
      { 
        key: "viewActiveSubscriptions", 
        label: "Active Plans", 
        description: "View active subscription plans",
        menuItemId: "subscriptions-active"
      },
      { 
        key: "viewExpiredSubscriptions", 
        label: "Expired Plans", 
        description: "View expired subscription plans",
        menuItemId: "subscriptions-expired"
      },
      { 
        key: "viewPaymentHistory", 
        label: "Payment History", 
        description: "Access payment history and transactions",
        menuItemId: "subscriptions-payments"
      },
      { 
        key: "viewRenewals", 
        label: "Renewals", 
        description: "View upcoming subscription renewals",
        menuItemId: "subscriptions-renewals"
      },
      { 
        key: "manageSubscriptions", 
        label: "Manage Subscriptions", 
        description: "Activate, pause, or cancel subscriptions",
        menuItemId: null
      },
      { 
        key: "processRefunds", 
        label: "Process Refunds", 
        description: "Issue refunds and handle payment disputes",
        menuItemId: null
      },
    ]
  },
  {
    id: "plans",
    label: "Custom Plans",
    icon: Package,
    color: "pink",
    menuItemId: "plans",
    permissions: [
      { 
        key: "viewPlans", 
        label: "All Plans", 
        description: "View all subscription plans",
        menuItemId: "plans"
      },
      { 
        key: "createPlans", 
        label: "Create Plan", 
        description: "Create new subscription plans",
        menuItemId: "plans-create"
      },
      { 
        key: "editPlans", 
        label: "Manage Plans", 
        description: "Modify existing plans and pricing",
        menuItemId: "plans-manage"
      },
      { 
        key: "deletePlans", 
        label: "Delete Plans", 
        description: "Remove plans from the system",
        menuItemId: null
      },
      { 
        key: "manageCustomPlans", 
        label: "Manage Custom Plans", 
        description: "Create and manage user-specific custom plans",
        menuItemId: null
      },
      { 
        key: "assignPlans", 
        label: "Assign Plans", 
        description: "Assign plans to users manually",
        menuItemId: null
      },
    ]
  },
  {
    id: "advertisements",
    label: "Advertisement Manager",
    icon: Megaphone,
    color: "red",
    menuItemId: "ads-dashboard",
    permissions: [
      { 
        key: "viewAdsDashboard", 
        label: "Ads Dashboard", 
        description: "View advertisement dashboard and overview",
        menuItemId: "ads-dashboard"
      },
      { 
        key: "createAds", 
        label: "Create Ad", 
        description: "Create new ad campaigns",
        menuItemId: "ads-create"
      },
      { 
        key: "viewActiveAds", 
        label: "Active Ads", 
        description: "View active advertisements",
        menuItemId: "ads-active"
      },
      { 
        key: "viewPausedAds", 
        label: "Paused Ads", 
        description: "View paused advertisements",
        menuItemId: "ads-paused"
      },
      { 
        key: "viewScheduledAds", 
        label: "Scheduled Ads", 
        description: "View scheduled advertisements",
        menuItemId: "ads-scheduled"
      },
      { 
        key: "viewDraftAds", 
        label: "Draft Ads", 
        description: "View draft advertisements",
        menuItemId: "ads-drafts"
      },
      { 
        key: "viewAdAnalytics", 
        label: "Ad Analytics", 
        description: "Access advertisement performance metrics",
        menuItemId: "ads-analytics"
      },
      { 
        key: "manageAdSettings", 
        label: "Ad Settings", 
        description: "Configure advertisement system settings",
        menuItemId: "ads-settings"
      },
    ]
  },
  {
    id: "analytics",
    label: "Analytics & Reports",
    icon: BarChart3,
    color: "indigo",
    menuItemId: "analytics",
    permissions: [
      { 
        key: "viewAnalytics", 
        label: "Analytics Overview", 
        description: "Access main analytics dashboard",
        menuItemId: "analytics"
      },
      { 
        key: "viewBusinessAnalytics", 
        label: "Business Analytics", 
        description: "View business performance metrics",
        menuItemId: "analytics-businesses"
      },
      { 
        key: "viewRevenueAnalytics", 
        label: "Revenue Analytics", 
        description: "Access revenue and financial reports",
        menuItemId: "analytics-revenue"
      },
      { 
        key: "viewQRAnalytics", 
        label: "QR Scan Analytics", 
        description: "View QR code scan statistics",
        menuItemId: "analytics-qr"
      },
      { 
        key: "exportReports", 
        label: "Export Reports", 
        description: "Download and export analytics reports",
        menuItemId: null
      },
    ]
  },
  {
    id: "support",
    label: "Support Center",
    icon: MessageSquare,
    color: "teal",
    menuItemId: "support-help",
    permissions: [
      { 
        key: "viewHelpDesk", 
        label: "Help Desk", 
        description: "Access support center and help desk",
        menuItemId: "support-help"
      },
      { 
        key: "viewSupportTickets", 
        label: "Support Tickets", 
        description: "Handle support tickets and customer inquiries",
        menuItemId: "support-tickets"
      },
      { 
        key: "manageKnowledgeBase", 
        label: "Knowledge Base", 
        description: "Create and edit knowledge base articles",
        menuItemId: "support-knowledge"
      },
      { 
        key: "manageFAQs", 
        label: "FAQs", 
        description: "Create and manage FAQ content",
        menuItemId: "support-faqs"
      },
      { 
        key: "viewSupportAnalytics", 
        label: "Support Analytics", 
        description: "View support performance metrics",
        menuItemId: "support-analytics"
      },
    ]
  },
  {
    id: "website",
    label: "Website Customization",
    icon: Globe,
    color: "cyan",
    menuItemId: "website-general",
    permissions: [
      { 
        key: "manageGeneralSettings", 
        label: "General Settings", 
        description: "Manage website general settings",
        menuItemId: "website-general"
      },
      { 
        key: "manageLogoBranding", 
        label: "Logo & Branding", 
        description: "Customize logo, colors, and branding",
        menuItemId: "website-logo"
      },
      { 
        key: "manageTypography", 
        label: "Typography", 
        description: "Customize website typography",
        menuItemId: "website-typography"
      },
      { 
        key: "manageColorsTheme", 
        label: "Colors & Theme", 
        description: "Customize website colors and theme",
        menuItemId: "website-colors"
      },
      { 
        key: "manageLayoutStructure", 
        label: "Layout & Structure", 
        description: "Customize website layout and structure",
        menuItemId: "website-layout"
      },
      { 
        key: "manageImagesMedia", 
        label: "Images & Media", 
        description: "Manage website images and media",
        menuItemId: "website-images"
      },
      { 
        key: "manageAnimationsEffects", 
        label: "Animations & Effects", 
        description: "Customize animations and effects",
        menuItemId: "website-animations"
      },
      { 
        key: "manageSectionsComponents", 
        label: "Sections & Components", 
        description: "Manage website sections and components",
        menuItemId: "website-sections"
      },
      { 
        key: "manageSEO", 
        label: "SEO & Meta Tags", 
        description: "Manage SEO settings and meta tags",
        menuItemId: "website-seo"
      },
      { 
        key: "previewPublish", 
        label: "Preview & Publish", 
        description: "Preview and publish website changes",
        menuItemId: "website-preview"
      },
      { 
        key: "manageOurServices", 
        label: "Our Services", 
        description: "Manage our services section",
        menuItemId: "website-services"
      },
    ]
  },
];

export default function RolesPermissions() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminUsers({ 
        page: 1, 
        limit: 1000,
        includeAdmins: true 
      });
      if (response.success && response.data) {
        const usersWithPermissions = response.data.map((user: User) => ({
          ...user,
          permissions: user.permissions || getDefaultPermissions(user.role === "admin")
        }));
        setUsers(usersWithPermissions);
        setTotal(usersWithPermissions.length);
      }
    } catch (error) {

      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPermissions = (isAdmin: boolean): UserPermissions => {
    if (isAdmin) {
      const allPermissions: UserPermissions = {};
      permissionCategories.forEach(category => {
        category.permissions.forEach(perm => {
          allPermissions[perm.key as keyof UserPermissions] = true;
        });
      });
      return allPermissions;
    }
    return {};
  };

  const toggleAdminRole = async (user: User) => {
    if (user.isMasterAdmin || user.email === 'rudranshdevelopment@gmail.com') {
      toast({
        title: 'Error',
        description: 'Master Admin account cannot be modified. This account is protected.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      const newPermissions = newRole === "admin" ? getDefaultPermissions(true) : {};
      await api.updateAdminUser(user._id, { role: newRole, permissions: newPermissions });
      toast({
        title: 'Success',
        description: newRole === "admin" ? `${user.name} is now an Administrator` : `Admin privileges revoked from ${user.name}`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || "Failed to update user role",
        variant: 'destructive',
      });
    }
  };

  const togglePermission = async (user: User, permissionKey: keyof UserPermissions) => {
    try {
      const updatedPermissions = {
        ...user.permissions,
        [permissionKey]: !user.permissions?.[permissionKey]
      };
      await api.updateAdminUser(user._id, { permissions: updatedPermissions });
      setUsers(users.map(u => u._id === user._id ? { ...u, permissions: updatedPermissions } : u));
      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser({ ...selectedUser, permissions: updatedPermissions });
      }
      toast({
        title: 'Success',
        description: "Permission updated successfully",
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || "Failed to update permission",
        variant: 'destructive',
      });
    }
  };

  const toggleAllCategoryPermissions = async (user: User, categoryId: string, enable: boolean) => {
    try {
      const category = permissionCategories.find(c => c.id === categoryId);
      if (!category) return;
      const updatedPermissions = { ...user.permissions };
      category.permissions.forEach(perm => {
        updatedPermissions[perm.key as keyof UserPermissions] = enable;
      });
      await api.updateAdminUser(user._id, { permissions: updatedPermissions });
      setUsers(users.map(u => u._id === user._id ? { ...u, permissions: updatedPermissions } : u));
      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser({ ...selectedUser, permissions: updatedPermissions });
      }
      toast({
        title: 'Success',
        description: `${enable ? 'Enabled' : 'Disabled'} all ${category.label} permissions`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || "Failed to update permissions",
        variant: 'destructive',
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const getTotalPermissions = (user: User) => {
    if (user.role === "admin") {
      return permissionCategories.reduce((sum, cat) => sum + cat.permissions.length, 0);
    }
    return user.permissions ? Object.values(user.permissions).filter(Boolean).length : 0;
  };

  const getCategoryPermissionCount = (user: User, categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category || !user.permissions) return 0;
    return category.permissions.filter(perm => user.permissions?.[perm.key as keyof UserPermissions]).length;
  };

  const isCategoryFullyEnabled = (user: User, categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category || !user.permissions) return false;
    return category.permissions.every(perm => user.permissions?.[perm.key as keyof UserPermissions]);
  };

  const isMasterAdmin = (user: User) => {
    return user.isMasterAdmin || user.email === 'rudranshdevelopment@gmail.com';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchUsers();
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

  const handleOpenPermissionsDialog = async (user: User) => {
    try {
      const response = await api.getAdminUser(user._id);
      if (response.success && response.data) {
        const userWithPermissions = {
          ...response.data,
          permissions: response.data.permissions || getDefaultPermissions(response.data.role === "admin")
        };
        setSelectedUser(userWithPermissions);
        setPermissionsDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive',
      });
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      await api.updateAdminUser(selectedUser._id, { permissions: selectedUser.permissions });
      toast({
        title: 'Success',
        description: 'Permissions saved successfully',
      });
      setPermissionsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save permissions',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    filtered = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'permissions':
          aValue = getTotalPermissions(a);
          bValue = getTotalPermissions(b);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'lastLogin':
          aValue = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          bValue = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredAndSortedUsers.slice(start, end);
  }, [filteredAndSortedUsers, page, limit]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / limit);

  const adminUsers = users.filter(u => u.role === "admin");
  const regularUsers = users.filter(u => u.role !== "admin");

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
      green: 'bg-gradient-to-br from-green-500 to-green-600',
      orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
      pink: 'bg-gradient-to-br from-pink-500 to-pink-600',
      red: 'bg-gradient-to-br from-red-500 to-red-600',
      indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      teal: 'bg-gradient-to-br from-teal-500 to-teal-600',
      cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    };
    return colorMap[color] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Roles & Permissions</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Comprehensive access control for all admin features</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2 text-purple-900 dark:text-purple-100">{users.length}</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  {regularUsers.length} regular users
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-500 dark:text-purple-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Administrators</p>
                <p className="text-3xl font-bold mt-2 text-orange-900 dark:text-orange-100">{adminUsers.length}</p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  {users.length > 0 ? Math.round((adminUsers.length / users.length) * 100) : 0}% of total
                </p>
              </div>
              <Crown className="w-10 h-10 text-orange-500 dark:text-orange-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Regular Users</p>
                <p className="text-3xl font-bold mt-2 text-green-900 dark:text-green-100">{regularUsers.length}</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {users.length > 0 ? Math.round((regularUsers.length / users.length) * 100) : 0}% of total
                </p>
              </div>
              <UserCheck className="w-10 h-10 text-green-500 dark:text-green-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Permission Categories</p>
                <p className="text-3xl font-bold mt-2 text-blue-900 dark:text-blue-100">{permissionCategories.length}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {permissionCategories.reduce((sum, cat) => sum + cat.permissions.length, 0)} total permissions
                </p>
              </div>
              <Shield className="w-10 h-10 text-blue-500 dark:text-blue-400 opacity-20" />
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
          <CardDescription>Filter and sort users by role, status, and more</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={roleFilter} onValueChange={(value: any) => { setRoleFilter(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value: any) => { setStatusFilter(value); setPage(1); }}>
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
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortField} onValueChange={(value: any) => { setSortField(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="permissions">Permissions Count</SelectItem>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="lastLogin">Last Login</SelectItem>
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
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Users ({filteredAndSortedUsers.length})</CardTitle>
              <CardDescription className="mt-1">
                Showing {((page - 1) * limit) + 1} to{' '}
                {Math.min(page * limit, filteredAndSortedUsers.length)} of{' '}
                {filteredAndSortedUsers.length} users
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No users available'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
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
                      <th className="text-left p-3 font-semibold cursor-pointer" onClick={() => handleSort('permissions')}>
                        <div className="flex items-center gap-1">
                          Permissions
                          {getSortIcon('permissions')}
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold cursor-pointer" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center gap-1">
                          Created
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <Avatar className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700">
                              <AvatarImage 
                                src={user.profileImage || user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                              />
                              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white font-semibold">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <Badge 
                              className={user.role === 'admin' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 w-fit' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 w-fit'
                              } 
                              variant="secondary"
                            >
                              {user.role === 'admin' ? (
                                <>
                                  <Crown className="w-3 h-3 mr-1" />
                                  Administrator
                                </>
                              ) : (
                                <>
                                  <Users className="w-3 h-3 mr-1" />
                                  User
                                </>
                              )}
                            </Badge>
                            {user.isMasterAdmin && (
                              <Badge variant="outline" className="text-xs w-fit bg-yellow-50 text-yellow-800 border-yellow-300">
                                Master Admin
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {getTotalPermissions(user)} / {permissionCategories.reduce((sum, cat) => sum + cat.permissions.length, 0)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {user.role === 'admin' ? 'All enabled' : `${getTotalPermissions(user)} enabled`}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge 
                            className={user.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 w-fit' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 w-fit'
                            } 
                            variant="secondary"
                          >
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
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPermissionsDialog(user)}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Manage
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => toggleAdminRole(user)}
                                  disabled={isMasterAdmin(user)}
                                >
                                  {user.role === 'admin' ? (
                                    <>
                                      <UserCog className="w-4 h-4 mr-2" />
                                      Remove Admin
                                    </>
                                  ) : (
                                    <>
                                      <Crown className="w-4 h-4 mr-2" />
                                      Make Admin
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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

      {/* Manage Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
          <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Manage Permissions - {selectedUser?.name}
              </DialogTitle>
              <DialogDescription>
                Configure access permissions for {selectedUser?.email}. Toggle permissions to control which admin dashboard features this user can access.
              </DialogDescription>
            </DialogHeader>
          </div>
          {selectedUser && (
            <ScrollArea className="flex-1 min-h-0 px-6">
              <div className="space-y-6 py-4 pr-4">
                {/* User Info Header */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <Avatar className="h-16 w-16 border-2 border-purple-200 dark:border-purple-700">
                    <AvatarImage 
                      src={selectedUser.profileImage || selectedUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xl font-bold">
                      {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        className={selectedUser.role === 'admin' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        } 
                        variant="secondary"
                      >
                        {selectedUser.role === 'admin' ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Administrator
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            User
                          </>
                        )}
                      </Badge>
                      <Badge 
                        className={selectedUser.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        } 
                        variant="secondary"
                      >
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {selectedUser.isMasterAdmin && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                          Master Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {getTotalPermissions(selectedUser)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Permissions Enabled
                    </div>
                  </div>
                </div>

                {/* Admin Role Toggle */}
                {!isMasterAdmin(selectedUser) && (
                  <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-semibold">
                            {selectedUser.role === "admin" ? "Administrator Role" : "Grant Administrator Role"}
                          </Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {selectedUser.role === "admin" 
                              ? "This user has full system access with all permissions enabled" 
                              : "Grant full administrator access with all permissions"}
                          </p>
                        </div>
                        <Switch 
                          checked={selectedUser.role === "admin"} 
                          onCheckedChange={() => toggleAdminRole(selectedUser)} 
                          className="data-[state=checked]:bg-purple-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedUser.role === "admin" && (
                  <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                            Administrator Permissions
                          </p>
                          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                            Administrators have all permissions enabled by default and cannot be modified individually. 
                            To customize permissions, first remove the administrator role.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Permission Categories - Organized by Dashboard Sections */}
                {selectedUser.role !== "admin" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">Admin Dashboard Access Permissions</h4>
                      <div className="text-sm text-slate-500">
                        {getTotalPermissions(selectedUser)} of {permissionCategories.reduce((sum, cat) => sum + cat.permissions.length, 0)} permissions enabled
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      {permissionCategories.map(category => {
                        const Icon = category.icon;
                        const enabledCount = getCategoryPermissionCount(selectedUser, category.id);
                        const totalCount = category.permissions.length;
                        const isFullyEnabled = isCategoryFullyEnabled(selectedUser, category.id);
                        
                        return (
                          <Card key={category.id} className="border-2">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg ${getColorClasses(category.color)} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-base">{category.label}</CardTitle>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      {enabledCount} of {totalCount} permissions enabled
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => toggleAllCategoryPermissions(selectedUser, category.id, !isFullyEnabled)}
                                >
                                  {isFullyEnabled ? "Disable All" : "Enable All"}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {category.permissions.map(permission => {
                                  const isMenuItem = permission.menuItemId !== null;
                                  return (
                                    <div 
                                      key={permission.key} 
                                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                        isMenuItem 
                                          ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800' 
                                          : 'bg-slate-50 dark:bg-slate-900'
                                      } hover:bg-slate-100 dark:hover:bg-slate-800`}
                                    >
                                      <div className="flex-1 mr-3">
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {permission.label}
                                          </p>
                                          {isMenuItem && (
                                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300">
                                              Menu Item
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                          {permission.description}
                                        </p>
                                        {isMenuItem && (
                                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                                            Controls: {permission.menuItemId}
                                          </p>
                                        )}
                                      </div>
                                      <Switch
                                        checked={selectedUser.permissions?.[permission.key as keyof UserPermissions] || false}
                                        onCheckedChange={() => togglePermission(selectedUser, permission.key as keyof UserPermissions)}
                                        className="data-[state=checked]:bg-purple-600"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <div className="px-6 py-4 border-t bg-slate-50 dark:bg-slate-900">
            <DialogFooter className="sm:justify-end">
              <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSavePermissions}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Permissions
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}