import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MdCheck, MdPayment, MdStar, MdVerified } from "react-icons/md";
import { FiX, FiArrowRight, FiShield } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { formatCurrency, computePlanPricing } from "@/lib/pricing";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant?: any;
  onSuccess?: () => void;
  defaultPlan?: string;
  showTitle?: boolean;
  source?: "onboarding" | "pricing" | "dashboard" | "upgrade";
}

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  popular: boolean;
  businessCategory?: string;
}

// Convert backend plan to frontend format
const convertPlanToDisplay = (plan: any): Plan => {
  const features = [];
  
  features.push({
    text: `Up to ${plan.features?.menuItemsLimit === 'unlimited' ? 'Unlimited' : plan.features?.menuItemsLimit || '10'} items`,
    included: true
  });
  
  features.push({
    text: `${plan.features?.qrScansLimit === 'unlimited' ? 'Unlimited' : plan.features?.qrScansLimit || '1000'} QR scans/month`,
    included: true
  });
  
  features.push({
    text: plan.features?.analytics ? "Advanced analytics" : "Basic analytics",
    included: plan.features?.analytics !== false
  });
  
  features.push({
    text: "Custom domain",
    included: plan.features?.customDomain === true
  });
  
  features.push({
    text: "Custom branding",
    included: plan.features?.customBranding !== false
  });
  
  features.push({
    text: "Priority support",
    included: plan.features?.prioritySupport === true
  });
  
  features.push({
    text: "API access",
    included: plan.features?.apiAccess === true
  });

  // Calculate effective price for custom plans
  let effectivePrice = plan.price;
  if (plan.customPricing?.enabled) {
    if (plan.customPricing.overridePrice !== null) {
      effectivePrice = plan.customPricing.overridePrice;
    } else if (plan.customPricing.discountPercent > 0) {
      effectivePrice = plan.price * (1 - plan.customPricing.discountPercent / 100);
    }
  }

  return {
    id: plan._id || plan.id,
    name: plan.name,
    price: effectivePrice,
    originalPrice: plan.customPricing?.enabled && effectivePrice !== plan.price ? plan.price : plan.originalPrice,
    period: `/${plan.billingCycle || 'month'}`,
    description: plan.description || 'Perfect for your business',
    features,
    popular: plan.name === 'Pro' || plan.name === 'Basic',
    businessCategory: plan.businessCategory,
  };
};

