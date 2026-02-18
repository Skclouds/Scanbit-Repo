import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MdDescription, MdDownload, MdInsertChart, MdAnalytics } from "react-icons/md";
import { FiDownload, FiFilter, FiCalendar, FiFileText } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";


interface Report {
  _id?: string;
  id?: string;
  title: string;
  type: "sales" | "inventory" | "customer" | "performance";
  date: string;
  data?: Record<string, unknown>;
}

export const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("all");
  const [salesData, setSalesData] = useState<Array<{ category: string; sales: number; revenue: number }>>([]);
  const [inventoryData, setInventoryData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.getReports?.({ type: reportType === "all" ? undefined : reportType });
      if (response?.success) {
        setReports(response.data);
        // Mock data for charts
        setSalesData([
          { category: "SaaS", sales: 4000, revenue: 45000 },
          { category: "Services", sales: 3000, revenue: 30000 },
          { category: "Consulting", sales: 2000, revenue: 25000 },
          { category: "Ads", sales: 2500, revenue: 28000 },
        ]);
        setInventoryData([
          { name: "Active", value: 60, color: "#10b981" },
          { name: "Pending", value: 25, color: "#f59e0b" },
          { name: "Archived", value: 15, color: "#ef4444" },
        ]);
      }
    } catch (error) {
      toast.error("Failed to fetch intelligence reports");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    try {
      await api.generateReport?.({ type });
      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <div>
            <p className="font-semibold">Intelligence Report Compiled</p>
            <p className="text-sm opacity-90">Your professional report is ready for analysis</p>
          </div>
        </div>
      );
      fetchReports();
    } catch (error: Error | unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to generate report";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Professional Reports Header */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-8 md:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
              <MdAnalytics className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Operational Intelligence</h1>
              <p className="text-slate-500 font-medium mt-1">
                Download comprehensive performance audits and strategic business reports
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {["performance", "conversion", "revenue", "engagement"].map((type) => (
              <Button
                key={type}
                variant="outline"
                onClick={() => generateReport(type)}
                className="h-11 px-5 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                <MdDownload className="w-4 h-4 mr-2 text-orange-600" />
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Visualization Row */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Performance Distribution */}
        <Card className="border-slate-200 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
            <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Revenue distribution</CardTitle>
            <CardDescription className="font-medium text-slate-500">Capital performance across primary business sectors</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#f97316" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-slate-200 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
            <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Entity Status</CardTitle>
            <CardDescription className="font-medium text-slate-500">Real-time distribution of business assets</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compiled Intelligence Repository */}
      <Card className="border-slate-200 shadow-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
          <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Intelligence Repository</CardTitle>
          <CardDescription className="font-medium text-slate-500">Secure access to previously generated strategic documentation</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {reports.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <FiFileText className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-xs">No reports compiled in the repository</p>
              <Button onClick={() => generateReport("performance")} className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-lg transition-all active:scale-95">
                <FiDownload className="w-5 h-5 mr-2" />
                Initialize Performance Audit
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report._id || report.id}
                  className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                      <MdInsertChart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 uppercase tracking-tight leading-tight">{report.title}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-all">
                    <FiDownload className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
