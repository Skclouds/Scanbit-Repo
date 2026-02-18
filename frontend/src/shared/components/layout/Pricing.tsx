import SubscriptionDialog from "@/components/SubscriptionDialog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiArrowRight } from "react-icons/fi";
import { MdCheck } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { env, api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Convert backend plan to frontend format
const convertPlanToDisplay = (plan: any) => {
  const features = [];
  
  // Menu Items
  features.push({
    text: `Up to ${plan.features?.menuItemsLimit === 'unlimited' ? 'Unlimited' : plan.features?.menuItemsLimit || '10'} menu items`,
    included: true
  });
  
  // QR Scans
  features.push({
    text: `${plan.features?.qrScansLimit === 'unlimited' ? 'Unlimited' : plan.features?.qrScansLimit || '1000'} QR scans per month`,
    included: true
  });
  
  // Analytics
  features.push({
    text: plan.features?.analytics ? "Advanced analytics dashboard" : "Basic analytics",
    included: plan.features?.analytics !== false
  });
  
  // Custom Domain
  features.push({
    text: "Custom domain",
    included: plan.features?.customDomain === true
  });
  
  // Custom Branding
  features.push({
    text: plan.features?.customBranding ? "Full custom branding" : "Basic branding",
    included: plan.features?.customBranding !== false
  });
  
  // Priority Support
  features.push({
    text: "Priority support",
    included: plan.features?.prioritySupport === true
  });
  
  // API Access
  features.push({
    text: "API access",
    included: plan.features?.apiAccess === true
  });

  // Generate description based on business category
  let description = plan.description;
  if (!description) {
    if (plan.businessCategory === 'Food Mall') {
      description = 'Perfect for restaurants and cafes';
    } else if (plan.businessCategory === 'Retail / E-Commerce Businesses') {
      description = 'Perfect for retail stores';
    } else {
      description = 'Perfect for creative businesses';
    }
  }

  return {
    id: plan._id || plan.id,
    name: plan.name,
    price: plan.price,
    originalPrice: plan.originalPrice,
    period: `/${plan.billingCycle || 'month'}`,
    description: description,
    features,
    cta: plan.price === 0 ? "Start Free" : "Get Started",
    popular: false, // You can set this based on plan name or other criteria
    businessCategory: plan.businessCategory,
  };
};

const Pricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Food Mall");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const adminAuth = localStorage.getItem("adminAuth");
      const hotelAuth = localStorage.getItem("hotelAuth");

      if (!token && !adminAuth && !hotelAuth) {
        setIsAuthenticated(false);
        setUserRole(null);
        return;
      }

      try {
        const response = await api.getCurrentUser();
        if (response.success && response.user) {
          setIsAuthenticated(true);
          setUserRole(response.user.role || null);
          
          // Fetch restaurant data for logged-in users
          if (response.user.role !== 'admin') {
            try {
              const restaurantRes = await api.getMyRestaurant();
              if (restaurantRes.success) {
                setRestaurant(restaurantRes.data);
              }
            } catch (e) {

            }
          }
        }
      } catch (error) {
        if (hotelAuth) {
          try {
            const hotel = JSON.parse(hotelAuth);
            setIsAuthenticated(true);
            setUserRole(hotel.role || "user");
            
            try {
              const restaurantRes = await api.getMyRestaurant();
              if (restaurantRes.success) {
                setRestaurant(restaurantRes.data);
              }
            } catch (e) {

            }
          } catch {
            setIsAuthenticated(false);
          }
        } else if (adminAuth) {
          try {
            const admin = JSON.parse(adminAuth);
            setIsAuthenticated(true);
            setUserRole(admin.role || "admin");
          } catch {
            setIsAuthenticated(false);
          }
        }
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await api.getPlans({ businessCategory: selectedCategory });
        if (response.success && response.data) {
          // Convert backend plans to display format
          const convertedPlans = response.data
            .filter((p: any) => p.businessCategory === selectedCategory)
            .map(convertPlanToDisplay)
            .sort((a: any, b: any) => a.price - b.price);
          
          // Mark middle plan as popular if we have 3 plans
          if (convertedPlans.length >= 3) {
            convertedPlans[1].popular = true;
          }
          
          setPlans(convertedPlans);
        }
      } catch (error) {

        // Fallback to empty array
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [selectedCategory]);

  // Handle plan selection
  const handlePlanSelect = (planName: string) => {
    if (isAuthenticated && userRole !== "admin") {
      // Logged in user - redirect to checkout page with selected plan
      sessionStorage.setItem('selectedPlan', planName);
      navigate(`/checkout?plan=${planName}`);
    } else if (isAuthenticated && userRole === "admin") {
      // Admin user - go to admin dashboard
      navigate('/admin/dashboard');
    } else {
      // Not logged in - redirect to register with selected plan
      sessionStorage.setItem('selectedPlan', planName);
      navigate('/register');
    }
  };

  // Handle successful subscription
  const handleSubscriptionSuccess = () => {
    setShowSubscriptionDialog(false);
    navigate('/dashboard?tab=subscription');
  };

  const categories = [
    { id: "Food Mall", label: "Food Mall", icon: "🍽️" },
    { id: "Retail / E-Commerce Businesses", label: "Retail", icon: "🛍️" },
    { id: "Creative & Design", label: "Creative", icon: "🎨" },
  ];

  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      {/* Subscription Dialog for logged-in users */}
      {isAuthenticated && userRole !== "admin" && (
        <SubscriptionDialog
          open={showSubscriptionDialog}
          onOpenChange={setShowSubscriptionDialog}
          restaurant={restaurant}
          defaultPlan={selectedPlanForPayment || undefined}
          onSuccess={handleSubscriptionSuccess}
          source="pricing"
        />
      )}
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Simple, Transparent
            <span className="text-gradient"> Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your business. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No plans available for this category. Please check back later.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.id || plan.name}
                className={`relative p-8 rounded-3xl animate-slide-up ${
                  plan.popular
                    ? "bg-foreground text-background shadow-elevated scale-105 border-2 border-primary"
                    : "bg-card border border-border shadow-card"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 gradient-primary rounded-full text-primary-foreground text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`font-display text-2xl font-bold mb-2 ${
                    plan.popular ? "text-background" : "text-foreground"
                  }`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${
                    plan.popular ? "text-background/70" : "text-muted-foreground"
                  }`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    {plan.originalPrice && plan.originalPrice > plan.price ? (
                      <>
                        <span className={`font-display text-3xl font-bold line-through ${
                          plan.popular ? "text-background/50" : "text-muted-foreground"
                        }`}>
                          {formatCurrency(plan.originalPrice)}
                        </span>
                        <span className={`font-display text-5xl font-bold ${
                          plan.popular ? "text-background" : "text-foreground"
                        }`}>
                          {formatCurrency(plan.price)}
                        </span>
                      </>
                    ) : (
                      <span className={`font-display text-5xl font-bold ${
                        plan.popular ? "text-background" : "text-foreground"
                      }`}>
                        {formatCurrency(plan.price)}
                      </span>
                    )}
                    <span className={plan.popular ? "text-background/70" : "text-muted-foreground"}>
                      {plan.period}
                    </span>
                  </div>
                  {plan.originalPrice && plan.originalPrice > plan.price && (
                    <p className={`text-xs font-medium ${
                      plan.popular ? "text-background/80" : "text-emerald-600"
                    }`}>
                      Save {formatCurrency(plan.originalPrice - plan.price)}/month
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular ? "bg-primary" : "bg-accent"
                        }`}>
                          <MdCheck className={`w-3 h-3 ${
                            plan.popular ? "text-primary-foreground" : "text-accent-foreground"
                          }`} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          <FiX className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className={`text-sm ${
                        plan.popular 
                          ? feature.included ? "text-background" : "text-background/50" 
                          : feature.included ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "glass" : "default"}
                  size="lg"
                  className={`w-full ${
                    plan.popular 
                      ? "bg-background text-foreground hover:bg-background/90" 
                      : ""
                  }`}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {isAuthenticated && userRole !== "admin" ? (
                    plan.price === 0 ? "Activate Free" : "Choose Plan"
                  ) : (
                    plan.cta
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;
