import DemoCardsOverlay from "@/components/ui/DemoCards";
import { MdQrCode, MdSmartphone } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";


const Hero = () => {
  const navigate = useNavigate();
  const isLoggedIn =
    typeof window !== "undefined" &&
    (localStorage.getItem("token") ||
      localStorage.getItem("adminAuth") ||
      localStorage.getItem("hotelAuth"));

  return (
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
              <span>Trusted by 2,000+ businesses worldwide</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Digital Menus
              <span className="block text-gradient">Made Simple</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Transform your restaurant experience with beautiful QR-based digital menus. 
              Update prices instantly, showcase specials, and delight your customers.
            </p>

            {!isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={() => navigate("/register")}
                  className="gap-3"
                >
                  Start Free Trial
                  <FiArrowRight className="w-5 h-5" />
                </Button>
              </div>
            )}
            


            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">500+ 5-star reviews</p>
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
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 gradient-primary rounded-2xl mx-auto flex items-center justify-center">
                        <MdQrCode className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <h3 className="font-display text-lg font-bold">The Garden Café</h3>
                      <p className="text-xs text-muted-foreground">Scan • Order • Enjoy</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-3 py-2 bg-secondary rounded-xl">
                        <span className="text-sm font-medium">🍳 Breakfast</span>
                        <span className="text-xs text-muted-foreground">12 items</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-primary/10 rounded-xl border-2 border-primary">
                        <span className="text-sm font-medium text-primary">🥗 Lunch Specials</span>
                        <span className="text-xs text-primary">8 items</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-secondary rounded-xl">
                        <span className="text-sm font-medium">🍝 Mains</span>
                        <span className="text-xs text-muted-foreground">15 items</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-secondary rounded-xl">
                        <span className="text-sm font-medium">🍰 Desserts</span>
                        <span className="text-xs text-muted-foreground">6 items</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-secondary rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold">Caesar Salad</p>
                            <p className="text-xs text-muted-foreground">Fresh romaine, parmesan</p>
                          </div>
                          <span className="text-sm font-bold text-primary">$12.99</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -left-12 top-20 p-4 glass-card rounded-2xl shadow-card animate-float">
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

              <div className="absolute -right-8 bottom-32 p-4 glass-card rounded-2xl shadow-card animate-float" style={{ animationDelay: '1s' }}>
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
  );
};

export default Hero;
