import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MdWarning, MdPayment, MdStar, MdCheck, MdBlock } from "react-icons/md";
import { FiArrowRight, FiAlertTriangle, FiZap } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import api, { env } from "@/lib/api";
import { formatCurrency } from "@/lib/pricing";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

interface PlanPreview {
  id: string;
  name: string;
  price: number;
  popular: boolean;
  businessCategory?: string;
}

function toPlanPreview(plan: any): PlanPreview {
  let price = plan.price;
  if (plan.customPricing?.enabled) {
    if (plan.customPricing.overridePrice != null) price = plan.customPricing.overridePrice;
    else if (plan.customPricing.discountPercent > 0)
      price = plan.price * (1 - plan.customPricing.discountPercent / 100);
  }
  return {
    id: plan._id || plan.id,
    name: plan.name,
    price: Math.round(price),
    popular: ["Pro", "Basic", "Professional"].includes(plan.name),
    businessCategory: plan.businessCategory,
  };
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isExpired: boolean;
    isExpiringSoon: boolean;
    daysRemaining: number;
    plan: string;
    endDate: string | null;
  } | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [plans, setPlans] = useState<PlanPreview[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // On /dashboard, skip guard check so Dashboard handles subscription/trial state and fetches data once (avoids duplicate getMyRestaurant + 429)
        if (location.pathname === '/dashboard') {
          setLoading(false);
          return;
        }

        // Skip subscription check for admin users
        const userRole = localStorage.getItem('userRole');
        const adminAuth = localStorage.getItem('adminAuth');
        
        if (userRole === 'admin' || adminAuth === 'true') {
          setLoading(false);
          return;
        }

        const response = await api.getMyRestaurant();
        if (response.success && response.data) {
          setRestaurant(response.data);
          const subscription = response.data.subscription;
          
          if (subscription) {
            const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
            const now = new Date();
            const daysRemaining = endDate 
              ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            
            const isExpired = daysRemaining <= 0 || subscription.status === 'expired' || subscription.status === 'cancelled';
            const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 3;
            
            // Check if it's a free plan that's expired
            const isFreePlanExpired = (subscription.plan === 'Free' || !subscription.plan || subscription.planPrice === 0) && isExpired;
            
            setSubscriptionStatus({
              isExpired: isExpired || isFreePlanExpired,
              isExpiringSoon,
              daysRemaining: Math.max(0, daysRemaining),
              plan: subscription.plan || 'Free',
              endDate: subscription.endDate
            });
            
            // Show modal if expired
            if (isExpired || isFreePlanExpired) {
              setShowExpiredModal(true);
            }
          } else {
            // No subscription at all - treat as expired free trial
            setSubscriptionStatus({
              isExpired: true,
              isExpiringSoon: false,
              daysRemaining: 0,
              plan: 'Free',
              endDate: null
            });
            setShowExpiredModal(true);
          }
        }
      } catch (error: any) {
        // If it's a 404 error (Restaurant not found), check if user is admin
        if (error.message?.includes('Restaurant not found') || error.message?.includes('404')) {
          const userRole = localStorage.getItem('userRole');
          const adminAuth = localStorage.getItem('adminAuth');
          
          if (userRole === 'admin' || adminAuth === 'true') {
            setLoading(false);
            return;
          }
        }
        
        // For non-admin users with errors, treat as no subscription
        setSubscriptionStatus({
          isExpired: true,
          isExpiringSoon: false,
          daysRemaining: 0,
          plan: 'Free',
          endDate: null
        });
        setShowExpiredModal(true);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  useEffect(() => {
    if (!showExpiredModal) return;
    const category = restaurant?.businessCategory || "Food Mall";
    let cancelled = false;
    setPlansLoading(true);
    api
      .getPlans({ businessCategory: "all" })
      .then((res: any) => {
        if (cancelled || !res?.success || !Array.isArray(res.data)) return;
        const filtered = res.data.filter(
          (p: any) =>
            (p.businessCategory === category || p.businessCategory === "All") && (p.price ?? 0) > 0
        );
        const previews = filtered.map(toPlanPreview).sort((a: PlanPreview, b: PlanPreview) => a.price - b.price);
        if (!cancelled) setPlans(previews);
      })
      .catch(() => {
        if (!cancelled) setPlans([]);
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => { cancelled = true; };
  }, [showExpiredModal, restaurant?.businessCategory]);

  const handleSelectPlan = (planName: string) => {
    setShowExpiredModal(false);
    navigate(`/checkout?plan=${encodeURIComponent(planName)}`);
  };

  const handleChoosePlan = () => {
    const defaultPlan = plans.find((p) => p.name === "Pro") || plans.find((p) => p.name === "Basic") || plans[0];
    setShowExpiredModal(false);
    navigate(defaultPlan ? `/checkout?plan=${encodeURIComponent(defaultPlan.name)}` : "/pricing");
  };

  const handleViewPricing = () => {
    setShowExpiredModal(false);
    navigate("/pricing");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hotelAuth");
    localStorage.removeItem("adminAuth");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Checking subscription...</p>
        </div>
      </div>
    );
  }

  // If subscription is expired, show the modal and block access
  if (subscriptionStatus?.isExpired) {
    return (
      <>
        <Dialog open={showExpiredModal} onOpenChange={() => {}}>
          <DialogContent 
            className="sm:max-w-lg"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <MdBlock className="w-8 h-8 text-red-600" />
              </div>
              <DialogTitle className="text-2xl">
                {subscriptionStatus.plan === 'Free' 
                  ? 'Free Trial Expired' 
                  : 'Subscription Expired'
                }
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {subscriptionStatus.plan === 'Free' 
                  ? `Your ${env.FREE_PLAN_TRIAL_DAYS}-day free trial has ended. Choose a plan to continue using ${env.APP_NAME}.`
                  : `Your ${subscriptionStatus.plan} subscription has expired. Renew now to continue using all features.`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Benefits reminder */}
              <div className="bg-secondary/50 rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FiZap className="w-4 h-4 text-primary" />
                  Unlock Premium Features
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <MdCheck className="w-4 h-4 text-green-600" />
                    Unlimited menu items & categories
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheck className="w-4 h-4 text-green-600" />
                    Custom branded QR codes
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheck className="w-4 h-4 text-green-600" />
                    Advanced analytics & insights
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheck className="w-4 h-4 text-green-600" />
                    Priority customer support
                  </li>
                </ul>
              </div>

              {/* Pricing from DB – per user business category */}
              <div className="space-y-3">
                {restaurant?.businessCategory && (
                  <p className="text-xs text-muted-foreground">
                    Plans for <span className="font-medium text-foreground">{restaurant.businessCategory}</span>
                    {restaurant.businessType ? ` · ${restaurant.businessType}` : ""}
                  </p>
                )}
                {plansLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading plans…</span>
                  </div>
                ) : plans.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {plans.map((p) => (
                      <div
                        key={p.id}
                        className={`relative p-4 rounded-xl border-2 transition-colors ${
                          p.popular ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        {p.popular && (
                          <div className="absolute -top-2 right-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <MdStar className="w-3 h-3" />
                            Popular
                          </div>
                        )}
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xl font-bold text-primary mt-1">{formatCurrency(p.price)}</p>
                        <p className="text-xs text-muted-foreground">/month</p>
                        <Button
                          size="sm"
                          variant={p.popular ? "default" : "outline"}
                          className="w-full mt-3 gap-1"
                          onClick={() => handleSelectPlan(p.name)}
                        >
                          Select
                          <FiArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                    <p className="text-sm text-muted-foreground">No plans found. Plans are loaded from the database—ensure plans are seeded for your category.</p>
                    <Button variant="link" size="sm" onClick={handleViewPricing} className="mt-2">
                      View all plans
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleChoosePlan} className="w-full gap-2" disabled={plansLoading}>
                <MdPayment className="w-5 h-5" />
                {plans.length > 0 ? "Choose a Plan" : "View Plans"}
                <FiArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleViewPricing} className="w-full">
                View All Plans
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="w-full text-muted-foreground">
                Logout
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-2">
              Need help? Contact us at {env.SUPPORT_EMAIL}
            </p>
          </DialogContent>
        </Dialog>

        {/* Show a blocked view behind the modal */}
        <div className="min-h-screen bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="max-w-md mx-4 text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <MdWarning className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                Please subscribe to a plan to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleChoosePlan} className="w-full">
                Choose a Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Show expiring soon warning banner but allow access
  if (subscriptionStatus?.isExpiringSoon) {
    return (
      <div className="min-h-screen">
        {/* Expiring soon banner */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-950 py-2 px-4">
          <div className="container mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                Your {subscriptionStatus.plan} plan expires in {subscriptionStatus.daysRemaining} day{subscriptionStatus.daysRemaining !== 1 ? 's' : ''}!
              </span>
            </div>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => navigate("/checkout?plan=" + subscriptionStatus.plan)}
              className="gap-1"
            >
              Renew Now
              <FiArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Add padding to account for banner */}
        <div className="pt-12">
          {children}
        </div>
      </div>
    );
  }

  // Subscription is valid, render children
  return <>{children}</>;
};

export default SubscriptionGuard;
