import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { env } from "@/lib/api";

interface IndustryLayoutProps {
  children: ReactNode;
  /** Optional CTA to show in a sticky or hero */
  ctaLabel?: string;
  ctaTo?: string;
}

export function IndustryLayout({ children }: IndustryLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

/** Full-screen demo page: slim bar + demo only. No site navbar/footer. */
interface DemoPageLayoutProps {
  children: ReactNode;
  demoName: string;
  /** If true, main content is full width (no max-w, no horizontal padding) for edge-to-edge demos */
  fullWidth?: boolean;
}

export function DemoPageLayout({ children, demoName, fullWidth }: DemoPageLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="sticky top-0 z-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-3 py-2.5 sm:px-4 sm:py-3 bg-background border-b border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/our-services"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            <FiArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Back to Our Services</span>
          </Link>
          <span className="hidden sm:inline text-border flex-shrink-0">|</span>
          <span className="text-xs sm:text-sm font-semibold text-foreground truncate min-w-0">
            {env.APP_NAME} Demo — {demoName}
          </span>
        </div>
        <Link
          to="/register"
          className="text-xs sm:text-sm font-medium text-primary hover:underline flex-shrink-0 touch-manipulation py-1"
        >
          Get your own →
        </Link>
      </header>
      <main className={`flex-1 w-full self-center min-w-0 ${fullWidth ? "max-w-none px-0" : "max-w-6xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8"}`}>
        {children}
      </main>
    </div>
  );
}

interface IndustryHeroProps {
  badge: string;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  /** Tailwind gradient/background classes */
  gradientClass?: string;
  icon: ReactNode;
  ctaPrimary?: { label: string; to: string };
  ctaSecondary?: { label: string; to: string };
}

export function IndustryHero({
  badge,
  title,
  titleHighlight,
  subtitle,
  gradientClass = "from-primary/10 via-background to-background",
  icon,
  ctaPrimary = { label: "Start free trial", to: "/register" },
  ctaSecondary = { label: "View pricing", to: "/pricing" },
}: IndustryHeroProps) {
  return (
    <section className={`relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b ${gradientClass}`}>
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl bg-primary/20" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl bg-primary/10" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
            {icon}
            <span>{badge}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
            {title}
            {titleHighlight && (
              <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mt-2">
                {titleHighlight}
              </span>
            )}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 rounded-xl font-semibold" asChild>
              <Link to={ctaPrimary.to} className="gap-2">
                {ctaPrimary.label}
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl font-semibold" asChild>
              <Link to={ctaSecondary.to}>{ctaSecondary.label}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface IndustrySectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function IndustrySection({ title, subtitle, children, className = "" }: IndustrySectionProps) {
  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h2>
          {subtitle && <p className="text-muted-foreground text-lg">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

interface IndustryCTAProps {
  title: string;
  subtitle: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

export function IndustryCTA({
  title,
  subtitle,
  primaryLabel = "Get started free",
  primaryTo = "/register",
  secondaryLabel = "Contact sales",
  secondaryTo = "/support",
}: IndustryCTAProps) {
  return (
    <section className="py-20 md:py-28 bg-primary/5 border-y border-border">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">{subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-12 px-8 rounded-xl font-semibold" asChild>
            <Link to={primaryTo} className="gap-2">
              {primaryLabel}
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl font-semibold" asChild>
            <Link to={secondaryTo}>{secondaryLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
