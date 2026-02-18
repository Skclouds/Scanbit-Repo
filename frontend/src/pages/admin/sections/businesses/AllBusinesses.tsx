import { Search, Filter, CheckCircle, Clock, AlertCircle, MoreVertical, Building2, RefreshCw, Eye, Edit, Archive, Download, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Trash2, XCircle, Settings, FileDown, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
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
  isVerified: boolean;
  verificationStatus: string;
  subscription: {
    plan: string;
    status: string;
    planPrice?: number;
    daysRemaining?: number;
    startDate?: string;
    endDate?: string;
  };
  logo?: string;
  profileImage?: string;
  owner?: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  qrScans?: number;
  createdAt: string;
  updatedAt?: string;
  isArchived: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

type SortField = 'name' | 'createdAt' | 'qrScans' | 'businessCategory' | 'businessType' | 'email' | 'verificationStatus' | 'subscription.plan';
type SortOrder = 'asc' | 'desc';

export default function AllBusinesses() {
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
  const [verificationStatus, setVerificationStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [selectedCategoryForTypes, setSelectedCategoryForTypes] = useState<string>('');
  const [businessImages, setBusinessImages] = useState<string[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

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

  // Fetch business types when category changes
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      if (!selectedCategoryForTypes) {
        setBusinessTypes([]);
        return;
      }
      
      try {
        const response = await api.getBusinessCategories();
        if (response.success && response.data && Array.isArray(response.data)) {
          const category = response.data.find((cat: any) => cat.name === selectedCategoryForTypes);
          if (category && category.businessTypes && Array.isArray(category.businessTypes)) {
            const types = category.businessTypes
              .filter((type: any) => type.isActive !== false)
              .map((type: any) => type.name)
              .filter(Boolean);
            setBusinessTypes(types);
          } else {
            setBusinessTypes([]);
          }
        }
      } catch (error) {
        setBusinessTypes([]);
      }
    };
    fetchBusinessTypes();
  }, [selectedCategoryForTypes]);

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

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminRestaurants({
        page,
        limit,
        search: search || undefined,
        businessCategory: businessCategory !== 'all' ? businessCategory : undefined,
        businessType: businessType !== 'all' ? businessType : undefined,
        subscriptionStatus: subscriptionStatus !== 'all' ? subscriptionStatus : undefined,
        verificationStatus: verificationStatus !== 'all' ? verificationStatus : undefined,
        isArchived: false,
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
        description: 'Failed to fetch businesses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, businessCategory, businessType, subscriptionStatus, verificationStatus, sortField, sortOrder]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      fetchBusinesses();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBusinesses();
    setIsRefreshing(false);
  };

  const handleViewDetails = async (businessId: string) => {
    try {
      const response = await api.getAdminRestaurant(businessId);
      if (response.success && response.data) {
        const business = response.data;
        setSelectedBusiness(business);
        
        // Collect all images from the business
        const images: string[] = [];
        if (business.logo) images.push(business.logo);
        if (business.profileImage) images.push(business.profileImage);
        if (business.images && Array.isArray(business.images)) {
          images.push(...business.images.filter(Boolean));
        }
        if (business.gallery && Array.isArray(business.gallery)) {
          images.push(...business.gallery.filter(Boolean));
        }
        setBusinessImages(images);
        
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

  const handleEdit = async (businessId: string) => {
    try {
      const response = await api.getAdminRestaurant(businessId);
      if (response.success && response.data) {
        const business = response.data;
        setSelectedBusiness(business);
        setSelectedCategoryForTypes(business.businessCategory || '');
        setEditDialogOpen(true);
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

  const handleSaveEdit = async () => {
    if (!selectedBusiness) return;
    
    try {
      await api.updateAdminRestaurant(selectedBusiness._id, {
        name: selectedBusiness.name,
        email: selectedBusiness.email,
        phone: selectedBusiness.phone,
        businessCategory: selectedBusiness.businessCategory,
        businessType: selectedBusiness.businessType,
      });
      toast({
        title: 'Success',
        description: 'Business updated successfully',
      });
      setEditDialogOpen(false);
      setSelectedBusiness(null);
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update business',
        variant: 'destructive',
      });
    }
  };

  const handleVerify = async (businessId: string) => {
    try {
      await api.updateAdminRestaurant(businessId, {
        isVerified: true,
        verificationStatus: 'verified',
      });
      toast({
        title: 'Success',
        description: 'Business verified successfully',
      });
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify business',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async (businessId: string) => {
    try {
      await api.updateAdminRestaurant(businessId, {
        isArchived: true,
      });
      toast({
        title: 'Success',
        description: 'Business archived successfully',
      });
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive business',
        variant: 'destructive',
      });
    }
  };

  const handleBulkArchive = async () => {
    try {
      const promises = Array.from(selectedBusinesses).map(id => 
        api.updateAdminRestaurant(id, { isArchived: true })
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedBusinesses.size} businesses archived successfully`,
      });
      setSelectedBusinesses(new Set());
      setShowBulkActions(false);
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive businesses',
        variant: 'destructive',
      });
    }
  };

  const handleBulkVerify = async () => {
    try {
      const promises = Array.from(selectedBusinesses).map(id => 
        api.updateAdminRestaurant(id, { isVerified: true, verificationStatus: 'verified' })
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedBusinesses.size} businesses verified successfully`,
      });
      setSelectedBusinesses(new Set());
      setShowBulkActions(false);
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify businesses',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedBusiness) return;
    
    try {
      await api.deleteAdminRestaurant(selectedBusiness._id);
      toast({
        title: 'Success',
        description: 'Business permanently deleted',
      });
      setDeleteDialogOpen(false);
      setSelectedBusiness(null);
      handleRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete business',
        variant: 'destructive',
      });
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

  const getSortLabel = (field: SortField) => {
    const labels: Record<SortField, string> = {
      'name': 'Business Name',
      'createdAt': 'Date Joined',
      'qrScans': 'QR Scans',
      'businessCategory': 'Category',
      'businessType': 'Business Type',
      'email': 'Email',
      'verificationStatus': 'Verification Status',
      'subscription.plan': 'Subscription Plan'
    };
    return labels[field] || field;
  };

  const handleExport = () => {
    // Create CSV data
    const headers = ['Name', 'Email', 'Phone', 'Category', 'Business Type', 'Status', 'Plan', 'QR Scans', 'Joined Date'];
    const rows = businesses.map(b => [
      b.name,
      b.email,
      b.phone || '',
      b.businessCategory,
      b.businessType,
      b.isVerified ? 'Verified' : 'Pending',
      b.subscription.plan,
      b.qrScans || 0,
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
    a.download = `businesses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Businesses exported successfully',
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

  const getVerificationBadge = (business: Business) => {
    if (business.isVerified || business.verificationStatus === 'verified') {
      return (
        <Badge className="bg-green-100 text-green-800 flex gap-1 w-fit">
          <CheckCircle className="w-3 h-3" />
          Verified
        </Badge>
      );
    }
    if (business.verificationStatus === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800 flex gap-1 w-fit">
          <XCircle className="w-3 h-3" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 flex gap-1 w-fit">
        <Clock className="w-3 h-3" />
        Pending
      </Badge>
    );
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
          <h2 className="text-3xl font-bold tracking-tight">All Businesses</h2>
          <p className="text-slate-600 mt-2">Manage all registered businesses on the platform</p>
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
                  onClick={handleBulkVerify}
                  disabled={loading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                  disabled={loading}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Selected
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search businesses..."
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

            {/* Verification Status Filter */}
            <Select value={verificationStatus} onValueChange={(value) => {
              setVerificationStatus(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                  <SelectItem value="createdAt">Date Joined</SelectItem>
                  <SelectItem value="businessCategory">Category</SelectItem>
                  <SelectItem value="businessType">Business Type (User Type)</SelectItem>
                  <SelectItem value="verificationStatus">Verification Status</SelectItem>
                  <SelectItem value="qrScans">QR Scans</SelectItem>
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

      {/* Businesses Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Businesses</CardTitle>
            <CardDescription>
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} businesses
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No businesses found</p>
              <p className="text-slate-500 text-sm">Try adjusting your filters</p>
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
                        onClick={() => handleSort('verificationStatus')}
                        className="flex items-center hover:text-slate-900 transition-colors"
                      >
                        Status
                        {getSortIcon('verificationStatus')}
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
                        onClick={() => handleSort('qrScans')}
                        className="flex items-center hover:text-slate-900 transition-colors"
                      >
                        QR Scans
                        {getSortIcon('qrScans')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center hover:text-slate-900 transition-colors"
                      >
                        Joined
                        {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((business) => (
                    <tr key={business._id} className="border-b hover:bg-slate-50 transition-colors">
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
                      <td className="px-4 py-3">{getVerificationBadge(business)}</td>
                      <td className="px-4 py-3">{getSubscriptionBadge(business.subscription)}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-900">{business.qrScans || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">
                          {new Date(business.createdAt).toLocaleDateString()}
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
                              className="cursor-pointer gap-2"
                              onClick={() => handleEdit(business._id)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit Business
                            </DropdownMenuItem>
                            {!business.isVerified && (
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 text-green-600"
                                onClick={() => handleVerify(business._id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Verify Business
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-orange-600"
                              onClick={() => handleArchive(business._id)}
                            >
                              <Archive className="w-4 h-4" />
                              Archive
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
                              Delete Permanently
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

      {/* View Details Dialog - Keep existing implementation */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Business Complete Details</DialogTitle>
            <DialogDescription>All information, images, and location for {selectedBusiness?.name}</DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-6">
              {/* Business Header with Logo */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="relative">
                  <img
                    src={selectedBusiness.logo || selectedBusiness.profileImage || '/logo.svg'}
                    alt={selectedBusiness.name}
                    className="h-20 w-20 rounded-lg object-cover border-2 border-slate-200"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.svg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedBusiness.name}</h3>
                  <p className="text-sm text-slate-600">{selectedBusiness.email}</p>
                  <div className="mt-2">{getVerificationBadge(selectedBusiness)}</div>
                </div>
              </div>

              {/* Business Images Gallery */}
              {businessImages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Business Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {businessImages.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={img}
                          alt={`${selectedBusiness.name} image ${index + 1}`}
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

              {/* Business Card Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <p className="text-sm font-semibold text-slate-700 mb-1">QR Scans</p>
                      <p className="text-sm text-slate-600 font-medium">{selectedBusiness.qrScans || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Joined Date</p>
                      <p className="text-sm text-slate-600">
                        {new Date(selectedBusiness.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address with Map */}
              {selectedBusiness.address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    </div>
                    {selectedBusiness.address.city && selectedBusiness.address.state && (
                      <div className="w-full">
                        <Button
                          variant="outline"
                          className="w-full"
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Owner Information */}
              {selectedBusiness.owner && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Owner Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Name</p>
                        <p className="text-sm text-slate-600">{selectedBusiness.owner.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Email</p>
                        <p className="text-sm text-slate-600">{selectedBusiness.owner.email}</p>
                      </div>
                      {selectedBusiness.owner.phone && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Phone</p>
                          <p className="text-sm text-slate-600">{selectedBusiness.owner.phone}</p>
                        </div>
                      )}
                      {selectedBusiness.owner.role && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Role</p>
                          <Badge variant="outline">{selectedBusiness.owner.role}</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subscription Details */}
              {selectedBusiness.subscription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subscription Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Status</p>
                        <Badge>{selectedBusiness.subscription.status}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Plan</p>
                        {getSubscriptionBadge(selectedBusiness.subscription)}
                      </div>
                      {selectedBusiness.subscription.planPrice && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Price</p>
                          <p className="text-sm text-slate-600">₹{selectedBusiness.subscription.planPrice}</p>
                        </div>
                      )}
                      {selectedBusiness.subscription.daysRemaining !== undefined && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Days Remaining</p>
                          <p className="text-sm text-slate-600">{selectedBusiness.subscription.daysRemaining}</p>
                        </div>
                      )}
                      {selectedBusiness.subscription.startDate && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Start Date</p>
                          <p className="text-sm text-slate-600">
                            {new Date(selectedBusiness.subscription.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {selectedBusiness.subscription.endDate && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">End Date</p>
                          <p className="text-sm text-slate-600">
                            {new Date(selectedBusiness.subscription.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              if (selectedBusiness) handleEdit(selectedBusiness._id);
            }}>Edit Business</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Keep existing implementation */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>Update business information</DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Business Name</label>
                <Input
                  value={selectedBusiness.name}
                  onChange={(e) => setSelectedBusiness({ ...selectedBusiness, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Email</label>
                <Input
                  type="email"
                  value={selectedBusiness.email}
                  onChange={(e) => setSelectedBusiness({ ...selectedBusiness, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Phone</label>
                <Input
                  value={selectedBusiness.phone || ''}
                  onChange={(e) => setSelectedBusiness({ ...selectedBusiness, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Business Category</label>
                <Select
                  value={selectedBusiness.businessCategory}
                  onValueChange={(value) => {
                    setSelectedBusiness({ ...selectedBusiness, businessCategory: value, businessType: '' });
                    setSelectedCategoryForTypes(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Business Type</label>
                <Select
                  value={selectedBusiness.businessType}
                  onValueChange={(value) => setSelectedBusiness({ ...selectedBusiness, businessType: value })}
                  disabled={!selectedCategoryForTypes || businessTypes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={businessTypes.length === 0 ? "Select category first" : "Select business type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.length > 0 ? (
                      businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No types available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {businessTypes.length === 0 && selectedCategoryForTypes && (
                  <p className="text-xs text-slate-500 mt-1">No business types found for this category</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to permanently delete <strong>{selectedBusiness?.name}</strong>? 
              This action cannot be undone. All data associated with this business will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
