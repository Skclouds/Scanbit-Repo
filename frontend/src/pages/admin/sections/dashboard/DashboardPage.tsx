import { Building2, CheckCircle, DollarSign, Users, MousePointerClick, CheckCircle2, TrendingUp, Activity, Store, ShoppingBag, Palette, ChevronRight, Eye, } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";

import { useAdminDashboard } from "../../hooks/useAdminDashboard";


// Business type pricing structure
const businessTypePricing = {
  "Food Mall": {
    Free: 0,
    Basic: 299,
    Pro: 699,
  },
  "Retail / E-Commerce Businesses": {
    Free: 0,
    Basic: 349,
    Pro: 799,
  },
  "Creative & Design": {
    Free: 0,
    Basic: 399,
    Pro: 899,
  },
};

const DashboardPage = () => {
  const {
    stats,
    statsLoading,
    restaurants,
    restaurantsLoading,
    users,
    chartData,
    formatCurrency,
    formatDate,
    sortedRestaurants,
    setActiveTab,
    setSidebarOpen,
    setSelectedRestaurant,
    setShowRestaurantDialog,
    fetchStats,
    fetchRestaurants,
  } = useAdminDashboard();

  useEffect(() => {
    fetchStats();
    fetchRestaurants();
  }, []);

  // Calculate plan distribution dynamically from database categories
  const [planDistribution, setPlanDistribution] = useState({
    overall: {
      Free: { count: 0, revenue: 0 },
      Basic: { count: 0, revenue: 0 },
      Pro: { count: 0, revenue: 0 },
    },
    byType: {} as Record<string, { Free: { count: number; revenue: number }; Basic: { count: number; revenue: number }; Pro: { count: number; revenue: number } }>,
  });

  useEffect(() => {
    const calculateDistribution = async () => {
      // Fetch business categories from database
      try {
        const categoriesResponse = await api.getBusinessCategories();
        const dbCategories = categoriesResponse.success && categoriesResponse.data 
          ? categoriesResponse.data.map((cat: any) => cat.name)
          : ['Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design'];
        
        // Initialize byType with database categories
        const byType: Record<string, { Free: { count: number; revenue: number }; Basic: { count: number; revenue: number }; Pro: { count: number; revenue: number } }> = {};
        dbCategories.forEach((cat: string) => {
          byType[cat] = { Free: { count: 0, revenue: 0 }, Basic: { count: 0, revenue: 0 }, Pro: { count: 0, revenue: 0 } };
        });

        const overall = {
          Free: { count: 0, revenue: 0 },
          Basic: { count: 0, revenue: 0 },
          Pro: { count: 0, revenue: 0 },
        };

        restaurants.forEach((r: any) => {
          const plan = r.subscription?.plan || "Free";
          const businessCategory = r.businessCategory || dbCategories[0] || "Food Mall";
          const price = r.subscription?.planPrice || 0;
          
          if (plan in overall) {
            overall[plan as keyof typeof overall].count++;
            overall[plan as keyof typeof overall].revenue += price;
          }
          
          if (businessCategory in byType && plan in byType[businessCategory]) {
            byType[businessCategory][plan as keyof typeof byType[string]].count++;
            byType[businessCategory][plan as keyof typeof byType[string]].revenue += price;
          }
        });

        setPlanDistribution({ overall, byType });
      } catch (error) {
        // Fallback to default categories if API fails
        const defaultByType = {
          "Food Mall": { Free: { count: 0, revenue: 0 }, Basic: { count: 0, revenue: 0 }, Pro: { count: 0, revenue: 0 } },
          "Retail / E-Commerce Businesses": { Free: { count: 0, revenue: 0 }, Basic: { count: 0, revenue: 0 }, Pro: { count: 0, revenue: 0 } },
          "Creative & Design": { Free: { count: 0, revenue: 0 }, Basic: { count: 0, revenue: 0 }, Pro: { count: 0, revenue: 0 } },
        };
        
        restaurants.forEach((r: any) => {
          const plan = r.subscription?.plan || "Free";
          const businessCategory = r.businessCategory || "Food Mall";
          const price = r.subscription?.planPrice || 0;
          
          if (plan in defaultByType["Food Mall"]) {
            defaultByType["Food Mall"][plan as keyof typeof defaultByType["Food Mall"]].count++;
            defaultByType["Food Mall"][plan as keyof typeof defaultByType["Food Mall"]].revenue += price;
          }
        });
        
        setPlanDistribution({ overall: defaultByType["Food Mall"], byType: defaultByType });
      }
    };

    if (restaurants.length > 0) {
      calculateDistribution();
    }
  }, [restaurants]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Businesses
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-10 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.totalRestaurants.toLocaleString()}</div>
                {stats.newThisMonth > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-emerald-600 font-medium">+{stats.newThisMonth}</span> this month
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Subscriptions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-10 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-emerald-600">{stats.activeSubscriptions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-500">{stats.expiredSubscriptions}</span> expired
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue (MRR)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-10 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-accent">{formatCurrency(stats.monthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Recurring revenue</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-10 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-purple-600">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered users</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total QR Scans
            </CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-10 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.totalQRScans.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">All time scans</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified Businesses
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {restaurants.filter((r: any) => r.verificationStatus === "verified" || r.isVerified).length.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {restaurants.filter((r: any) => r.verificationStatus === "pending" || (!r.verificationStatus && !r.isVerified)).length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(
                stats.activeSubscriptions > 0
                  ? stats.monthlyRevenue / stats.activeSubscriptions
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per active subscription</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {users.filter((u: any) => u.isActive !== false).length.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {users.filter((u: any) => u.isActive === false).length} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Business & User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Overview</CardTitle>
            <CardDescription>Business and user growth over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.growthData}>
                <defs>
                  <linearGradient id="colorBusinesses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="businesses" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorBusinesses)"
                  name="Businesses"
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)"
                  name="Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue generated over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Business Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Business Categories</CardTitle>
            <CardDescription>Distribution of businesses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Distribution of subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.planData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Scanned Businesses Chart */}
      {chartData.topScannedBusinesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Scanned Businesses</CardTitle>
            <CardDescription>Businesses with the most QR code scans</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={chartData.topScannedBusinesses}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="scans" fill="#10b981" radius={[0, 8, 8, 0]} name="QR Scans" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Plan Distribution by Business Type */}
      <div className="space-y-6">
        {/* Overall Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Subscription Plans</CardTitle>
            <CardDescription>Total subscriptions across all business types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-4">
              {Object.entries(planDistribution.overall).map(([planName, data]) => (
                <div key={planName} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{planName} Plan</span>
                    <span className="text-sm text-muted-foreground">
                      {planName === "Free" ? "Free" : "Paid"}
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-1">{data.count}</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Revenue: {formatCurrency(data.revenue)}
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full"
                      style={{
                        width: `${stats.totalRestaurants > 0 ? (data.count / stats.totalRestaurants) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution by Business Type */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions by Business Type</CardTitle>
            <CardDescription>Breakdown of subscriptions across different business categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(planDistribution.byType).map(([businessType, plans]) => {
                const pricing = businessTypePricing[businessType as keyof typeof businessTypePricing] || businessTypePricing["Food Mall"];
                return (
                  <div key={businessType} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      {businessType === "Food Mall" && <Store className="w-4 h-4" />}
                      {businessType === "Retail / E-Commerce Businesses" && <ShoppingBag className="w-4 h-4" />}
                      {businessType === "Creative & Design" && <Palette className="w-4 h-4" />}
                      {businessType}
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(plans).map(([planName, data]) => (
                        <div key={planName} className="p-3 bg-secondary/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{planName}</span>
                            <span className="text-xs text-muted-foreground">
                              {planName === "Free" ? "Free" : formatCurrency(pricing[planName as keyof typeof pricing])}/mo
                            </span>
                          </div>
                          <div className="text-xl font-bold">{data.count}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(data.revenue)} revenue
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Businesses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Businesses</CardTitle>
              <CardDescription>Latest businesses registered on the platform</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("restaurants");
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {restaurantsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : sortedRestaurants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No restaurants found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Business</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">QR Scans</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRestaurants.slice(0, 10).map((restaurant: any) => (
                    <tr key={restaurant._id || restaurant.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={
                                restaurant.logo ||
                                restaurant.ownerImage ||
                                restaurant.profileImage ||
                                undefined
                              }
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                              {(restaurant.name || "B").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{restaurant.name || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{restaurant.email || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            restaurant.subscription?.plan === "Pro"
                              ? "default"
                              : restaurant.subscription?.plan === "Basic"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {restaurant.subscription?.plan || "Free"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            restaurant.subscription?.status === "active"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {restaurant.subscription?.status === "active" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {restaurant.subscription?.status || "inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {(restaurant.qrScans || restaurant.qrScansThisMonth || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setShowRestaurantDialog(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
