import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MdCheck, MdCheckCircle, MdPayment, MdStar, MdWarning, MdCreditCard, MdReceipt, MdCalendarToday, MdTrendingUp, MdHelp, MdDownload, MdRefresh, MdAnalytics } from "react-icons/md";
import { FiArrowRight, FiClock, FiDownload, FiRefreshCw, FiAlertCircle, FiX, FiShield, FiTrendingUp, FiTrendingDown, FiBarChart2, FiDollarSign } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getSubscriptionCopy } from "@/pages/hotel/utils/subscriptionCopy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PendingOrderActions } from "@/hooks/useOrderCountdown.tsx";

interface SubscriptionSectionProps {
  restaurant: any;
  onUpgrade: () => void;
  onRefresh: () => void;
  formatCurrency?: (amount: number) => string;
}

interface PaymentHistory {
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

interface Plan {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  billingCycle: string;
  features: string[];
  isPopular?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | Date) => {
  if (!dateString) return "N/A";
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string | Date) => {
  if (!dateString) return "N/A";
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700 border-green-300";
    case "expired":
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-300";
    case "inactive":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "refunded":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const SubscriptionSection = ({ restaurant, onUpgrade, onRefresh, formatCurrency: formatCurrencyProp }: SubscriptionSectionProps) => {
  const navigate = useNavigate();
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState<any>(restaurant);
  const [planCapabilities, setPlanCapabilities] = useState<string[]>([]);
  const [loadingCapabilities, setLoadingCapabilities] = useState(true);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  const handlePayNow = (payment: PaymentHistory) => {
    const plan = (payment.plan || "Pro").trim();
    const cycle = payment.billingCycle || "monthly";
    sessionStorage.setItem("selectedPlan", plan);
    sessionStorage.setItem("selectedPlanCycle", cycle);
    navigate(`/checkout?plan=${encodeURIComponent(plan)}&cycle=${encodeURIComponent(cycle)}`);
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    if (downloadingInvoiceId) return;
    setDownloadingInvoiceId(paymentId);
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
      setDownloadingInvoiceId(null);
    }
  };

  // Fetch latest restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.getMyRestaurant();
        if (response.success && response.data) {
          setCurrentRestaurant(response.data);
        }
      } catch (error) {

      }
    };
    fetchRestaurant();
  }, []);

  const fetchPaymentHistory = async (showLoading = true) => {
    if (showLoading) setLoadingHistory(true);
    try {
      const response = await api.getPaymentHistory({ limit: 50 });
      if (response.success) {
        setPaymentHistory(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to load payment history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const hasPendingPayment = paymentHistory.some((p) => p.status?.toLowerCase() === "pending");

  useEffect(() => {
    fetchPaymentHistory(true);
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && hasPendingPayment) {
        fetchPaymentHistory(false);
        onRefreshRef.current?.();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = hasPendingPayment
      ? setInterval(() => {
          if (document.visibilityState === "visible") {
            fetchPaymentHistory(false);
            onRefreshRef.current?.();
          }
        }, 25000)
      : undefined;
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (interval) clearInterval(interval);
    };
  }, [hasPendingPayment]);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const businessCategory = currentRestaurant?.businessCategory || "Food Mall";
        const response = await api.getPlans({ businessCategory: "all" });
        if (response.success && response.data) {
          const relevant = response.data.filter(
            (p: any) =>
              p.businessCategory === businessCategory || p.businessCategory === "All"
          );
          setAvailablePlans(relevant.slice(0, 3));
        }
      } catch (error) {
        // ignore
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [currentRestaurant?.businessCategory]);

  // Fetch plan capabilities from database (for current plan)
  useEffect(() => {
    const fetchCapabilities = async () => {
      const planName = currentRestaurant?.subscription?.plan || "Free";
      const businessCategory = currentRestaurant?.businessCategory || "All";
      setLoadingCapabilities(true);
      try {
        const res = await api.getPlanCapabilities({ planName, businessCategory });
        if (res?.success && res?.data?.capabilities) {
          setPlanCapabilities(Array.isArray(res.data.capabilities) ? res.data.capabilities : []);
        } else {
          setPlanCapabilities([]);
        }
      } catch (error) {
        setPlanCapabilities([]);
      } finally {
        setLoadingCapabilities(false);
      }
    };
    fetchCapabilities();
  }, [currentRestaurant?.subscription?.plan, currentRestaurant?.businessCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [restaurantRes, paymentRes] = await Promise.all([
        api.getMyRestaurant(),
        api.getPaymentHistory({ limit: 50 })
      ]);
      
      if (restaurantRes.success) {
        setCurrentRestaurant(restaurantRes.data);
      }
      if (paymentRes.success) {
        setPaymentHistory(paymentRes.data || []);
      }
      toast.success("Data refreshed successfully");
      onRefresh();
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const subscription = currentRestaurant?.subscription || {
    plan: "Free",
    planPrice: 0,
    status: "active",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 7,
    billingCycle: "monthly",
  };

  const businessCategory = currentRestaurant?.businessCategory || "Food Mall";
  const businessType = currentRestaurant?.businessType || "";
  const copy = getSubscriptionCopy(businessCategory, businessType);
  const capabilities = planCapabilities.length > 0 ? planCapabilities : [];

  // Calculate subscription status details
  const isExpiringSoon = subscription.daysRemaining > 0 && subscription.daysRemaining <= 7;
  const isExpired = subscription.daysRemaining <= 0 || subscription.status === "expired";
  const isFreePlan = subscription.plan === "Free" || subscription.planPrice === 0;

  // Calculate usage statistics
  const menuItemsCount = currentRestaurant?.menuItems?.length || 0;
  const menuItemsLimit = parseInt(currentRestaurant?.menuItemsLimit || "10");
  const usagePercentage = menuItemsLimit > 0 ? (menuItemsCount / menuItemsLimit) * 100 : 0;
  const qrScans = currentRestaurant?.qrScans || 0;
  const qrScansThisMonth = currentRestaurant?.qrScansThisMonth || 0;

  // Calculate payment statistics
  const totalPaid = paymentHistory
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = paymentHistory.filter(p => p.status === "completed").length;
  const lastPayment = paymentHistory.find(p => p.status === "completed");

  const currencyFormatter = formatCurrencyProp || formatCurrency;

  if (refreshing && !paymentHistory.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
        <p className="text-slate-600 font-medium text-lg">Fetching your subscription data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{copy.pageTitle}</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-lg">{copy.pageSubtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="lg" 
            className="gap-2 shadow-sm border-slate-200 hover:bg-slate-50 w-full sm:w-auto justify-center touch-manipulation min-h-[44px]"
            disabled={refreshing}
          >
            <FiRefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            {refreshing ? "Updating…" : copy.syncDataCta}
          </Button>
          <Button onClick={onUpgrade} size="lg" className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 gap-2 w-full sm:w-auto justify-center touch-manipulation min-h-[44px]">
            <MdStar className="w-5 h-5" />
            {isFreePlan ? copy.getPremiumCta : isExpired ? copy.renewCta : copy.upgradeCta}
          </Button>
        </div>
      </div>

      {/* Alert Banner for Expiring/Expired Plans */}
      {(isExpiringSoon || isExpired) && (
        <Card className={cn(
          "border-2 overflow-hidden",
          isExpired ? "bg-red-50/50 border-red-200" : "bg-orange-50/50 border-orange-200"
        )}>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className={cn(
                "w-full md:w-20 self-stretch flex items-center justify-center py-4 md:py-0",
                isExpired ? "bg-red-500" : "bg-orange-500"
              )}>
                {isExpired ? (
                  <FiAlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                ) : (
                  <FiClock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                )}
              </div>
              <div className="flex-1 p-4 sm:p-6 text-center md:text-left">
                <h4 className={cn(
                  "font-bold text-lg sm:text-xl mb-1",
                  isExpired ? "text-red-900" : "text-orange-900"
                )}>
                  {isExpired ? copy.expiredTitle : copy.expiringTitle}
                </h4>
                <p className={cn(
                  "text-sm sm:text-base",
                  isExpired ? "text-red-700" : "text-orange-700"
                )}>
                  {isExpired ? copy.expiredMessage : copy.expiringMessage(subscription.daysRemaining)}
                </p>
              </div>
              <div className="p-4 sm:p-6 w-full md:w-auto">
                <Button onClick={onUpgrade} size="lg" className={cn(
                  "w-full md:w-auto shadow-md min-h-[44px]",
                  isExpired ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
                )}>
                  {isExpired ? copy.renewCta : "Renew early"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Current Plan Hero */}
        <Card className="md:col-span-2 overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 text-xs font-bold uppercase tracking-wider w-fit">
                    {subscription.status}
                  </Badge>
                  <span className="text-slate-400 text-xs sm:text-sm font-medium">Active since {formatDate(subscription.startDate)}</span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">{subscription.plan || "Free"} Plan</h3>
                  <p className="text-slate-400 text-sm sm:text-base md:text-lg mt-2">
                    {copy.currentPlanTagline(subscription.plan || "Free")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2 sm:pt-4">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Next Billing</span>
                    <span className="text-lg sm:text-xl font-bold">{formatDate(subscription.endDate)}</span>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-slate-700" />
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Amount</span>
                    <span className="text-lg sm:text-xl font-bold">{currencyFormatter(subscription.planPrice || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 w-full md:w-auto">
                <div className="text-center space-y-1">
                  <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest">Days Left</p>
                  <p className={cn(
                    "text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter",
                    subscription.daysRemaining <= 7 ? "text-orange-500" : "text-white"
                  )}>
                    {subscription.daysRemaining || 0}
                  </p>
                  <p className="text-slate-400 text-xs sm:text-sm">Valid until {formatDate(subscription.endDate)}</p>
                </div>
                <Button onClick={onUpgrade} className="mt-4 sm:mt-6 w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-4 sm:py-6 text-sm sm:text-base">
                  {isFreePlan ? copy.getPremiumCta : isExpired ? "Renew now" : subscription.plan === "Pro" ? "View plans" : copy.upgradeCta}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Investment Card */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-orange-600 to-amber-600 text-white">
          <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col h-full justify-between">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 sm:mb-6">
              <FiDollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-bold uppercase tracking-widest">{copy.totalInvestmentLabel}</p>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mt-1">{currencyFormatter(totalPaid)}</h3>
              <p className="text-orange-100 text-xs sm:text-sm mt-2 opacity-80">{totalPayments} {copy.successfulTransactionsLabel}</p>
            </div>
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium opacity-80">{copy.latestPaymentLabel}</span>
                <span className="text-xs sm:text-sm font-bold">{lastPayment ? currencyFormatter(lastPayment.amount) : "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage & Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Resource Usage */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MdAnalytics className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">{copy.resourceUsageLabel}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{copy.resourceUsageDescription}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-700 text-sm sm:text-base">{copy.resourceUsageLabel}</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-black tracking-tighter">
                    {menuItemsLimit === 999999 ? "Unlimited" : `${menuItemsLimit} Limit`}
                  </Badge>
                </div>
                <span className="text-sm font-black text-slate-900">{usagePercentage.toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(usagePercentage, 100)} className="h-3 bg-slate-100" />
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>{menuItemsCount} {copy.itemsCreatedLabel}</span>
                <span>{menuItemsLimit === 999999 ? "∞" : menuItemsLimit} {copy.availableLabel}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 pt-2 sm:pt-4">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total QR Scans</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{qrScans.toLocaleString()}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">This Month</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{qrScansThisMonth.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Capabilities — from database */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <MdCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">{copy.planCapabilitiesTitle}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{copy.planCapabilitiesDescription(subscription.plan || "Free")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            {loadingCapabilities ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                <span className="text-sm text-slate-500">Loading capabilities…</span>
              </div>
            ) : capabilities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {capabilities.map((text, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                      <MdCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-900">{text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-2">No capabilities listed for this plan. Upgrade to see more features.</p>
            )}
            {subscription.plan !== "Pro" && !(subscription.plan || "").toLowerCase().includes("pro") && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-orange-900">{copy.upgradeBannerTitle}</p>
                  <p className="text-xs text-orange-700 mt-1 opacity-80">{copy.upgradeBannerDescription}</p>
                </div>
                <Button onClick={onUpgrade} size="sm" className="bg-orange-600 hover:bg-orange-700 shadow-md w-full sm:w-auto">
                  {copy.upgradeCta}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History - Professional Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                <MdReceipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">{copy.billingHistoryTitle}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{copy.billingHistoryDescription}</CardDescription>
              </div>
            </div>
            {paymentHistory.length > 0 && (
              <Button variant="outline" size="sm" className="gap-2 font-bold shadow-sm w-full sm:w-auto justify-center min-h-[44px]">
                <FiDownload className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              <p className="text-slate-500 font-medium tracking-tight">Fetching billing history...</p>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                <MdReceipt className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">{copy.noInvoicesTitle}</h4>
              <p className="text-slate-500 max-w-sm mx-auto">{copy.noInvoicesDescription}</p>
              <Button onClick={onUpgrade} variant="link" className="mt-4 text-orange-600 font-bold">
                {copy.viewPricingCta} →
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile: Card-based layout */}
              <div className="md:hidden space-y-3 p-4">
                {paymentHistory.map((payment) => (
                  <Card key={payment._id} className="border border-slate-200">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-base">{payment.plan || "—"} Plan</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatDate(payment.createdAt)} • {new Date(payment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <Badge className={cn(
                          "font-medium capitalize shrink-0",
                          getPaymentStatusColor(payment.status)
                        )}>
                          {payment.status || "—"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                          <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{currencyFormatter(payment.amount || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Valid Until</p>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {payment.subscriptionEndDate ? formatDate(payment.subscriptionEndDate) : "—"}
                          </p>
                        </div>
                      </div>
                      {payment.status?.toLowerCase() === 'failed' && payment.failureReason && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Failure Reason</p>
                          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                            {payment.failureReason}
                          </p>
                        </div>
                      )}
                      {(payment.razorpayPaymentId || payment.razorpayOrderId) && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Transaction ID</p>
                          <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 dark:text-slate-400 break-all block">
                            {payment.razorpayPaymentId || payment.razorpayOrderId}
                          </code>
                        </div>
                      )}
                      <div className="pt-3 border-t border-slate-200">
                        {(payment.status?.toLowerCase() === "pending" || payment.status?.toLowerCase() === "failed") && (
                          <PendingOrderActions
                            createdAt={payment.createdAt}
                            status={payment.status}
                            onPayNow={() => handlePayNow(payment)}
                          />
                        )}
                        {payment.status?.toLowerCase() === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={downloadingInvoiceId === payment._id}
                            onClick={() => handleDownloadInvoice(payment._id)}
                          >
                            {downloadingInvoiceId === payment._id ? (
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
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                <Table className="min-w-[640px]">
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="py-4 font-bold text-slate-900">Transaction Date</TableHead>
                      <TableHead className="py-4 font-bold text-slate-900">Plan Details</TableHead>
                      <TableHead className="py-4 font-bold text-slate-900">Amount Paid</TableHead>
                      <TableHead className="py-4 font-bold text-slate-900">Payment Status</TableHead>
                      <TableHead className="py-4 font-bold text-slate-900">Transaction ID</TableHead>
                      <TableHead className="py-4 font-bold text-slate-900 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="py-4">
                          <p className="font-bold text-slate-900">{formatDate(payment.createdAt)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 uppercase tracking-tighter text-xs">{payment.plan} Plan</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">Valid until {formatDate(payment.subscriptionEndDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="font-black text-slate-900 text-lg">{currencyFormatter(payment.amount)}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <Badge className={cn(
                              "px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                              getPaymentStatusColor(payment.status)
                            )}>
                              {payment.status}
                            </Badge>
                            {payment.status?.toLowerCase() === 'failed' && payment.failureReason && (
                              <p className="text-xs text-red-600 font-medium mt-1 max-w-[200px]">
                                {payment.failureReason}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <code className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                            {payment.razorpayPaymentId || payment.razorpayOrderId || "N/A"}
                          </code>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          {(payment.status?.toLowerCase() === "pending" || payment.status?.toLowerCase() === "failed") && (
                            <PendingOrderActions
                              createdAt={payment.createdAt}
                              status={payment.status}
                              onPayNow={() => handlePayNow(payment)}
                              className="items-end"
                              compact
                            />
                          )}
                          {payment.status?.toLowerCase() === "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              disabled={downloadingInvoiceId === payment._id}
                              onClick={() => handleDownloadInvoice(payment._id)}
                            >
                              {downloadingInvoiceId === payment._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiDownload className="w-4 h-4" />
                              )}
                              Invoice
                            </Button>
                          )}
                          {payment.status?.toLowerCase() === "failed" && (
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handlePayNow(payment)}>
                              <MdPayment className="w-4 h-4" />
                              Try again
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Trust & Security Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 flex-shrink-0">
            <FiShield className="w-6 h-6 sm:w-8 sm:h-10 text-green-600" />
          </div>
          <div>
            <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">{copy.secureBillingTitle}</h4>
            <p className="text-slate-500 mt-1 max-w-md font-medium text-sm sm:text-base">{copy.secureBillingDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 w-full md:w-auto justify-center md:justify-end">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Powered by</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic">Razorpay</span>
          </div>
          <div className="w-px h-8 sm:h-12 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Encrypted by</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic">SSL Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSection;
