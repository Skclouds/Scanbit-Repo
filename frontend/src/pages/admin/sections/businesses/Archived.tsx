import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Search, Filter, Building2, RefreshCw, MoreVertical, Eye, RotateCcw, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, FileDown, CheckCircle, Clock, XCircle, AlertCircle, MapPin, Users, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';


interface Business {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  businessCategory: string;
  businessType: string;
  logo?: string;
  profileImage?: string;
  owner?: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt?: string;
  archivedAt?: string;
  subscription: {
    plan: string;
    status: string;
    planPrice?: number;
    daysRemaining?: number;
    startDate?: string;
    endDate?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  qrScans?: number;
  isVerified?: boolean;
  verificationStatus?: string;
}

type SortField = 'name' | 'createdAt' | 'archivedAt' | 'businessCategory' | 'businessType' | 'email' | 'subscription.plan';
type SortOrder = 'asc' | 'desc';

export default function Archived() {
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [businessCategory, setBusinessCategory] = useState('all');
  const [businessType, setBusinessType] = useState('all');
  const [subscriptionStatus, setSubscriptionStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField>('archivedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getBusinessCategories();
        if (response.success && response.data && Array.isArray(response.data)) {
          const catNames = response.data.map((cat: any) => cat.name).filter(Boolean);
          if (catNames.length > 0) {
            setCategories(catNames);
          } else {
            setCategories(['Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design']);
          }
        } else {
          setCategories(['Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design']);
        }
      } catch (error) {
        setCategories(['Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design']);
      }
    };
    fetchCategories();
  }, []);

  // Get all unique business types from businesses
  const allBusinessTypes = useMemo(() => {
    const types = new Set<string>();
    businesses.forEach(business => {
      if (business.businessType) {
        types.add(business.businessType);
      }
    });
    return Array.from(types).sort();
  }, [businesses]);

  const fetchArchivedBusinesses = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminRestaurants({
        page,
        limit,
        search: search || undefined,
        businessCategory: businessCategory !== 'all' ? businessCategory : undefined,
        businessType: businessType !== 'all' ? businessType : undefined,
        subscriptionStatus: subscriptionStatus !== 'all' ? subscriptionStatus : undefined,
        isArchived: true,
        sortBy: sortField,
        sortOrder: sortOrder,
      });

      if (response.success) {
        setBusinesses(response.data || []);
        if (response.pagination) {
          setTotal(response.pagination.total);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch archived businesses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, businessCategory, businessType, subscriptionStatus, sortField, sortOrder]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      fetchArchivedBusinesses();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchArchivedBusinesses();
    setIsRefreshing(false);
  };

  const handleViewDetails = async (businessId: string) => {
    try {
      const response = await api.getAdminRestaurant(businessId);
      if (response.success && response.data) {
        setSelectedBusiness(response.data);
        setViewDialogOpen(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch business details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch business details',
        variant: 'destructive',
      });
    }
  };

  const handleRestore = async (businessId?: string) => {
    const idToRestore = businessId || selectedBusiness?._id;
    if (!idToRestore) return;

    try {
      setRestoring(true);
      await api.updateAdminRestaurant(idToRestore, {
        isArchived: false,
      });
      toast({
        title: 'Success',
        description: 'Business restored successfully',
      });
      setRestoreDialogOpen(false);
      setSelectedBusiness(null);
      setSelectedBusinesses(new Set());
      setShowBulkActions(false);
      await fetchArchivedBusinesses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to restore business',
        variant: 'destructive',
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleBulkRestore = async () => {
    try {
      setRestoring(true);
      const promises = Array.from(selectedBusinesses).map(id => 
        api.updateAdminRestaurant(id, { isArchived: false })
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedBusinesses.size} businesses restored successfully`,
      });
      setSelectedBusinesses(new Set());
      setShowBulkActions(false);
      await fetchArchivedBusinesses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to restore businesses',
        variant: 'destructive',
      });
    } finally {
      setRestoring(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedBusiness) return;
    
    try {
      setDeleting(true);
      const response = await api.deleteAdminRestaurant(selectedBusiness._id);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Business permanently deleted from database',
        });
        setDeleteDialogOpen(false);
        setSelectedBusiness(null);
        await fetchArchivedBusinesses();
      } else {
        throw new Error(response.message || 'Failed to delete business');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete business',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setDeleting(true);
      const promises = Array.from(selectedBusinesses).map(id => 
        api.deleteAdminRestaurant(id)
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedBusinesses.size} businesses permanently deleted`,
      });
      setSelectedBusinesses(new Set());
      setShowBulkActions(false);
      await fetchArchivedBusinesses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete businesses',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
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
    const headers = ['Name', 'Email', 'Phone', 'Category', 'Business Type', 'Plan', 'Archived Date', 'Created Date'];
    const rows = businesses.map(b => [
      b.name,
      b.email,
      b.phone || '',
      b.businessCategory,
      b.businessType || '',
      b.subscription.plan,
      b.archivedAt ? new Date(b.archivedAt).toLocaleDateString() : (b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : 'N/A'),
      new Date(b.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archived_businesses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Archived businesses exported successfully',
    });
  };

  const toggleBusinessSelection = (businessId: string) => {
    const newSelected = new Set(selectedBusinesses);
    if (newSelected.has(businessId)) {
      newSelected.delete(businessId);
    } else {
      newSelected.add(businessId);
    }
    setSelectedBusinesses(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedBusinesses.size === businesses.length) {
      setSelectedBusinesses(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedBusinesses(new Set(businesses.map(b => b._id)));
      setShowBulkActions(true);
    }
  };

  const getSubscriptionBadge = (subscription: Business['subscription']) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-orange-100 text-orange-800',
    };
    return (
      <Badge className={colors[subscription.status] || 'bg-gray-100 text-gray-800'}>
        {subscription.plan}
      </Badge>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Archived Businesses</h2>
          <p className="text-slate-600 mt-2">View and manage archived business accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Archived</p>
                <p className="text-2xl font-bold mt-1">{total}</p>
              </div>
              <Building2 className="w-8 h-8 text-slate-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold mt-1">
                  {businesses.filter(b => {
                    const archivedDate = b.archivedAt ? new Date(b.archivedAt) : (b.updatedAt ? new Date(b.updatedAt) : null);
                    if (!archivedDate) return false;
                    const now = new Date();
                    return archivedDate.getMonth() === now.getMonth() && archivedDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold mt-1">
                  {businesses.filter(b => b.subscription.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold mt-1">{selectedBusinesses.size}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && selectedBusinesses.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-white">
                  {selectedBusinesses.size} selected
                </Badge>
                <span className="text-sm text-slate-700">
                  Bulk actions available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkRestore}
                  disabled={restoring}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedBusiness(null);
                    setDeleteDialogOpen(true);
                  }}
                  disabled={deleting}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBusinesses(new Set());
                    setShowBulkActions(false);
                  }}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search archived businesses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={businessCategory} onValueChange={(value) => {
              setBusinessCategory(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Business Type Filter */}
            <Select value={businessType} onValueChange={(value) => {
              setBusinessType(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Business Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {allBusinessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subscription Filter */}
            <Select value={subscriptionStatus} onValueChange={(value) => {
              setSubscriptionStatus(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort and Page Size Controls */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Sort by:</span>
              <Select value={sortField} onValueChange={(value) => {
                setSortField(value as SortField);
                setPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Business Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="archivedAt">Archived Date</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="businessCategory">Category</SelectItem>
                  <SelectItem value="businessType">Business Type</SelectItem>
                  <SelectItem value="subscription.plan">Subscription Plan</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Items per page:</span>
              <Select value={limit.toString()} onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1);
              }}>
                <SelectTrigger className="w-[100px]">
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
          </div>
        </CardContent>
      </Card>

      {/* Archived Businesses Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Archived Businesses List</CardTitle>
          <CardDescription>
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} archived businesses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No archived businesses</p>
              <p className="text-slate-500 text-sm">All businesses are currently active</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedBusinesses.size === businesses.length && businesses.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center hover:text-slate-900 transition-colors"
                      >
                        Business
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center hover:text-slate-900 transition-colors"
                      >
                        Email
                        {getSortIcon('email')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <button
                        onClick={() => handleSort('businessCategory')}
                        className="flex items-center hover:text-slate-900 transition-colors"
                      >
                        Category
                        {getSortIcon('businessCategory')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <button
                        onClick={() => handleSort('businessType')}
                        className="flex items-center hover:text-slate-900 transition-colors"
                      >
                        Business Type
                        {getSortIcon('businessType')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <button
                        onClick={() => handleSort('subscription.plan')}
                        className="flex items-center hover:text-slate-900 transition-colors"
                      >
                        Plan
                        {getSortIcon('subscription.plan')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <button
                        onClick={() => handleSort('archivedAt')}
                        className="flex items-center hover:text-slate-900 transition-colors"
                      >
                        Archived On
                        {getSortIcon('archivedAt')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((business) => (
                    <tr
                      key={business._id}
                      className="border-b hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedBusinesses.has(business._id)}
                          onChange={() => toggleBusinessSelection(business._id)}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={business.logo || business.profileImage} />
                            <AvatarFallback className="bg-slate-200">
                              {business.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{business.name}</p>
                            {business.phone && (
                              <p className="text-xs text-slate-500 truncate">{business.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">{business.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">{business.businessCategory}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {business.businessType || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {getSubscriptionBadge(business.subscription)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">
                          {business.archivedAt 
                            ? new Date(business.archivedAt).toLocaleDateString()
                            : business.updatedAt
                            ? new Date(business.updatedAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer gap-2"
                              onClick={() => handleViewDetails(business._id)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-green-600"
                              onClick={() => {
                                setSelectedBusiness(business);
                                setRestoreDialogOpen(true);
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Restore Business
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer gap-2 text-red-600"
                              onClick={() => {
                                setSelectedBusiness(business);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              Permanently Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-slate-600">
                Page {page} of {totalPages} • Showing {limit} per page
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Archived Business Details</DialogTitle>
            <DialogDescription>Complete information about {selectedBusiness?.name}</DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedBusiness.logo || selectedBusiness.profileImage} />
                  <AvatarFallback className="bg-slate-200 text-lg">
                    {selectedBusiness.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedBusiness.name}</h3>
                  <p className="text-sm text-slate-600">{selectedBusiness.email}</p>
                  <Badge variant="outline" className="mt-1 bg-orange-50 text-orange-700 border-orange-200">
                    Archived
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Business Category</p>
                  <p className="text-sm text-slate-600">{selectedBusiness.businessCategory}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Business Type</p>
                  <p className="text-sm text-slate-600">{selectedBusiness.businessType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Phone</p>
                  <p className="text-sm text-slate-600">{selectedBusiness.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Subscription Plan</p>
                  {getSubscriptionBadge(selectedBusiness.subscription)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Created Date</p>
                  <p className="text-sm text-slate-600">
                    {new Date(selectedBusiness.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Archived Date</p>
                  <p className="text-sm text-slate-600">
                    {selectedBusiness.archivedAt 
                      ? new Date(selectedBusiness.archivedAt).toLocaleDateString()
                      : selectedBusiness.updatedAt
                      ? new Date(selectedBusiness.updatedAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                {selectedBusiness.qrScans !== undefined && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Total QR Scans</p>
                    <p className="text-sm text-slate-600 font-medium">{selectedBusiness.qrScans || 0}</p>
                  </div>
                )}
              </div>

              {selectedBusiness.address && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Address</p>
                  <p className="text-sm text-slate-600">
                    {[
                      selectedBusiness.address.street,
                      selectedBusiness.address.city,
                      selectedBusiness.address.state,
                      selectedBusiness.address.zipCode,
                      selectedBusiness.address.country,
                    ].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                  {selectedBusiness.address.city && selectedBusiness.address.state && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const address = [
                          selectedBusiness.address?.street,
                          selectedBusiness.address?.city,
                          selectedBusiness.address?.state,
                          selectedBusiness.address?.zipCode,
                          selectedBusiness.address?.country,
                        ].filter(Boolean).join(', ');
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Google Maps
                    </Button>
                  )}
                </div>
              )}

              {selectedBusiness.owner && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Owner Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Name</p>
                      <p className="text-sm text-slate-600">{selectedBusiness.owner.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-sm text-slate-600">{selectedBusiness.owner.email}</p>
                    </div>
                    {selectedBusiness.owner.phone && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Phone</p>
                        <p className="text-sm text-slate-600">{selectedBusiness.owner.phone}</p>
                      </div>
                    )}
                    {selectedBusiness.owner.role && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Role</p>
                        <Badge variant="outline">{selectedBusiness.owner.role}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBusiness.subscription && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Subscription Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Status</p>
                      <Badge>{selectedBusiness.subscription.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Plan</p>
                      {getSubscriptionBadge(selectedBusiness.subscription)}
                    </div>
                    {selectedBusiness.subscription.planPrice && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Price</p>
                        <p className="text-sm text-slate-600">₹{selectedBusiness.subscription.planPrice}</p>
                      </div>
                    )}
                    {selectedBusiness.subscription.daysRemaining !== undefined && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Days Remaining</p>
                        <p className="text-sm text-slate-600">{selectedBusiness.subscription.daysRemaining}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button 
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => {
                if (selectedBusiness) {
                  setViewDialogOpen(false);
                  setRestoreDialogOpen(true);
                }
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Business
            </Button>
            <Button 
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                setViewDialogOpen(false);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore <strong>{selectedBusiness?.name}</strong>? 
              This will make the business active again and it will appear in the main businesses list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBusiness(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleRestore()}
              className="bg-green-600 hover:bg-green-700"
              disabled={restoring}
            >
              {restoring ? 'Restoring...' : 'Restore Business'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete {selectedBusinesses.size > 0 ? 'Businesses' : 'Business'}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedBusinesses.size > 0 ? (
                <>
                  Are you absolutely sure you want to permanently delete <strong>{selectedBusinesses.size} businesses</strong>? 
                  This action cannot be undone. All data associated with these businesses, including owner accounts, 
                  will be permanently removed from the database.
                </>
              ) : (
                <>
                  Are you absolutely sure you want to permanently delete <strong>{selectedBusiness?.name}</strong>? 
                  This action cannot be undone. All data associated with this business, including the owner account, 
                  will be permanently removed from the database.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedBusiness(null);
              setSelectedBusinesses(new Set());
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedBusinesses.size > 0) {
                  handleBulkDelete();
                } else {
                  handlePermanentDelete();
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
