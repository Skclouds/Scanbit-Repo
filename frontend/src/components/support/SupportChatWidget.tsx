import { 
  MessageCircle, 
  X, 
  Send, 
  CheckCircle, 
  Phone, 
  Mail, 
  Loader2, 
  ChevronLeft 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";


// Professional support questions with comprehensive answers
const supportQuestions = [
  {
    id: "account",
    category: "Account & Access",
    question: "How do I create an account?",
    answer: "Creating an account is simple! Click on the 'Get Started' or 'Sign Up' button on our homepage. Fill in your business details including business name, email, phone number, and choose your business category (Food Mall, Retail/E-Commerce, or Creative & Design). Select your subscription plan, verify your email address, and you'll have instant access to your dashboard. The entire process takes less than 2 minutes!",
  },
  {
    id: "pricing",
    category: "Pricing & Plans",
    question: "What are your pricing plans?",
    answer: "We offer three flexible pricing tiers:\n\n• Free Plan: Perfect for trying out our services with up to 10 menu items, basic QR code, and essential features.\n• Basic Plan (₹299/month): Ideal for small businesses with up to 100 menu items, branded QR codes, custom branding, and advanced analytics.\n• Pro Plan (₹699/month): Best for growing businesses with unlimited menu items, priority support, advanced features, and multiple locations.\n\nAll plans include mobile-optimized menus, real-time updates, and 24/7 customer support. Visit our Pricing page for detailed feature comparison.",
  },
  {
    id: "qr-code",
    category: "QR Codes",
    question: "How do I generate a QR code?",
    answer: "Generating your QR code is easy:\n\n1. Log in to your dashboard\n2. Navigate to 'QR Codes' section\n3. Click 'Generate QR Code'\n4. Customize with your logo, brand colors, and styling\n5. Download in high resolution (PNG, PDF, or SVG formats)\n6. Print and place on tables, menus, or marketing materials\n\nYour QR code automatically links to your digital menu and updates in real-time whenever you make changes. No need to regenerate!",
  },
  {
    id: "menu-update",
    category: "Menu Management",
    question: "How do I update my menu?",
    answer: "Updating your menu is instant and hassle-free:\n\n• Go to your dashboard → 'Menu Items'\n• Click 'Add Item' for new items or edit existing ones\n• Change prices, descriptions, images, or availability\n• Add daily specials, seasonal items, or promotions\n• All changes appear immediately for your customers\n\nNo reprinting needed! Your digital menu updates in real-time, saving you time and money. You can also organize items by categories and set featured items.",
  },
  {
    id: "payment",
    category: "Billing & Payments",
    question: "What payment methods do you accept?",
    answer: "We accept multiple secure payment methods:\n\n• Credit Cards (Visa, Mastercard, American Express)\n• Debit Cards\n• UPI (Google Pay, PhonePe, Paytm, etc.)\n• Net Banking\n• Bank Transfers\n\nAll payments are processed through secure, PCI-compliant gateways. You'll receive an invoice via email after each transaction. We also support automatic recurring payments for monthly subscriptions.",
  },
  {
    id: "subscription",
    category: "Subscription",
    question: "Can I change my subscription plan?",
    answer: "Absolutely! You have full flexibility:\n\n• Upgrade: Move to a higher plan anytime - changes take effect immediately\n• Downgrade: Switch to a lower plan - we'll prorate your charges\n• Cancel: Cancel anytime with no long-term commitments\n• Free Trial: Start with our free plan and upgrade when ready\n\nAll plan changes are instant and you'll receive a prorated invoice. Your data and settings are preserved when switching plans.",
  },
  {
    id: "technical",
    category: "Technical Support",
    question: "I'm having technical issues",
    answer: "Our technical support team is here to help! Common issues we can assist with:\n\n• Browser compatibility problems\n• Mobile responsiveness issues\n• QR code scanning difficulties\n• Menu display problems\n• Account access issues\n• Payment processing errors\n\nPlease provide details about the issue (browser, device, error messages) and our team will resolve it quickly. We typically respond within 24-48 hours, but urgent issues are prioritized.",
  },
  {
    id: "features",
    category: "Features",
    question: "What features are included?",
    answer: "Our platform includes comprehensive features:\n\n• Digital Menu Creation with rich media\n• Custom QR Codes with branding\n• Real-time Menu Updates\n• Analytics Dashboard (views, popular items, peak hours)\n• Multiple Professional Themes\n• Mobile Optimization\n• Multi-language Support\n• Category Management\n• Image Uploads\n• SEO Optimization\n• Social Media Integration\n• Export Options (PDF, Print)\n\nVisit our Features page for a complete list and detailed explanations of each capability.",
  },
  {
    id: "setup",
    category: "Setup & Onboarding",
    question: "How do I get started after signing up?",
    answer: "Getting started is simple:\n\n1. Complete your business profile\n2. Add your menu items (or import from existing menu)\n3. Customize your menu theme and branding\n4. Generate your QR code\n5. Download and print your QR code\n6. Share with customers!\n\nWe also provide step-by-step tutorials, video guides, and email support during your first week. Our onboarding process ensures you're up and running in minutes!",
  },
  {
    id: "other",
    category: "General",
    question: "I have another question",
    answer: "We're here to help with any questions or concerns! Our support team is available 24/7 to assist you. Please describe your question in detail, and we'll get back to you within 24-48 hours with a comprehensive solution. For urgent matters, please mention 'URGENT' in your query and we'll prioritize your request.",
  },
];

interface SupportChatWidgetProps {
  position?: "bottom-right" | "bottom-left";
}

export const SupportChatWidget = ({ position = "bottom-right" }: SupportChatWidgetProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"questions" | "answer" | "form" | "submitted">("questions");
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    query: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Completely hide widget on dedicated portfolio pages
  if (location.pathname.startsWith("/portfolio/")) {
    return null;
  }

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, step, selectedQuestion]);

  const handleQuestionSelect = (question: any) => {
    setSelectedQuestion(question);
    setStep("answer");
  };

  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
    setStep("questions");
  };

  const handleContinue = () => {
    setStep("form");
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.phone || !formData.query.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation (basic)
    if (formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create support ticket via public endpoint
      const response = await api.createPublicSupportTicket({
        subject: selectedQuestion?.question || "General Inquiry",
        description: `Query from Public Support Chat Widget\n\nSelected Question: ${selectedQuestion?.question || "General"}\nSelected Answer: ${selectedQuestion?.answer || "N/A"}\n\nUser Query: ${formData.query}\n\nCategory: ${selectedQuestion?.category || "general"}\n\nContact Details:\nEmail: ${formData.email}\nPhone: ${formData.phone}`,
        category: selectedQuestion?.id === "technical" ? "technical" : selectedQuestion?.id === "payment" || selectedQuestion?.id === "subscription" ? "billing" : "general",
        priority: selectedQuestion?.id === "technical" ? "high" : "medium",
        userEmail: formData.email,
        userPhone: formData.phone,
        userQuery: formData.query,
        selectedQuestion: selectedQuestion?.question || "",
        selectedAnswer: selectedQuestion?.answer || "",
      });

      if (response.success) {
        setStep("submitted");
        toast.success("Your query has been submitted successfully!");
      } else {
        throw new Error(response.message || "Failed to submit query");
      }
    } catch (error: any) {

      toast.error(error.message || "Failed to submit your query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep("questions");
      setSelectedQuestion(null);
      setFormData({ email: "", phone: "", query: "" });
    }, 300);
  };

  // Professional placement: extra bottom space so bottom bar stays visible (safe-area + padding)
  const buttonPositionClasses = position === "bottom-right" 
    ? "right-4 sm:right-6 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6" 
    : "left-4 sm:left-6 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6";
  const chatPositionClasses = position === "bottom-right"
    ? "inset-x-0 bottom-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:left-auto"
    : "inset-x-0 bottom-0 sm:inset-auto sm:bottom-24 sm:left-6 sm:right-auto";
  
  // Hide on admin and public menu/catalog routes
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/menu/') || location.pathname.startsWith('/demo-menu') || location.pathname.startsWith('/demo-catalog')) {
    return null;
  }

  return (
    <>
      {/* Floating Support Button - professional, 48px touch target, safe-area aware */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${buttonPositionClasses} z-[10000] flex items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 min-w-[48px] min-h-[48px] w-12 h-12 sm:w-14 sm:h-14 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background group`}
        aria-label="Need help? Open support chat"
        title="Need Help? Chat with us!"
      >
        <MessageCircle className="w-6 h-6 shrink-0" aria-hidden />
        {!isOpen && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background animate-pulse" aria-hidden />
        )}
        {/* Tooltip - hidden on touch to avoid blocking tap; shown on hover for desktop */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none hidden sm:inline">
          <span className="bg-foreground text-background text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
            Need Help? Chat with us!
          </span>
        </span>
      </button>

      {/* Backdrop on mobile - tap to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black/40 sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none animate-in fade-in duration-200"
          aria-hidden
          onClick={() => handleReset()}
        />
      )}

      {/* Chat Window - bottom sheet on mobile, floating card on desktop */}
      {isOpen && (
        <div
          className={`fixed ${chatPositionClasses} z-[10001] flex flex-col w-full sm:w-96 sm:max-w-[calc(100vw-2rem)] max-h-[90dvh] sm:max-h-[calc(100vh-6rem)] rounded-t-2xl sm:rounded-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-dialog-title"
        >
          <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden flex flex-col flex-1 min-h-0 rounded-t-2xl sm:rounded-xl">
            <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-accent text-primary-foreground pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle id="support-dialog-title" className="text-lg font-semibold">Support Center</CardTitle>
                    <p className="text-xs text-primary-foreground/80">We're here to help!</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
                  onClick={handleReset}
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0 flex flex-col pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30">
                  {/* Step 1: Questions */}
                  {step === "questions" && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-background rounded-lg p-3 shadow-sm">
                            <p className="text-sm font-medium text-foreground mb-2">
                              Hi! 👋 How can we help you today?
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Select a question below or choose "I have another question" for custom support.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        {supportQuestions.map((q) => (
                          <button
                            key={q.id}
                            onClick={() => handleQuestionSelect(q)}
                            className="w-full text-left bg-background hover:bg-primary/5 active:bg-primary/10 rounded-lg p-3 min-h-[44px] border border-border hover:border-primary/30 transition-all group hover:shadow-sm touch-manipulation"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <Badge variant="outline" className="text-xs mb-1.5 bg-primary/5 border-primary/20">
                                  {q.category}
                                </Badge>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {q.question}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs text-primary">→</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Step 2: Answer */}
                  {step === "answer" && selectedQuestion && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-background rounded-lg p-3 shadow-sm">
                            <Badge variant="outline" className="text-xs mb-2">
                              {selectedQuestion.category}
                            </Badge>
                            <p className="text-sm font-medium text-foreground mb-2">
                              {selectedQuestion.question}
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {selectedQuestion.answer}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                            <p className="text-sm font-medium text-foreground mb-1">
                              Did this answer your question?
                            </p>
                            <p className="text-xs text-muted-foreground">
                              If not, click below and we'll help you further!
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 3: Form */}
                  {step === "form" && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-background rounded-lg p-3 shadow-sm">
                            <p className="text-sm font-medium text-foreground mb-2">
                              We'd love to help you further!
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Please provide your contact details and describe your query. Our team will get back to you within 24-48 hours.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 4: Submitted */}
                  {step === "submitted" && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                Query Submitted Successfully!
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Thank you for contacting us! We've received your query and our support team will get back to you within <strong className="text-emerald-700 dark:text-emerald-400">24-48 hours</strong>.
                            </p>
                            <div className="space-y-2 text-xs bg-background/50 rounded-lg p-3 border border-emerald-500/20">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-emerald-600" />
                                <p className="text-muted-foreground">
                                  Confirmation email sent to <strong className="text-foreground">{formData.email}</strong>
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <p className="text-muted-foreground">
                                  We may contact you at <strong className="text-foreground">{formData.phone}</strong> if needed
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {step === "form" && (
                  <div className="border-t border-border p-4 bg-background space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-9 text-sm focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-9 text-sm focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="query" className="text-xs font-medium flex items-center gap-1">
                        Your Query <span className="text-destructive">*</span>
                      </Label>
                      <textarea
                        id="query"
                        placeholder="Describe your question or issue in detail..."
                        value={formData.query}
                        onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                        className="w-full min-h-[100px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        rows={4}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Please provide as much detail as possible to help us assist you better.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.email || !formData.phone || !formData.query.trim()}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Query
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        We'll respond within 24-48 hours
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons for Answer Step */}
                {step === "answer" && (
                  <div className="border-t border-border p-4 bg-background space-y-2">
                    <Button
                      onClick={handleContinue}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      I Need More Help
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleBackToQuestions}
                        variant="outline"
                        className="flex-1"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Close
                      </Button>
                    </div>
                  </div>
                )}

                {/* Close Button for Submitted Step */}
                {step === "submitted" && (
                  <div className="border-t border-border p-4 bg-background">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="w-full"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
