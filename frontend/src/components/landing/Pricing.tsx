import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { MdCheck, MdRestaurantMenu, MdShoppingBag, MdBrush, MdSpa, MdWork, MdPayments, MdStar } from "react-icons/md";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
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

// Short label and React icon for display (category name → { label, Icon })
const categoryIcons: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  "Food Mall": { label: "Food Mall", Icon: MdRestaurantMenu },
  "Retail / E-Commerce Businesses": { label: "Retail", Icon: MdShoppingBag },
  "Creative & Design": { label: "Creative", Icon: MdBrush },
  "Health & Wellness": { label: "Wellness", Icon: MdSpa },
  "Professional Services": { label: "Professional", Icon: MdWork },
};

const getCategoryDisplay = (name: string) =>
  categoryIcons[name] || { label: name?.split(/[/&]/)[0]?.trim() || name, Icon: MdPayments };

type CategoryItem = { id: string; name: string; label: string; Icon: React.ComponentType<{ className?: string }> };

const Pricing = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Fetch business categories from API
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await api.getBusinessCategories();
        if (!mounted) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const list: CategoryItem[] = res.data.map((c: any) => {
            const name = c.name || c.label || c.id || "";
            const { label, Icon } = getCategoryDisplay(name);
            return { id: c.id || name, name, label, Icon };
          });
          setCategories(list);
          setSelectedCategory((prev) => (prev ? prev : list[0].name));
        } else {
          const fallback: CategoryItem[] = [
            { id: "Food Mall", name: "Food Mall", label: "Food Mall", Icon: MdRestaurantMenu },
            { id: "Retail", name: "Retail / E-Commerce Businesses", label: "Retail", Icon: MdShoppingBag },
            { id: "Creative", name: "Creative & Design", label: "Creative", Icon: MdBrush },
          ];
          setCategories(fallback);
          setSelectedCategory((prev) => (prev ? prev : fallback[0].name));
        }
      } catch (e) {

        if (!mounted) return;
        const fallback: CategoryItem[] = [
          { id: "Food Mall", name: "Food Mall", label: "Food Mall", Icon: MdRestaurantMenu },
          { id: "Retail", name: "Retail / E-Commerce Businesses", label: "Retail", Icon: MdShoppingBag },
          { id: "Creative", name: "Creative & Design", label: "Creative", Icon: MdBrush },
        ];
        setCategories(fallback);
        setSelectedCategory((prev) => (prev ? prev : fallback[0].name));
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await api.getPlans({ businessCategory: selectedCategory });
        if (response.success && response.data) {
          const convertedPlans = (Array.isArray(response.data) ? response.data : [])
            .filter((p: any) => (p.businessCategory || p.business_category) === selectedCategory)
            .map(convertPlanToDisplay)
            .sort((a: any, b: any) => a.price - b.price);
          if (convertedPlans.length >= 3) convertedPlans[1].popular = true;
          setPlans(convertedPlans);
        } else {
          setPlans([]);
        }
      } catch (error) {

        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [selectedCategory]);

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-secondary/30 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            <HiOutlineCurrencyRupee className="w-4 h-4" />
            Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Simple, Transparent
            <span className="text-gradient"> Pricing</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Choose the plan that fits your business. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Category Selector - responsive wrap */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 lg:mb-12 px-1">
            {categories.map((cat) => {
              const CatIcon = cat.Icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                    selectedCategory === cat.name
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  <CatIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 w-full max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.id || plan.name}
                className={`relative min-w-0 w-full max-w-[420px] mx-auto sm:mx-0 sm:max-w-none p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl animate-slide-up ${
                  plan.popular
                    ? "bg-foreground text-background shadow-elevated border-2 border-primary lg:scale-[1.02]"
                    : "bg-card border border-border shadow-card"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 gradient-primary rounded-full text-primary-foreground text-xs sm:text-sm font-semibold">
                    <MdStar className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                )}

                <div className="mb-5 sm:mb-6 lg:mb-8">
                  <h3 className={`font-display text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2 ${
                    plan.popular ? "text-background" : "text-foreground"
                  }`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 ${
                    plan.popular ? "text-background/70" : "text-muted-foreground"
                  }`}>
                    {plan.description}
                  </p>
                  <div className="flex flex-wrap items-baseline gap-2 mb-1 sm:mb-2">
                    {plan.originalPrice && plan.originalPrice > plan.price ? (
                      <>
                        <span className={`font-display text-2xl sm:text-3xl font-bold line-through ${
                          plan.popular ? "text-background/50" : "text-muted-foreground"
                        }`}>
                          {formatCurrency(plan.originalPrice)}
                        </span>
                        <span className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold ${
                          plan.popular ? "text-background" : "text-foreground"
                        }`}>
                          {formatCurrency(plan.price)}
                        </span>
                      </>
                    ) : (
                      <span className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold ${
                        plan.popular ? "text-background" : "text-foreground"
                      }`}>
                        {formatCurrency(plan.price)}
                      </span>
                    )}
                    <span className={`text-sm sm:text-base ${plan.popular ? "text-background/70" : "text-muted-foreground"}`}>
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

                <ul className="space-y-2.5 sm:space-y-3 lg:space-y-4 mb-5 sm:mb-6 lg:mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2 sm:gap-3">
                      {feature.included ? (
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular ? "bg-primary" : "bg-accent"
                        }`}>
                          <MdCheck className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${plan.popular ? "text-primary-foreground" : "text-accent-foreground"}`} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className={`text-xs sm:text-sm ${
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
                  size="default"
                  className={`w-full text-sm sm:text-base h-10 sm:h-11 ${
                    plan.popular 
                      ? "bg-background text-foreground hover:bg-background/90" 
                      : ""
                  }`}
                  asChild
                >
                  <Link to="/register">{plan.cta}</Link>
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
