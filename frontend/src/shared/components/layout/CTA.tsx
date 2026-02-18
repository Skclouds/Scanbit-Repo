import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FiArrowRight } from "react-icons/fi";
import { MdCheck } from "react-icons/md";
import { env } from "@/lib/api";

const CTA = () => {
  const isLoggedIn =
    typeof window !== "undefined" &&
    (localStorage.getItem("token") ||
      localStorage.getItem("adminAuth") ||
      localStorage.getItem("hotelAuth"));

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-dark" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6">
            Ready to Transform Your
            <span className="block text-primary"> Restaurant Experience?</span>
          </h2>

          <p className="text-lg md:text-xl text-background/70 mb-8 max-w-2xl mx-auto">
            Join thousands of restaurants already using {env.APP_NAME} to delight their customers 
            with beautiful digital menus.
          </p>

          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register" className="gap-3">
                  Start Free Trial
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          )}

          <Button 
            variant="outline" 
            size="xl" 
            className="border-background/30 text-background hover:bg-background hover:text-foreground"
            asChild
          >
            <Link to="/demo-menu">See Live Demo</Link>
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-6 text-background/70 mt-12">
            <div className="flex items-center gap-2">
              <MdCheck className="w-5 h-5 text-accent" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <MdCheck className="w-5 h-5 text-accent" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <MdCheck className="w-5 h-5 text-accent" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
