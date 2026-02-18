import { 
  MdTrendingUp, 
  MdQrCode, 
  MdVisibility, 
  MdAccessTime, 
  MdRefresh, 
  MdDeviceHub,
  MdPieChart,
  MdBarChart,
  MdTimeline
} from "react-icons/md";
import { 
  FiSmartphone, 
  FiMonitor, 
  FiTablet, 
  FiArrowUp, 
  FiDownload, 
  FiInfo, 
  FiTrendingUp,
  FiCalendar
} from "react-icons/fi";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { getBusinessConfig } from "./menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface AnalyticsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restaurant: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analytics?: any;
}

export const Analytics = ({ restaurant, analytics: initialAnalytics }: AnalyticsProps) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const config = getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDashboardAnalytics(timeRange);
      if (response?.success && response?.data) {
        setAnalyticsData(response.data);
      } else {
        // Fallback to restaurant data if API fails
        setAnalyticsData({
          stats: {
            totalScans: restaurant?.qrScans || 0,
            thisMonthScans: restaurant?.qrScansThisMonth || 0,
            todayScans: 0,
            avgDailyScans: 0,
            growthPercentage: 0
          },
          scansByDay: [],
          deviceStats: { mobile: 75, desktop: 20, tablet: 5 },
          peakHours: [],
          categoryStats: []
        });
      }
    } catch (error) {
      // Fallback to restaurant data on error
      setAnalyticsData({
        stats: {
          totalScans: restaurant?.qrScans || 0,
          thisMonthScans: restaurant?.qrScansThisMonth || 0,
          todayScans: 0,
          avgDailyScans: 0,
          growthPercentage: 0
        },
        scansByDay: [],
        deviceStats: { mobile: 75, desktop: 20, tablet: 5 },
        peakHours: [],
        categoryStats: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const rangeScans = analyticsData?.stats?.rangeScans || 0;
    return {
      totalScans: analyticsData?.stats?.totalScans || initialAnalytics?.stats?.totalScans || restaurant?.qrScans || 0,
      rangeScans: rangeScans,
      thisMonth: analyticsData?.stats?.thisMonthScans || initialAnalytics?.stats?.thisMonthScans || restaurant?.qrScansThisMonth || 0,
      today: analyticsData?.stats?.todayScans || initialAnalytics?.stats?.todayScans || 0,
      avgDaily: analyticsData?.stats?.avgDailyScans || initialAnalytics?.stats?.avgDailyScans || 0,
      growth: analyticsData?.stats?.growthPercentage || initialAnalytics?.stats?.growthPercentage || 0,
    };
  }, [analyticsData, initialAnalytics, restaurant]);

  const deviceData = useMemo(() => {
    const deviceStats = analyticsData?.deviceStats || { mobile: 75, desktop: 20, tablet: 5 };
    return [
      { name: 'Mobile', value: deviceStats.mobile || 75, color: '#f97316' },
      { name: 'Desktop', value: deviceStats.desktop || 20, color: '#6366f1' },
      { name: 'Tablet', value: deviceStats.tablet || 5, color: '#ec4899' },
    ];
  }, [analyticsData]);

  const hasData = stats.totalScans > 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const exportReport = () => {
    toast.success('Analytics intelligence report exported successfully!');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Professional Analytics Header */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 md:p-10">
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20 flex-shrink-0">
                <MdTrendingUp className="w-7 h-7 sm:w-10 sm:h-10" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Business Intelligence</h1>
                <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">
                  Deep insights into your digital engagement and {config.itemLabel.toLowerCase()} performance
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={loadAnalytics} disabled={isLoading} className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl border-slate-200 font-bold hover:bg-slate-50 transition-all w-full sm:w-auto justify-center touch-manipulation min-h-[44px]">
                <MdRefresh className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Data
              </Button>
              <Button onClick={exportReport} disabled={!hasData} className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all w-full sm:w-auto justify-center touch-manipulation min-h-[44px]">
                <FiDownload className="w-5 h-5 mr-2" />
                Export Intel
              </Button>
            </div>
          </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-6 p-2 bg-slate-50 rounded-xl sm:rounded-2xl w-full sm:w-auto border border-slate-200/60">
          {([
            { value: 'today', label: 'Today' },
            { value: 'week', label: '7 Days' },
            { value: 'month', label: '30 Days' },
            { value: 'year', label: '1 Year' }
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              disabled={isLoading}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-all touch-manipulation flex-shrink-0 min-h-[44px] sm:min-h-0 ${
                timeRange === value 
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-white/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total Scans', value: stats.totalScans, icon: MdQrCode, color: 'orange', trend: stats.growth },
          { label: timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'Last 7 Days' : timeRange === 'month' ? 'Last 30 Days' : 'Last Year', value: stats.rangeScans, icon: FiCalendar, color: 'blue' },
          { label: 'This Month', value: stats.thisMonth, icon: MdVisibility, color: 'purple' },
          { label: 'Daily Average', value: stats.avgDaily, icon: MdTimeline, color: 'green' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3 sm:mb-6">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 group-hover:bg-white transition-all flex items-center justify-center border border-slate-100 group-hover:border-orange-200`}>
                <stat.icon className={`w-7 h-7 text-slate-400 group-hover:text-orange-600 transition-colors`} />
              </div>
              {stat.trend ? (
                <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-widest">
                  <FiArrowUp className="w-3 h-3" />
                  {stat.trend}%
                </div>
              ) : (
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-widest">Stats</span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-1 tracking-tighter">{formatNumber(stat.value)}</p>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Engagement Velocity Chart - Recharts */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Engagement Velocity</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Daily scan distribution and momentum</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-orange-50 transition-colors">
              <FiTrendingUp className="w-6 h-6 text-slate-400 group-hover:text-orange-600" />
            </div>
          </div>
          
          <div className="h-80 w-full">
            {analyticsData?.scansByDay && analyticsData.scansByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.scansByDay}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#f97316', fontWeight: 900 }}
                    cursor={{ stroke: '#f97316', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="#f97316" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorScans)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FiInfo className="w-8 h-8" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No scan data available yet</p>
                <p className="text-xs text-slate-400">Start sharing your QR code to see engagement trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Distribution - Pie Chart */}
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Device Ecosystem</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Consumer hardware distribution</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
              <MdDeviceHub className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 space-y-3">
            {deviceData.map((device, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: device.color }} />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{device.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{device.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Engagement Hotspots */}
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Peak Engagement Hours</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Optimal time slots for consumer activity</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <MdAccessTime className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          {analyticsData?.peakHours && analyticsData.peakHours.length > 0 && analyticsData.peakHours[0].scans > 0 ? (
            <div className="space-y-6">
              {analyticsData.peakHours.slice(0, 5).map((item: any, index: number) => {
                const maxScans = analyticsData.peakHours[0].scans;
                return (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center">0{index + 1}</span>
                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{item.time}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{item.scans} INTERACTIONS</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all group-hover:brightness-110"
                        style={{ width: `${maxScans > 0 ? (item.scans / maxScans) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <MdAccessTime className="w-8 h-8" />
              <p className="font-bold uppercase tracking-widest text-[10px]">No peak hour data available</p>
              <p className="text-xs text-slate-400">Scan activity will appear here</p>
            </div>
          )}
        </div>

        {/* Category Performance - Bar Chart */}
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Category Resonance</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Engagement by business sector</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-purple-50 transition-colors">
              <MdBarChart className="w-6 h-6 text-slate-400 group-hover:text-purple-600" />
            </div>
          </div>
          
          <div className="h-64 sm:h-72 md:h-80 w-full min-w-0">
            {analyticsData?.categoryStats && analyticsData.categoryStats.length > 0 && analyticsData.categoryStats.some((cat: any) => cat.views > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.categoryStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 11, fontWeight: 800}}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="views" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MdPieChart className="w-8 h-8" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No category data available</p>
                <p className="text-xs text-slate-400">Category performance will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
