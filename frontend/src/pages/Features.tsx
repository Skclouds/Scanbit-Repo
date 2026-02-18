import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { 
  QrCode, 
  Palette, 
  BarChart3, 
  RefreshCw, 
  Shield, 
  Smartphone,
  Zap,
  Globe,
  Image,
  Clock,
  Users,
  Bell,
  Lock,
  Download,
  Sparkles,
  ArrowRight
} from "lucide-react";
import api from "@/lib/api";

const mainFeatures = [
  {
    icon: QrCode,
    title: "Custom QR Codes",
    description: "Generate branded QR codes with your logo and colors. Perfect for table tents and marketing materials.",
    details: "Create unlimited QR codes with custom styling, colors, and logos. Download in high resolution for printing.",
  },
  {
    icon: Palette,
    title: "Beautiful Themes",
    description: "Choose from stunning templates or customize every detail to match your brand identity.",
    details: "Access dozens of professionally designed themes. Customize colors, fonts, layouts, and more to match your brand perfectly.",
  },
  {
    icon: RefreshCw,
    title: "Real-Time Updates",
    description: "Change prices, add specials, or update items instantly. No reprinting needed.",
    details: "Update your menu from anywhere, anytime. Changes appear instantly for all customers. No app updates or reprints required.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track menu views, popular items, and customer engagement with detailed insights.",
    details: "Get comprehensive analytics on menu views, popular items, peak hours, and customer behavior to optimize your offerings.",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Menus look perfect on any device. Lightning-fast loading for the best experience.",
    details: "Fully responsive design that works flawlessly on smartphones, tablets, and desktops. Optimized for speed and performance.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime. Your menu is always available.",
    details: "Bank-level security with SSL encryption. 99.9% uptime guarantee ensures your menu is always accessible to customers.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Get your digital menu up and running in under 5 minutes. No technical skills required.",
    details: "Simple, intuitive interface that anyone can use. Get started in minutes with our step-by-step guide.",
  },
];

const additionalFeatures = [
  {
    icon: Image,
    title: "High-Quality Images",
    description: "Upload beautiful photos of your dishes to entice customers.",
  },
  {
    icon: Clock,
    title: "Time-Based Menus",
    description: "Show different menus for breakfast, lunch, and dinner automatically.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite team members to help manage your menu together.",
  },
  {
    icon: Bell,
    title: "Special Notifications",
    description: "Highlight daily specials, promotions, and limited-time offers.",
  },
  {
    icon: Lock,
    title: "Password Protection",
    description: "Optionally protect your menu with a password for exclusive access.",
  },
  {
    icon: Download,
    title: "Export Options",
    description: "Download your menu as PDF or share via social media.",
  },
];

const Features = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
              <span>Powerful Features</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              Everything You Need to
              <span className="block text-gradient"> Go Digital</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Powerful tools for menus, catalogs, portfolios, and business cards—built for every business. 
              Simple to use, beautiful to look at, and packed with features.
            </p>
            {(!isLoggedIn || userRole === "admin") && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isLoggedIn && (
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/register">Start Free Trial</Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 bg-card rounded-2xl border border-border hover-lift cursor-default animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  {feature.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              And So Much <span className="text-gradient">More</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Additional features to help you create the perfect digital menu experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase - Detailed */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-24">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6">
                  <QrCode className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Custom Branded QR Codes
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Create professional QR codes that match your brand. Add your logo, choose colors, 
                  and download in high resolution for printing on menus, table tents, or marketing materials.
                </p>
                <ul className="space-y-3">
                  {["Custom colors and styling", "Logo integration", "High-resolution downloads", "Multiple format options"].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-accent-foreground text-xs">✓</span>
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
                  <QrCode className="w-48 h-48 text-primary/50" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative">
                <div className="w-full h-80 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl flex items-center justify-center">
                  <BarChart3 className="w-48 h-48 text-accent/50" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Powerful Analytics
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Understand your customers better with detailed analytics. Track menu views, 
                  popular items, peak hours, and customer engagement metrics.
                </p>
                <ul className="space-y-3">
                  {["Real-time statistics", "Popular items tracking", "Peak hours analysis", "Customer engagement metrics"].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-accent-foreground text-xs">✓</span>
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
              Start your free trial today and experience all these features firsthand.
            </p>
            {!(
              typeof window !== "undefined" &&
              (localStorage.getItem("token") ||
                localStorage.getItem("adminAuth") ||
                localStorage.getItem("hotelAuth"))
            ) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/register" className="gap-2">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-background/30 text-background hover:bg-background hover:text-foreground"
                  asChild
                >
                  <Link to="/how-it-works">Learn How It Works</Link>
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

export default Features;
