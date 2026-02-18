import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  FiArrowLeft,
  FiShield,
  FiLock,
  FiCreditCard,
  FiTag,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiPercent,
  FiMapPin,
  FiFileText,
} from "react-icons/fi";
import {
  MdPayment,
  MdCheckCircle,
  MdStar,
  MdVerified,
  MdLocalOffer,
} from "react-icons/md";
import { Link } from "react-router-dom";
import api, { env } from "@/lib/api";
import { formatCurrency, computePlanPricing, getEffectiveMonthlyPrice } from "@/lib/pricing";
import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CHECKOUT_SUCCESS_KEY = "checkout_success";
const CHECKOUT_FAILED_KEY = "checkout_failed";
const CHECKOUT_RAZORPAY_OPENED_KEY = "checkout_razorpay_opened";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanDetails {
  name: string;
  price: number;
  yearlyPrice: number;
  features: PlanFeature[];
  popular?: boolean;
  description?: string;
}

function apiPlanToDetails(plan: any, itemLabel: string): PlanDetails {
  const price = getEffectiveMonthlyPrice(plan);
  const { yearlyTotal } = computePlanPricing(price);
  const yearlyPrice = yearlyTotal;
  const f = plan.features || {};
  const features: PlanFeature[] = [
    {
      text: `Up to ${f.menuItemsLimit === "unlimited" ? "Unlimited" : f.menuItemsLimit || "10"} ${itemLabel}`,
      included: true,
    },
    {
      text: `${f.qrScansLimit === "unlimited" ? "Unlimited" : f.qrScansLimit || "1000"} QR scans/month`,
      included: true,
    },
    { text: f.analytics !== false ? "Advanced analytics" : "Basic analytics", included: f.analytics !== false },
    { text: "Custom domain", included: f.customDomain === true },
    { text: "Custom branding", included: f.customBranding !== false },
    { text: "Priority support", included: f.prioritySupport === true },
    { text: "API access", included: f.apiAccess === true },
  ];
  return {
    name: plan.name,
    price,
    yearlyPrice,
    features,
    popular: plan.name === "Pro" || plan.name === "Basic",
    description: plan.description || "",
  };
}

function getItemLabel(category: string): string {
  if (category === "Retail / E-Commerce Businesses") return "Products";
  if (category === "Creative & Design") return "Portfolio Items";
  return "Menu Items";
}

/** Format phone for Razorpay prefill: +{country}{number}. Indian 10-digit → +91. */
function formatPhoneForRazorpay(phone: string): string {
  const raw = (phone || "").replace(/\s/g, "").replace(/^\+91/, "");
  if (/^[6-9]\d{9}$/.test(raw)) return `+91${raw}`;
  if (/^\+\d{10,15}$/.test((phone || "").trim())) return (phone || "").trim();
  return raw ? `+91${raw}` : "";
}

function waitForRazorpay(maxMs = 8000): Promise<void> {
  if (typeof window !== "undefined" && (window as any).Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const t = setInterval(() => {
      if ((window as any).Razorpay) {
        clearInterval(t);
        resolve();
        return;
      }
      if (Date.now() - start >= maxMs) {
        clearInterval(t);
        reject(new Error("Payment gateway script did not load in time. Please refresh."));
      }
    }, 150);
  });
}

