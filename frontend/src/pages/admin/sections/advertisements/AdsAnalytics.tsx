import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, RefreshCw, Download, Filter, Eye, MousePointer, 
  Target, BarChart3, Calendar, Search, ArrowUpRight, ArrowDownRight,
  Activity, DollarSign, Users, TrendingDown
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import api from "@/lib/api";
import { toast } from "sonner";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export default function AdsAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dateRange, setDateRange] = useState("30");
  const [businessCategory, setBusinessCategory] = useState("all");
  const [adTypeFilter, setAdTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [adDetails, setAdDetails] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
    fetchAnalytics();
  }, [dateRange, businessCategory, adTypeFilter]);

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

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const dashboardResponse = await api.getAdvertisementDashboard({ 
        dateRange, 
        businessCategory: businessCategory !== 'all' ? businessCategory : undefined 
      });

      const adsResponse = await api.getAdvertisements({ 
        status: "active",
        businessCategory: businessCategory !== 'all' ? businessCategory : undefined,
        adType: adTypeFilter !== 'all' ? adTypeFilter : undefined
      });

      if (dashboardResponse.success && dashboardResponse.data) {
        setAnalytics({
          ...dashboardResponse.data,
          ads: adsResponse.success ? adsResponse.data : []
        });
      }
    } catch (error) {

      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdDetails = async (adId: string) => {
    try {
      const response = await api.getAdvertisementAnalytics(adId, { 
        dateRange,
        groupBy: 'day'
      });
      if (response.success && response.data) {
        setAdDetails(response.data);
      }
    } catch (error) {

      toast.error("Failed to load ad analytics");
    }
  };

  const handleViewAdDetails = (ad: any) => {
    setSelectedAd(ad);
    fetchAdDetails(ad._id);
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Ads', analytics.stats?.totalAds || 0],
      ['Active Campaigns', analytics.statusBreakdown?.active || 0],
      ['Total Impressions', analytics.stats?.totalImpressions || 0],
      ['Total Clicks', analytics.stats?.totalClicks || 0],
      ['CTR', `${analytics.stats?.averageCTR || 0}%`],
      ['Average Impressions/Ad', analytics.stats?.averageImpressions || 0],
      ['Average Clicks/Ad', analytics.stats?.averageClicks || 0],
      ['Total Conversions', analytics.stats?.totalConversions || 0],
    ];

    // Add time series data
    if (analytics.timeSeries && analytics.timeSeries.length > 0) {
      csvData.push([]);
      csvData.push(['Date', 'Impressions', 'Clicks', 'CTR']);
      analytics.timeSeries.forEach((item: any) => {
        csvData.push([
          item.date,
          item.impressions || 0,
          item.clicks || 0,
          `${item.ctr || 0}%`
        ]);
      });
    }

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ads-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Analytics data exported successfully");
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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

  const filteredAds = analytics?.ads?.filter((ad: any) =>
    ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.campaignName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const timeSeries = analytics?.timeSeries || [];
  const chartData = timeSeries.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    impressions: item.impressions || 0,
    clicks: item.clicks || 0,
    ctr: parseFloat(item.ctr) || 0
  }));

  const deviceData = analytics?.deviceBreakdown ? Object.entries(analytics.deviceBreakdown).map(([device, data]: [string, any]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: data.impressions || 0,
    clicks: data.clicks || 0
  })) : [];

  const typeData = analytics?.typeBreakdown ? Object.entries(analytics.typeBreakdown).map(([type, count]: [string, any]) => ({
    name: type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count
  })) : [];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics & Performance</h2>
            <p className="text-slate-600 mt-1">Detailed analytics and performance metrics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Ad Type:</label>
              <Select value={adTypeFilter} onValueChange={setAdTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="header-banner">Header Banner</SelectItem>
                  <SelectItem value="sticky-top-bar">Sticky Top Bar</SelectItem>
                  <SelectItem value="popup-modal">Popup Modal</SelectItem>
                  <SelectItem value="slide-in-popup">Slide-In Popup</SelectItem>
                  <SelectItem value="announcement-bar">Announcement Bar</SelectItem>
                  <SelectItem value="full-width-banner">Full Width Banner</SelectItem>
                  <SelectItem value="cta-floating-button">CTA Floating Button</SelectItem>
                  <SelectItem value="exit-intent-popup">Exit Intent Popup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Impressions</p>
                <p className="text-3xl font-bold text-blue-900">
                  {formatNumber(analytics?.stats?.totalImpressions || 0)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Eye className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-700">Views</span>
                </div>
              </div>
              <Eye className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Clicks</p>
                <p className="text-3xl font-bold text-purple-900">
                  {formatNumber(analytics?.stats?.totalClicks || 0)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <MousePointer className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-700">Interactions</span>
                </div>
              </div>
              <MousePointer className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Click-Through Rate</p>
                <p className="text-3xl font-bold text-green-900">
                  {analytics?.stats?.averageCTR?.toFixed(2) || 0}%
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {analytics?.stats?.averageCTR > 2 ? (
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-600" />
                  )}
                  <span className="text-xs text-green-700">CTR</span>
                </div>
              </div>
              <Target className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Total Conversions</p>
                <p className="text-3xl font-bold text-orange-900">
                  {analytics?.stats?.totalConversions || 0}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-700">Conversions</span>
                </div>
              </div>
              <Activity className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
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
                  {deviceData.map((device) => (
                    <div key={device.name} className="flex items-center justify-between text-sm">
                      <span>{device.name}</span>
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
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No device data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ad Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ad Performance</CardTitle>
              <CardDescription>Detailed performance metrics for each ad</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search ads..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No ads found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad: any) => {
                  const impressions = ad.analytics?.impressions || 0;
                  const clicks = ad.analytics?.clicks || 0;
                  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
                  
                  return (
                    <TableRow key={ad._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ad.title || ad.campaignName}</p>
                          <p className="text-xs text-muted-foreground">{ad.headline?.substring(0, 50)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {ad.adType?.replace(/-/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNumber(impressions)}</TableCell>
                      <TableCell>{formatNumber(clicks)}</TableCell>
                      <TableCell>
                        <Badge className={parseFloat(ctr) > 2 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {ctr}%
                        </Badge>
                      </TableCell>
                      <TableCell>{ad.analytics?.conversions || 0}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewAdDetails(ad)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ad Details Modal */}
      {selectedAd && adDetails && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Detailed Analytics: {selectedAd.title}</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAd(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Impressions</p>
                    <p className="text-2xl font-bold">{formatNumber(adDetails.totalImpressions || 0)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                    <p className="text-2xl font-bold">{formatNumber(adDetails.totalClicks || 0)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">CTR</p>
                    <p className="text-2xl font-bold">{parseFloat(adDetails.ctr || 0).toFixed(2)}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {adDetails.timeSeries && adDetails.timeSeries.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={adDetails.timeSeries.map((item: any) => ({
                  date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  impressions: item.impressions || 0,
                  clicks: item.clicks || 0,
                  ctr: parseFloat(item.ctr) || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="impressions" stroke="hsl(var(--chart-1))" />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(var(--chart-2))" />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
