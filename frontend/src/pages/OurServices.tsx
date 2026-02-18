import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HiSparkles } from "react-icons/hi";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { env } from "@/lib/api";
import api from "@/lib/api";
import { 
  MdRestaurantMenu,
  MdShoppingBag,
  MdBrush,
  MdRestaurant,
  MdLocalCafe,
  MdHotel,
  MdFastfood,
  MdCake,
  MdLocalBar,
  MdStorefront,
  MdLocalPizza,
  MdIcecream,
  MdLocalDrink,
  MdStore,
  MdEvent,
  MdInventory,
  MdChair,
  MdDevices,
  MdToys,
  MdPrint,
  MdDesignServices,
  MdPalette,
  MdWork,
  MdCampaign,
  MdSpa,
} from "react-icons/md";
import { INDUSTRY_ROUTES } from "./industries";

// Icon mapping
const iconMap: Record<string, any> = {
  MdRestaurantMenu,
  MdShoppingBag,
  MdBrush,
  MdRestaurant,
  MdLocalCafe,
  MdHotel,
  MdFastfood,
  MdCake,
  MdLocalBar,
  MdStorefront,
  MdIcecream,
  MdLocalDrink,
  MdStore,
  MdEvent,
  MdInventory,
  MdChair,
  MdDevices,
  MdToys,
  MdPrint,
  MdDesignServices,
  MdPalette,
  MdWork,
  MdCampaign,
};

// Your 5 business categories → demo page (order matches display)
const BUSINESS_CATEGORY_DEMO_ROUTES: Record<string, string> = {
  "Agencies & Studios": INDUSTRY_ROUTES.creative,
  "Creative & Design businesses": INDUSTRY_ROUTES["creative-design"],
  "Portfolio": INDUSTRY_ROUTES["professional-services"],
  "Retail / E-Commerce businesses": INDUSTRY_ROUTES.retail,
  "Food Mall": INDUSTRY_ROUTES["food-mall"],
};

const normalizeCategoryKey = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();
const BUSINESS_CATEGORY_DEMO_ROUTES_NORMALIZED = Object.fromEntries(
  Object.entries(BUSINESS_CATEGORY_DEMO_ROUTES).map(([key, route]) => [normalizeCategoryKey(key), route])
);

// Icon map for API-loaded categories (by name or icon key)
const iconMapForApi: Record<string, any> = {
  ...iconMap,
  MdSpa,
};

