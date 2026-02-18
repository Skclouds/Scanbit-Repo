import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserPlus, 
  UtensilsCrossed, 
  QrCode, 
  PartyPopper, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Clock, 
  Smartphone, 
  Download, 
  Share2,
  Package,
  Palette,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { env } from "@/lib/api";
import { MdRestaurantMenu, MdShoppingBag, MdBrush, MdSpa, MdWork } from "react-icons/md";
import api from "@/lib/api";

// Business type workflows
const businessTypeWorkflows = {
  "Food Mall": {
    icon: MdRestaurantMenu,
    color: "primary",
    layout: "Menu layout",
    description: "Perfect for restaurants, cafés, and food businesses",
    steps: [
      {
        icon: UserPlus,
        step: "01",
        title: "Create Account",
        description: "Sign up in seconds. Choose your business type and plan.",
        details: [
          "Enter your restaurant/business details",
          "Select Food Mall category",
          "Choose your subscription plan",
          "Verify your email address",
          "Access your dashboard instantly",
        ],
        time: "2 minutes",
      },
      {
        icon: UtensilsCrossed,
        step: "02",
        title: "Add Your Menu",
        description: "Upload items, set prices, add photos. Our editor makes it effortless.",
        details: [
          "Create menu categories",
          "Add items with descriptions",
          "Upload high-quality food images",
          "Set prices and mark specials",
          "Mark items as veg/non-veg, spicy, popular",
        ],
        time: "5 minutes",
      },
      {
        icon: QrCode,
        step: "03",
        title: "Generate QR Code",
        description: "Get your custom QR code. Download and print for your tables.",
        details: [
          "Customize QR code design",
          "Add your logo and brand colors",
          "Download in high resolution",
          "Print on menus or table tents",
          "Share via social media",
        ],
        time: "1 minute",
      },
      {
        icon: PartyPopper,
        step: "04",
        title: "Go Live!",
        description: "Customers scan and browse. Update your menu anytime, anywhere.",
        details: [
          "Share QR codes with customers",
          "Monitor real-time analytics",
          "Update menu instantly",
          "Track popular items",
          "Manage multiple locations",
        ],
        time: "Instant",
      },
    ],
    tips: [
      {
        icon: Smartphone,
        title: "Place QR Codes Strategically",
        description: "Put QR codes on every table, at the entrance, and on takeout menus for maximum visibility.",
      },
      {
        icon: Clock,
        title: "Update Regularly",
        description: "Keep your menu fresh by updating specials, prices, and seasonal items regularly.",
      },
      {
        icon: Share2,
        title: "Share on Social Media",
        description: "Share your digital menu link on social media to reach more customers.",
      },
    ],
  },
  "Retail / E-Commerce Businesses": {
    icon: MdShoppingBag,
    color: "accent",
    layout: "Product catalog layout",
    description: "Ideal for retail stores and e-commerce businesses",
    steps: [
      {
        icon: UserPlus,
        step: "01",
        title: "Create Account",
        description: "Sign up in seconds. Choose your business type and plan.",
        details: [
          "Enter your store/business details",
          "Select Retail / E-Commerce category",
          "Choose your subscription plan",
          "Verify your email address",
          "Access your dashboard instantly",
        ],
        time: "2 minutes",
      },
      {
        icon: Package,
        step: "02",
        title: "Add Your Products",
        description: "Upload products, set prices, add images. Our catalog builder makes it easy.",
        details: [
          "Create product categories",
          "Add products with descriptions",
          "Upload high-quality product images",
          "Set prices and variations",
          "Track inventory levels",
        ],
        time: "5 minutes",
      },
      {
        icon: QrCode,
        step: "03",
        title: "Generate QR Code",
        description: "Get your custom QR code. Display in-store or share online.",
        details: [
          "Customize QR code design",
          "Add your logo and brand colors",
          "Download in high resolution",
          "Print for in-store display",
          "Share via social media",
        ],
        time: "1 minute",
      },
      {
        icon: PartyPopper,
        step: "04",
        title: "Go Live!",
        description: "Customers scan and browse. Update your catalog anytime, anywhere.",
        details: [
          "Share QR codes with customers",
          "Monitor product analytics",
          "Update catalog instantly",
          "Track popular products",
          "Manage multiple stores",
        ],
        time: "Instant",
      },
    ],
    tips: [
      {
        icon: Smartphone,
        title: "Display QR Codes In-Store",
        description: "Place QR codes at checkout counters, product displays, and store windows for easy access.",
      },
      {
        icon: Clock,
        title: "Keep Catalog Updated",
        description: "Regularly update prices, add new products, and mark items as sold out or on sale.",
      },
      {
        icon: Share2,
        title: "Share Catalog Online",
        description: "Share your product catalog link on social media and websites to reach more customers.",
      },
    ],
  },
  "Creative & Design": {
    icon: MdBrush,
    color: "primary",
    layout: "Portfolio layout",
    description: "Perfect for creative professionals and agencies",
    steps: [
      {
        icon: UserPlus,
        step: "01",
        title: "Create Account",
        description: "Sign up in seconds. Choose your business type and plan.",
        details: [
          "Enter your creative business details",
          "Select Creative & Design category",
          "Choose your subscription plan",
          "Verify your email address",
          "Access your dashboard instantly",
        ],
        time: "2 minutes",
      },
      {
        icon: Palette,
        step: "02",
        title: "Add Your Portfolio",
        description: "Showcase your work. Upload projects, add descriptions, create galleries.",
        details: [
          "Create portfolio categories",
          "Add projects with descriptions",
          "Upload high-quality work images",
          "Organize into galleries",
          "Add client testimonials",
        ],
        time: "5 minutes",
      },
      {
        icon: QrCode,
        step: "03",
        title: "Generate QR Code",
        description: "Get your custom QR code. Share on business cards and marketing materials.",
        details: [
          "Customize QR code design",
          "Add your logo and brand colors",
          "Download in high resolution",
          "Print on business cards",
          "Share via social media",
        ],
        time: "1 minute",
      },
      {
        icon: PartyPopper,
        step: "04",
        title: "Go Live!",
        description: "Clients scan and view your portfolio. Update your work anytime, anywhere.",
        details: [
          "Share QR codes with clients",
          "Monitor portfolio analytics",
          "Update portfolio instantly",
          "Track popular projects",
          "Manage multiple portfolios",
        ],
        time: "Instant",
      },
    ],
    tips: [
      {
        icon: Smartphone,
        title: "Use QR Codes on Business Cards",
        description: "Add QR codes to business cards, portfolios, and marketing materials for instant access to your work.",
      },
      {
        icon: Clock,
        title: "Keep Portfolio Fresh",
        description: "Regularly update your portfolio with new projects, case studies, and recent work.",
      },
      {
        icon: Share2,
        title: "Share Portfolio Online",
        description: "Share your portfolio link on social media, websites, and professional networks.",
      },
    ],
  },
  // Generic workflow for any business type (Health, Professional Services, etc.)
  Generic: {
    icon: Package,
    color: "primary",
    layout: "Digital presence",
    description: "One process for every business—restaurants, retail, agencies, practices, and services. Get your menu, catalog, portfolio, or business card live in minutes.",
    steps: [
      {
        icon: UserPlus,
        step: "01",
        title: "Create Your Account",
        description: "Register in under two minutes. Select your industry and the plan that fits your business.",
        details: [
          "Enter your business name and contact details",
          "Choose your business category",
          "Select a plan (free trial available)",
          "Verify your email and access your dashboard",
        ],
        time: "2 minutes",
      },
      {
        icon: FileText,
        step: "02",
        title: "Add Your Content",
        description: "Build your digital presence with menus, products, services, or portfolio items. No technical skills required.",
        details: [
          "Create sections (e.g. categories, services, products)",
          "Add titles, descriptions, and images",
          "Set prices or highlight key offerings",
          "Apply your branding (logo, colors)",
        ],
        time: "5 minutes",
      },
      {
        icon: QrCode,
        step: "03",
        title: "Get Your QR Code",
        description: "Generate a custom QR code linked to your digital presence. Use it in print or online.",
        details: [
          "Customize the QR style and colors",
          "Add your logo to the code",
          "Download in print-ready resolution",
          "Use on cards, signage, or digital channels",
        ],
        time: "1 minute",
      },
      {
        icon: PartyPopper,
        step: "04",
        title: "Go Live",
        description: "Share your link or QR code. Visitors see your content instantly; you can update it anytime from your dashboard.",
        details: [
          "Share your unique link and QR code",
          "View visits and engagement in analytics",
          "Edit content in real time from anywhere",
          "Grow from one location to many",
        ],
        time: "Instant",
      },
    ],
    tips: [
      { icon: Smartphone, title: "Put Your QR Where It’s Seen", description: "Place QR codes where your audience is: reception, counters, business cards, packaging, or marketing materials." },
      { icon: Clock, title: "Keep Content Up to Date", description: "Update your digital presence regularly—new items, prices, or offers—so visitors always see current information." },
      { icon: Share2, title: "Share Your Digital Link", description: "Add your link to email signatures, social profiles, and your website so customers can find you easily." },
    ],
  },
};

