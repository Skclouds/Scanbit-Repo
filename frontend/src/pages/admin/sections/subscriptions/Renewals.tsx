import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, RefreshCw, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// API returns restaurants; each row is a business with subscription
interface RenewalRow {
  _id: string;
  name: string;
  email: string;
  logo?: string;
  subscription?: {
    plan: string;
    planPrice: number;
    endDate: string;
    daysRemaining: number;
  };
}

export default function Renewals() {
  const [renewals, setRenewals] = useState<RenewalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminRenewals({ days: 30 });

      if (response.success) {
        const list = (response.data || []).slice();
        list.sort((a: RenewalRow, b: RenewalRow) => {
          const da = a.subscription?.daysRemaining ?? 999;
          const db = b.subscription?.daysRemaining ?? 999;
          return da - db;
        });
        setRenewals(list);
      }
    } catch (error) {
      toast.error("Failed to fetch renewals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const getDaysRemaining = (r: RenewalRow) => {
    const sub = r.subscription;
    if (sub?.daysRemaining != null) return sub.daysRemaining;
    if (!sub?.endDate) return 0;
    const end = new Date(sub.endDate);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getRenewalStatusLabel = (daysRemaining: number) => {
    if (daysRemaining <= 0) return { label: "Expired", className: "bg-red-100 text-red-800" };
    if (daysRemaining <= 3) return { label: "Urgent", className: "bg-red-100 text-red-800" };
    if (daysRemaining <= 7) return { label: "Due soon", className: "bg-orange-100 text-orange-800" };
    if (daysRemaining <= 14) return { label: "This fortnight", className: "bg-amber-100 text-amber-800" };
    return { label: "Upcoming", className: "bg-blue-100 text-blue-800" };
  };

  const getUrgencyBadge = (daysRemaining: number) => {
    const { label, className } = getRenewalStatusLabel(daysRemaining);
    if (daysRemaining <= 3) return <Badge className={className}><AlertTriangle className="w-3 h-3 mr-1" />{label}</Badge>;
    if (daysRemaining <= 7) return <Badge className={className}><Clock className="w-3 h-3 mr-1" />{label}</Badge>;
    return <Badge className={className}><Calendar className="w-3 h-3 mr-1" />{label}</Badge>;
  };

  const urgentCount = renewals.filter((r) => getDaysRemaining(r) <= 7).length;
  const totalRevenue = renewals.reduce((sum, r) => sum + (r.subscription?.planPrice || 0), 0);
  const pricingUrl = typeof window !== "undefined" ? `${window.location.origin}/pricing` : "/pricing";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upcoming Renewals</h2>
          <p className="text-slate-600 mt-2">Subscriptions expiring in the next 30 days</p>
        </div>
        <Button variant="outline" onClick={fetchRenewals} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Upcoming Renewals</p>
                <p className="text-3xl font-bold mt-2">{renewals.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Urgent (≤7 days)</p>
                <p className="text-3xl font-bold mt-2 text-red-600">{urgentCount}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Renewal Revenue</p>
                <p className="text-3xl font-bold mt-2">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Renewals List */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Schedule</CardTitle>
          <CardDescription>
            {renewals.length} subscriptions need attention in the next 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : renewals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-300 mb-4" />
              <p className="text-slate-600 font-medium">No upcoming renewals</p>
              <p className="text-slate-500 text-sm">All subscriptions are up to date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {renewals.map((renewal) => (
                <div
                  key={renewal._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={renewal.logo} />
                      <AvatarFallback>{renewal.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{renewal.name}</h3>
                        {getUrgencyBadge(getDaysRemaining(renewal))}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{renewal.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                        <span>Plan: <strong>{renewal.subscription?.plan ?? "—"}</strong></span>
                        <span>Price: <strong>₹{(renewal.subscription?.planPrice ?? 0).toLocaleString()}/mo</strong></span>
                        <span>Expires: <strong>{renewal.subscription?.endDate ? new Date(renewal.subscription.endDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{getDaysRemaining(renewal)}</p>
                      <p className="text-xs text-slate-500">
                        {getDaysRemaining(renewal) === 0 ? "Expired" : getDaysRemaining(renewal) === 1 ? "day left" : "days left"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pricingUrl, "_blank")}
                    >
                      Renew now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
