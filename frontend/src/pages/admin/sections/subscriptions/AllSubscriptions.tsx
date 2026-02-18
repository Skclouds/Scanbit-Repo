import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Search, Filter, RefreshCw, Download, Eye, MoreVertical, TrendingUp, TrendingDown, Calendar, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { env } from "@/lib/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// API returns restaurants (each with subscription); each row is a business
interface SubscriptionRow {
  _id: string;
  name: string;
  email: string;
  logo?: string;
  businessCategory?: string;
  subscription?: {
    plan: string;
    planPrice: number;
    status: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    billingCycle: string;
  };
  createdAt?: string;
}

interface AllSubscriptionsProps {
  initialStatusFilter?: string;
}

const getPricingUrl = () => {
  try {
    const base = typeof window !== "undefined" && window.location?.origin ? window.location.origin : env?.FRONTEND_URL || "";
    return `${base}/pricing`;
  } catch {
    return "/pricing";
  }
};

export default function AllSubscriptions({ initialStatusFilter = "all" }: AllSubscriptionsProps = {}) {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [planFilter, setPlanFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminSubscriptions({
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        plan: planFilter !== "all" ? planFilter : undefined,
      });

      if (response.success) {
        const raw = response.data || [];
        setSubscriptions(raw);
        setTotal(response.pagination?.total ?? raw.length);
      }
    } catch (error) {
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, limit, statusFilter, planFilter]);

  // Compute days remaining from endDate when not set (client-side fallback)
  const getDaysRemaining = (row: SubscriptionRow) => {
    const sub = row.subscription;
    if (sub?.daysRemaining != null && sub.status !== "expired") return sub.daysRemaining;
    if (!sub?.endDate) return 0;
    const end = new Date(sub.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getSubscriptionStatus = (row: SubscriptionRow) => {
    const sub = row.subscription;
    const days = getDaysRemaining(row);
    if (days <= 0) return "expired";
    return sub?.status || "inactive";
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSubscriptions();
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Inactive</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      Free: "bg-gray-100 text-gray-800",
      Basic: "bg-blue-100 text-blue-800",
      Pro: "bg-purple-100 text-purple-800",
    };
    return <Badge className={colors[plan] || colors.Free}>{plan}</Badge>;
  };

  const totalPages = Math.ceil(total / limit);
  const activeCount = subscriptions.filter((s) => getSubscriptionStatus(s) === "active").length;
  const expiredCount = subscriptions.filter((s) => getSubscriptionStatus(s) === "expired").length;
  const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.subscription?.planPrice || 0), 0);

  const handleViewDetails = (row: SubscriptionRow) => {
    navigate(`/admin/dashboard?activeTab=businesses-all&selectedId=${row._id}`);
    toast.info("Opening business details");
  };

  const handleRenewLink = (row: SubscriptionRow) => {
    const url = getPricingUrl();
    window.open(url, "_blank");
    toast.success("Opened pricing page. Customer can renew there.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Subscriptions</h2>
          <p className="text-slate-600 mt-2">Manage and monitor all subscription plans</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Subscriptions</p>
                <p className="text-3xl font-bold mt-2">{total}</p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{activeCount}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expired</p>
                <p className="text-3xl font-bold mt-2 text-red-600">{expiredCount}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <CreditCard className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={(value) => {
              setPlanFilter(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(limit)} onValueChange={(value) => {
              setLimit(parseInt(value));
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions List</CardTitle>
          <CardDescription>
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No subscriptions found</p>
              <p className="text-slate-500 text-sm">No subscriptions match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Business</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Days Remaining</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">End Date</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((row) => (
                    <tr key={row._id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={row.logo} />
                            <AvatarFallback>{row.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">{row.name}</p>
                            <p className="text-xs text-slate-500">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getPlanBadge(row.subscription?.plan || "Free")}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(getSubscriptionStatus(row))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">₹{row.subscription?.planPrice?.toLocaleString() ?? 0}</span>
                        <span className="text-xs text-slate-500 ml-1">/mo</span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const days = getDaysRemaining(row);
                          const isExpired = getSubscriptionStatus(row) === "expired";
                          return (
                            <span className={days <= 7 && !isExpired ? "text-orange-600 font-semibold" : isExpired ? "text-red-600 font-medium" : "text-slate-600"}>
                              {isExpired ? "Expired" : `${days} day${days !== 1 ? "s" : ""} left`}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">
                          {row.subscription?.endDate ? new Date(row.subscription.endDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label="Actions">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleViewDetails(row)}>
                              <Eye className="w-4 h-4" />
                              View business
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleRenewLink(row)}>
                              <ExternalLink className="w-4 h-4" />
                              Open pricing (customer renews)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
