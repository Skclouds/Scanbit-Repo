import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, Eye, MousePointer, Play, Pause, Calendar, RefreshCw, Plus, 
  Download, Filter, Monitor, Smartphone, Tablet, ExternalLink, ArrowUpRight, ArrowDownRight,
  Activity, Target, Zap, DollarSign
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "@/lib/api";
import { toast } from "sonner";

export default function AdsDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dateRange, setDateRange] = useState("30");
  const [businessCategory, setBusinessCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchDashboardData();
  }, [dateRange, businessCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.getBusinessCategories();
      if (response.success && response.data) {
        const catNames = response.data.map((cat: any) => cat.name).filter(Boolean);
        setCategories(['all', ...catNames]);
      }
    } catch (error) {

    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getAdvertisementDashboard({ 
        dateRange, 
        businessCategory: businessCategory !== 'all' ? businessCategory : undefined 
      });
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {

      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!dashboardData) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Ads', dashboardData.stats?.totalAds || 0],
      ['Active Campaigns', dashboardData.statusBreakdown?.active || 0],
      ['Total Impressions', dashboardData.stats?.totalImpressions || 0],
      ['Total Clicks', dashboardData.stats?.totalClicks || 0],
      ['CTR', `${dashboardData.stats?.averageCTR || 0}%`],
      ['Average Impressions/Ad', dashboardData.stats?.averageImpressions || 0],
      ['Average Clicks/Ad', dashboardData.stats?.averageClicks || 0],
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ads-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg animate-pulse">
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

  const stats = dashboardData?.stats || {};
  const statusBreakdown = dashboardData?.statusBreakdown || {};
  const timeSeries = dashboardData?.timeSeries || [];
  const topAds = dashboardData?.topAds || [];
  const deviceBreakdown = dashboardData?.deviceBreakdown || {};
  const pageBreakdown = dashboardData?.pageBreakdown || [];
  const typeBreakdown = dashboardData?.typeBreakdown || {};

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Prepare chart data
  const chartData = timeSeries.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    impressions: item.impressions || 0,
    clicks: item.clicks || 0,
    ctr: parseFloat(item.ctr) || 0
  }));

  // Device data for pie chart
  const deviceData = Object.entries(deviceBreakdown).map(([device, data]: [string, any]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: data.impressions || 0,
    clicks: data.clicks || 0
  }));

  // Type breakdown data
  const typeData = Object.entries(typeBreakdown).map(([type, count]: [string, any]) => ({
    name: type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count
  }));

  const chartConfig = {
    impressions: {
      label: "Impressions",
      color: "hsl(var(--chart-1))",
    },
    clicks: {
      label: "Clicks",
      color: "hsl(var(--chart-2))",
    },
    ctr: {
      label: "CTR",
      color: "hsl(var(--chart-3))",
    },
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ads Dashboard</h2>
            <p className="text-slate-600 mt-1">Comprehensive overview of all advertisements and campaigns</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setSearchParams({ activeTab: 'ads-create' })}>
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Date Range:</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Category:</label>
              <Select value={businessCategory} onValueChange={setBusinessCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Total Ads</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalAds || 0}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">All Status</Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium mb-1">Active Campaigns</p>
                <p className="text-3xl font-bold text-green-900">{statusBreakdown.active || 0}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Play className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-700">Running</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium mb-1">Total Impressions</p>
                <p className="text-3xl font-bold text-purple-900">{formatNumber(stats.totalImpressions || 0)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Eye className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-700">Views</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium mb-1">Total Clicks</p>
                <p className="text-3xl font-bold text-orange-900">{formatNumber(stats.totalClicks || 0)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <MousePointer className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-700">Interactions</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Click-through Rate</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{stats.averageCTR?.toFixed(2) || 0}%</span>
                  {stats.averageCTR > 2 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Avg. Impressions/Ad</span>
                <span className="font-semibold">{Math.round(stats.averageImpressions || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Avg. Clicks/Ad</span>
                <span className="font-semibold">{Math.round(stats.averageClicks || 0)}</span>
              </div>
              {stats.totalConversions > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Conversions</span>
                  <span className="font-semibold">{stats.totalConversions}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Campaign Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <Play className="w-4 h-4 text-green-600" />
                Active
              </span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {statusBreakdown.active || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <Pause className="w-4 h-4 text-orange-600" />
                Paused
              </span>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {statusBreakdown.paused || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Scheduled
              </span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {statusBreakdown.scheduled || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Draft</span>
              <Badge variant="outline">{statusBreakdown.draft || 0}</Badge>
            </div>
            {statusBreakdown.expired > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Expired</span>
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  {statusBreakdown.expired || 0}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Ad Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(typeBreakdown).length > 0 ? (
                Object.entries(typeBreakdown).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 capitalize">
                      {type.replace(/-/g, ' ')}
                    </span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No ad types data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Impressions and clicks over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="impressions" 
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stackId="2"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No data available for the selected period</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Impressions by device type</CardDescription>
          </CardHeader>
          <CardContent>
            {deviceData.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2">
                  {deviceData.map((device, index) => (
                    <div key={device.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {device.name === 'Desktop' && <Monitor className="w-4 h-4 text-muted-foreground" />}
                        {device.name === 'Mobile' && <Smartphone className="w-4 h-4 text-muted-foreground" />}
                        {device.name === 'Tablet' && <Tablet className="w-4 h-4 text-muted-foreground" />}
                        <span>{device.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{formatNumber(device.value)} impressions</span>
                        <span className="font-medium">{device.clicks} clicks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No device data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Ads & Page Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Ads */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Ads</CardTitle>
            <CardDescription>Best performing campaigns by clicks</CardDescription>
          </CardHeader>
          <CardContent>
            {topAds.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAds.map((ad: any) => (
                    <TableRow key={ad._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ad.title || ad.campaignName}</p>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 ${
                              ad.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                              ad.status === 'paused' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {ad.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground capitalize">
                          {ad.adType?.replace(/-/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{formatNumber(ad.clicks || 0)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{parseFloat(ad.ctr || 0).toFixed(2)}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No ads data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Page Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Page Performance</CardTitle>
            <CardDescription>Top pages by impressions</CardDescription>
          </CardHeader>
          <CardContent>
            {pageBreakdown.length > 0 ? (
              <div className="space-y-4">
                {pageBreakdown.slice(0, 5).map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{page.page}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(page.impressions)} impressions • {page.clicks} clicks
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{parseFloat(page.ctr).toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">CTR</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <ExternalLink className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No page data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
