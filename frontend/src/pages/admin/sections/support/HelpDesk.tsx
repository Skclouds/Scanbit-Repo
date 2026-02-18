import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, RefreshCw, MessageSquare, BookOpen, FileText, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function HelpDesk() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: 0,
    avgResolutionTime: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.getTicketStats();
      if (response.success && response.data) {
        setStats({
          totalTickets: response.data.metrics?.totalTickets || 0,
          openTickets: response.data.metrics?.openTickets || 0,
          resolvedTickets: response.data.metrics?.resolvedTickets || 0,
          avgResponseTime: response.data.metrics?.avgResponseTime || 0,
          avgResolutionTime: response.data.metrics?.avgResolutionTime || 0,
        });
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const quickActions = [
    {
      title: "View Tickets",
      description: "Manage support tickets",
      icon: MessageSquare,
      color: "bg-blue-500",
      onClick: () => navigate('/admin/dashboard?activeTab=support-tickets'),
    },
    {
      title: "Knowledge Base",
      description: "Manage help articles",
      icon: BookOpen,
      color: "bg-green-500",
      onClick: () => navigate('/admin/dashboard?activeTab=support-knowledge'),
    },
    {
      title: "FAQs",
      description: "Manage FAQs",
      icon: FileText,
      color: "bg-orange-500",
      onClick: () => navigate('/admin/dashboard?activeTab=support-faqs'),
    },
    {
      title: "Analytics",
      description: "View support metrics",
      icon: TrendingUp,
      color: "bg-purple-500",
      onClick: () => navigate('/admin/dashboard?activeTab=support-analytics'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Help Desk</h2>
            <p className="text-slate-600 mt-1">Customer support management center</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Tickets</p>
                <p className="text-3xl font-bold mt-2">{stats.totalTickets}</p>
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
                <p className="text-3xl font-bold mt-2 text-blue-600">{stats.openTickets}</p>
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
                <p className="text-3xl font-bold mt-2 text-green-600">{stats.resolvedTickets}</p>
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
                <p className="text-3xl font-bold mt-2">{Math.round(stats.avgResponseTime)}m</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access support management features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={action.onClick}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{action.title}</h3>
                        <p className="text-sm text-slate-500">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Support Overview</CardTitle>
          <CardDescription>Quick overview of support operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Ticket Management</p>
                <p className="text-sm text-slate-600">View and manage all support tickets</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/dashboard?activeTab=support-tickets')}>
                View Tickets
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Knowledge Base</p>
                <p className="text-sm text-slate-600">Create and manage help articles</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/dashboard?activeTab=support-knowledge')}>
                Manage Articles
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">FAQs</p>
                <p className="text-sm text-slate-600">Manage frequently asked questions</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/dashboard?activeTab=support-faqs')}>
                Manage FAQs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
