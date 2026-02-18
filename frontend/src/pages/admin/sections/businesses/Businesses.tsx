import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle, Clock, TrendingUp, Users, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';


export default function Businesses() {
  const sections = [
    {
      title: 'All Businesses',
      description: 'View and manage all businesses on the platform',
      icon: Building2,
      color: 'bg-blue-500',
      path: '?activeTab=businesses-all',
      stats: {
        label: 'Total Businesses',
        value: '128',
      },
    },
    {
      title: 'Pending Approval',
      description: 'Review businesses awaiting verification',
      icon: Clock,
      color: 'bg-orange-500',
      path: '?activeTab=businesses-pending',
      stats: {
        label: 'Pending',
        value: '12',
      },
    },
    {
      title: 'Categories',
      description: 'Analyze businesses by category and distribution',
      icon: TrendingUp,
      color: 'bg-purple-500',
      path: '?activeTab=businesses-categories',
      stats: {
        label: 'Categories',
        value: '3',
      },
    },
    {
      title: 'Archived',
      description: 'Manage archived and inactive businesses',
      icon: Users,
      color: 'bg-slate-500',
      path: '?activeTab=businesses-archived',
      stats: {
        label: 'Archived',
        value: '8',
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Businesses Management</h1>
        <p className="text-slate-600 mt-2">
          Manage all business accounts, verify applications, and analyze performance metrics
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.title} to={section.path}>
              <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-slate-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`${section.color} p-2 rounded-lg text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {section.title === 'Pending Approval' && (
                      <Badge className="bg-orange-100 text-orange-800">12 New</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-600">
                    <p className="text-xs">{section.stats.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{section.stats.value}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Building2 className="w-5 h-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-blue-800">Total Businesses</span>
              <Badge className="bg-blue-600">128</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-blue-800">Active Subscriptions</span>
              <Badge className="bg-green-600">95</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-blue-800">Verified Accounts</span>
              <Badge className="bg-purple-600">116</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-blue-800">Pending Review</span>
              <Badge className="bg-orange-600">12</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <CheckCircle className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-purple-800">Verification Rate</span>
              <Badge className="bg-green-600">90.6%</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-purple-800">Monthly Revenue</span>
              <Badge className="bg-blue-600">₹2.4L</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-purple-800">Avg QR Scans</span>
              <Badge className="bg-indigo-600">1,240</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-purple-800">Avg Retention</span>
              <Badge className="bg-teal-600">98%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>
            Important tasks to maintain platform health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-900">Review Pending Approvals</p>
                  <p className="text-sm text-orange-800">12 businesses are waiting for verification</p>
                </div>
              </div>
              <Link to="?activeTab=businesses-pending">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Review Now
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">Analyze Business Categories</p>
                  <p className="text-sm text-blue-800">View distribution and performance metrics</p>
                </div>
              </div>
              <Link to="?activeTab=businesses-categories">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  View Analytics
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Manage Archived Businesses</p>
                  <p className="text-sm text-slate-800">8 businesses have been archived</p>
                </div>
              </div>
              <Link to="?activeTab=businesses-archived">
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