// Fallback: exactly 5 business categories with professional copy and business types
const fallbackBusinessTypes: Record<string, { icon: any; color: string; layout: string; description: string; subcategories: { name: string; icon: any; description: string }[] }> = {
  "Agencies & Studios": {
    icon: MdCampaign,
    color: "primary",
    layout: "Agency & studio landing",
    description: "Showcase your agency with a branded landing page, featured work, and clear contact—so clients find you and trust you.",
    subcategories: [
      { name: "Branding agencies", icon: MdPalette, description: "Brand identity, guidelines, and visual systems" },
      { name: "Digital marketing agencies", icon: MdCampaign, description: "Campaigns, social, and performance marketing" },
      { name: "Creative studios", icon: MdBrush, description: "Design, motion, and creative production" },
      { name: "Advertising agencies", icon: MdWork, description: "Campaigns, media, and creative strategy" },
    ],
  },
  "Creative & Design businesses": {
    icon: MdBrush,
    color: "accent",
    layout: "Creative portfolio",
    description: "Present your design work and services professionally—portfolios, case studies, and clear CTAs that win clients.",
    subcategories: [
      { name: "Graphic designers", icon: MdPalette, description: "Visual identity, print, and digital design" },
      { name: "Logo & brand designers", icon: MdDesignServices, description: "Logos, brand systems, and style guides" },
      { name: "Print & packaging", icon: MdPrint, description: "Print shops, packaging design, and samples" },
      { name: "Freelancers & independents", icon: MdWork, description: "Services, projects, and client work" },
    ],
  },
  "Portfolio": {
    icon: MdWork,
    color: "primary",
    layout: "Professional profile",
    description: "One clear profile for your expertise, practice areas, and contact—ideal for consultants, lawyers, and B2B professionals.",
    subcategories: [
      { name: "Legal & law firms", icon: MdWork, description: "Practice areas, team, and client contact" },
      { name: "Consultants", icon: MdWork, description: "Expertise, offerings, and engagement" },
      { name: "Coaches & advisors", icon: MdWork, description: "Services, testimonials, and booking" },
      { name: "B2B & professional services", icon: MdWork, description: "Capabilities and contact for enterprises" },
    ],
  },
  "Retail / E-Commerce businesses": {
    icon: MdShoppingBag,
    color: "accent",
    layout: "Product catalog",
    description: "Digital catalogs that look pro—categories, search, filters, and product details so customers browse and buy with confidence.",
    subcategories: [
      { name: "Fashion & apparel", icon: MdInventory, description: "Collections, sizes, and lookbooks" },
      { name: "Furniture & home", icon: MdChair, description: "Ranges, specs, and in-store or online" },
      { name: "Electronics & gadgets", icon: MdDevices, description: "Specs, pricing, and availability" },
      { name: "Specialty & gift stores", icon: MdStore, description: "Curated products and gifting" },
    ],
  },
  "Food Mall": {
    icon: MdRestaurantMenu,
    color: "primary",
    layout: "Digital menu",
    description: "QR menus, categories, and instant updates—so diners see your full offer and you change it anytime without reprinting.",
    subcategories: [
      { name: "Restaurants & cafés", icon: MdRestaurant, description: "Full menus, specials, and dietary info" },
      { name: "Hotels & room service", icon: MdHotel, description: "In-room dining and F&B outlets" },
      { name: "Cloud kitchens & delivery", icon: MdStorefront, description: "Delivery menus and quick updates" },
      { name: "Fast food & food courts", icon: MdFastfood, description: "Quick-service and multi-outlet menus" },
      { name: "Bakeries, bars, juice bars", icon: MdCake, description: "Drinks, pastries, and daily offerings" },
    ],
  },
};

// Display order for the 5 business categories
const CATEGORY_ORDER = [
  "Agencies & Studios",
  "Creative & Design businesses",
  "Portfolio",
  "Retail / E-Commerce businesses",
  "Food Mall",
];

