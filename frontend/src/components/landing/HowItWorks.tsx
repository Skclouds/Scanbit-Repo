import { FiUserPlus } from "react-icons/fi";
import { MdQrCode, MdEdit } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

const steps = [
  {
    icon: FiUserPlus,
    step: "01",
    title: "Create Account",
    description: "Sign up in seconds. Choose your business type and plan, and get started immediately.",
  },
  {
    icon: MdEdit,
    step: "02",
    title: "Add Your Content",
    description: "Add your menu, products, portfolio, or catalog. Our editor makes it effortless.",
  },
  {
    icon: MdQrCode,
    step: "03",
    title: "Generate QR Code",
    description: "Get your custom QR code. Download, print, or share anywhere—tables, cards, or online.",
  },
  {
    icon: HiSparkles,
    step: "04",
    title: "Go Live!",
    description: "Customers and clients scan and explore. Update your content anytime, anywhere.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Go Digital in
            <span className="text-gradient"> 4 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From signup to going live, get your digital presence—menu, catalog, or business card—running in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative group animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="relative p-6 text-center">
                {/* Step Number */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 text-6xl font-display font-bold text-primary/10">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="relative z-10 w-20 h-20 mx-auto gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
