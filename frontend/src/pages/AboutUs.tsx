import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Target,
  QrCode,
  Zap,
  Shield,
  Leaf,
  Building2,
  Heart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { env } from "@/lib/api";
import founderImage from "@/assets/founder.png";

const whyScanBit = [
  {
    icon: Leaf,
    title: "Contactless & eco-friendly",
    description: "Digital solution that reduces paper waste and physical touchpoints.",
  },
  {
    icon: Zap,
    title: "Fast, secure, easy-to-use",
    description: "QR-based access that works instantly—no apps or logins required.",
  },
  {
    icon: QrCode,
    title: "Customizable for your business",
    description: "Tailored to different business needs—menus, catalogs, portfolios, and more.",
  },
  {
    icon: Shield,
    title: "Scalable & performant",
    description: "Built for growth and reliability, from single outlets to multi-location brands.",
  },
  {
    icon: Heart,
    title: "Business-first, user-centric",
    description: "Designed to solve real problems and deliver long-term value.",
  },
];

const rudranshServices = [
  "Modern web development",
  "Custom software solutions",
  "UI/UX enhancements",
  "Digital transformation services",
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl bg-primary/20" />
          <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl bg-primary/10" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              About {env.APP_NAME}
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
              Smart digital interaction,
              <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mt-2">
                one scan away
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {env.APP_NAME} is a smart digital interaction platform designed to simplify the way businesses connect with their customers.
            </p>
          </div>
        </div>
      </section>

      {/* About Us — main copy */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              About Us
            </h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                {env.APP_NAME} is a smart digital interaction platform designed to simplify the way businesses connect with their customers. Built with a focus on speed, convenience, and modern user experience, {env.APP_NAME} enables instant access to digital content through a simple QR code scan—eliminating the need for physical materials and outdated processes.
              </p>
              <p>
                {env.APP_NAME} is a product of <strong className="text-foreground font-semibold">{env.COMPANY_NAME}</strong>, a technology-driven company committed to building scalable, business-oriented digital solutions. At {env.COMPANY_NAME}, we believe that technology should not only look good but also deliver real value, efficiency, and long-term growth for businesses of all sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 md:py-24 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Our Vision
              </h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The vision behind {env.APP_NAME} is to help businesses transition smoothly into the digital-first era. We aim to reduce friction between brands and users by offering seamless, contactless, and interactive digital experiences. Whether it's menus, business information, promotions, or instant actions—{env.APP_NAME} is built to make information accessible in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Why ScanBit? */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why {env.APP_NAME}?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for speed, security, and scalability—with your business at the center.
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyScanBit.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-2 border-border/60 hover:border-primary/30 transition-colors bg-card">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ul className="max-w-2xl mx-auto mt-10 space-y-3">
            {[
              "Contactless & eco-friendly digital solution",
              "Fast, secure, and easy-to-use QR-based access",
              "Customizable for different business needs",
              "Designed for scalability and performance",
              "Built with a business-first and user-centric approach",
            ].map((text) => (
              <li key={text} className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Built by Rudransh Infotech Private Limited */}
      <section className="py-16 md:py-24 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Built by {env.COMPANY_NAME}
              </h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {env.COMPANY_NAME} specializes in modern web development, custom software solutions, UI/UX enhancements, and digital transformation services. {env.APP_NAME} represents our commitment to creating products—not just projects—that solve real-world business problems and generate long-term value.
            </p>
            <div className="flex flex-wrap gap-3">
              {rudranshServices.map((s) => (
                <span
                  key={s}
                  className="px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Leadership
            </h2>
            <Card className="border-2 border-border/60 overflow-hidden bg-card">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-8">
                  <img
                    src={founderImage}
                    alt="Vivek Kamble - CEO & Founder"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0 border-2 border-border"
                  />
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      Vivek Kamble
                    </h3>
                    <p className="text-primary font-semibold mt-1">
                      CEO & Founder, {env.COMPANY_NAME}
                    </p>
                    <p className="text-muted-foreground mt-4 leading-relaxed">
                      {env.APP_NAME} is conceptualized and led under the guidance of Vivek Kamble, CEO & Founder of {env.COMPANY_NAME}. With a strong background in technology, innovation, and business strategy, he envisions {env.APP_NAME} as a powerful yet simple digital tool that empowers businesses to operate smarter, faster, and more efficiently.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-center text-sm text-muted-foreground mt-6">
              {env.APP_NAME} is developed and maintained by <strong className="text-foreground">{env.COMPANY_NAME}</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-slate-900 text-slate-100">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to go digital?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Join businesses already using {env.APP_NAME} to connect with customers instantly. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-semibold h-12 px-8 rounded-xl" asChild>
                <Link to="/register" className="gap-2">
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white font-semibold h-12 px-8 rounded-xl"
                asChild
              >
                <Link to="/support">Contact support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
