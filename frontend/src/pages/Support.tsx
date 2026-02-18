import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Sparkles, HelpCircle, Mail, Phone, MessageCircle, Book, ArrowRight, Clock } from "lucide-react";
import { env } from "@/lib/api";

const SUPPORT_EMAIL = "support@scanbit.in";
const SUPPORT_PHONE = "+91 6390420225";
const SUPPORT_PHONE_TEL = "+916390420225";

const supportOptions = [
  {
    icon: HelpCircle,
    title: "Help Center",
    description: "Browse our comprehensive knowledge base for answers to common questions.",
    link: "/help-center",
    isExternal: false,
    color: "primary",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us an email and we'll get back to you within 24 hours.",
    link: `mailto:${SUPPORT_EMAIL}`,
    isExternal: true,
    color: "accent",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Call us for immediate assistance. Available Mon–Sat, 10:00 AM – 6:00 PM IST.",
    link: `tel:${SUPPORT_PHONE_TEL}`,
    isExternal: true,
    color: "primary",
  },
  {
    icon: MessageCircle,
    title: "Help Center & FAQs",
    description: "Find quick answers, guides, and tutorials to get the most out of your account.",
    link: "/help-center",
    isExternal: false,
    color: "accent",
  },
  {
    icon: Book,
    title: "Documentation",
    description: `Access detailed guides and tutorials to help you get the most out of ${env.APP_NAME}.`,
    link: "/help-center",
    isExternal: false,
    color: "primary",
  },
];

const commonQuestions = [
  {
    question: "How do I create my first menu?",
    answer: "After signing up, go to your dashboard and click 'Add Menu'. Follow the step-by-step guide to add categories and items.",
  },
  {
    question: "Can I customize my QR code?",
    answer: "Yes! Pro plan users can customize QR code colors, add logos, and download in various formats.",
  },
  {
    question: "How do I update my menu?",
    answer: "Simply log into your dashboard, navigate to the Menu section, and make your changes. Updates appear instantly.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, UPI, and bank transfers.",
  },
];

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Support</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              How Can We Help?
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8">
              We're here to help you succeed with {env.APP_NAME}. Choose the best way to get in touch.
            </p>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {supportOptions.map((option, index) => {
                const content = (
                  <>
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-6 flex-shrink-0 ${
                        option.color === "primary" ? "gradient-primary" : "bg-accent/20"
                      }`}
                    >
                      <option.icon
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
                          option.color === "primary" ? "text-primary-foreground" : "text-accent"
                        }`}
                      />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                      {option.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      {option.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all mt-auto">
                      <span className="text-sm font-medium">Get Started</span>
                      <ArrowRight className="w-4 h-4 flex-shrink-0" />
                    </div>
                  </>
                );
                if (option.isExternal) {
                  return (
                    <a
                      key={index}
                      href={option.link}
                      className="flex flex-col p-6 sm:p-8 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
                    >
                      {content}
                    </a>
                  );
                }
                return (
                  <Link
                    key={index}
                    to={option.link}
                    className="flex flex-col p-6 sm:p-8 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact — Email & Phone */}
      <section id="contact" className="py-16 sm:py-24 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                Contact Support
              </h2>
              <p className="text-muted-foreground">
                Reach us by email or phone. We typically respond within 24 hours.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-4 p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {SUPPORT_EMAIL}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">We'll reply within 24 hours</p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="flex items-center gap-4 p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Phone
                  </p>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {SUPPORT_PHONE}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Mon–Sat, 10:00 AM – 6:00 PM IST
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button size="lg" className="gap-2" asChild>
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <Mail className="w-5 h-5" />
                  Email us
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a href={`tel:${SUPPORT_PHONE_TEL}`}>
                  <Phone className="w-5 h-5" />
                  Call us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-4">
              {commonQuestions.map((faq, index) => (
                <div
                  key={index}
                  className="p-5 sm:p-6 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors"
                >
                  <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10 sm:mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link to="/help-center">View All FAQs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-border shadow-sm text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Still Need Help?
            </h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <Mail className="w-5 h-5" />
                  {SUPPORT_EMAIL}
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a href={`tel:${SUPPORT_PHONE_TEL}`}>
                  <Phone className="w-5 h-5" />
                  {SUPPORT_PHONE}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Support;
