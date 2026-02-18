import { MdQrCode, MdPalette, MdSmartphone, MdSecurity, MdBarChart, } from "react-icons/md";
import { FiQrCode, FiTrendingUp, FiRefreshCw, FiZap, } from "react-icons/fi";


const features = [
  {
    icon: MdQrCode,
    title: "QR Code Technology",
    description: "Generate scannable QR codes that instantly connect customers to your digital presence. Perfect for in-store and on-premise access.",
  },
  {
    icon: MdPalette,
    title: "Brand Customization",
    description: "Fully customize colors, fonts, and layouts to match your brand identity perfectly.",
  },
  {
    icon: FiRefreshCw,
    title: "Real-Time Updates",
    description: "Update content instantly without any reprinting or republishing. Changes go live immediately.",
  },
  {
    icon: MdBarChart,
    title: "Analytics & Insights",
    description: "Track engagement, monitor performance, and gain valuable insights about customer behavior.",
  },
  {
    icon: MdSmartphone,
    title: "Mobile First Design",
    description: "Perfectly optimized for all devices. Fast-loading, responsive, and user-friendly interface.",
  },
  {
    icon: MdSecurity,
    title: "Secure Platform",
    description: "Enterprise-grade security with 99.9% uptime. Your data and customers are protected.",
  },
  {
    icon: FiZap,
    title: "Quick Setup",
    description: "Get started in minutes. No complex setup process or technical knowledge required.",
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
            <span className="text-gradient"> Engage Your Customers</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive platform designed for all types of businesses. 
            Simple to use, powerful in results.
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
