import { MdCheck, MdStar, MdTrendingUp, MdRestaurantMenu, MdShoppingBag, MdBrush, MdSecurity, MdSpa, MdWork } from "react-icons/md";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SubscriptionDialog from "@/components/SubscriptionDialog";
import { FiArrowRight, FiX, FiZap } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { HiSparkles } from "react-icons/hi";
import { Loader2 } from "lucide-react";
import api, { env } from "@/lib/api";
import { formatCurrency } from "@/lib/pricing";

// Pricing plans for each business type
const businessTypePricing = {
  "Food Mall": {
    icon: MdRestaurantMenu,
    color: "primary",
    layout: "Menu layout",
    description: "Perfect for restaurants, cafés, and food businesses",
    plans: [
      {
        name: "Free",
        price: "₹0",
        period: "/month",
        description: "Perfect for trying out our menu solutions",
        features: [
          { text: "Up to 10 menu items", included: true },
          { text: "Basic QR code", included: true },
          { text: "1 menu category", included: true },
          { text: "Mobile-optimized menu", included: true },
          { text: "Basic analytics", included: true },
          { text: "Custom branding", included: false },
          { text: "Advanced analytics", included: false },
          { text: "Priority support", included: false },
          { text: "Multiple locations", included: false },
        ],
        cta: "Start Free",
        popular: false,
      },
      {
        name: "Basic",
        price: "₹299",
        period: "/month",
        description: "Great for small restaurants and cafés",
        features: [
          { text: "Up to 100 menu items", included: true },
          { text: "Branded QR codes", included: true },
          { text: "Unlimited categories", included: true },
          { text: "Mobile-optimized menu", included: true },
          { text: "Custom branding", included: true },
          { text: "Basic analytics", included: true },
          { text: "Email support", included: true },
          { text: "Menu scheduling", included: true },
          { text: "Advanced analytics", included: false },
          { text: "Priority support", included: false },
        ],
        cta: "Get Started",
        popular: false,
      },
      {
        name: "Pro",
        price: "₹699",
        period: "/month",
        description: "Best for growing food businesses",
        features: [
          { text: "Unlimited menu items", included: true },
          { text: "Custom branded QR codes", included: true },
          { text: "Unlimited categories", included: true },
          { text: "Mobile-optimized menu", included: true },
          { text: "Full custom branding", included: true },
          { text: "Advanced analytics", included: true },
          { text: "Priority support", included: true },
          { text: "Multiple locations", included: true },
          { text: "Menu scheduling", included: true },
          { text: "API access", included: true },
        ],
        cta: "Start Pro Trial",
        popular: true,
      },
    ],
  },
  "Retail / E-Commerce Businesses": {
    icon: MdShoppingBag,
    color: "accent",
    layout: "Product catalog layout",
    description: "Ideal for retail stores and e-commerce businesses",
    plans: [
      {
        name: "Free",
        price: "₹0",
        period: "/month",
        description: "Perfect for trying out our product catalog",
        features: [
          { text: "Up to 10 products", included: true },
          { text: "Basic QR code", included: true },
          { text: "1 product category", included: true },
          { text: "Mobile-optimized catalog", included: true },
          { text: "Basic product analytics", included: true },
          { text: "Custom branding", included: false },
          { text: "Inventory tracking", included: false },
          { text: "Priority support", included: false },
          { text: "Multiple stores", included: false },
        ],
        cta: "Start Free",
        popular: false,
      },
      {
        name: "Basic",
        price: "₹349",
        period: "/month",
        description: "Great for small retail stores",
        features: [
          { text: "Up to 200 products", included: true },
          { text: "Branded QR codes", included: true },
          { text: "Unlimited categories", included: true },
          { text: "Mobile-optimized catalog", included: true },
          { text: "Custom branding", included: true },
          { text: "Basic product analytics", included: true },
          { text: "Inventory tracking", included: true },
          { text: "Email support", included: true },
          { text: "Product variations", included: true },
          { text: "Advanced analytics", included: false },
          { text: "Priority support", included: false },
        ],
        cta: "Get Started",
        popular: false,
      },
      {
        name: "Pro",
        price: "₹799",
        period: "/month",
        description: "Best for growing retail businesses",
        features: [
          { text: "Unlimited products", included: true },
          { text: "Custom branded QR codes", included: true },
          { text: "Unlimited categories", included: true },
          { text: "Mobile-optimized catalog", included: true },
          { text: "Full custom branding", included: true },
          { text: "Advanced product analytics", included: true },
          { text: "Priority support", included: true },
          { text: "Multiple stores", included: true },
          { text: "Inventory management", included: true },
          { text: "API access", included: true },
        ],
        cta: "Start Pro Trial",
        popular: true,
      },
    ],
  },
  "Creative & Design": {
    icon: MdBrush,
    color: "primary",
    layout: "Portfolio layout",
    description: "Perfect for creative professionals and agencies",
    plans: [
      {
        name: "Free",
        price: "₹0",
        period: "/month",
        description: "Perfect for trying out our portfolio solutions",
        features: [
          { text: "Up to 10 portfolio items", included: true },
          { text: "Basic QR code", included: true },
          { text: "1 portfolio category", included: true },
          { text: "Mobile-optimized portfolio", included: true },
          { text: "Basic portfolio analytics", included: true },
          { text: "Custom branding", included: false },
          { text: "Client galleries", included: false },
          { text: "Priority support", included: false },
          { text: "Multiple portfolios", included: false },
        ],
        cta: "Start Free",
        popular: false,
      },
      {
        name: "Basic",
        price: "₹399",
        period: "/month",
        description: "Great for freelancers and designers",
        features: [
          { text: "Up to 50 portfolio items", included: true },
          { text: "Branded QR codes", included: true },
          { text: "Unlimited categories", included: true },
          { text: "Mobile-optimized portfolio", included: true },
          { text: "Custom branding", included: true },
          { text: "Basic portfolio analytics", included: true },
          { text: "Client galleries", included: true },
          { text: "Email support", included: true },
          { text: "Project showcases", included: true },
          { text: "Advanced analytics", included: false },
          { text: "Priority support", included: false },
        ],
        cta: "Get Started",
        popular: false,
      },
      {
        name: "Pro",
        price: "₹899",
        period: "/month",
        description: "Best for agencies and studios",
        features: [
          { text: "Unlimited portfolio items", included: true },
          { text: "Custom branded QR codes", included: true },
          { text: "Unlimited categories", included: true },
          { text: "Mobile-optimized portfolio", included: true },
          { text: "Full custom branding", included: true },
          { text: "Advanced portfolio analytics", included: true },
          { text: "Priority support", included: true },
          { text: "Multiple portfolios", included: true },
          { text: "Client management", included: true },
          { text: "API access", included: true },
        ],
        cta: "Start Pro Trial",
        popular: true,
      },
    ],
  },
  "Health & Wellness": {
    icon: MdSpa,
    color: "primary",
    layout: "Wellness layout",
    description: "Ideal for health, wellness, and practice businesses",
    plans: [],
  },
  "Professional Services": {
    icon: MdWork,
    color: "primary",
    layout: "Professional layout",
    description: "For firms and service providers",
    plans: [],
  },
};

