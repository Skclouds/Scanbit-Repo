import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp, DollarSign, Users, Building2, QrCode, CreditCard, Package, Crown, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";


interface DashboardOverviewProps {
  stats: {
    totalUsers: number;
    totalRestaurants: number;
    totalRevenue: number;
    totalQRScans: number;
    activeSubscriptions: number;
    pendingApprovals: number;
  };
  chartData: any[];
  revenueData: any[];
  loading: boolean;
}

export default function DashboardOverview({ stats, chartData, revenueData, loading }: DashboardOverviewProps) {
  // Colors for charts
  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Businesses",
      value: stats.totalRestaurants,
      icon: Building2,
      description: "Active businesses",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "This month",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "QR Scans",
      value: stats.totalQRScans.toLocaleString(),
      icon: QrCode,
      description: "Total scans",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: TrendingUp,
      description: "Current subscribers",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: Package,
      description: "Awaiting verification",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Plan Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Revenue by Plan
            </CardTitle>
            <CardDescription>
              Monthly revenue breakdown by subscription plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Businesses by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Businesses by Category
            </CardTitle>
            <CardDescription>
              Distribution of businesses across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Free Plan</span>
              <Badge variant="secondary">
                {chartData.find(d => d.name === 'Free')?.count || 0} businesses
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Basic Plan</span>
              <Badge variant="outline">
                {chartData.find(d => d.name === 'Basic')?.count || 0} businesses
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pro Plan</span>
              <Badge variant="default">
                {chartData.find(d => d.name === 'Pro')?.count || 0} businesses
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-sm font-medium">
                {stats.activeSubscriptions > 0 
                  ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Revenue per User</span>
              <span className="text-sm font-medium">
                ₹{stats.totalUsers > 0 
                  ? Math.round(stats.totalRevenue / stats.totalUsers)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Business Verification</span>
              <span className="text-sm font-medium">
                {stats.totalRestaurants > 0 
                  ? (((stats.totalRestaurants - stats.pendingApprovals) / stats.totalRestaurants) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Users</span>
                <span className="font-medium">{((stats.totalUsers / (stats.totalUsers + 100)) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(stats.totalUsers / (stats.totalUsers + 100)) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Verified Businesses</span>
                <span className="font-medium">
                  {stats.totalRestaurants > 0 
                    ? (((stats.totalRestaurants - stats.pendingApprovals) / stats.totalRestaurants) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={stats.totalRestaurants > 0 
                  ? ((stats.totalRestaurants - stats.pendingApprovals) / stats.totalRestaurants) * 100
                  : 0} 
                className="h-2" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subscription Rate</span>
                <span className="font-medium">
                  {stats.totalUsers > 0 
                    ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={stats.totalUsers > 0 
                  ? (stats.activeSubscriptions / stats.totalUsers) * 100
                  : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}