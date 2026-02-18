import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, RefreshCw, DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { LineChart as RechartsLineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function RevenueAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const statsResponse = await api.getAdminStats();
      const revenueResponse = await api.getRevenueAnalytics();
      
      if (statsResponse.success && statsResponse.data) {
        // Handle both array and object response formats
        let monthlyRevenue: any[] = [];
        if (Array.isArray(revenueResponse)) {
          monthlyRevenue = revenueResponse.map((item: any) => ({ month: item.month, revenue: item.revenue || 0 }));
        } else if (revenueResponse?.success && Array.isArray(revenueResponse.data)) {
          monthlyRevenue = revenueResponse.data.map((item: any) => ({ month: item.month, revenue: item.revenue || 0 }));
        } else if (revenueResponse?.data && Array.isArray(revenueResponse.data)) {
          monthlyRevenue = revenueResponse.data.map((item: any) => ({ month: item.month, revenue: item.revenue || 0 }));
        }
        
        setAnalytics({
          totalRevenue: statsResponse.data.monthlyRevenue || 0,
          activeSubscriptions: statsResponse.data.activeSubscriptions || 0,
          monthlyRevenue,
          planDistribution: statsResponse.data.planDistribution || {},
        });
      }
    } catch (error) {

      toast.error("Failed to load revenue analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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

  const monthlyData = analytics?.monthlyRevenue || [];
  const planData = Object.entries(analytics?.planDistribution || {}).map(([name, data]: [string, any]) => ({
    name,
    revenue: data.revenue || 0,
    count: data.count || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <LineChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
            <p className="text-slate-600 mt-1">Track revenue trends and financial metrics</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 text-green-900">₹{analytics?.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-xs text-green-600 mt-1">Monthly recurring</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Active Subscriptions</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">{analytics?.activeSubscriptions || 0}</p>
                <p className="text-xs text-blue-600 mt-1">Paying customers</p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Revenue</p>
                <p className="text-3xl font-bold mt-2 text-purple-900">
                  ₹{analytics?.activeSubscriptions > 0 
                    ? Math.round((analytics.totalRevenue || 0) / analytics.activeSubscriptions)
                    : 0}
                </p>
                <p className="text-xs text-purple-600 mt-1">Per subscription</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>Revenue distribution across subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            {planData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={planData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>No plan data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown by Plan</CardTitle>
          <CardDescription>Detailed revenue analysis by subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {planData.map((plan) => (
              <div key={plan.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{plan.name} Plan</span>
                  <Badge variant="outline">{plan.count} businesses</Badge>
                </div>
                <div className="text-2xl font-bold text-green-600">₹{plan.revenue.toLocaleString()}</div>
                <div className="text-sm text-slate-500 mt-1">Monthly revenue</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
