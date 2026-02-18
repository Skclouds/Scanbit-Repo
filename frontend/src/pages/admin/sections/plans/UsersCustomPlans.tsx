import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  RefreshCw,
  Eye,
  Edit,
  TrendingUp,
  DollarSign,
  Crown,
  Package,
  Filter,
  Download,
  ArrowUpDown,
  Calendar,
  CreditCard
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/api";

interface UserPlan {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  planId: string;
  planName: string;
  planPrice: number;
  planDuration: number;
  businessName: string;
  businessCategory: string;
  subscriptionDate: string;
  expiryDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
  totalSpent: number;
}

export default function UsersCustomPlans() {
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("subscriptionDate");

  useEffect(() => {
    fetchUserPlans();
  }, []);

  const fetchUserPlans = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockData: UserPlan[] = [
        {
          userId: "1",
          userName: "Rajesh Kumar",
          userEmail: "rajesh@example.com",
          planId: "p1",
          planName: "Pro Plan",
          planPrice: 699,
          planDuration: 30,
          businessName: "Spice Garden Restaurant",
          businessCategory: "Food Mall",
          subscriptionDate: "2024-01-15",
          expiryDate: "2024-02-15",
          status: "active",
          autoRenew: true,
          totalSpent: 2097,
        },
        {
          userId: "2",
          userName: "Priya Sharma",
          userEmail: "priya@example.com",
          planId: "p2",
          planName: "Basic Plan",
          planPrice: 299,
          planDuration: 30,
          businessName: "Fashion Hub",
          businessCategory: "Retail / E-Commerce Businesses",
          subscriptionDate: "2024-01-10",
          expiryDate: "2024-02-10",
          status: "active",
          autoRenew: false,
          totalSpent: 897,
        },
        {
          userId: "3",
          userName: "Amit Patel",
          userEmail: "amit@example.com",
          planId: "p1",
          planName: "Pro Plan",
          planPrice: 899,
          planDuration: 30,
          businessName: "Creative Studio",
          businessCategory: "Creative & Design",
          subscriptionDate: "2023-12-20",
          expiryDate: "2024-01-20",
          status: "expired",
          autoRenew: false,
          totalSpent: 1798,
        },
      ];
      setUserPlans(mockData);
    } catch (error) {

      toast.error("Failed to load user plans");
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (name: string) => {
    if (name.toLowerCase().includes("pro")) return <Crown className="w-4 h-4 text-purple-600" />;
    if (name.toLowerCase().includes("basic")) return <Package className="w-4 h-4 text-blue-600" />;
    return <CreditCard className="w-4 h-4 text-green-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "expired": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPlans = userPlans.filter(up => {
    const matchesSearch = 
      up.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      up.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      up.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === "all" || up.planName === planFilter;
    const matchesStatus = statusFilter === "all" || up.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalUsers = userPlans.length;
  const activeSubscriptions = userPlans.filter(up => up.status === "active").length;
  const totalRevenue = userPlans.reduce((sum, up) => sum + up.totalSpent, 0);
  const avgSpent = totalUsers > 0 ? totalRevenue / totalUsers : 0;

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Users Custom Plans</h2>
            <p className="text-slate-600 mt-1">View users by subscription plan and manage custom pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUserPlans}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2 text-purple-900">{totalUsers}</p>
              </div>
              <Users className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Subscriptions</p>
                <p className="text-3xl font-bold mt-2 text-green-900">{activeSubscriptions}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Avg. Spent/User</p>
                <p className="text-3xl font-bold mt-2 text-orange-900">₹{Math.round(avgSpent)}</p>
              </div>
              <CreditCard className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Pro Plan">Pro Plan</SelectItem>
                  <SelectItem value="Basic Plan">Basic Plan</SelectItem>
                  <SelectItem value="Free Plan">Free Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscriptionDate">Subscription Date</SelectItem>
                  <SelectItem value="expiryDate">Expiry Date</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                  <SelectItem value="userName">User Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Subscriptions ({filteredPlans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((userPlan) => (
                    <TableRow key={userPlan.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={userPlan.userAvatar} />
                            <AvatarFallback>{userPlan.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{userPlan.userName}</p>
                            <p className="text-sm text-gray-600">{userPlan.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlanIcon(userPlan.planName)}
                          <div>
                            <p className="font-medium">{userPlan.planName}</p>
                            <p className="text-sm text-gray-600">₹{userPlan.planPrice}/{userPlan.planDuration}d</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{userPlan.businessName}</p>
                          <p className="text-sm text-gray-600">{userPlan.businessCategory}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{new Date(userPlan.subscriptionDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{new Date(userPlan.expiryDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(userPlan.status)}>
                          {userPlan.status}
                        </Badge>
                        {userPlan.autoRenew && (
                          <Badge variant="outline" className="ml-2">Auto-renew</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">₹{userPlan.totalSpent.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
