import { 
  FiQrCode,
  FiTrendingUp,
  FiRefreshCw,
  FiZap,
  FiGlobe,
} from "react-icons/fi";
import {
  MdQrCode,
  MdPalette,
  MdSmartphone,
  MdSecurity,
  MdBarChart,
} from "react-icons/md";

const features = [
  {
    icon: MdQrCode,
    title: "Custom QR Codes",
    description: "Generate branded QR codes with your logo and colors. Perfect for table tents and marketing materials.",
  },
  {
    icon: MdPalette,
    title: "Beautiful Themes",
    description: "Choose from stunning templates or customize every detail to match your brand identity.",
  },
  {
    icon: FiRefreshCw,
    title: "Real-Time Updates",
    description: "Change prices, add specials, or update items instantly. No reprinting needed.",
  },
  {
    icon: MdBarChart,
    title: "Analytics Dashboard",
    description: "Track menu views, popular items, and customer engagement with detailed insights.",
  },
  {
    icon: MdSmartphone,
    title: "Mobile Optimized",
    description: "Menus look perfect on any device. Lightning-fast loading for the best experience.",
  },
  {
    icon: MdSecurity,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime. Your menu is always available.",
  },
  {
    icon: FiZap,
    title: "Instant Setup",
    description: "Get your digital menu up and running in under 5 minutes. No technical skills required.",
  },
  {
    icon: FiGlobe,
    title: "Multi-Language",
    description: "Support for multiple languages. Serve international guests with ease.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="text-gradient"> Digitize Your Menu</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools designed specifically for restaurants, cafes, and hotels. 
            Simple to use, beautiful to look at.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-card rounded-2xl border border-border hover-lift cursor-default animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
