import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, RefreshCw, Building2, TrendingUp, Users, CheckCircle2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function BusinessAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Get stats for totals
      const statsResponse = await api.getAdminStats();
      // Get business analytics for charts
      const analyticsResponse = await api.getBusinessAnalytics();
      
      if (statsResponse.success && statsResponse.data) {
        // Handle both array and object response formats
        let monthlyData: any[] = [];
        if (Array.isArray(analyticsResponse)) {
          monthlyData = analyticsResponse.map((item: any) => ({ month: item.month, count: item.businesses || 0 }));
        } else if (analyticsResponse?.success && Array.isArray(analyticsResponse.data)) {
          monthlyData = analyticsResponse.data.map((item: any) => ({ month: item.month, count: item.businesses || 0 }));
        } else if (analyticsResponse?.data && Array.isArray(analyticsResponse.data)) {
          monthlyData = analyticsResponse.data.map((item: any) => ({ month: item.month, count: item.businesses || 0 }));
        }
        
        setAnalytics({
          totalBusinesses: statsResponse.data.totalRestaurants || 0,
          verifiedBusinesses: statsResponse.data.verifiedBusinesses || 0,
          pendingBusinesses: statsResponse.data.pendingBusinesses || 0,
          monthlyData,
          categoryData: Object.entries(statsResponse.data.plansByBusinessType || {}).map(([name, data]: [string, any]) => ({
            name,
            count: Object.values(data).reduce((sum: number, plan: any) => sum + (plan.count || 0), 0)
          }))
        });
      }
    } catch (error) {

      toast.error("Failed to load business analytics");
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

  const monthlyData = analytics?.monthlyData || [];
  const categoryData = analytics?.categoryData || [];
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <PieChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Business Analytics</h2>
            <p className="text-slate-600 mt-1">Detailed business performance metrics</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Total Businesses</p>
                <p className="text-3xl font-bold mt-2 text-indigo-900">{analytics?.totalBusinesses || 0}</p>
              </div>
              <Building2 className="w-10 h-10 text-indigo-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Verified Businesses</p>
                <p className="text-3xl font-bold mt-2 text-green-900">{analytics?.verifiedBusinesses || 0}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Pending Approval</p>
                <p className="text-3xl font-bold mt-2 text-purple-900">{analytics?.pendingBusinesses || 0}</p>
              </div>
              <Clock className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Growth</CardTitle>
            <CardDescription>Monthly business registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="New Businesses" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Businesses by Category</CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