export const SubscriptionDialog = ({
  open,
  onOpenChange,
  restaurant,
  onSuccess,
  defaultPlan,
  showTitle = true,
  source = "dashboard",
}: SubscriptionDialogProps) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(defaultPlan || null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentRestaurant, setCurrentRestaurant] = useState<any>(restaurant);

  // Check if user has an active paid subscription
  const hasActivePaidSubscription = (() => {
    const sub = currentRestaurant?.subscription;
    if (!sub) return false;
    const isPaid = sub.plan && sub.plan !== "Free" && (sub.planPrice || 0) > 0;
    const isActive = sub.status === "active" && (sub.daysRemaining || 0) > 0;
    return isPaid && isActive;
  })();

  const currentSubscriptionPlan = currentRestaurant?.subscription?.plan || "Free";
  const currentPlanPrice = currentRestaurant?.subscription?.planPrice || 0;

  // Fetch restaurant data if not provided
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurant && open) {
        try {
          const res = await api.getMyRestaurant();
          if (res.success) {
            setCurrentRestaurant(res.data);
          }
        } catch (error) {

        }
      } else {
        setCurrentRestaurant(restaurant);
      }
    };
    fetchRestaurant();
  }, [restaurant, open]);

  // Fetch plans from database when dialog opens
  useEffect(() => {
    const fetchPlans = async () => {
      if (!open) return;

      setLoading(true);
      try {
        const businessCategory = currentRestaurant?.businessCategory || "Food Mall";
        const response = await api.getPlans({ businessCategory: "all" });

        if (response.success && response.data) {
          const relevant = response.data.filter(
            (p: any) =>
              (p.businessCategory === businessCategory || p.businessCategory === "All") &&
              (p.price ?? 0) > 0 // Only include paid plans
          );
          const convertedPlans = relevant
            .map(convertPlanToDisplay)
            .sort((a: Plan, b: Plan) => a.price - b.price);

          const updatedPlans = convertedPlans.map((plan: Plan) => ({
            ...plan,
            popular: plan.name === "Pro" || plan.name === "Basic",
          }));

          setPlans(updatedPlans);

          if (defaultPlan && updatedPlans.some((p: Plan) => p.name === defaultPlan)) {
            setSelectedPlan(defaultPlan);
          } else if (updatedPlans.length > 0) {
            const pro = updatedPlans.find((p: Plan) => p.name === "Pro");
            const basic = updatedPlans.find((p: Plan) => p.name === "Basic");
            const firstPaid = updatedPlans.find((p: Plan) => p.price > 0);
            setSelectedPlan(pro?.name || basic?.name || firstPaid?.name || updatedPlans[0]?.name);
          }
        }
      } catch (error) {

        toast.error("Failed to load plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [open, currentRestaurant?.businessCategory, defaultPlan]);

  const handleProceedToCheckout = () => {
    if (!selectedPlan) {
      toast.error("Please select a plan first");
      return;
    }
    sessionStorage.setItem("selectedPlan", selectedPlan);
    sessionStorage.setItem("selectedPlanCycle", billingCycle);
    onOpenChange(false);
    navigate(`/checkout?plan=${encodeURIComponent(selectedPlan)}&cycle=${billingCycle}`);
  };

  const getDialogTitle = () => {
    if (hasActivePaidSubscription) {
      return `Upgrade from ${currentSubscriptionPlan}`;
    }
    switch (source) {
      case 'onboarding':
        return "Choose Your Plan to Get Started";
      case 'pricing':
        return "Complete Your Subscription";
      case 'upgrade':
        return "Upgrade Your Plan";
      default:
        return "Choose a Plan";
    }
  };

  const getDialogDescription = () => {
    if (hasActivePaidSubscription) {
      return `You're currently on the ${currentSubscriptionPlan} plan. Select a higher plan to unlock more features, limits, and priority support.`;
    }
    switch (source) {
      case 'onboarding':
        return "Select a plan to unlock all features and start growing your business with ScanBit.";
      case 'pricing':
        return "Complete your subscription to access all the features you selected.";
      case 'upgrade':
        return "Upgrade to a higher plan for more features and better support.";
      default:
        return "Select the plan that best fits your business needs.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {showTitle && (
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MdPayment className="w-5 h-5 text-primary" />
              </div>
              {getDialogTitle()}
            </DialogTitle>
            <DialogDescription className="text-base">
              {getDialogDescription()}
            </DialogDescription>
          </DialogHeader>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading plans...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <MdPayment className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No plans available. Please try again later.</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 rounded-xl border border-border/50">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === "yearly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Yearly
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md bg-green-500/20 text-green-700 dark:text-green-400 font-semibold">
                  Save 10%
                </span>
              </button>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.name;
                const isFree = plan.price === 0;
                const pricing = isFree ? { yearlyTotal: 0, yearlyPerMonth: 0 } : computePlanPricing(plan.price);
                const yearlyTotal = pricing.yearlyTotal;
                const monthlyEquivalent = isFree ? 0 : (billingCycle === "yearly" ? pricing.yearlyPerMonth : plan.price);
                const displayYearly = billingCycle === "yearly" && !isFree;
                
                // Check if this is user's current plan or a downgrade
                const isCurrentPlan = hasActivePaidSubscription && plan.name === currentSubscriptionPlan;
                const isDowngrade = hasActivePaidSubscription && plan.price <= currentPlanPrice && plan.name !== currentSubscriptionPlan;
                const isDisabled = isCurrentPlan || isDowngrade || isFree;

                return (
                  <Card
                    key={plan.id || plan.name}
                    onClick={() => !isDisabled && setSelectedPlan(plan.name)}
                    className={`relative transition-all duration-200 ${
                      isDisabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    } ${
                      isCurrentPlan
                        ? "border-2 border-green-500 bg-green-50/50 dark:bg-green-900/20"
                        : isSelected && !isDisabled
                        ? "border-2 border-primary shadow-lg ring-2 ring-primary/20"
                        : "border border-border hover:border-primary/40"
                    } ${plan.popular && !isDisabled ? "shadow-md" : ""}`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <MdCheck className="w-3 h-3" />
                        Current Plan
                      </div>
                    )}
                    
                    {!isCurrentPlan && plan.popular && !isDowngrade && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
                        <MdStar className="w-3 h-3" />
                        Popular
                      </div>
                    )}

                    {isSelected && !isDisabled && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <MdCheck className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    
                    {isDowngrade && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded">
                        N/A
                      </div>
                    )}

                    <CardHeader className={`space-y-1 ${plan.popular ? "pt-6" : "pt-4"}`}>
                      <CardTitle className="font-display text-lg">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {plan.description}
                      </CardDescription>
                      <div className="pt-3 space-y-0.5">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                            {isFree ? "Free" : formatCurrency(monthlyEquivalent)}
                          </span>
                          {!isFree && <span className="text-muted-foreground text-sm">/month</span>}
                        </div>
                        {displayYearly && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(yearlyTotal)} billed yearly
                          </p>
                        )}
                        {plan.originalPrice != null && plan.originalPrice > plan.price && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Save {formatCurrency(plan.originalPrice - plan.price)}/mo
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      <ul className="space-y-2">
                        {plan.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            {feature.included ? (
                              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MdCheck className="w-2.5 h-2.5 text-primary" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FiX className="w-2.5 h-2.5 text-muted-foreground" />
                              </div>
                            )}
                            <span className={`text-xs ${
                              feature.included ? "text-foreground" : "text-muted-foreground line-through"
                            }`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <FiShield className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <span className="font-medium text-green-700 dark:text-green-400">Secure Payment</span>
                <span className="text-green-600 dark:text-green-500"> • Powered by Razorpay • 256-bit SSL Encryption</span>
              </div>
              <MdVerified className="w-5 h-5 text-green-600" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                {source === "onboarding" ? "Skip for Now" : "Cancel"}
              </Button>
              <Button
                onClick={handleProceedToCheckout}
                disabled={!selectedPlan || (hasActivePaidSubscription && selectedPlan === currentSubscriptionPlan)}
                className="flex-1 gap-2"
              >
                <FiArrowRight className="w-4 h-4" />
                {!selectedPlan 
                  ? "Select a Plan" 
                  : hasActivePaidSubscription 
                    ? `Upgrade to ${selectedPlan}` 
                    : `Proceed to Checkout · ${selectedPlan}`
                }
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>By subscribing, you agree to our <a href="/terms-of-service" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a></p>
              <p>Cancel anytime • No hidden fees • 30-day money-back guarantee</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
