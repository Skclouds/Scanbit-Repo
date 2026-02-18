import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, } from 'recharts';
import { Building2, TrendingUp, Users, RefreshCw, Eye, Edit, Archive, MoreVertical, DollarSign, CheckCircle2, Clock, XCircle, Filter, Download, Search, } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import api from '@/lib/api';


interface Business {
  _id: string;
  name: string;
  email: string;
  logo?: string;
  isVerified: boolean;
  verificationStatus: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

interface BusinessType {
  name: string;
  count: number;
  verified: number;
  pending: number;
  active: number;
}

interface CategoryData {
  name: string;
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  active: number;
  inactive: number;
  planStats: {
    Free: number;
    Basic: number;
    Pro: number;
  };
  totalRevenue: number;
  businessTypes: BusinessType[];
  percentage: number;
  verificationRate: number;
  businesses: Business[];
}

interface CategoryStats {
  categories: CategoryData[];
  totals: {
    totalBusinesses: number;
    totalVerified: number;
    totalPending: number;
    totalRejected: number;
    totalActive: number;
    totalRevenue: number;
  };
  lastUpdated: string;
}

export default function Categories() {
  const { toast } = useToast();
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');

  const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      
      // Try the dedicated analytics endpoint first
      try {
        const response = await api.getCategoriesAnalytics();
        
        if (response.success && response.data && response.data.categories && Array.isArray(response.data.categories)) {
          // Ensure we have valid data
          if (response.data.categories.length > 0 || response.data.totals) {
            setCategoryStats(response.data);
            return;
          }
        }
      } catch (apiError: any) {

      }
      
      // Fallback: fetch categories and calculate manually
      await fetchCategoriesFallback();
    } catch (error: any) {

      toast({
        title: 'Warning',
        description: 'Using fallback method to fetch category data',
        variant: 'default',
      });
      // Fallback to manual calculation
      await fetchCategoriesFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesFallback = async () => {
    try {
      // Fetch business categories from database
      let dbCategories: string[] = [];
      try {
        const categoriesResponse = await api.getBusinessCategories();
        if (categoriesResponse.success && categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          dbCategories = categoriesResponse.data.map((cat: any) => cat.name || cat).filter(Boolean);
        }
      } catch (error) {
        // Continue to next fallback
      }
      
      // Fetch all businesses first to get unique categories
      let allBusinesses: any[] = [];
      try {
        const allResponse = await api.getAdminRestaurants({
          limit: 10000,
          isArchived: false,
        });
        
        if (allResponse.success && Array.isArray(allResponse.data)) {
          allBusinesses = allResponse.data;
          
          // If no categories from database, get unique from businesses
          if (dbCategories.length === 0) {
            const uniqueCategories = new Set<string>();
            allBusinesses.forEach((restaurant: any) => {
              if (restaurant.businessCategory && restaurant.businessCategory.trim()) {
                uniqueCategories.add(restaurant.businessCategory);
              }
            });
            dbCategories = Array.from(uniqueCategories).sort();
          }
        }
      } catch (error) {
        // Continue with empty businesses array
      }
      
      // Final fallback to defaults if still no categories
      if (dbCategories.length === 0) {
        dbCategories = ['Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design'];
      }
      
      // Calculate stats for each category
      const categories: CategoryData[] = dbCategories.map((categoryName: string) => {
        const categoryBusinesses = allBusinesses.filter((b: any) => 
          b.businessCategory === categoryName
        );
        
        const verified = categoryBusinesses.filter((b: any) => b.isVerified === true).length;
        const pending = categoryBusinesses.filter((b: any) => 
          b.isVerified !== true && b.verificationStatus !== 'rejected'
        ).length;
        const rejected = categoryBusinesses.filter((b: any) => 
          b.verificationStatus === 'rejected'
        ).length;
        const active = categoryBusinesses.filter((b: any) => 
          b.subscription?.status === 'active'
        ).length;
        
        const planStats = {
          Free: categoryBusinesses.filter((b: any) => (b.subscription?.plan || 'Free') === 'Free').length,
          Basic: categoryBusinesses.filter((b: any) => b.subscription?.plan === 'Basic').length,
          Pro: categoryBusinesses.filter((b: any) => b.subscription?.plan === 'Pro').length,
        };
        
        const totalRevenue = categoryBusinesses.reduce((sum: number, business: any) => {
          return sum + (business.subscription?.planPrice || 0);
        }, 0);
        
        // Business types
        const businessTypesMap: Record<string, BusinessType> = {};
        categoryBusinesses.forEach((business: any) => {
          const type = business.businessType || 'Unknown';
          if (!businessTypesMap[type]) {
            businessTypesMap[type] = {
              name: type,
              count: 0,
              verified: 0,
              pending: 0,
              active: 0,
            };
          }
          businessTypesMap[type].count++;
          if (business.isVerified) businessTypesMap[type].verified++;
          if (!business.isVerified && business.verificationStatus !== 'rejected') businessTypesMap[type].pending++;
          if (business.subscription?.status === 'active') businessTypesMap[type].active++;
        });
        
        return {
          name: categoryName,
          total: categoryBusinesses.length,
          verified,
          pending,
          rejected,
          active,
          inactive: categoryBusinesses.length - active,
          planStats,
          totalRevenue,
          businessTypes: Object.values(businessTypesMap).sort((a, b) => b.count - a.count),
          percentage: allBusinesses.length > 0 ? Math.round((categoryBusinesses.length / allBusinesses.length) * 100) : 0,
          verificationRate: categoryBusinesses.length > 0 ? Math.round((verified / categoryBusinesses.length) * 100) : 0,
          businesses: categoryBusinesses.slice(0, 10),
        };
      });
      
      const totals = {
        totalBusinesses: allBusinesses.length,
        totalVerified: categories.reduce((sum, cat) => sum + cat.verified, 0),
        totalPending: categories.reduce((sum, cat) => sum + cat.pending, 0),
        totalRejected: categories.reduce((sum, cat) => sum + cat.rejected, 0),
        totalActive: categories.reduce((sum, cat) => sum + cat.active, 0),
        totalRevenue: categories.reduce((sum, cat) => sum + cat.totalRevenue, 0),
      };
      
      // Always set stats, even if empty - this ensures the page shows something
      setCategoryStats({
        categories: categories.sort((a, b) => b.total - a.total),
        totals,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {

      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch category statistics. Please try refreshing.',
        variant: 'destructive',
      });
      // Set empty stats instead of null to show empty state
      setCategoryStats({
        categories: [],
        totals: {
          totalBusinesses: 0,
          totalVerified: 0,
          totalPending: 0,
          totalRejected: 0,
          totalActive: 0,
          totalRevenue: 0,
        },
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    fetchCategoryStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCategoryStats();
    setIsRefreshing(false);
  };

  const handleViewAllBusinesses = (categoryName: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('activeTab', 'restaurants');
    url.searchParams.set('category', categoryName);
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleViewCategoryDetails = (category: CategoryData) => {
    setSelectedCategory(category);
    setViewDialogOpen(true);
  };

  // Filter categories - show all categories even if they have 0 businesses when filter is 'all'
  const filteredCategories = categoryStats?.categories?.filter(cat => {
    if (!cat || !cat.name) return false;
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterType === 'all' || // Show all when filter is 'all', even with 0 businesses
      (filterType === 'verified' && cat.verified > 0) ||
      (filterType === 'pending' && cat.pending > 0) ||
      (filterType === 'rejected' && cat.rejected > 0);
    return matchesSearch && matchesFilter;
  }) || [];
  

  const chartData = filteredCategories.map((cat) => ({
    name: cat.name.split(' / ')[0].slice(0, 12),
    Verified: cat.verified,
    Pending: cat.pending,
    Rejected: cat.rejected,
  }));

  const pieData = filteredCategories.map((cat) => ({
    name: cat.name,
    value: cat.total,
    revenue: cat.totalRevenue,
  }));

  const planDistributionData = filteredCategories.flatMap((cat) => [
    { category: cat.name.split(' / ')[0].slice(0, 10), plan: 'Free', count: cat.planStats.Free },
    { category: cat.name.split(' / ')[0].slice(0, 10), plan: 'Basic', count: cat.planStats.Basic },
    { category: cat.name.split(' / ')[0].slice(0, 10), plan: 'Pro', count: cat.planStats.Pro },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Categories</h2>
          <p className="text-slate-600 mt-2">Comprehensive analytics and distribution across all categories</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Businesses</p>
                <p className="text-3xl font-bold mt-2">{categoryStats?.totals.totalBusinesses || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Across all categories</p>
              </div>
              <Building2 className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Verified</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{categoryStats?.totals.totalVerified || 0}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {categoryStats?.totals.totalBusinesses 
                    ? Math.round((categoryStats.totals.totalVerified / categoryStats.totals.totalBusinesses) * 100)
                    : 0}% verified
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Approval</p>
                <p className="text-3xl font-bold mt-2 text-orange-600">{categoryStats?.totals.totalPending || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 text-emerald-600">₹{categoryStats?.totals.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Monthly recurring</p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('verified')}
              >
                Verified
              </Button>
              <Button
                variant={filterType === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filterType === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('rejected')}
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status by Category</CardTitle>
            <CardDescription>Verified, Pending, and Rejected businesses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8 h-80">
                <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 h-80 text-slate-500">
                <Building2 className="w-12 h-12 mb-2 opacity-50" />
                <p>No category data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Verified" fill="#22c55e" />
                  <Bar dataKey="Pending" fill="#f97316" />
                  <Bar dataKey="Rejected" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution by Category</CardTitle>
            <CardDescription>Market share across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8 h-80">
                <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 h-80 text-slate-500">
                <Building2 className="w-12 h-12 mb-2 opacity-50" />
                <p>No category data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split(' /')[0].slice(0, 8)}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {filteredCategories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution Chart */}
      {planDistributionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan Distribution</CardTitle>
            <CardDescription>Plan distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={planDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Free" stackId="a" fill="#94a3b8" />
                <Bar dataKey="Basic" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Pro" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Detailed breakdown for each category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : !categoryStats || categoryStats.categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium mb-2">No categories found</p>
              <p className="text-slate-500 text-sm mb-4">
                Categories will appear here once businesses are registered in the system.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('activeTab', 'restaurants');
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  View All Businesses
                </Button>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium mb-2">
                {searchQuery ? 'No categories match your search' : 'No categories match the filter'}
              </p>
              <p className="text-slate-500 text-sm">
                {searchQuery 
                  ? 'Try adjusting your search query' 
                  : 'Try selecting a different filter'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setFilterType('all')}
              >
                Show All Categories
              </Button>
            </div>
          ) : (
            filteredCategories.map((category, index) => (
              <div key={category.name} className="border rounded-lg p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg text-slate-900">{category.name}</h3>
                        <Badge className="bg-slate-100 text-slate-700">
                          {category.total} businesses
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {category.verificationRate}% verified
                        </Badge>
                        {category.totalRevenue > 0 && (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            ₹{category.totalRevenue.toLocaleString()}/mo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {category.percentage}% of total businesses
                      </p>
                    </div>
                  </div>
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
                        onClick={() => handleViewAllBusinesses(category.name)}
                      >
                        <Eye className="w-4 h-4" />
                        View All Businesses
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer gap-2"
                        onClick={() => handleViewCategoryDetails(category)}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2 text-red-600">
                        <Archive className="w-4 h-4" />
                        Archive Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-slate-900">{category.total}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Verified</p>
                    <p className="text-2xl font-bold text-green-600">{category.verified}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{category.pending}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{category.rejected}</p>
                  </div>
                </div>

                {/* Verification Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Verification Rate</span>
                    <span className="font-semibold text-green-600">{category.verificationRate}%</span>
                  </div>
                  <Progress
                    value={category.verificationRate}
                    className="h-2"
                  />
                </div>

                {/* Plan Distribution */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-600">Free Plan</p>
                    <p className="text-lg font-bold text-slate-700">{category.planStats.Free}</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-slate-600">Basic Plan</p>
                    <p className="text-lg font-bold text-blue-700">{category.planStats.Basic}</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-xs text-slate-600">Pro Plan</p>
                    <p className="text-lg font-bold text-purple-700">{category.planStats.Pro}</p>
                  </div>
                </div>

                {/* Business Types */}
                {category.businessTypes && category.businessTypes.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Business Types</p>
                    <div className="flex flex-wrap gap-2">
                      {category.businessTypes.slice(0, 5).map((type) => (
                        <Badge key={type.name} variant="outline" className="text-xs">
                          {type.name} ({type.count})
                        </Badge>
                      ))}
                      {category.businessTypes.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.businessTypes.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Category Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCategory?.name} - Complete Details</DialogTitle>
            <DialogDescription>Comprehensive analytics and information</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Total Businesses</p>
                  <p className="text-3xl font-bold text-slate-900">{selectedCategory.total}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Verified</p>
                  <p className="text-3xl font-bold text-green-600">{selectedCategory.verified}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{selectedCategory.pending}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600">₹{selectedCategory.totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Plan Distribution */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Subscription Plan Distribution</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Free Plan</p>
                    <p className="text-2xl font-bold text-slate-700">{selectedCategory.planStats.Free}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedCategory.total > 0 
                        ? Math.round((selectedCategory.planStats.Free / selectedCategory.total) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Basic Plan</p>
                    <p className="text-2xl font-bold text-blue-700">{selectedCategory.planStats.Basic}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedCategory.total > 0 
                        ? Math.round((selectedCategory.planStats.Basic / selectedCategory.total) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">Pro Plan</p>
                    <p className="text-2xl font-bold text-purple-700">{selectedCategory.planStats.Pro}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedCategory.total > 0 
                        ? Math.round((selectedCategory.planStats.Pro / selectedCategory.total) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Types */}
              {selectedCategory.businessTypes && selectedCategory.businessTypes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Business Types Breakdown</h4>
                  <div className="space-y-2">
                    {selectedCategory.businessTypes.map((type) => (
                      <div key={type.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{type.name}</p>
                          <div className="flex gap-4 mt-1 text-xs text-slate-600">
                            <span>Total: {type.count}</span>
                            <span>Verified: {type.verified}</span>
                            <span>Pending: {type.pending}</span>
                            <span>Active: {type.active}</span>
                          </div>
                        </div>
                        <Progress
                          value={selectedCategory.total > 0 ? (type.count / selectedCategory.total) * 100 : 0}
                          className="w-24 h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Businesses */}
              {selectedCategory.businesses && selectedCategory.businesses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Sample Businesses (Top 10)</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedCategory.businesses.map((business) => (
                      <div key={business._id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                            {business.logo ? (
                              <img src={business.logo} alt={business.name} className="w-8 h-8 rounded object-cover" />
                            ) : (
                              <Building2 className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{business.name}</p>
                            <p className="text-xs text-slate-500">{business.email}</p>
                          </div>
                        </div>
                        <Badge className={business.isVerified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                          {business.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              if (selectedCategory) {
                setViewDialogOpen(false);
                handleViewAllBusinesses(selectedCategory.name);
              }
            }}>View All Businesses</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