const OurServices = () => {
  const [businessTypes, setBusinessTypes] = useState<typeof fallbackBusinessTypes>(fallbackBusinessTypes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await api.getBusinessCategories();
        if (response.success && response.data?.length > 0) {
          const mapped = new Map<string, (typeof fallbackBusinessTypes)[string]>();
          CATEGORY_ORDER.forEach((key) => {
            const fallback = fallbackBusinessTypes[key];
            if (fallback) mapped.set(key, { ...fallback });
          });
          response.data.forEach((category: any) => {
            if (!category.isActive || !mapped.has(category.name)) return;
            const CategoryIcon = iconMapForApi[category.icon] || fallbackBusinessTypes[category.name]?.icon || MdStore;
            const existing = mapped.get(category.name)!;
            mapped.set(category.name, {
              ...existing,
              icon: CategoryIcon,
              color: category.iconColor?.includes("accent") ? "accent" : "primary",
              layout: category.layout ?? existing.layout,
              description: category.description ?? existing.description,
              subcategories: (category.businessTypes?.length > 0
                ? category.businessTypes
                    .filter((t: any) => t.isActive)
                    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                    .map((t: any) => ({
                      name: t.name,
                      icon: iconMapForApi[t.icon] || MdStore,
                      description: t.description ?? "",
                    }))
                : existing.subcategories) as typeof existing.subcategories,
            });
          });
          setBusinessTypes(Object.fromEntries(mapped));
        }
      } catch {
        // Keep fallback
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);
  return (
    <div className="min-h-screen">
      <Navbar />

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
              <span>Our Services</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              Solutions for Every
              <span className="block text-gradient"> Business Type</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Professional digital solutions for Agencies & Studios, Creative & Design, Portfolio, 
              Retail & E-Commerce, and Food Mall—tailored to your business type.
            </p>
          </div>
        </div>
      </section>

      {/* Main Business Types — 5 categories, wide cards, View Demo from here only */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {CATEGORY_ORDER.filter((key) => businessTypes[key]).map((mainType) => {
                const info = businessTypes[mainType];
                const Icon = info.icon;
                const demoRoute =
                  BUSINESS_CATEGORY_DEMO_ROUTES[mainType] ||
                  BUSINESS_CATEGORY_DEMO_ROUTES_NORMALIZED[normalizeCategoryKey(mainType)];
                return (
                  <Card
                    key={mainType}
                    className="relative overflow-hidden border-2 hover:border-primary/40 transition-all hover:shadow-lg h-full flex flex-col"
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                          info.color === "primary" ? "gradient-primary" : "bg-accent/20"
                        }`}
                      >
                        <Icon
                          className={`w-7 h-7 ${
                            info.color === "primary" ? "text-primary-foreground" : "text-accent"
                          }`}
                        />
                      </div>
                      <CardTitle className="text-xl sm:text-2xl font-bold leading-tight">{mainType}</CardTitle>
                      <CardDescription className="text-sm sm:text-base mt-2 leading-relaxed">
                        {info.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col pt-0">
                      <div className="flex items-center gap-2 text-sm text-primary font-medium mb-4">
                        <FiCheck className="w-4 h-4 flex-shrink-0" />
                        <span>{info.layout}</span>
                      </div>
                      <div className="pt-4 border-t border-border flex-1">
                        <p className="text-sm font-semibold text-foreground mb-2">Suitable for</p>
                        <ul className="space-y-1.5">
                          {info.subcategories.slice(0, 5).map((sub, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span>{sub.name}</span>
                            </li>
                          ))}
                          {info.subcategories.length > 5 && (
                            <li className="text-xs text-muted-foreground font-medium pt-1">
                              +{info.subcategories.length - 5} more
                            </li>
                          )}
                        </ul>
                      </div>
                      {demoRoute && (
                        <div className="mt-6 pt-4 border-t border-border">
                          <Button className="w-full sm:w-auto" size="default" asChild>
                            <Link to={demoRoute} className="gap-2">
                              View Demo
                              <FiArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Complete Category List */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Complete Category List
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional digital solutions by business category and type
              </p>
            </div>

            {CATEGORY_ORDER.filter((key) => businessTypes[key]).map((mainType) => {
            const info = businessTypes[mainType];
            const Icon = info.icon;
            return (
              <div key={mainType} className="mb-16 last:mb-0">
                <div className={`flex items-center gap-4 mb-8 pb-4 border-b-2 ${
                  info.color === "primary" ? "border-primary/30" : "border-accent/30"
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    info.color === "primary" ? "gradient-primary" : "bg-accent/20"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      info.color === "primary" ? "text-primary-foreground" : "text-accent"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{mainType}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">{info.layout}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {info.subcategories.map((subcategory, subIndex) => {
                    const SubIcon = subcategory.icon;
                    return (
                      <Card
                        key={subIndex}
                        className="group hover:border-primary/50 transition-all hover-lift"
                      >
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <SubIcon className={`w-6 h-6 flex-shrink-0 ${
                              info.color === "primary" ? "text-primary" : "text-accent"
                            }`} />
                            <CardTitle className="text-lg">{subcategory.name}</CardTitle>
                          </div>
                          <CardDescription className="text-sm leading-relaxed">
                            {subcategory.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
              Join thousands of businesses already using {env.APP_NAME} to enhance their customer experience.
            </p>
            {(() => {
              const token = typeof window !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("adminAuth") || localStorage.getItem("hotelAuth"));
              let isAdmin = false;
              if (token) {
                try {
                  const adminAuth = localStorage.getItem("adminAuth");
                  if (adminAuth) {
                    const admin = JSON.parse(adminAuth);
                    isAdmin = admin.role === "admin";
                  }
                } catch {}
              }
              return !token || isAdmin;
            })() && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!(
                  typeof window !== "undefined" &&
                  (localStorage.getItem("token") ||
                    localStorage.getItem("adminAuth") ||
                    localStorage.getItem("hotelAuth"))
                ) && (
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/register" className="gap-2">
                      Start Free Trial
                      <FiArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-background/30 text-background hover:bg-background hover:text-foreground"
                  asChild
                >
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurServices;
