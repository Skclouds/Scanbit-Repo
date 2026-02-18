import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw, TrendingUp, Clock, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SupportAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.getTicketStats({ dateRange: '30' });
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {

      toast.error("Failed to load support analytics");
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

  const metrics = stats?.metrics || {};
  const categoryData = stats?.categoryBreakdown?.map((item: any) => ({
    name: item.category || 'Unknown',
    value: item.count || 0,
  })) || [];
  const statusData = stats?.statusBreakdown?.map((item: any) => ({
    name: item.status || 'Unknown',
    value: item.count || 0,
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Support Analytics</h2>
            <p className="text-slate-600 mt-1">Track support performance and metrics</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Tickets</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalTickets || 0}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Open Tickets</p>
                <p className="text-3xl font-bold mt-2 text-blue-600">{metrics.openTickets || 0}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Resolved</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{metrics.resolvedTickets || 0}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Response</p>
                <p className="text-3xl font-bold mt-2">{Math.round(metrics.avgResponseTime || 0)}m</p>
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
            <CardTitle>Tickets by Category</CardTitle>
            <CardDescription>Distribution of tickets across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>No status data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Avg Response Time</span>
              <span className="font-semibold">{Math.round(metrics.avgResponseTime || 0)} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Avg Resolution Time</span>
              <span className="font-semibold">{Math.round(metrics.avgResolutionTime || 0)} hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Satisfaction Rating</span>
              <span className="font-semibold">
                {metrics.avgSatisfaction ? metrics.avgSatisfaction.toFixed(1) : 'N/A'} / 5
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ticket Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Open</span>
              <span className="font-semibold text-blue-600">{metrics.openTickets || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">In Progress</span>
              <span className="font-semibold text-yellow-600">{metrics.inProgressTickets || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Resolved</span>
              <span className="font-semibold text-green-600">{metrics.resolvedTickets || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Closed</span>
              <span className="font-semibold text-gray-600">{metrics.closedTickets || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Urgent</span>
              <span className="font-semibold text-red-600">{metrics.urgentTickets || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">High</span>
              <span className="font-semibold text-orange-600">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Medium</span>
              <span className="font-semibold text-yellow-600">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Low</span>
              <span className="font-semibold text-blue-600">—</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