/** Razorpay requires a valid absolute HTTPS image URL. Avoid relative or empty-origin URLs (can cause 400). */
function getRazorpayImageUrl(logo: string | null | undefined): string {
  const fallback = "https://res.cloudinary.com/dco26pixi/image/upload/v1770330669/Scanbit/branding/ihu7ptsgu31xd5zqayhk.png";
  if (logo && typeof logo === "string" && (logo.startsWith("http://") || logo.startsWith("https://"))) return logo;
  if (typeof window !== "undefined" && window.location?.origin && window.location.origin.startsWith("http")) {
    return `${window.location.origin}/logo.svg`;
  }
  return fallback;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get plan from URL params or session storage
  const planParam = searchParams.get("plan") || sessionStorage.getItem("selectedPlan") || "Pro";
  const cycleParam = searchParams.get("cycle") || sessionStorage.getItem("selectedPlanCycle") || "monthly";
  
  const [selectedPlan, setSelectedPlan] = useState<string>(planParam);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(cycleParam as "monthly" | "yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Contact info
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  // Billing address
  const [billingAddress, setBillingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  // GST / tax details
  const [gstDetails, setGstDetails] = useState({
    gstin: "",
    companyLegalName: "",
    stateCode: "",
  });
  // Auto-renew / autopay — industry standard: default ON
  const [autopayEnabled, setAutopayEnabled] = useState(true);

  useEffect(() => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch { /* ignore */ }
    };
  }, []);

  // If user refreshed (or navigated back) during payment, show fail page
  useEffect(() => {
    const raw = sessionStorage.getItem(CHECKOUT_RAZORPAY_OPENED_KEY);
    if (!raw) return;
    const reason = "Payment was cancelled or interrupted. Please try again.";
    try {
      const o = JSON.parse(raw) as { plan?: string; billingCycle?: string; amount?: number };
      sessionStorage.removeItem(CHECKOUT_RAZORPAY_OPENED_KEY);
      sessionStorage.setItem(
        CHECKOUT_FAILED_KEY,
        JSON.stringify({
          reason,
          plan: o.plan,
          amount: o.amount,
          billingCycle: o.billingCycle,
        })
      );
      navigate(`/checkout/failed?reason=${encodeURIComponent(reason)}`, { replace: true });
    } catch {
      sessionStorage.removeItem(CHECKOUT_RAZORPAY_OPENED_KEY);
      sessionStorage.setItem(CHECKOUT_FAILED_KEY, JSON.stringify({ reason }));
      navigate(`/checkout/failed?reason=${encodeURIComponent(reason)}`, { replace: true });
    }
  }, [navigate]);

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const hotelAuth = localStorage.getItem("hotelAuth");

      if (!token && !hotelAuth) {
        toast.error("Please login to continue");
        sessionStorage.setItem("selectedPlan", selectedPlan);
        sessionStorage.setItem("redirectAfterLogin", "/checkout");
        navigate("/login");
        return;
      }

      setIsLoading(true);
      try {
        const userRes = await api.getCurrentUser();
        const restaurantRes = await api.getMyRestaurant();
        const category = restaurantRes?.success
          ? restaurantRes.data?.businessCategory || "Food Mall"
          : "Food Mall";

        if (userRes.success) {
          setUser(userRes.user);
          const u = userRes.user;
          const r = restaurantRes?.success ? restaurantRes.data : null;
          setContactInfo((prev) => ({
            ...prev,
            name: u?.name || r?.name || "",
            email: u?.email || r?.email || "",
            phone: (u?.phone || r?.phone || "").replace(/\D/g, "").slice(0, 10),
          }));
          const addr = r?.location?.address || r?.address || u?.address || "";
          const addrStr = typeof addr === "string" ? addr : "";
          setBillingAddress((prev) => ({
            ...prev,
            line1: addrStr.split(",")[0]?.trim() || prev.line1,
            country: "India",
          }));
          setGstDetails((prev) => ({
            ...prev,
            companyLegalName: r?.name || u?.name || prev.companyLegalName,
          }));
        }

        if (restaurantRes?.success) {
          const r = restaurantRes.data;
          setRestaurant(r);
          setAutopayEnabled(r?.subscription?.autopayEnabled !== false);
        }

        const plansRes = await api.getPlans({ businessCategory: "all" });
        if (plansRes.success && Array.isArray(plansRes.data)) {
          const filtered = plansRes.data.filter(
            (p: any) =>
              (p.businessCategory === category || p.businessCategory === "All") && (p.price ?? 0) >= 0
          );
          setPlans(filtered);
        }
      } catch (error: any) {

        toast.error("Failed to load checkout data");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, selectedPlan]);

  const itemLabel = getItemLabel(restaurant?.businessCategory || "Food Mall");

  // Check if user already has an active paid subscription
  const hasActivePaidSubscription = useMemo(() => {
    const sub = restaurant?.subscription;
    if (!sub) return false;
    const isPaid = sub.plan && sub.plan !== "Free" && (sub.planPrice || 0) > 0;
    const isActive = sub.status === "active" && (sub.daysRemaining || 0) > 0;
    return isPaid && isActive;
  }, [restaurant?.subscription]);

  const currentSubscriptionPlan = restaurant?.subscription?.plan || "Free";

  const { planDetails, planKeys, currentPlan, effectivePlanKey } = useMemo(() => {
    const details: Record<string, PlanDetails> = {};
    // Only include paid plans in checkout - Free plan is not available for purchase
    const sorted = [...plans].sort((a: any, b: any) => (a.price ?? 0) - (b.price ?? 0));
    sorted.forEach((p: any) => {
      // Skip free plans - checkout is for paid plans only
      if (p.name && (p.price ?? 0) > 0) {
        details[p.name] = apiPlanToDetails(p, itemLabel);
      }
    });
    const keys = Object.keys(details);
    const exists = keys.includes(selectedPlan);
    const defaultKey =
      keys.find((k) => k === "Pro") || keys.find((k) => k === "Basic") || keys[0];
    const effective = exists ? selectedPlan : defaultKey;
    const current = details[effective] || details[keys[0]];
    return {
      planDetails: details,
      planKeys: keys,
      currentPlan: current,
      effectivePlanKey: effective,
    };
  }, [plans, restaurant?.businessCategory, selectedPlan, itemLabel]);

  useEffect(() => {
    if (planKeys.length === 0) return;
    if (!planKeys.includes(selectedPlan)) {
      setSelectedPlan(effectivePlanKey);
    }
  }, [planKeys, selectedPlan, effectivePlanKey]);

  const displayPlanKey = effectivePlanKey;

  // Pricing (matches backend; coupon not applied to charge until backend supports it)
  const safePlan: PlanDetails = currentPlan ?? {
    name: effectivePlanKey || "Plan",
    price: 0,
    yearlyPrice: 0,
    features: [],
    popular: false,
  };
  const basePrice = billingCycle === "yearly" ? safePlan.yearlyPrice : safePlan.price;
  const yearlyDiscount =
    billingCycle === "yearly" ? Math.round(safePlan.price * 12 - safePlan.yearlyPrice) : 0;
  const couponDiscount = appliedCoupon ? Math.round(basePrice * (appliedCoupon.discount / 100)) : 0;
  const totalPrice = basePrice;
  const hasPlans = planKeys.length > 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsApplyingCoupon(true);
    try {
      const validCoupons: Record<string, { discount: number; description: string }> = {
        WELCOME10: { discount: 10, description: "10% off on first subscription" },
        SAVE20: { discount: 20, description: "20% off" },
        LAUNCH50: { discount: 50, description: "50% launch discount" },
      };
      const coupon = validCoupons[couponCode.toUpperCase().trim()];
      if (coupon) {
        setAppliedCoupon({ code: couponCode.toUpperCase().trim(), ...coupon });
        toast.success(`Coupon applied! ${coupon.description}`);
      } else {
        toast.error("Invalid coupon code");
      }
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const validateContact = (): boolean => {
    if (!contactInfo.name?.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!contactInfo.email?.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!contactInfo.phone?.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(contactInfo.phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return false;
    }
    return true;
  };

  const handleReviewAndPay = () => {
    if (!validateContact()) return;
    setShowConfirmModal(true);
  };

  const handlePayment = async () => {
    if (!validateContact()) return;

    // Validate that we have a valid paid plan selected
    if (!hasPlans || totalPrice === 0) {
      toast.error("Please select a valid plan to continue");
      return;
    }

    setIsProcessing(true);

    try {
      const billingAddressStr = [
        billingAddress.line1,
        billingAddress.line2,
        [billingAddress.city, billingAddress.state, billingAddress.pincode].filter(Boolean).join(" "),
        billingAddress.country,
      ].filter(Boolean).join(", ");

      const orderRes = (await api.createPaymentOrder({
        plan: displayPlanKey,
        businessCategory: restaurant?.businessCategory || "Food Mall",
        billingCycle,
        autopayEnabled,
        gstin: gstDetails.gstin.trim() || undefined,
        billingAddress: billingAddressStr || undefined,
        companyLegalName: gstDetails.companyLegalName.trim() || undefined,
      })) as any;

      if (!orderRes.success) {
        throw new Error(orderRes.message || "Failed to create payment order");
      }

      const { order, keyId, testMode } = orderRes;
      const amountRupees = Number(order.amount) / 100;

      if (testMode) {
        toast.info("Simulating payment…", { duration: 1500 });
        await new Promise((r) => setTimeout(r, 1500));
        const testPaymentRes = await api.simulateTestPayment(order.id);
        if (testPaymentRes.success) {
          sessionStorage.setItem(
            CHECKOUT_SUCCESS_KEY,
            JSON.stringify({
              plan: displayPlanKey,
              billingCycle,
              amount: amountRupees,
              orderId: order.id,
            })
          );
          sessionStorage.removeItem("selectedPlan");
          setShowConfirmModal(false);
          navigate("/checkout/success", { replace: true });
        } else {
          throw new Error("Test payment simulation failed");
        }
        setIsProcessing(false);
        return;
      }

      await waitForRazorpay();

      const amountPaise = Math.round(Number(order.amount));
      const prefillContact = formatPhoneForRazorpay(contactInfo.phone);
      
      // Store rzp instance reference
      let rzpInstance: any = null;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency: order.currency || "INR",
        name: (restaurant?.name || env.APP_NAME || "ScanBit").slice(0, 255),
        description: `${displayPlanKey} Plan – ${billingCycle === "yearly" ? "Annual" : "Monthly"} Subscription`.slice(0, 255),
        image: getRazorpayImageUrl(restaurant?.logo),
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes?.success) {
              const pay = verifyRes.payment || {};
              sessionStorage.removeItem(CHECKOUT_RAZORPAY_OPENED_KEY);
              sessionStorage.setItem(
                CHECKOUT_SUCCESS_KEY,
                JSON.stringify({
                  plan: displayPlanKey,
                  billingCycle,
                  amount: pay.amount ?? amountRupees,
                  orderId: order.id,
                  subscriptionEndDate: pay.subscriptionEndDate,
                })
              );
              sessionStorage.removeItem("selectedPlan");
              setShowConfirmModal(false);
              setIsProcessing(false);
              // Close Razorpay gateway immediately and after a tick (reliable close)
              const r = rzpInstance;
              if (r && typeof r.close === "function") {
                try { r.close(); } catch (_) {}
                setTimeout(() => { try { r.close(); } catch (_) {} }, 0);
              }
              navigate("/checkout/success", { replace: true });
            } else {
              throw new Error(verifyRes?.message || "Payment verification failed");
            }
          } catch (err: any) {
            const msg = err?.message || "Payment verification failed";
            sessionStorage.removeItem(CHECKOUT_RAZORPAY_OPENED_KEY);
            sessionStorage.setItem(
              CHECKOUT_FAILED_KEY,
              JSON.stringify({
                reason: msg,
                plan: displayPlanKey,
                amount: amountRupees,
                billingCycle,
              })
            );
            setShowConfirmModal(false);
            setIsProcessing(false);
            
            toast.error("Payment verification failed. Redirecting to failure page...", { duration: 5000 });
            const r = rzpInstance;
            if (r && typeof r.close === "function") {
              try { r.close(); } catch (_) {}
              setTimeout(() => { try { r.close(); } catch (_) {} }, 0);
            }
            navigate(`/checkout/failed?reason=${encodeURIComponent(msg)}`, { replace: true });
          }
        },
        prefill: {
          name: contactInfo.name.trim().slice(0, 255),
          email: contactInfo.email.trim().slice(0, 255),
          ...(prefillContact && { contact: prefillContact }),
        },
        notes: {
          plan: String(displayPlanKey).slice(0, 256),
          cycle: billingCycle,
          rid: String(restaurant?._id || restaurant?.id || "").slice(0, 256),
          ...(appliedCoupon?.code && { coupon: String(appliedCoupon.code).slice(0, 256) }),
        },
        theme: { color: "#F97316" },
        modal: {
          ondismiss: () => {
            const cancelReason = "Payment was cancelled.";
            sessionStorage.removeItem(CHECKOUT_RAZORPAY_OPENED_KEY);
            sessionStorage.setItem(
              CHECKOUT_FAILED_KEY,
              JSON.stringify({
                reason: cancelReason,
                plan: displayPlanKey,
                amount: amountRupees,
                billingCycle,
              })
            );
            setShowConfirmModal(false);
            setIsProcessing(false);
            // Gateway is already closed by Razorpay on dismiss
            navigate(`/checkout/failed?reason=${encodeURIComponent(cancelReason)}`, { replace: true });
          },
          confirm_close: true,
          escape: true,
        },
      };

      sessionStorage.setItem(
        CHECKOUT_RAZORPAY_OPENED_KEY,
        JSON.stringify({
          plan: displayPlanKey,
          billingCycle,
          amount: amountRupees,
        })
      );
      
      rzpInstance = new window.Razorpay(options);
      
      // Handle payment failure - close gateway and navigate
      rzpInstance.on("payment.failed", (response: any) => {
        const desc = response?.error?.description || "Payment failed. Please try again.";
        sessionStorage.removeItem(CHECKOUT_RAZORPAY_OPENED_KEY);
        sessionStorage.setItem(
          CHECKOUT_FAILED_KEY,
          JSON.stringify({
            reason: desc,
            plan: displayPlanKey,
            amount: amountRupees,
            billingCycle,
          })
        );
        setShowConfirmModal(false);
        setIsProcessing(false);
        
        // Show error message immediately
        toast.error("Payment failed. Redirecting to failure page...", { duration: 5000 });
        const r = rzpInstance;
        if (r && typeof r.close === "function") {
          try { r.close(); } catch (_) {}
          setTimeout(() => { try { r.close(); } catch (_) {} }, 0);
        }
        navigate(`/checkout/failed?reason=${encodeURIComponent(desc)}`, { replace: true });
      });
      
      rzpInstance.open();
    } catch (err: any) {
      const msg = err?.message || "Failed to initiate payment";
      toast.error(msg);
      sessionStorage.removeItem(CHECKOUT_RAZORPAY_OPENED_KEY);
      sessionStorage.setItem(
        CHECKOUT_FAILED_KEY,
        JSON.stringify({
          reason: msg,
          plan: displayPlanKey,
          amount: totalPrice,
          billingCycle,
        })
      );
      setShowConfirmModal(false);
      navigate(`/checkout/failed?reason=${encodeURIComponent(msg)}`, { replace: true });
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl w-full">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-2xl md:text-4xl font-bold font-display mb-2 md:mb-3">
              {hasActivePaidSubscription ? "Upgrade Your Plan" : "Complete Your Purchase"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg px-2">
              {hasActivePaidSubscription ? (
                <>
                  You're currently on the <span className="font-semibold text-primary">{currentSubscriptionPlan}</span> plan.
                  <span className="block text-xs md:text-sm mt-1">
                    Select a higher plan to unlock more features.
                  </span>
                </>
              ) : (
                <>
                  Secure checkout for your {displayPlanKey} subscription
                  {restaurant?.businessCategory && (
                    <span className="block text-xs md:text-sm mt-1">
                      Plans for {restaurant.businessCategory}
                      {restaurant.businessType ? ` · ${restaurant.businessType}` : ""}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {!hasPlans && !isLoading ? (
            <Card className="max-w-xl mx-auto">
              <CardContent className="py-12 text-center">
                <MdPayment className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No plans available</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  There are no subscription plans for your business category at the moment. Please try again later or contact support.
                </p>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  <FiArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Plan Selection & Forms */}
            <div className="lg:col-span-2 space-y-5 sm:space-y-6">
              {/* Plan Selection */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <MdPayment className="w-5 h-5 text-primary" />
                    {hasActivePaidSubscription ? "Choose Upgrade Plan" : "Select Your Plan"}
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {hasActivePaidSubscription 
                      ? "Upgrade to a higher plan to unlock more features and limits"
                      : "Choose the plan that best fits your needs"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 md:px-6">
                  <RadioGroup
                    value={displayPlanKey}
                    onValueChange={setSelectedPlan}
                    className="grid gap-3"
                  >
                    {planKeys.map((key) => {
                      const plan = planDetails[key];
                      if (!plan) return null;
                      // If user has active subscription, show current plan as disabled
                      const isCurrentPlan = hasActivePaidSubscription && key === currentSubscriptionPlan;
                      const isDowngrade = hasActivePaidSubscription && plan.price < (planDetails[currentSubscriptionPlan]?.price || 0);
                      
                      return (
                        <div
                          key={key}
                          className={`relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isCurrentPlan
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20 cursor-not-allowed opacity-75"
                              : isDowngrade
                              ? "border-border bg-muted/30 cursor-not-allowed opacity-60"
                              : displayPlanKey === key
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => !isCurrentPlan && !isDowngrade && setSelectedPlan(key)}
                        >
                          <RadioGroupItem 
                            value={key} 
                            id={key} 
                            disabled={isCurrentPlan || isDowngrade}
                            className="mt-1 sm:mt-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Label htmlFor={key} className="text-base md:text-lg font-semibold cursor-pointer">
                                {plan.name}
                              </Label>
                              {isCurrentPlan && (
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-[10px]">
                                  Current Plan
                                </Badge>
                              )}
                              {isDowngrade && (
                                <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">
                                  Downgrade N/A
                                </Badge>
                              )}
                              {!isCurrentPlan && !isDowngrade && plan.popular && (
                                <Badge className="bg-primary text-primary-foreground text-[10px]">
                                  <MdStar className="w-3 h-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2 sm:truncate">
                              {plan.features.filter((f) => f.included).slice(0, 3).map((f) => f.text).join(" • ")}
                            </p>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className="text-xl md:text-2xl font-bold text-primary">
                              {formatCurrency(plan.price)}
                            </p>
                            <p className="text-xs text-muted-foreground">/month</p>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  {/* Billing Cycle */}
                  {(safePlan?.price ?? 0) > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Billing Cycle</Label>
                        <RadioGroup
                          value={billingCycle}
                          onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          <div
                            className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              billingCycle === "monthly"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setBillingCycle("monthly")}
                          >
                            <RadioGroupItem value="monthly" id="monthly" />
                            <div className="flex-1">
                              <Label htmlFor="monthly" className="font-semibold cursor-pointer text-sm md:text-base">Monthly</Label>
                              <p className="text-xs md:text-sm text-muted-foreground">{formatCurrency(safePlan.price)}/mo</p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-center space-x-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              billingCycle === "yearly"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setBillingCycle("yearly")}
                          >
                            <RadioGroupItem value="yearly" id="yearly" />
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-1">
                                <Label htmlFor="yearly" className="font-semibold cursor-pointer text-sm md:text-base">
                                  Yearly
                                </Label>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] px-1.5">
                                  Save 10%
                                </Badge>
                              </div>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {formatCurrency(safePlan.yearlyPrice)}/yr
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* 1. Personal Information */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <FiUser className="w-5 h-5 text-primary" />
                    Personal information
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Primary contact for billing and account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 md:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                      <Label htmlFor="name" className="text-xs md:text-sm">Full name *</Label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="name"
                          placeholder="e.g. Rajesh Kumar"
                          value={contactInfo.name}
                          onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                          className="pl-10 h-10 md:h-11 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs md:text-sm">Email address *</Label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                          className="pl-10 h-10 md:h-11 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs md:text-sm">Phone number *</Label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="phone"
                          placeholder="10-digit mobile"
                          maxLength={10}
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          className="pl-10 h-10 md:h-11 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Billing address */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <FiMapPin className="w-5 h-5 text-primary" />
                    Billing address
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">For invoice and compliance (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 md:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="line1" className="text-xs md:text-sm">Address line 1</Label>
                      <Input
                        id="line1"
                        placeholder="Building, street, area"
                        value={billingAddress.line1}
                        onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                        className="h-10 md:h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="line2" className="text-xs md:text-sm">Address line 2</Label>
                      <Input
                        id="line2"
                        placeholder="Landmark, optional"
                        value={billingAddress.line2}
                        onChange={(e) => setBillingAddress({ ...billingAddress, line2: e.target.value })}
                        className="h-10 md:h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs md:text-sm">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        className="h-10 md:h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-xs md:text-sm">State</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={billingAddress.state}
                        onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                        className="h-10 md:h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-xs md:text-sm">Pincode</Label>
                      <Input
                        id="pincode"
                        placeholder="e.g. 110001"
                        maxLength={6}
                        value={billingAddress.pincode}
                        onChange={(e) => setBillingAddress({ ...billingAddress, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                        className="h-10 md:h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-xs md:text-sm">Country</Label>
                      <Input
                        id="country"
                        placeholder="Country"
                        value={billingAddress.country}
                        onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                        className="h-10 md:h-11 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. GST / tax details */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <FiFileText className="w-5 h-5 text-primary" />
                    GST / tax details
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">For invoice and tax compliance (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 md:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="gstin" className="text-xs md:text-sm">GSTIN</Label>
                      <Input
                        id="gstin"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={gstDetails.gstin}
                        onChange={(e) => setGstDetails({ ...gstDetails, gstin: e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 15) })}
                        className="h-10 md:h-11 text-sm font-mono"
                      />
                      <p className="text-[10px] md:text-xs text-muted-foreground">15-character GST identification number</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyLegalName" className="text-xs md:text-sm">Legal name of business</Label>
                      <Input
                        id="companyLegalName"
                        placeholder="As per GST certificate"
                        value={gstDetails.companyLegalName}
                        onChange={(e) => setGstDetails({ ...gstDetails, companyLegalName: e.target.value })}
                        className="h-10 md:h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stateCode" className="text-xs md:text-sm">State code (GST)</Label>
                      <Input
                        id="stateCode"
                        placeholder="e.g. 07 for Delhi"
                        maxLength={2}
                        value={gstDetails.stateCode}
                        onChange={(e) => setGstDetails({ ...gstDetails, stateCode: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                        className="h-10 md:h-11 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coupon Code */}
              {(safePlan?.price ?? 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FiTag className="w-5 h-5 text-primary" />
                      Have a Coupon?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <MdLocalOffer className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-700 dark:text-green-400">{appliedCoupon.code}</p>
                            <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={removeCoupon}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1"
                        />
                        <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                          {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Order Summary (sticky on desktop) */}
            <div className="space-y-5 sm:space-y-6 order-first lg:order-none">
              <Card className="lg:sticky lg:top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Plan Details */}
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MdStar className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{safePlan.name} Plan</span>
                      </div>
                      {safePlan.popular && (
                        <Badge variant="secondary">Popular</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      {billingCycle === "yearly" ? "Annual billing" : "Monthly billing"}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Includes:</p>
                    {(safePlan.features ?? []).filter(f => f.included).slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <MdCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {safePlan.name} ({billingCycle === "yearly" ? "Annual" : "Monthly"})
                      </span>
                      <span>
                        {billingCycle === "yearly"
                          ? formatCurrency(safePlan.price * 12)
                          : formatCurrency(safePlan.price)}
                      </span>
                    </div>
                    {billingCycle === "yearly" && yearlyDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <FiPercent className="w-3 h-3" />
                          Yearly discount (10%)
                        </span>
                        <span>-{formatCurrency(yearlyDiscount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Auto-pay (default ON — industry standard) */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Auto-renew at renewal date</p>
                      <p className="text-xs text-muted-foreground">We’ll charge your saved method so you don’t miss service. You can turn this off anytime in Subscription.</p>
                    </div>
                    <Switch
                      checked={autopayEnabled}
                      onCheckedChange={setAutopayEnabled}
                      className="shrink-0"
                    />
                  </div>

                  {/* Terms & Privacy */}
                  <p className="text-xs text-muted-foreground text-center">
                    By completing payment you agree to our{" "}
                    <Link to="/terms-of-service" className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy-policy" className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
                  </p>

                  {/* Review & Pay */}
                  <Button
                    className="w-full h-11 md:h-12 text-sm md:text-lg gap-2"
                    onClick={handleReviewAndPay}
                    disabled={isProcessing || !hasPlans}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <FiLock className="w-4 md:w-5 h-4 md:h-5" />
                        {hasActivePaidSubscription 
                          ? `Upgrade & Pay ${formatCurrency(totalPrice)}`
                          : `Review & Pay ${formatCurrency(totalPrice)}`
                        }
                      </>
                    )}
                  </Button>

                  {/* Security Badges */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <FiShield className="w-4 h-4 text-green-600" />
                      <span>Secured by Razorpay</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 opacity-60">
                      <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6" />
                      <FiCreditCard className="w-6 h-6" />
                      <MdVerified className="w-6 h-6 text-blue-600" />
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      256-bit SSL Encryption • PCI DSS Compliant
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          )}
        </div>
      </main>

      <Footer />

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review your order</DialogTitle>
            <DialogDescription>
              Confirm your details before proceeding to secure payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{safePlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-primary">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Auto-renew</span>
                <span className="font-medium">{autopayEnabled ? "On" : "Off"}</span>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 space-y-1 text-sm">
              <p className="font-medium text-muted-foreground">Contact</p>
              <p>{contactInfo.name}</p>
              <p>{contactInfo.email}</p>
              <p>{contactInfo.phone || "—"}</p>
            </div>
            {(billingAddress.line1 || billingAddress.city) && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-1 text-sm">
                <p className="font-medium text-muted-foreground">Billing address</p>
                <p className="text-foreground">
                  {[billingAddress.line1, billingAddress.line2, [billingAddress.city, billingAddress.state, billingAddress.pincode].filter(Boolean).join(", "), billingAddress.country].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
            {(gstDetails.gstin || gstDetails.companyLegalName) && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-1 text-sm">
                <p className="font-medium text-muted-foreground">GST / tax</p>
                {gstDetails.gstin && <p className="font-mono text-foreground">{gstDetails.gstin}</p>}
                {gstDetails.companyLegalName && <p className="text-foreground">{gstDetails.companyLegalName}</p>}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              By paying you agree to our <Link to="/terms-of-service" className="text-primary underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and <Link to="/privacy-policy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
            >
              Edit
            </Button>
            <Button
              className="w-full sm:w-auto gap-2"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FiLock className="w-4 h-4" />
              )}
              {hasActivePaidSubscription 
                ? `Upgrade & Pay ${formatCurrency(totalPrice)}`
                : `Pay ${formatCurrency(totalPrice)}`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
