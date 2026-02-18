import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Users,
  TrendingUp,
  DollarSign,
  Package,
  MoreVertical,
  Check,
  X,
  Crown,
  Zap,
  Calendar,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  Plus,
  AlertTriangle,
  Building2,
  Settings,
  CheckCircle2
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
import { toast } from "sonner";
import api from "@/lib/api";
import { useSearchParams } from "react-router-dom";

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  businessCategory: string;
  features: string[] | any;
  featuresList?: string[];
  isActive: boolean;
  userCount?: number;
  revenue?: number;
  createdAt: string;
  updatedAt?: string;
  isCustom?: boolean;
  assignedToUser?: any;
  limits?: {
    maxMenuItems?: number;
    maxCategories?: number;
    customDomain?: boolean;
    analytics?: boolean;
    prioritySupport?: boolean;
  };
}

type SortField = 'name' | 'price' | 'duration' | 'userCount' | 'revenue' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function AllPlans() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Plan>>({});

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminPlans({});
      if (response.success && response.data) {
        const normalizedPlans = response.data.map((plan: Plan) => ({
          ...plan,
          features: Array.isArray(plan.features) 
            ? plan.features 
            : Array.isArray((plan as any).featuresList) 
              ? (plan as any).featuresList 
              : [],
          userCount: plan.userCount || 0,
          revenue: plan.revenue || 0,
        }));
        setPlans(normalizedPlans);
      }
    } catch (error) {

      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPlans();
      toast.success("Plans refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh plans");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleView = async (plan: Plan) => {
    try {
      const response = await api.getAdminPlan(plan._id);
      if (response.success && response.data) {
        setSelectedPlan(response.data);
        setViewDialogOpen(true);
      }
    } catch (error) {
      toast.error("Failed to fetch plan details");
    }
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setEditForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      businessCategory: plan.businessCategory,
      features: plan.features,
      isActive: plan.isActive,
      limits: plan.limits || {},
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPlan) return;

    // Validation
    if (!editForm.name || !editForm.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!editForm.price || editForm.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!editForm.duration || editForm.duration <= 0) {
      toast.error("Please enter a valid duration (days)");
      return;
    }
    if (!editForm.businessCategory) {
      toast.error("Please select a business category");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.updateAdminPlan(selectedPlan._id, editForm);
      if (response.success) {
        toast.success("Plan updated successfully");
        setEditDialogOpen(false);
        await fetchPlans();
      } else {
        toast.error(response.message || "Failed to update plan");
      }
    } catch (error: any) {

      toast.error(error.message || "Failed to update plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    try {
      const response = await api.deleteAdminPlan(planToDelete._id);
      if (response.success) {
        toast.success(response.message || "Plan deleted successfully");
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
        await fetchPlans(); // Refresh the plans list
      } else {
        toast.error(response.message || "Failed to delete plan");
      }
    } catch (error: any) {

      toast.error(error.message || "Failed to delete plan");
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const response = await api.updateAdminPlan(plan._id, { isActive: !plan.isActive });
      if (response.success) {
        toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchPlans();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update plan status");
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Description', 'Price', 'Duration', 'Category', 'Status', 'Users', 'Revenue', 'Features'].join(','),
      ...filteredAndSortedPlans.map(plan => [
        `"${plan.name}"`,
        `"${plan.description}"`,
        plan.price,
        plan.duration,
        `"${plan.businessCategory}"`,
        plan.isActive ? 'Active' : 'Inactive',
        plan.userCount || 0,
        plan.revenue || 0,
        `"${Array.isArray(plan.features) ? plan.features.join('; ') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plans-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Plans exported successfully");
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

  const getPlanIcon = (name: string) => {
    if (name.toLowerCase().includes("pro") || name.toLowerCase().includes("premium")) {
      return <Crown className="w-4 h-4" />;
    }
    if (name.toLowerCase().includes("basic")) {
      return <Package className="w-4 h-4" />;
    }
    return <Zap className="w-4 h-4" />;
  };

  const getPlanColor = (name: string) => {
    if (name.toLowerCase().includes("pro") || name.toLowerCase().includes("premium")) {
      return "from-purple-500 to-purple-600";
    }
    if (name.toLowerCase().includes("basic")) {
      return "from-blue-500 to-blue-600";
    }
    return "from-green-500 to-green-600";
  };

  // Filter and sort plans
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = plans;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(plan =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(plan => plan.businessCategory === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(plan =>
        statusFilter === "active" ? plan.isActive : !plan.isActive
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'userCount':
          aValue = a.userCount || 0;
          bValue = b.userCount || 0;
          break;
        case 'revenue':
          aValue = a.revenue || 0;
          bValue = b.revenue || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [plans, searchQuery, categoryFilter, statusFilter, sortField, sortOrder]);

  // Pagination
  const paginatedPlans = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredAndSortedPlans.slice(start, end);
  }, [filteredAndSortedPlans, page, limit]);

  const totalPages = Math.ceil(filteredAndSortedPlans.length / limit);

  // Stats
  const stats = useMemo(() => {
    const totalRevenue = plans.reduce((sum, plan) => sum + (plan.revenue || 0), 0);
    const totalUsers = plans.reduce((sum, plan) => sum + (plan.userCount || 0), 0);
    const activePlans = plans.filter(p => p.isActive).length;
    return { totalRevenue, totalUsers, activePlans };
  }, [plans]);

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Fetch business categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getBusinessCategories();
        if (response.success && response.data && Array.isArray(response.data)) {
          const catNames = response.data
            .filter((cat: any) => cat.isActive !== false)
            .map((cat: any) => cat.name)
            .filter(Boolean);
          if (catNames.length > 0) {
            setAvailableCategories(catNames);
          }
        }
      } catch (error) {

      }
    };
    fetchCategories();
  }, []);

  // Get unique categories from plans (fallback)
  const categories = useMemo(() => {
    if (availableCategories.length > 0) {
      return availableCategories;
    }
    const cats = new Set(plans.map(p => p.businessCategory).filter(Boolean));
    return Array.from(cats);
  }, [plans, availableCategories]);

  if (loading && plans.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">All Plans</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage subscription plans and pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={plans.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setResetDialogOpen(true)}
            disabled={isResetting}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            Reset Plans
          </Button>
          <Button size="sm" onClick={() => setSearchParams({ activeTab: 'plans-create' })}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Plans</p>
                <p className="text-3xl font-bold mt-2 text-indigo-900 dark:text-indigo-100">{plans.length}</p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                  {filteredAndSortedPlans.length} filtered
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-indigo-500 dark:text-indigo-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Active Plans</p>
                <p className="text-3xl font-bold mt-2 text-green-900 dark:text-green-100">{stats.activePlans}</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {plans.length > 0 ? Math.round((stats.activePlans / plans.length) * 100) : 0}% of total
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2 text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Across all plans
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
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 text-purple-900 dark:text-purple-100">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  All time revenue
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-500 dark:text-purple-400 opacity-20" />
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
          <CardDescription>Filter and sort plans by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
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
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="userCount">Users</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="createdAt">Date Created</SelectItem>
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
          {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
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

      {/* Plans Grid */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Plans ({filteredAndSortedPlans.length})</CardTitle>
              <CardDescription className="mt-1">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, filteredAndSortedPlans.length)} of{' '}
                {filteredAndSortedPlans.length} plans
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedPlans.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No plans found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first plan to get started'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPlans.map((plan) => (
                  <Card key={plan._id} className="hover:shadow-lg transition-shadow relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${getPlanColor(plan.name)}`}>
                            {getPlanIcon(plan.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{plan.name}</CardTitle>
                            {plan.isCustom && (
                              <Badge variant="outline" className="mt-1 text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                Custom Plan
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(plan)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(plan)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleActive(plan)}>
                              {plan.isActive ? (
                                <>
                                  <X className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(plan)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription className="mt-2 line-clamp-2">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">₹{plan.price.toLocaleString()}</span>
                        <span className="text-slate-600 dark:text-slate-400">/{plan.duration} days</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Category</span>
                          <Badge variant="outline" className="ml-2">{plan.businessCategory}</Badge>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Users</span>
                          <Badge variant="secondary" className="ml-2">{plan.userCount || 0}</Badge>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Revenue</span>
                          <span className="ml-2 font-medium">₹{(plan.revenue || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Status</span>
                          <Badge 
                            className={`ml-2 ${plan.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}`}
                            variant="secondary"
                          >
                            {plan.isActive ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Features ({Array.isArray(plan.features) ? plan.features.length : 0})
                        </p>
                        <div className="space-y-1">
                          {Array.isArray(plan.features) && plan.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="line-clamp-1">{feature}</span>
                            </div>
                          ))}
                          {Array.isArray(plan.features) && plan.features.length > 3 && (
                            <p className="text-xs text-slate-500">+{plan.features.length - 3} more</p>
                          )}
                          {!Array.isArray(plan.features) || plan.features.length === 0 && (
                            <p className="text-xs text-slate-500">No features listed</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="48">48</SelectItem>
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

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Plan Details - {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription>Complete information about this subscription plan</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Plan Name</Label>
                  <p className="font-semibold mt-1">{selectedPlan.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={selectedPlan.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {selectedPlan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Price</Label>
                  <p className="font-semibold mt-1">₹{selectedPlan.price.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Duration</Label>
                  <p className="font-semibold mt-1">{selectedPlan.duration} days</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Category</Label>
                  <p className="font-semibold mt-1">{selectedPlan.businessCategory}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Users</Label>
                  <p className="font-semibold mt-1">{selectedPlan.userCount || 0}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Revenue</Label>
                  <p className="font-semibold mt-1">₹{(selectedPlan.revenue || 0).toLocaleString()}</p>
                </div>
                {selectedPlan.createdAt && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Created</Label>
                    <p className="font-semibold mt-1">{new Date(selectedPlan.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedPlan.description}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Features ({Array.isArray(selectedPlan.features) ? selectedPlan.features.length : 0})</Label>
                <div className="mt-2 space-y-2">
                  {Array.isArray(selectedPlan.features) && selectedPlan.features.length > 0 ? (
                    selectedPlan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No features listed</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            {selectedPlan && (
              <Button onClick={() => { setViewDialogOpen(false); handleEdit(selectedPlan); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Plan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Plan - {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription>Update plan information and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={editForm.price || ''}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter days"
                    value={editForm.duration || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setEditForm({ ...editForm, duration: undefined });
                      } else {
                        const numValue = parseInt(value);
                        if (!isNaN(numValue) && numValue > 0) {
                          setEditForm({ ...editForm, duration: numValue });
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value === '' || parseInt(value) <= 0) {
                        setEditForm({ ...editForm, duration: selectedPlan?.duration || 30 });
                      }
                    }}
                    className="flex-1"
                  />
                  <Select 
                    value={String(editForm.duration || '')} 
                    onValueChange={(value) => setEditForm({ ...editForm, duration: parseInt(value) })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Quick" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                      <SelectItem value="730">730 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">Enter custom days or select from quick options</p>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editForm.businessCategory || ''}
                  onValueChange={(value) => setEditForm({ ...editForm, businessCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                value={Array.isArray(editForm.features) ? editForm.features.join('\n') : ''}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  features: e.target.value.split('\n').filter(f => f.trim()) 
                })}
                rows={5}
                placeholder="Enter features, one per line"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div>
                <Label>Plan Status</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {editForm.isActive ? 'Plan is currently active' : 'Plan is currently inactive'}
                </p>
              </div>
              <Switch
                checked={editForm.isActive || false}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Plans Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Reset All Plans
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all existing plans (except custom plans) and create new professional plans for each business category. This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setIsResetting(true);
                try {
                  const response = await api.resetAndCreatePlans();
                  if (response.success) {
                    toast.success(response.message || "Plans reset and created successfully");
                    setResetDialogOpen(false);
                    await fetchPlans();
                  }
                } catch (error: any) {
                  toast.error(error.message || "Failed to reset plans");
                } finally {
                  setIsResetting(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset & Create Plans"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Plan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone and will affect all users subscribed to this plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}