type WorkflowKey = keyof typeof businessTypeWorkflows;

const categoryToWorkflow = (name: string): WorkflowKey => {
  if (name === "Food Mall") return "Food Mall";
  if (name === "Retail / E-Commerce Businesses") return "Retail / E-Commerce Businesses";
  if (name === "Creative & Design") return "Creative & Design";
  return "Generic";
};

type CategoryItem = { id: string; name: string; label: string; Icon: React.ComponentType<{ className?: string }> };

const defaultCategories: CategoryItem[] = [
  { id: "Food Mall", name: "Food Mall", label: "Food Mall", Icon: MdRestaurantMenu },
  { id: "Retail", name: "Retail / E-Commerce Businesses", label: "Retail", Icon: MdShoppingBag },
  { id: "Creative", name: "Creative & Design", label: "Creative", Icon: MdBrush },
];

const HowItWorks = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("Food Mall");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getBusinessCategories()
      .then((res) => {
        if (!mounted || !res.success || !Array.isArray(res.data) || res.data.length === 0) return;
        const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
          "Food Mall": MdRestaurantMenu,
          "Retail / E-Commerce Businesses": MdShoppingBag,
          "Creative & Design": MdBrush,
          "Health & Wellness": MdSpa,
          "Professional Services": MdWork,
        };
        const list: CategoryItem[] = res.data
          .map((c: any) => {
            const name = c.name || c.label || c.id || "";
            const label = name ? name.split("/")[0].trim() : "";
            const Icon = iconMap[name] || MdWork;
            return { id: c.id || name, name, label, Icon };
          })
          .filter((item) => item.name);
        if (list.length === 0) return;
        setCategories(list);
        setSelectedBusinessType((prev) => {
          if (prev && list.some((item) => item.name === prev)) return prev;
          return list[0].name;
        });
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminAuth = localStorage.getItem("adminAuth");
        const hotelAuth = localStorage.getItem("hotelAuth");

        if (!token && !adminAuth && !hotelAuth) {
          setIsLoggedIn(false);
          setUserRole(null);
          return;
        }

        try {
          const response = await api.getCurrentUser();
          if (response.success && response.user) {
            setIsLoggedIn(true);
            setUserRole(response.user.role || null);
          } else {
            setIsLoggedIn(false);
            setUserRole(null);
          }
        } catch (error) {
          if (adminAuth) {
            try {
              const admin = JSON.parse(adminAuth);
              setIsLoggedIn(true);
              setUserRole(admin.role || "admin");
            } catch {
              setIsLoggedIn(false);
              setUserRole(null);
            }
          } else if (hotelAuth) {
            try {
              const hotel = JSON.parse(hotelAuth);
              setIsLoggedIn(true);
              setUserRole(hotel.role || "user");
            } catch {
              setIsLoggedIn(false);
              setUserRole(null);
            }
          } else {
            setIsLoggedIn(false);
            setUserRole(null);
          }
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuth();
  }, []);
  
  const visibleCategories = categories.length > 0 ? categories : defaultCategories;
  const workflowKey = categoryToWorkflow(selectedBusinessType);
  const selectedWorkflow = businessTypeWorkflows[workflowKey];
  const Icon = selectedWorkflow.icon;

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
              <Sparkles className="w-4 h-4" />
              <span>How It Works</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              Go Digital in
              <span className="block text-gradient"> 4 Simple Steps</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              From signup to going live—whether you run a restaurant, store, agency, or practice. 
              Choose your industry below to see the exact steps for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/register">Get Started Now</Link>
              </Button>
              {/* Show pricing only if not logged in OR if user is admin */}
              {(!isLoggedIn || userRole === "admin") && (
                <Button variant="outline" size="lg" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Business Type Selector */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Choose Your Industry
              </h2>
              <p className="text-muted-foreground">
                Content below updates to match your business category—steps, tips, and layout.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2 bg-secondary/50 rounded-2xl border border-border">
              {visibleCategories.map((cat) => {
                const workflow = businessTypeWorkflows[categoryToWorkflow(cat.name)];
                const TypeIcon = cat.Icon;
                const isSelected = selectedBusinessType === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedBusinessType(cat.name)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-4 rounded-xl transition-all min-w-[100px] sm:min-w-0 ${
                      isSelected
                        ? workflow.color === "primary"
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
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
                <Icon className={`w-4 h-4 ${selectedWorkflow.color === "primary" ? "text-primary" : "text-accent"}`} />
                <span className="text-sm text-muted-foreground">
                  Layout: <span className="font-medium text-foreground">{selectedWorkflow.layout}</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{selectedWorkflow.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section - content from selected workflow (business category) */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {selectedWorkflow.layout} — 4 Steps
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {selectedWorkflow.description}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {selectedWorkflow.steps.map((step, index) => (
              <div
                key={step.step}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Connector Line */}
                {index < selectedWorkflow.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 via-primary/30 to-transparent z-0" />
                )}

                <Card className="relative h-full hover-lift">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg shadow-soft z-10">
                    {step.step}
                  </div>

                  <CardHeader className="pb-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform duration-300 ${
                      selectedWorkflow.color === "primary" ? "gradient-primary" : "bg-accent/20"
                    }`}>
                      <step.icon className={`w-8 h-8 ${
                        selectedWorkflow.color === "primary" ? "text-primary-foreground" : "text-accent"
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">{step.time}</span>
                    </div>
                    
                    <CardTitle className="text-xl font-semibold mb-3">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed mb-6">
                      {step.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Details List */}
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            selectedWorkflow.color === "primary" ? "text-primary" : "text-accent"
                          }`} />
                          <span className="text-xs text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Timeline - category-specific */}
      <section className="py-20 sm:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Your Path to Going Live
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                {workflowKey === "Generic"
                  ? "Four steps to get your digital presence live—menus, catalogs, portfolios, or business cards. Usually under 10 minutes, with no technical skills required."
                  : `Follow these four steps to get your ${selectedWorkflow.layout.toLowerCase()} live—typically under 10 minutes.`}
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary opacity-30 hidden md:block" />

              {/* Timeline Items */}
              <div className="space-y-12">
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft ${
                      selectedWorkflow.color === "primary" ? "gradient-primary" : "bg-accent/20"
                    }`}>
                      <step.icon className={`w-8 h-8 ${
                        selectedWorkflow.color === "primary" ? "text-primary-foreground" : "text-accent"
                      }`} />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-sm font-medium ${
                          selectedWorkflow.color === "primary" ? "text-primary" : "text-accent"
                        }`}>
                          Step {step.step}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{step.time}</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              selectedWorkflow.color === "primary" ? "text-primary" : "text-accent"
                            }`} />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section - category-specific tips from workflow */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Best Practices for Your Industry
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Tips tailored to {selectedWorkflow.layout.toLowerCase()} to help you get the most from {env.APP_NAME}.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {selectedWorkflow.tips.map((tip, index) => (
                <Card
                  key={index}
                  className="hover-lift animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      selectedWorkflow.color === "primary" ? "bg-primary/10" : "bg-accent/10"
                    }`}>
                      <tip.icon className={`w-6 h-6 ${
                        selectedWorkflow.color === "primary" ? "text-primary" : "text-accent"
                      }`} />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {tip.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {tip.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Layout Comparison - show all workflows; highlight selected category */}
      <section className="py-20 sm:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Layouts by Business Type
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                Each industry gets a layout optimized for menus, catalogs, portfolios, or services.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {Object.entries(businessTypeWorkflows).map(([wfKey, workflow]) => {
                const TypeIcon = workflow.icon;
                const isSelected = wfKey === workflowKey;
                return (
                  <Card
                    key={wfKey}
                    className={`hover-lift transition-all ${
                      isSelected
                        ? "border-2 border-primary shadow-lg ring-2 ring-primary/20"
                        : "border border-border"
                    }`}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        workflow.color === "primary" ? "gradient-primary" : "bg-accent/20"
                      }`}>
                        <TypeIcon className={`w-6 h-6 ${
                          workflow.color === "primary" ? "text-primary-foreground" : "text-accent"
                        }`} />
                      </div>
                      <CardTitle className="text-lg sm:text-xl">{wfKey === "Generic" ? "Other Industries" : wfKey}</CardTitle>
                      <CardDescription className="text-sm mt-2">
                        {workflow.layout}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {workflow.description}
                      </p>
                      <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className={`w-4 h-4 ${
                            workflow.color === "primary" ? "text-primary" : "text-accent"
                          }`} />
                          <span>Custom QR codes</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className={`w-4 h-4 ${
                            workflow.color === "primary" ? "text-primary" : "text-accent"
                          }`} />
                          <span>Mobile-optimized</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className={`w-4 h-4 ${
                            workflow.color === "primary" ? "text-primary" : "text-accent"
                          }`} />
                          <span>Real-time updates</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-background mb-6">
              Ready to Go Digital?
            </h2>
            <p className="text-base sm:text-lg text-background/70 mb-8">
              Start your 7-day free trial. No credit card required—get your {selectedWorkflow.layout.toLowerCase()} live in minutes.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/register" className="gap-2">
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