// Convert backend plan to frontend format
const convertPlanToDisplay = (plan: any) => {
  const features = [];
  
  // Menu Items
  features.push({
    text: `Up to ${plan.features?.menuItemsLimit === 'unlimited' ? 'Unlimited' : plan.features?.menuItemsLimit || '10'} ${plan.businessCategory === 'Food Mall' ? 'menu items' : plan.businessCategory === 'Retail / E-Commerce Businesses' ? 'products' : 'portfolio items'}`,
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
    description: plan.description || `Perfect for ${plan.businessCategory === 'Food Mall' ? 'restaurants and cafes' : plan.businessCategory === 'Retail / E-Commerce Businesses' ? 'retail stores' : 'creative businesses'}`,
    features,
    cta: effectivePrice === 0 ? "Start Free" : "Get Started",
    popular: false,
    businessCategory: plan.businessCategory,
    isCustom: plan.isCustom || false,
    customPricing: plan.customPricing,
  };
};

type CategoryItem = { id: string; name: string; label: string; icon: React.ComponentType<{ className?: string }> };

const defaultCategories: CategoryItem[] = [
  { id: "Food Mall", name: "Food Mall", label: "Food Mall", icon: MdRestaurantMenu },
  { id: "Retail", name: "Retail / E-Commerce Businesses", label: "Retail", icon: MdShoppingBag },
  { id: "Creative", name: "Creative & Design", label: "Creative", icon: MdBrush },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("Food Mall");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<string | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminAuth = localStorage.getItem("adminAuth");
        const hotelAuth = localStorage.getItem("hotelAuth");

        if (!token && !adminAuth && !hotelAuth) {
          setIsAuthenticated(false);
          setUserRole(null);
          setAuthChecked(true);
          return;
        }

        try {
          const response = await api.getCurrentUser();
          if (response.success && response.user) {
            setIsAuthenticated(true);
            setUserRole(response.user.role || null);
            
            // Fetch restaurant data for logged-in users (needed for payment)
            if (response.user.role !== 'admin') {
              try {
                const restaurantRes = await api.getMyRestaurant();
                if (restaurantRes.success) {
                  setRestaurant(restaurantRes.data);
                }
              } catch (e) {

              }
            }
          } else {
            setIsAuthenticated(false);
            setUserRole(null);
          }
        } catch (error) {
          if (adminAuth) {
            try {
              const admin = JSON.parse(adminAuth);
              setIsAuthenticated(true);
              setUserRole(admin.role || "admin");
            } catch {
              setIsAuthenticated(false);
              setUserRole(null);
            }
          } else if (hotelAuth) {
            try {
              const hotel = JSON.parse(hotelAuth);
              setIsAuthenticated(true);
              setUserRole(hotel.role || "user");
              
              // Fetch restaurant data
              try {
                const restaurantRes = await api.getMyRestaurant();
                if (restaurantRes.success) {
                  setRestaurant(restaurantRes.data);
                }
              } catch (e) {

              }
            } catch {
              setIsAuthenticated(false);
              setUserRole(null);
            }
          } else {
            setIsAuthenticated(false);
            setUserRole(null);
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // Fetch business categories from API
  useEffect(() => {
    let mounted = true;
    api.getBusinessCategories()
      .then((res) => {
        if (!mounted || !res.success || !Array.isArray(res.data) || res.data.length === 0) return;
        const iconByCategory: Record<string, React.ComponentType<{ className?: string }>> = {
          "Food Mall": MdRestaurantMenu,
          "Retail / E-Commerce Businesses": MdShoppingBag,
          "Creative & Design": MdBrush,
          "Health & Wellness": MdSpa,
          "Professional Services": MdWork,
        };
        const list: CategoryItem[] = res.data.map((c: any) => {
          const name = c.name || c.label || c.id || "";
          const label = name.split("/")[0].trim();
          const Icon = iconByCategory[name] || MdRestaurantMenu;
          return { id: c.id || name, name, label, icon: Icon };
        });
        setCategories(list);
        setSelectedBusinessType((prev) => (list.some((c: CategoryItem) => c.name === prev) ? prev : list[0].name));
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedBusinessType) return;
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await api.getPlans({ businessCategory: selectedBusinessType });
        if (response.success && response.data) {
          const convertedPlans = (Array.isArray(response.data) ? response.data : [])
            .filter((p: any) => (p.businessCategory || p.business_category) === selectedBusinessType)
            .map(convertPlanToDisplay)
            .sort((a: any, b: any) => a.price - b.price);
          if (convertedPlans.length >= 3) convertedPlans[1].popular = true;
          setPlans(convertedPlans);
        } else {
          const fallback = businessTypePricing[selectedBusinessType as keyof typeof businessTypePricing];
          setPlans(fallback ? fallback.plans : []);
        }
      } catch (error) {

        const fallback = businessTypePricing[selectedBusinessType as keyof typeof businessTypePricing];
        setPlans(fallback ? fallback.plans : []);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [selectedBusinessType]);

  // Fetch FAQs from backend (faqs collection)
  useEffect(() => {
    let mounted = true;
    setFaqsLoading(true);
    api.getFAQs()
      .then((res) => {
        if (!mounted || !res.success || !Array.isArray(res.data)) return;
        const list = res.data.map((item: any) => ({
          question: item.question || item.title || item.q || "",
          answer: item.answer || item.content || item.body || item.a || "",
        })).filter((f: any) => f.question && f.answer);
        setFaqs(list);
      })
      .catch(() => {
        if (mounted) setFaqs([
          { question: "Can I change plans later?", answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately." },
          { question: "What payment methods do you accept?", answer: "We accept all major credit cards, debit cards, UPI, and bank transfers." },
          { question: "Is there a setup fee?", answer: "No setup fees. You only pay the monthly subscription fee." },
          { question: "Can I cancel anytime?", answer: "Absolutely! Cancel your subscription anytime with no cancellation fees." },
          { question: "Is there a free trial?", answer: "Yes! You get a 7-day free trial to explore all features. No credit card required." },
        ]);
      })
      .finally(() => { if (mounted) setFaqsLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Handle plan selection for authenticated users
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

  const benefits = [
    {
      icon: FiZap,
      title: "Instant Setup",
      description: "Get started in under 5 minutes",
    },
    {
      icon: MdSecurity,
      title: "Secure & Reliable",
      description: "99.9% uptime guarantee",
    },
    {
      icon: MdTrendingUp,
      title: "Scale as You Grow",
      description: "Upgrade anytime, no hassle",
    },
  ];

  const selectedType = businessTypePricing[selectedBusinessType as keyof typeof businessTypePricing];
  const Icon = selectedType?.icon ?? MdRestaurantMenu;

  return (
    <div className="min-h-screen">
      <Navbar />
      
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <HiSparkles className="w-4 h-4" />
              <span>Simple Pricing</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              Simple, Transparent
              <span className="block text-gradient"> Pricing</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Choose the plan that fits your business type. No hidden fees, cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MdStar className="w-4 h-4 text-primary fill-primary" />
              <span>7-day free trial on all plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Business Type Selector - 5 categories from API */}
      <section className="py-10 sm:py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
                Choose your business type
              </h2>
              <p className="text-sm text-muted-foreground">
                Pricing tailored to your industry
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2 bg-secondary/50 rounded-2xl border border-border">
              {categories.map((cat) => {
                const TypeIcon = cat.icon;
                const isSelected = selectedBusinessType === cat.name;
                const color = cat.name === "Food Mall" ? "primary" : cat.name.includes("Retail") ? "accent" : "primary";
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedBusinessType(cat.name)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-4 rounded-xl transition-all min-w-[120px] sm:min-w-0 ${
                      isSelected
                        ? color === "primary"
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-accent text-accent-foreground shadow-lg"
                        : "hover:bg-secondary text-muted-foreground"
                    }`}
                  >
                    <TypeIcon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${isSelected ? "" : "text-muted-foreground"}`} />
                    <span className="font-semibold text-sm sm:text-base">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {selectedType && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
                  <Icon className={`w-4 h-4 ${selectedType.color === "primary" ? "text-primary" : "text-accent"}`} />
                  <span className="text-sm text-muted-foreground">
                    Layout: <span className="font-medium text-foreground">{selectedType.layout}</span>
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{selectedType.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No plans available for this category. Please check back later.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => {
                // Handle both backend format (with price as number) and frontend format (with price as string)
                const priceValue = typeof plan.price === 'number' ? plan.price : parseFloat(plan.price?.replace(/[₹,]/g, '') || '0');
                const originalPriceValue = plan.originalPrice && typeof plan.originalPrice === 'number' ? plan.originalPrice : null;
                
                return (
                  <Card
                    key={plan.id || plan.name}
                    className={`relative overflow-hidden transition-all hover-lift animate-slide-up w-full max-w-md mx-auto lg:max-w-none ${
                      plan.popular
                        ? "border-2 border-primary shadow-elevated lg:scale-[1.02]"
                        : "border border-border shadow-card"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground py-2 text-center text-sm font-semibold">
                        Most Popular
                      </div>
                    )}

                    <CardHeader className={`pt-8 ${plan.popular ? "pb-4" : "pb-6"}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="font-display text-2xl font-bold">
                          {plan.name}
                        </CardTitle>
                        {plan.isCustom && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-sm mb-6">
                        {plan.description}
                      </CardDescription>
                      <div className="flex items-baseline gap-2 mb-2">
                        {originalPriceValue && originalPriceValue > priceValue ? (
                          <>
                            <span className="font-display text-3xl font-bold line-through text-muted-foreground">
                              {formatCurrency(originalPriceValue)}
                            </span>
                            <span className="font-display text-5xl font-bold text-foreground">
                              {formatCurrency(priceValue)}
                            </span>
                          </>
                        ) : (
                          <span className="font-display text-5xl font-bold text-foreground">
                            {typeof plan.price === 'string' ? plan.price : formatCurrency(priceValue)}
                          </span>
                        )}
                        <span className="text-lg text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                      {originalPriceValue && originalPriceValue > priceValue && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {plan.isCustom && plan.customPricing?.discountPercent > 0 
                            ? `${plan.customPricing.discountPercent}% Special Discount - Save ${formatCurrency(originalPriceValue - priceValue)}/month`
                            : `Save ${formatCurrency(originalPriceValue - priceValue)}/month`
                          }
                        </p>
                      )}
                      {plan.isCustom && plan.customPricing?.enabled && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                          ✨ Exclusive custom plan just for you
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {priceValue === 0 ? "7-day free trial" : "Billed monthly"}
                      </p>
                    </CardHeader>

                <CardContent className="space-y-6 pb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.popular ? "bg-primary" : "bg-accent"
                          }`}>
                            <MdCheck className={`w-3 h-3 ${
                              plan.popular ? "text-primary-foreground" : "text-accent-foreground"
                            }`} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FiX className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className={`text-sm leading-relaxed ${
                          feature.included ? "text-foreground" : "text-muted-foreground line-through"
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    className="w-full"
                    onClick={() => handlePlanSelect(plan.name)}
                  >
                    {isAuthenticated && userRole !== "admin" ? (
                      priceValue === 0 ? "Activate Free Plan" : "Choose Plan"
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">
              Why Choose {env.APP_NAME}?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - from backend */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Everything you need to know about our pricing
              </p>
            </div>

            {faqsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : faqs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No FAQs available at the moment.</p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card
                    key={index}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base sm:text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-background mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-background/70 mb-8">
              Start your 7-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated && userRole !== "admin" ? (
                <>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="gap-2"
                    onClick={() => {
                      setSelectedPlanForPayment("Pro");
                      setShowSubscriptionDialog(true);
                    }}
                  >
                    Upgrade to Pro
                    <FiArrowRight className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-background/30 text-background hover:bg-background hover:text-foreground"
                    asChild
                  >
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              ) : !isAuthenticated ? (
                <>
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/register" className="gap-2">
                      Start Free Trial
                      <FiArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-background/30 text-background hover:bg-background hover:text-foreground"
                    asChild
                  >
                    <Link to="/features">View Features</Link>
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-background/30 text-background hover:bg-background hover:text-foreground"
                  asChild
                >
                  <Link to="/admin/dashboard">Go to Admin Dashboard</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
