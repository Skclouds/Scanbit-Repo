import { MdSmartphone, MdCheck, MdQrCode, MdPalette, MdBarChart } from "react-icons/md";
import { FiArrowRight, FiZap, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { HiSparkles } from "react-icons/hi";
import { Link } from "react-router-dom";
import api, { env } from "@/lib/api";
import { safeImageSrc } from "@/lib/imageUtils";


const Home = () => {
  const { settings } = useSiteSettings();
  const isLoggedIn =
    typeof window !== "undefined" &&
    (localStorage.getItem("token") ||
      localStorage.getItem("adminAuth") ||
      localStorage.getItem("hotelAuth"));
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalScans: 0,
    satisfaction: 90,
    setupTime: 5
  });
  const [loading, setLoading] = useState(true);
  const [pageVersion] = useState(() => Date.now()); // Cache busting
  const [featuredBusinesses, setFeaturedBusinesses] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [reviewUsers, setReviewUsers] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 50, averageRating: 5 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use the same API URL as the api client
        const apiUrl = env.API_URL;
        const response = await fetch(`${apiUrl}/public/stats?v=${pageVersion}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setStats({
              totalBusinesses: data.data.totalBusinesses || data.data.totalRestaurants || 0,
              totalScans: data.data.totalScans || 0,
              satisfaction: data.data.satisfaction || 90,
              setupTime: data.data.setupTime || 5
            });
          }
        } else {
          // If API fails, keep default values

        }
      } catch (error) {

        // Keep default values on error - this is fine for public stats
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [pageVersion]);

  useEffect(() => {
    const fetchFeaturedBusinesses = async () => {
      setFeaturedLoading(true);
      try {
        const response = await api.getFeaturedBusinesses(30);
        if (response.success && Array.isArray(response.data)) {
          setFeaturedBusinesses(response.data);
        }
      } catch (error) {

      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedBusinesses();
  }, []);

  useEffect(() => {
    const fetchReviewUsers = async () => {
      try {
        const response = await api.getFeaturedBusinesses(12);
        if (response.success && Array.isArray(response.data)) {
          const usersWithLogos = response.data
            .filter((business: any) => business.logo)
            .slice(0, 5)
            .map((business: any) => ({
              id: business.id,
              name: business.name,
              logo: business.logo,
              businessType: business.businessType,
            }));

          setReviewUsers(usersWithLogos);

          const totalFeatured = response.data.length;
          setReviewStats({
            totalReviews: Math.max(50, totalFeatured * 12),
            averageRating: 4.9,
          });
        }
      } catch (error) {

      }
    };

    fetchReviewUsers();
  }, []);

  const quickStats = [
    { icon: FiUsers, value: stats.totalBusinesses > 0 ? stats.totalBusinesses.toLocaleString() + '+' : '0', label: "Businesses" },
    { icon: MdQrCode, value: `${(stats.totalScans / 1000000).toFixed(1)}M+`, label: "QR Scans" },
    { icon: FiTrendingUp, value: `${stats.satisfaction}%`, label: "Satisfaction" },
    { icon: FiZap, value: `${stats.setupTime}min`, label: "Setup Time" },
  ];

  const quickFeatures = [
    {
      title: "Instant Updates",
      description: "Update your digital presence in seconds, no printing needed",
      icon: FiZap,
    },
    {
      title: "Beautiful Design",
      description: "Stunning templates that match your brand identity",
      icon: MdPalette,
    },
    {
      title: "Mobile First",
      description: "Perfect experience on any device, anywhere",
      icon: MdSmartphone,
    },
    {
      title: "Analytics",
      description: "Track engagement and understand your customers better",
      icon: MdBarChart,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(30, 15%, 98%)', color: 'hsl(20, 20%, 10%)' }}>

      {/* Hero Section */}
      <section className="relative min-h-screen gradient-hero overflow-hidden pt-16">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 pt-20 pb-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
                <HiSparkles className="w-4 h-4" />
                <span>Trusted by {stats.totalBusinesses > 0 ? stats.totalBusinesses.toLocaleString() : 'thousands of'}+ businesses worldwide</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.3] mb-6">
              One QR.
                <span className="block text-gradient">One Digital Look.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Transform your Business experience with beautiful QR-based digital look. 
                Update prices instantly, showcase specials, and delight your customers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {isLoggedIn ? (
                  <Button variant="hero" size="xl" asChild className="flex-1 sm:flex-none h-12">
                    <Link to="/dashboard" className="gap-3 w-full sm:w-auto">
                      Go to Dashboard
                      <FiArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="hero" size="xl" asChild className="flex-1 sm:flex-none h-12">
                    <Link to="/register" className="gap-3 w-full sm:w-auto">
                      Start 7-Day Free Trial
                      <FiArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {reviewUsers.length > 0 ? (
                    reviewUsers.map((user, index) => (
                      <div
                        key={user.id || index}
                        className="w-10 h-10 rounded-full bg-secondary border-2 border-background overflow-hidden flex items-center justify-center"
                        title={user.name}
                      >
                        {user.logo ? (
                          <img
                            src={user.logo}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    // Fallback to letters if no users with logos
                    [1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reviewStats.totalReviews}+ 5-star reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="relative flex justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-[280px] md:w-[320px] h-[560px] md:h-[640px] bg-foreground rounded-[3rem] p-3 shadow-elevated">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-full z-10" />
                  <div className="w-full h-full bg-card rounded-[2.5rem] overflow-hidden">
                    {/* Menu Preview */}
                    <div className="p-6 space-y-6">
                      <div className="text-center space-y-0">
                        {settings?.branding?.logoUrl ? (
                          <img 
                            src={settings.branding.logoUrl} 
                            alt={settings.general?.siteName || env.APP_NAME}
                            className="w-28 h-28 mx-auto object-contain"
                          />
                        ) : (
                          <div className="w-28 h-28 mx-auto flex items-center justify-center">
                            <MdQrCode className="w-20 h-20 text-primary" />
                          </div>
                        )}
                        <h3 className="font-display text-sm font-bold">{ "Your Business Name"}</h3>
                        <p className="text-xs text-muted-foreground">Scan • See • Decide</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-3 py-2 bg-secondary rounded-xl">
                          <span className="text-sm font-medium">🍳 Menu Items</span>
                          <span className="text-xs text-muted-foreground">12 items</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-primary/10 rounded-xl border-2 border-primary">
                          <span className="text-sm font-medium text-primary">💁‍♂️ Your Portfolio </span>
                          <span className="text-xs text-primary">8K reviews</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-secondary rounded-xl">
                          <span className="text-sm font-medium">🛒 Product catalog</span>
                          <span className="text-xs text-muted-foreground">150+ Products</span>
                        </div>
                        
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="p-3 bg-secondary rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold">Paneer Butter Masala</p>
                              <p className="text-xs text-muted-foreground">Rich tomato gravy</p>
                            </div>
                            <span className="text-sm font-bold text-primary">₹ 240 </span>
                          </div>
                          
                        </div>

                        <div className="space-y-3 pt-2">
                        <div className="p-3 bg-secondary rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold">Cotton Casual T-Shirt</p>
                              <p className="text-xs text-muted-foreground">Premium cotton fabric</p>
                            </div>
                            <span className="text-sm font-bold text-primary">₹ 799</span>
                          </div>
                          
                        </div>
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="p-3 bg-secondary rounded-xl">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold">Logo Design Package</p>
                              <p className="text-xs text-muted-foreground">Custom logo concepts</p>
                            </div>
                            <span className="text-sm font-bold text-primary">₹ 2,999</span>
                          </div>
                          
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -left-20 top-10 p-4 glass-card rounded-2xl shadow-card animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                      <MdSmartphone className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Mobile First</p>
                      <p className="text-xs text-muted-foreground">Works perfectly</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-10 bottom-32 p-4 glass-card rounded-2xl shadow-card animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                      <MdQrCode className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">QR Ready</p>
                      <p className="text-xs text-muted-foreground">Instant access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-background">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="font-display text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Features Preview */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose <span className="text-gradient">{env.APP_NAME}?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to create, manage, and share your digital presence across all business types.
            </p>
          </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="p-6 bg-card rounded-2xl border border-border hover-lift animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/features">Explore All Features →</Link>
            </Button>
          </div>
        </div>
      </section>

      

      {/* Trusted Customers Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <HiSparkles className="w-4 h-4" />
              <span>Our Trusted Customers</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Trusted by Leading
              <span className="block text-gradient"> Businesses Worldwide</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of successful businesses using {env.APP_NAME} to transform their customer engagement.
            </p>
          </div>

          {/* Verified Businesses Marquee */}
          <div className="space-y-6 mb-16">
            {featuredLoading && (
              <p className="text-center text-sm text-muted-foreground">
                Loading verified businesses...
              </p>
            )}
            {!featuredLoading && featuredBusinesses.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Verified businesses will appear here once approved.
              </p>
            )}

            {featuredBusinesses.length > 0 && (
              <>
                {[0, 1].map((row) => {
                  const businesses = featuredBusinesses;
                  const loopBusinesses =
                    businesses.length > 0
                      ? [...businesses, ...businesses, businesses[0]]
                      : [];
                  const directionClass =
                    row === 0 ? "animate-marquee-left" : "animate-marquee-right";

                  return (
                    <div
                      key={row}
                      className="marquee-container relative overflow-hidden border border-border/50 rounded-2xl bg-card/60"
                    >
                      <div
                        className={`flex items-center w-max ${directionClass} py-4 sm:py-6 lg:py-8 gap-4 sm:gap-6 lg:gap-8`}
                        style={{ animationDuration: "32s" }}
                      >
                        {loopBusinesses.map((business, index) => {
                          const name =
                            business.businessName ||
                            business.name ||
                            business.restaurantName ||
                            "Business";
                          const logo =
                            business.logo ||
                            business.ownerImage ||
                            business.profileImage ||
                            business.image;
                          const category =
                            business.businessCategory || business.category || "";
                          const type =
                            business.businessType || business.type || "";

                          return (
                            <div
                              key={`${business._id || business.id || index}-${row}-${index}`}
                              className="flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-4 px-4 py-4 sm:px-6 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 bg-gradient-to-br from-card to-card/50 rounded-2xl sm:rounded-3xl border border-primary/20 shadow-lg w-[220px] min-w-[220px] min-h-[140px] sm:w-[260px] sm:min-w-[260px] sm:min-h-[160px] md:w-[280px] md:min-w-[280px] lg:w-[300px] lg:min-w-[300px] lg:min-h-[180px] xl:w-[320px] xl:min-w-[320px] hover:shadow-xl transition-shadow flex-shrink-0"
                            >
                              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-xl sm:rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border-2 border-primary/10 flex-shrink-0">
                                {logo ? (
                                  <img
                                    src={safeImageSrc(logo)}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                                    {String(name).charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="text-center min-w-0 w-full px-1">
                                <p className="text-xs sm:text-sm lg:text-base font-bold text-foreground truncate">
                                  {name}
                                </p>
                                <p className="text-[10px] sm:text-xs lg:text-sm text-primary font-semibold truncate">
                                  {[category, type].filter(Boolean).join(" • ") || "Verified Business"}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block">
                                  Trusted Partner
                                </p>
                              </div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] sm:text-[10px] font-medium border border-emerald-500/20 flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Verified
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;

// Marquee animation styles for verified businesses
// These rely on Tailwind's arbitrary classes plus custom keyframes
// defined directly here for the home page.
// This keeps the effect scoped and avoids global CSS changes.
if (typeof document !== "undefined") {
  const styleId = "home-marquee-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @keyframes marquee-left {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes marquee-right {
        0%   { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }
      .animate-marquee-left {
        animation: marquee-left 32s linear infinite;
      }
      .animate-marquee-right {
        animation: marquee-right 32s linear infinite;
      }
      .marquee-container:hover .animate-marquee-left,
      .marquee-container:hover .animate-marquee-right {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(style);
  }
}
