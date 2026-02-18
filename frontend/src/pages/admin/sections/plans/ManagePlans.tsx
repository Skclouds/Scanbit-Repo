import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit, 
  Search, 
  RefreshCw,
  Trash2,
  Eye,
  Copy,
  MoreVertical,
  Check,
  X,
  Crown,
  Zap,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpDown,
  Filter,
  Download,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  FileText
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/api";

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
}

interface PlanUser {
  _id: string;
  name: string;
  email: string;
  restaurant?: {
    name: string;
    businessCategory: string;
  };
  subscription?: {
    status: string;
    startDate: string;
    endDate: string;
  };
}

type SortField = 'name' | 'price' | 'duration' | 'userCount' | 'revenue' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function ManagePlans() {
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
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [planUsers, setPlanUsers] = useState<PlanUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    duration: 30,
    businessCategory: "",
    features: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
    fetchCategories();
  }, []);

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

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminPlans({});
      if (response.success && response.data) {
        // Calculate user count and revenue for each plan
        const plansWithStats = await Promise.all(
          response.data.map(async (plan: Plan) => {
            try {
              // Get subscriptions for this plan
              const subscriptionsResponse = await api.getAdminSubscriptions({ plan: plan._id, limit: 1000 });
              const subscriptions = subscriptionsResponse.success ? subscriptionsResponse.data : [];
              
              // Get payments for this plan
              const paymentsResponse = await api.getAdminPayments({ plan: plan._id, limit: 1000 });
              const payments = paymentsResponse.success ? paymentsResponse.data : [];
              
              const userCount = subscriptions.length;
              const revenue = payments.reduce((sum: number, payment: any) => {
                return sum + (payment.amount || 0);
              }, 0);

              return {
                ...plan,
                features: Array.isArray(plan.features) 
                  ? plan.features 
                  : Array.isArray((plan as any).featuresList) 
                    ? (plan as any).featuresList 
                    : [],
                userCount,
                revenue,
              };
            } catch (error) {

              return {
                ...plan,
                features: Array.isArray(plan.features) 
                  ? plan.features 
                  : Array.isArray((plan as any).featuresList) 
                    ? (plan as any).featuresList 
                    : [],
                userCount: 0,
                revenue: 0,
              };
            }
          })
        );
        setPlans(plansWithStats);
      }
    } catch (error) {

      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanUsers = async (planId: string) => {
    try {
      setLoadingUsers(true);
      const response = await api.getAdminSubscriptions({ plan: planId, limit: 1000 });
      if (response.success && response.data) {
        // Extract user data from subscriptions
        const users = response.data.map((sub: any) => ({
          _id: sub._id || sub.user?._id || '',
          name: sub.name || sub.user?.name || 'Unknown',
          email: sub.email || sub.user?.email || '',
          restaurant: sub.restaurant || {},
          subscription: sub.subscription || {},
        }));
        setPlanUsers(users);
      }
    } catch (error) {

      toast.error("Failed to load plan users");
    } finally {
      setLoadingUsers(false);
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
        setCurrentPlan({
          ...response.data,
          features: Array.isArray(response.data.features) 
            ? response.data.features 
            : Array.isArray(response.data.featuresList) 
              ? response.data.featuresList 
              : [],
        });
        setViewDialogOpen(true);
      }
    } catch (error) {
      toast.error("Failed to fetch plan details");
    }
  };

  const handleViewUsers = async (plan: Plan) => {
    setCurrentPlan(plan);
    setUsersDialogOpen(true);
    await fetchPlanUsers(plan._id);
  };

  const handleEdit = (plan: Plan) => {
    setCurrentPlan(plan);
    setEditForm({
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      duration: plan.duration || 30,
      businessCategory: plan.businessCategory,
      features: Array.isArray(plan.features) ? plan.features : [],
      isActive: plan.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!currentPlan) return;

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

    try {
      const updateData = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: editForm.price,
        duration: editForm.duration,
        businessCategory: editForm.businessCategory,
        featuresList: editForm.features.filter((f: string) => f.trim()),
        isActive: editForm.isActive,
      };

      const response = await api.updateAdminPlan(currentPlan._id, updateData);
      if (response.success) {
        toast.success("Plan updated successfully");
        setEditDialogOpen(false);
        await fetchPlans();
      } else {
        toast.error(response.message || "Failed to update plan");
      }
    } catch (error: any) {

      toast.error(error.message || "Failed to update plan");
    }
  };

  const handleDelete = (plan: Plan) => {
    setCurrentPlan(plan);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentPlan) return;
    
    try {
      const response = await api.deleteAdminPlan(currentPlan._id);
      if (response.success) {
        toast.success("Plan deleted successfully");
        setDeleteDialogOpen(false);
        await fetchPlans();
      } else {
        toast.error(response.message || "Failed to delete plan");
      }
    } catch (error: any) {

      toast.error(error.message || "Failed to delete plan");
    }
  };

  const handleDuplicate = async (plan: Plan) => {
    try {
      const duplicateData = {
        name: `${plan.name} (Copy)`,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        businessCategory: plan.businessCategory,
        featuresList: Array.isArray(plan.features) ? plan.features : [],
        isActive: false, // Start as inactive
      };
      const response = await api.createPlan(duplicateData);
      if (response.success) {
        toast.success("Plan duplicated successfully");
        await fetchPlans();
      } else {
        toast.error(response.message || "Failed to duplicate plan");
      }
    } catch (error: any) {

      toast.error(error.message || "Failed to duplicate plan");
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const response = await api.updateAdminPlan(plan._id, { isActive: !plan.isActive });
      if (response.success) {
        toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`);
        await fetchPlans();
      } else {
        toast.error(response.message || "Failed to update plan status");
      }
    } catch (error: any) {

      toast.error(error.message || "Failed to update plan status");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPlans.length === 0) {
      toast.error("Please select at least one plan");
      return;
    }

    try {
      switch (action) {
        case "activate":
          await Promise.all(
            selectedPlans.map(id => {
              const plan = plans.find(p => p._id === id);
              if (plan && !plan.isActive) {
                return api.updateAdminPlan(id, { isActive: true });
              }
            })
          );
          toast.success(`Activated ${selectedPlans.length} plan(s)`);
          break;
        case "deactivate":
          await Promise.all(
            selectedPlans.map(id => {
              const plan = plans.find(p => p._id === id);
              if (plan && plan.isActive) {
                return api.updateAdminPlan(id, { isActive: false });
              }
            })
          );
          toast.success(`Deactivated ${selectedPlans.length} plan(s)`);
          break;
        case "delete":
          await Promise.all(selectedPlans.map(id => api.deleteAdminPlan(id)));
          toast.success(`Deleted ${selectedPlans.length} plan(s)`);
          break;
      }
      setSelectedPlans([]);
      await fetchPlans();
    } catch (error: any) {
      toast.error(error.message || "Bulk action failed");
    }
  };

  const handleExport = () => {
    const csvData = filteredAndSortedPlans.map(plan => ({
      Name: plan.name,
      Description: plan.description || '',
      Price: plan.price,
      Duration: plan.duration,
      Category: plan.businessCategory,
      Status: plan.isActive ? 'Active' : 'Inactive',
      Users: plan.userCount || 0,
      Revenue: plan.revenue || 0,
      Features: Array.isArray(plan.features) ? plan.features.join('; ') : '',
      'Created At': new Date(plan.createdAt).toLocaleDateString(),
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plans_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Plans exported successfully");
  };

  const toggleSelectAll = () => {
    if (selectedPlans.length === filteredAndSortedPlans.length) {
      setSelectedPlans([]);
    } else {
      setSelectedPlans(filteredAndSortedPlans.map(p => p._id));
    }
  };

  const toggleSelectPlan = (planId: string) => {
    setSelectedPlans(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const getPlanIcon = (name: string) => {
    if (name.toLowerCase().includes("pro") || name.toLowerCase().includes("premium") || name.toLowerCase().includes("enterprise")) {
      return <Crown className="w-4 h-4" />;
    }
    if (name.toLowerCase().includes("basic") || name.toLowerCase().includes("starter")) {
      return <Package className="w-4 h-4" />;
    }
    return <Zap className="w-4 h-4" />;
  };

  const getPlanColor = (name: string) => {
    if (name.toLowerCase().includes("pro") || name.toLowerCase().includes("premium") || name.toLowerCase().includes("enterprise")) {
      return "from-purple-500 to-purple-600";
    }
    if (name.toLowerCase().includes("basic") || name.toLowerCase().includes("starter")) {
      return "from-blue-500 to-blue-600";
    }
    return "from-green-500 to-green-600";
  };

  // Get unique categories from plans and available categories
  const categories = useMemo(() => {
    if (availableCategories.length > 0) {
      return availableCategories;
    }
    const cats = new Set(plans.map(p => p.businessCategory).filter(Boolean));
    return Array.from(cats);
  }, [plans, availableCategories]);

  // Filter and sort plans
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = plans.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (plan.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plan.businessCategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || plan.businessCategory === categoryFilter;
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && plan.isActive) ||
                           (statusFilter === "inactive" && !plan.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
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
    return {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.isActive).length,
      totalUsers: plans.reduce((sum, p) => sum + (p.userCount || 0), 0),
      totalRevenue: plans.reduce((sum, p) => sum + (p.revenue || 0), 0),
    };
  }, [plans]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Edit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manage Plans</h2>
            <p className="text-slate-600 mt-1">Edit, duplicate, and manage subscription plans</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Plans</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">{stats.totalPlans}</p>
              </div>
              <Package className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Plans</p>
                <p className="text-3xl font-bold mt-2 text-green-900">{stats.activePlans}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2 text-purple-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 text-orange-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Actions
            </CardTitle>
            {selectedPlans.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedPlans.length} selected</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                      <Check className="w-4 h-4 mr-2" />
                      Activate Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                      <X className="w-4 h-4 mr-2" />
                      Deactivate Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleBulkAction("delete")}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="userCount">Users</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <div className="flex gap-2">
                <Button
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('asc')}
                  className="flex-1"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('desc')}
                  className="flex-1"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Plans ({filteredAndSortedPlans.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedPlans.length === filteredAndSortedPlans.length && filteredAndSortedPlans.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-slate-600">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : paginatedPlans.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No plans found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className={`flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow ${
                      selectedPlans.includes(plan._id) ? "bg-blue-50 border-blue-300" : ""
                    }`}
                  >
                    <Checkbox
                      checked={selectedPlans.includes(plan._id)}
                      onCheckedChange={() => toggleSelectPlan(plan._id)}
                    />

                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getPlanColor(plan.name)}`}>
                      <div className="text-white text-xs font-semibold flex items-center gap-1">
                        {getPlanIcon(plan.name)}
                        <span className="hidden sm:inline">{plan.name.substring(0, 10)}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{plan.name}</h4>
                        <Badge className={plan.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {plan.isCustom && (
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">{plan.description || 'No description'}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ₹{plan.price}/{plan.duration}d
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {plan.businessCategory}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {plan.userCount || 0} users
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          ₹{(plan.revenue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                          <DropdownMenuItem onClick={() => handleDuplicate(plan)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewUsers(plan)}>
                            <Users className="w-4 h-4 mr-2" />
                            View Users ({plan.userCount || 0})
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
                            onClick={() => handleDelete(plan)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredAndSortedPlans.length)} of {filteredAndSortedPlans.length} plans
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm px-3">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                    >
                      Last
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Plan Details - {currentPlan?.name}
            </DialogTitle>
            <DialogDescription>Complete information about this plan</DialogDescription>
          </DialogHeader>
          {currentPlan && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Plan Name</Label>
                    <p className="font-semibold mt-1">{currentPlan.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge className={currentPlan.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {currentPlan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="mt-1">{currentPlan.description || 'No description'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Price</Label>
                    <p className="font-semibold mt-1">₹{currentPlan.price}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Duration</Label>
                    <p className="font-semibold mt-1">{currentPlan.duration} days</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Business Category</Label>
                  <p className="font-semibold mt-1">{currentPlan.businessCategory}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Total Users</Label>
                    <p className="font-semibold mt-1">{currentPlan.userCount || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Total Revenue</Label>
                    <p className="font-semibold mt-1">₹{(currentPlan.revenue || 0).toLocaleString()}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm text-muted-foreground">Features ({Array.isArray(currentPlan.features) ? currentPlan.features.length : 0})</Label>
                  <div className="mt-2 space-y-2">
                    {Array.isArray(currentPlan.features) && currentPlan.features.length > 0 ? (
                      currentPlan.features.map((feature, idx) => (
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
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="mt-1">{new Date(currentPlan.createdAt).toLocaleString()}</p>
                  </div>
                  {currentPlan.updatedAt && (
                    <div>
                      <Label className="text-muted-foreground">Updated At</Label>
                      <p className="mt-1">{new Date(currentPlan.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            {currentPlan && (
              <Button onClick={() => { setViewDialogOpen(false); handleEdit(currentPlan); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Plan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Plan - {currentPlan?.name}
            </DialogTitle>
            <DialogDescription>Update plan information and settings</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g., Pro Plan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Plan description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Business Category</Label>
                  <Select
                    value={editForm.businessCategory}
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

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Plan Status</Label>
                  <p className="text-sm text-gray-600">Enable or disable this plan</p>
                </div>
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Users Dialog */}
      <Dialog open={usersDialogOpen} onOpenChange={setUsersDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Plan Users - {currentPlan?.name}
            </DialogTitle>
            <DialogDescription>
              Users subscribed to this plan ({planUsers.length})
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {loadingUsers ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Loading users...</p>
              </div>
            ) : planUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No users subscribed to this plan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {planUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.restaurant?.name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Business: {user.restaurant.name} ({user.restaurant.businessCategory})
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {user.subscription?.status && (
                        <Badge className={
                          user.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {user.subscription.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsersDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the plan "{currentPlan?.name}". 
              {currentPlan?.userCount && currentPlan.userCount > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: {currentPlan.userCount} users are currently subscribed to this plan.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Compare Plans Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Compare Plans</DialogTitle>
            <DialogDescription>
              Side-by-side comparison of selected plans
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedPlans.length < 2 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Please select at least 2 plans to compare</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Feature</th>
                      {selectedPlans.map(id => {
                        const plan = plans.find(p => p._id === id);
                        return plan ? (
                          <th key={id} className="border p-2 text-center">{plan.name}</th>
                        ) : null;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-semibold">Price</td>
                      {selectedPlans.map(id => {
                        const plan = plans.find(p => p._id === id);
                        return plan ? (
                          <td key={id} className="border p-2 text-center">₹{plan.price}</td>
                        ) : null;
                      })}
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Duration</td>
                      {selectedPlans.map(id => {
                        const plan = plans.find(p => p._id === id);
                        return plan ? (
                          <td key={id} className="border p-2 text-center">{plan.duration} days</td>
                        ) : null;
                      })}
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Category</td>
                      {selectedPlans.map(id => {
                        const plan = plans.find(p => p._id === id);
                        return plan ? (
                          <td key={id} className="border p-2 text-center">{plan.businessCategory}</td>
                        ) : null;
                      })}
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Users</td>
                      {selectedPlans.map(id => {
                        const plan = plans.find(p => p._id === id);
                        return plan ? (
                          <td key={id} className="border p-2 text-center">{plan.userCount || 0}</td>
                        ) : null;
                      })}
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold">Revenue</td>
                      {selectedPlans.map(id => {
                        const plan = plans.find(p => p._id === id);
                        return plan ? (
                          <td key={id} className="border p-2 text-center">₹{(plan.revenue || 0).toLocaleString()}</td>
                        ) : null;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
