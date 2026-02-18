import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw, TrendingUp, Users, DollarSign, Building2, QrCode, Package } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AnalyticsData {
  totalUsers: number;
  totalRestaurants: number;
  totalRevenue: number;
  totalQRScans: number;
  activeSubscriptions: number;
  pendingApprovals: number;
}

export default function OverviewAnalytics() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalRestaurants: 0,
    totalRevenue: 0,
    totalQRScans: 0,
    activeSubscriptions: 0,
    pendingApprovals: 0,
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminStats();
      
      if (response.success && response.data) {
        setAnalytics({
          totalUsers: response.data.totalUsers || 0,
          totalRestaurants: response.data.totalRestaurants || 0,
          totalRevenue: response.data.monthlyRevenue || 0,
          totalQRScans: response.data.totalQRScans || 0,
          activeSubscriptions: response.data.activeSubscriptions || 0,
          pendingApprovals: response.data.pendingBusinesses || 0,
        });
      }
    } catch (error) {

      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
    toast.success("Analytics refreshed");
  };

  // Mock chart data - in production, fetch from API
  const revenueData = [
    { month: 'Jan', revenue: analytics.totalRevenue * 0.8 },
    { month: 'Feb', revenue: analytics.totalRevenue * 0.85 },
    { month: 'Mar', revenue: analytics.totalRevenue * 0.9 },
    { month: 'Apr', revenue: analytics.totalRevenue * 0.95 },
    { month: 'May', revenue: analytics.totalRevenue },
    { month: 'Jun', revenue: analytics.totalRevenue * 1.05 },
  ];

  const growthData = [
    { month: 'Jan', users: Math.round(analytics.totalUsers * 0.7), businesses: Math.round(analytics.totalRestaurants * 0.7) },
    { month: 'Feb', users: Math.round(analytics.totalUsers * 0.75), businesses: Math.round(analytics.totalRestaurants * 0.75) },
    { month: 'Mar', users: Math.round(analytics.totalUsers * 0.8), businesses: Math.round(analytics.totalRestaurants * 0.8) },
    { month: 'Apr', users: Math.round(analytics.totalUsers * 0.85), businesses: Math.round(analytics.totalRestaurants * 0.85) },
    { month: 'May', users: Math.round(analytics.totalUsers * 0.9), businesses: Math.round(analytics.totalRestaurants * 0.9) },
    { month: 'Jun', users: analytics.totalUsers, businesses: analytics.totalRestaurants },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg animate-pulse">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Overview Analytics</h2>
            <p className="text-slate-600 mt-1">Comprehensive analytics dashboard with real-time data</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">{analytics.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">Registered users</p>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 text-green-900">₹{analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Monthly recurring revenue</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Businesses</p>
                <p className="text-3xl font-bold mt-2 text-purple-900">{analytics.totalRestaurants.toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-1">Active businesses</p>
              </div>
              <Building2 className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">QR Scans</p>
                <p className="text-3xl font-bold mt-2 text-orange-900">{analytics.totalQRScans.toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">Total scans</p>
              </div>
              <QrCode className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Active Subscriptions</p>
                <p className="text-3xl font-bold mt-2 text-slate-900">{analytics.activeSubscriptions.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Currently active</p>
              </div>
              <TrendingUp className="w-10 h-10 text-slate-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Pending Approvals</p>
                <p className="text-3xl font-bold mt-2 text-slate-900">{analytics.pendingApprovals.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Awaiting verification</p>
              </div>
              <Package className="w-10 h-10 text-slate-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User & Business Growth</CardTitle>
            <CardDescription>Growth trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#3b82f6" name="Users" />
                <Bar dataKey="businesses" fill="#8b5cf6" name="Businesses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
