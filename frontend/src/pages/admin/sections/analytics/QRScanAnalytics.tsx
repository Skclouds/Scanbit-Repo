import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, MousePointerClick, Eye, TrendingUp, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function QRScanAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const statsResponse = await api.getAdminStats();
      const qrResponse = await api.getQRScanAnalytics();
      
      if (statsResponse.success && statsResponse.data) {
        // Handle both array and object response formats
        let scanData: any[] = [];
        if (Array.isArray(qrResponse)) {
          scanData = qrResponse;
        } else if (qrResponse?.success && Array.isArray(qrResponse.data)) {
          scanData = qrResponse.data;
        } else if (qrResponse?.data && Array.isArray(qrResponse.data)) {
          scanData = qrResponse.data;
        }
        
        setAnalytics({
          totalScans: statsResponse.data.totalQRScans || 0,
          monthlyScans: scanData,
          topBusinesses: statsResponse.data.recentBusinesses?.slice(0, 10).map((b: any) => ({
            name: b.name,
            scans: b.qrScans || 0
          })) || []
        });
      }
    } catch (error) {

      toast.error("Failed to load QR scan analytics");
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

  const monthlyData = analytics?.monthlyScans?.map((item: any) => ({
    month: item.month || item.date || 'N/A',
    scans: item.scans || item.count || 0
  })) || [];
  const topBusinesses = analytics?.topBusinesses || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">QR Scan Analytics</h2>
            <p className="text-slate-600 mt-1">Track QR code scans and engagement metrics</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Scans</p>
                <p className="text-3xl font-bold mt-2 text-purple-900">{analytics?.totalScans?.toLocaleString() || 0}</p>
                <p className="text-xs text-purple-600 mt-1">All time scans</p>
              </div>
              <QrCode className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">This Month</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">
                  {monthlyData.length > 0 
                    ? monthlyData[monthlyData.length - 1]?.scans?.toLocaleString() || 0
                    : 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">Monthly scans</p>
              </div>
              <MousePointerClick className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Avg per Business</p>
                <p className="text-3xl font-bold mt-2 text-green-900">
                  {topBusinesses.length > 0
                    ? Math.round(topBusinesses.reduce((sum: number, b: any) => sum + (b.scans || 0), 0) / topBusinesses.length)
                    : 0}
                </p>
                <p className="text-xs text-green-600 mt-1">Average scans</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Scan Trends</CardTitle>
            <CardDescription>QR code scans over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="scans" stroke="#8b5cf6" strokeWidth={2} name="QR Scans" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>No scan data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Scanned Businesses</CardTitle>
            <CardDescription>Businesses with the most QR code scans</CardDescription>
          </CardHeader>
          <CardContent>
            {topBusinesses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topBusinesses.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="scans" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="Scans" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>No business scan data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Businesses List */}
      {topBusinesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Businesses</CardTitle>
            <CardDescription>Businesses ranked by QR code scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBusinesses.slice(0, 10).map((business: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{business.name}</p>
                      <p className="text-xs text-slate-500">Business</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">{business.scans.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">scans</p>
                    </div>
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
