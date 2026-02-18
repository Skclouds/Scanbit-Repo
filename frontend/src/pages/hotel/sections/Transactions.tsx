import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiDownload, FiRefreshCw, FiClock } from "react-icons/fi";
import { MdPayment, MdCreditCard, MdCalendarToday, MdVerified, MdReceipt } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { PendingOrderActions } from "@/hooks/useOrderCountdown.tsx";

interface PaymentRecord {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  billingCycle?: string;
  createdAt: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentMethod?: string;
  description?: string;
  failureReason?: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string | Date) => {
  if (!dateString) return "N/A";
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string | Date) => {
  if (!dateString) return "N/A";
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    case "pending":
    case "processing":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    case "failed":
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    case "refunded":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  }
};

const Transactions = ({ restaurant, formatCurrency: formatCurrencyProp }: { restaurant?: any; formatCurrency?: (n: number) => string }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fmt = formatCurrencyProp || formatCurrency;

  const handlePayNow = (t: PaymentRecord) => {
    const plan = (t.plan || "Pro").trim();
    const cycle = t.billingCycle || "monthly";
    sessionStorage.setItem("selectedPlan", plan);
    sessionStorage.setItem("selectedPlanCycle", cycle);
    navigate(`/checkout?plan=${encodeURIComponent(plan)}&cycle=${encodeURIComponent(cycle)}`);
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    if (downloadingId) return;
    setDownloadingId(paymentId);
    try {
      const { blob, filename } = await api.downloadPaymentInvoice(paymentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch (e: any) {
      toast.error(e?.message || "Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchHistory = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await api.getPaymentHistory({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setTransactions(res.data);
      } else {
        setTransactions([]);
      }
    } catch {
      if (transactions.length === 0) toast.error("Failed to load subscription transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const hasPending = transactions.some((t) => t.status?.toLowerCase() === "pending");

  useEffect(() => {
    setLoading(true);
    fetchHistory();
  }, []);

  // Auto-update when user returns from checkout or when payment completes (poll if pending)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && hasPending) fetchHistory(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = hasPending
      ? setInterval(() => {
          if (document.visibilityState === "visible") fetchHistory(true);
        }, 25000)
      : undefined;
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (interval) clearInterval(interval);
    };
  }, [hasPending]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory(true);
    toast.success("Transactions refreshed");
  };

  const filtered = transactions.filter((t) => {
    const matchSearch =
      !searchQuery ||
      (t.plan && t.plan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.razorpayPaymentId && t.razorpayPaymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.razorpayOrderId && t.razorpayOrderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t._id && t._id.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === "all" || (t.status && t.status.toLowerCase() === statusFilter);
    return matchSearch && matchStatus;
  });

  const completed = transactions.filter((t) => t.status?.toLowerCase() === "completed");
  const failed = transactions.filter((t) => t.status?.toLowerCase() === "failed");
  const totalSpent = completed.reduce((s, t) => s + (t.amount || 0), 0);
  const lastPayment = completed.length
    ? [...completed].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  if (loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading subscription transactions…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Subscription Transactions</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Billing history for your ScanBit subscription plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <FiRefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Spent</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{fmt(totalSpent)}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <MdPayment className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transactions</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{transactions.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                <MdReceipt className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</p>
                <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{completed.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                <MdVerified className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Failed</p>
                <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{failed.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                <MdReceipt className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
              <CardDescription className="text-sm">Subscription payments and plan renewals</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by plan or ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-56"
                />
              </div>
              <div className="flex flex-wrap gap-1 sm:flex-nowrap rounded-lg border border-border overflow-hidden">
                {["all", "completed", "pending", "failed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium capitalize transition-colors",
                      statusFilter === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile: Card-based layout */}
          <div className="md:hidden space-y-3 p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <MdReceipt className="w-7 h-7 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">No subscription transactions</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {transactions.length === 0
                      ? "Your subscription payment history will appear here."
                      : "No matches for your filters."}
                  </p>
                </div>
              </div>
            ) : (
              filtered.map((t) => (
                <Card key={t._id} className="border border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-base">{t.plan || "—"} Plan</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatDate(t.createdAt)} • {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("font-medium capitalize shrink-0", getStatusStyles(t.status))}>
                        {t.status || "—"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                        <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{fmt(t.amount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Valid Until</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {t.subscriptionEndDate ? formatDate(t.subscriptionEndDate) : "—"}
                        </p>
                      </div>
                    </div>
                    {t.subscriptionStartDate && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Subscription Period</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          From {formatDate(t.subscriptionStartDate)}
                        </p>
                      </div>
                    )}
                    {t.status?.toLowerCase() === 'failed' && t.failureReason && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Failure Reason</p>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                          {t.failureReason}
                        </p>
                      </div>
                    )}
                    {(t.razorpayPaymentId || t.razorpayOrderId) && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Payment ID</p>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-slate-600 dark:text-slate-400 break-all block">
                          {t.razorpayPaymentId || t.razorpayOrderId}
                        </code>
                      </div>
                    )}
                    <div className="pt-3 border-t border-border">
                      {(t.status?.toLowerCase() === "pending" || t.status?.toLowerCase() === "failed") && (
                        <PendingOrderActions
                          createdAt={t.createdAt}
                          status={t.status}
                          onPayNow={() => handlePayNow(t)}
                        />
                      )}
                      {t.status?.toLowerCase() === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          disabled={downloadingId === t._id}
                          onClick={() => handleDownloadInvoice(t._id)}
                        >
                          {downloadingId === t._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiDownload className="w-4 h-4" />
                          )}
                          Download invoice
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Date & Time</TableHead>
                  <TableHead className="font-semibold">Plan</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Valid Until</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Payment ID</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <MdReceipt className="w-7 h-7 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">No subscription transactions</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {transactions.length === 0
                              ? "Your subscription payment history will appear here."
                              : "No matches for your filters."}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t) => (
                    <TableRow key={t._id} className="hover:bg-muted/20">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{formatDate(t.createdAt)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{t.plan || "—"} Plan</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t.subscriptionStartDate ? `From ${formatDate(t.subscriptionStartDate)}` : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        {fmt(t.amount || 0)}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {t.subscriptionEndDate ? formatDate(t.subscriptionEndDate) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className={cn("font-medium capitalize", getStatusStyles(t.status))}>
                            {t.status || "—"}
                          </Badge>
                          {t.status?.toLowerCase() === 'failed' && t.failureReason && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1 max-w-[200px]">
                              {t.failureReason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-slate-600 dark:text-slate-400 truncate max-w-[140px] block">
                          {t.razorpayPaymentId || t.razorpayOrderId || "—"}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        {(t.status?.toLowerCase() === "pending" || t.status?.toLowerCase() === "failed") && (
                          <PendingOrderActions
                            createdAt={t.createdAt}
                            status={t.status}
                            onPayNow={() => handlePayNow(t)}
                            className="items-end"
                            compact
                          />
                        )}
                        {t.status?.toLowerCase() === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={downloadingId === t._id}
                            onClick={() => handleDownloadInvoice(t._id)}
                          >
                            {downloadingId === t._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiDownload className="w-4 h-4" />
                            )}
                            Invoice
                          </Button>
                        )}
                        {t.status?.toLowerCase() === "failed" && (
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handlePayNow(t)}>
                            <MdPayment className="w-4 h-4" />
                            Try again
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
