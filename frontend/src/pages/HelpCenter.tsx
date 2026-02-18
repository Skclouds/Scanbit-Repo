import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Search, Book, Video, FileText, ChevronRight, MessageSquare, 
  HelpCircle, Send, CheckCircle2, Clock, AlertCircle, X, Plus,
  Ticket, Mail, Phone, MessageCircle, ArrowRight, ThumbsUp, ThumbsDown
} from "lucide-react";
import { env } from "@/lib/api";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState<any[]>([]);
  const [featuredFaqs, setFeaturedFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Ticket creation state
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
    userEmail: "",
    userPhone: "",
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    fetchFAQs();
    fetchFeaturedFAQs();
  }, [searchQuery, selectedCategory]);

  const fetchFAQs = async () => {
    try {
      setFaqLoading(true);
      const response = await api.getFAQs({
        search: searchQuery || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      });
      if (response.success && response.data) {
        setFaqs(response.data);
      }
    } catch (error) {

    } finally {
      setFaqLoading(false);
    }
  };

  const fetchFeaturedFAQs = async () => {
    try {
      const response = await api.getFAQs({ featured: true });
      if (response.success && response.data) {
        setFeaturedFaqs(response.data.slice(0, 6));
      }
    } catch (error) {

    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketForm.subject || !ticketForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!ticketForm.userEmail || !ticketForm.userPhone) {
      toast.error("Please provide your contact information");
      return;
    }

    try {
      setSubmittingTicket(true);
      const response = await api.createPublicSupportTicket({
        subject: ticketForm.subject,
        description: ticketForm.description,
        category: ticketForm.category,
        priority: ticketForm.priority,
        userEmail: ticketForm.userEmail,
        userPhone: ticketForm.userPhone,
        userQuery: ticketForm.description,
      });

      if (response.success) {
        toast.success(response.message || "Ticket created successfully! We'll get back to you soon.");
        setTicketForm({
          subject: "",
          description: "",
          category: "general",
          priority: "medium",
          userEmail: "",
          userPhone: "",
        });
        setShowTicketForm(false);
      }
    } catch (error: any) {

      toast.error(error?.message || "Failed to create support ticket. Please try again.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleFAQFeedback = async (faqId: string, helpful: boolean) => {
    try {
      await api.submitFAQFeedback(faqId, helpful);
      toast.success("Thank you for your feedback!");
      fetchFAQs();
      fetchFeaturedFAQs();
    } catch (error) {

    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "billing", label: "Billing" },
    { value: "technical", label: "Technical" },
    { value: "account", label: "Account" },
    { value: "features", label: "Features" },
    { value: "troubleshooting", label: "Troubleshooting" },
    { value: "subscription", label: "Subscription" },
  ];

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Book,
      category: "general",
      description: "Learn the basics of using our platform",
    },
    {
      title: "Billing & Plans",
      icon: FileText,
      category: "billing",
      description: "Questions about pricing and subscriptions",
    },
    {
      title: "Technical Support",
      icon: Video,
      category: "technical",
      description: "Technical issues and troubleshooting",
    },
    {
      title: "Account Management",
      icon: HelpCircle,
      category: "account",
      description: "Managing your account settings",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Support Center</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              How Can We Help?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Find answers to common questions, browse our knowledge base, or contact our support team.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="search">Search & FAQs</TabsTrigger>
                <TabsTrigger value="ticket">Create Ticket</TabsTrigger>
                <TabsTrigger value="contact">Contact Us</TabsTrigger>
              </TabsList>

              {/* Search & FAQs Tab */}
              <TabsContent value="search" className="space-y-8">
                {/* Category Filter */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Label className="text-sm font-medium">Filter by Category:</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured FAQs */}
                {featuredFaqs.length > 0 && !searchQuery && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Featured FAQs
                      </CardTitle>
                      <CardDescription>Most helpful articles</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {featuredFaqs.map((faq) => (
                          <AccordionItem key={faq._id} value={faq._id}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="capitalize">
                                  {faq.category}
                                </Badge>
                                <span className="font-medium">{faq.question}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pl-8">
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                  {faq.answer}
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                  <span className="text-sm text-muted-foreground">
                                    Was this helpful?
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFAQFeedback(faq._id, true)}
                                  >
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    Yes ({faq.helpful || 0})
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFAQFeedback(faq._id, false)}
                                  >
                                    <ThumbsDown className="w-4 h-4 mr-1" />
                                    No ({faq.notHelpful || 0})
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {/* All FAQs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                      {searchQuery 
                        ? `Search results for "${searchQuery}"` 
                        : "Browse all frequently asked questions"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {faqLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : faqs.length === 0 ? (
                      <div className="text-center py-12">
                        <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {searchQuery ? "No FAQs found" : "No FAQs available"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {searchQuery 
                            ? "Try a different search term or create a support ticket"
                            : "FAQs will appear here once they're added"}
                        </p>
                        {searchQuery && (
                          <Button onClick={() => setActiveTab("ticket")}>
                            Create Support Ticket
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq) => (
                          <AccordionItem key={faq._id} value={faq._id}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="capitalize">
                                  {faq.category}
                                </Badge>
                                <span className="font-medium">{faq.question}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pl-8">
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                  {faq.answer}
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                  <span className="text-sm text-muted-foreground">
                                    Was this helpful?
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFAQFeedback(faq._id, true)}
                                  >
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    Yes ({faq.helpful || 0})
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFAQFeedback(faq._id, false)}
                                  >
                                    <ThumbsDown className="w-4 h-4 mr-1" />
                                    No ({faq.notHelpful || 0})
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>

                {/* Category Cards */}
                {!searchQuery && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {faqCategories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <Card
                          key={index}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => {
                            setSelectedCategory(category.category);
                            setActiveTab("search");
                          }}
                        >
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <Icon className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {category.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Create Ticket Tab */}
              <TabsContent value="ticket" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Create Support Ticket
                    </CardTitle>
                    <CardDescription>
                      Submit a support ticket and our team will get back to you within 24-48 hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitTicket} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="userEmail">
                            Email Address <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="userEmail"
                            type="email"
                            placeholder="your@email.com"
                            value={ticketForm.userEmail}
                            onChange={(e) =>
                              setTicketForm({ ...ticketForm, userEmail: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userPhone">
                            Phone Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="userPhone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={ticketForm.userPhone}
                            onChange={(e) =>
                              setTicketForm({ ...ticketForm, userPhone: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">
                          Subject <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="subject"
                          placeholder="Brief description of your issue"
                          value={ticketForm.subject}
                          onChange={(e) =>
                            setTicketForm({ ...ticketForm, subject: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={ticketForm.category}
                            onValueChange={(value) =>
                              setTicketForm({ ...ticketForm, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                              <SelectItem value="account">Account</SelectItem>
                              <SelectItem value="feature-request">Feature Request</SelectItem>
                              <SelectItem value="bug-report">Bug Report</SelectItem>
                              <SelectItem value="subscription">Subscription</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={ticketForm.priority}
                            onValueChange={(value) =>
                              setTicketForm({ ...ticketForm, priority: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Please provide detailed information about your issue..."
                          rows={6}
                          value={ticketForm.description}
                          onChange={(e) =>
                            setTicketForm({ ...ticketForm, description: e.target.value })
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Include any error messages, steps to reproduce, or relevant details
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <Button type="submit" disabled={submittingTicket} className="flex-1">
                          {submittingTicket ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Ticket
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setTicketForm({
                              subject: "",
                              description: "",
                              category: "general",
                              priority: "medium",
                              userEmail: "",
                              userPhone: "",
                            });
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Response Time:</strong> We typically respond within 24-48 hours. 
                    For urgent issues, please mark your ticket as "Urgent" priority.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Contact Us Tab */}
              <TabsContent value="contact" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        Send us an email and we'll get back to you within 24-48 hours.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          window.location.href = `mailto:support@${env.APP_NAME?.toLowerCase() || 'scanbit'}.com`;
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Live Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        Chat with our support team in real-time (available during business hours).
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Trigger chat widget if available
                          const chatWidget = document.querySelector('[data-chat-widget]');
                          if (chatWidget) {
                            (chatWidget as HTMLElement).click();
                          } else {
                            toast.info("Chat widget will open automatically when support is available");
                          }
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Phone Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        Call us directly for immediate assistance.
                      </p>
                      <div className="space-y-2">
                        <p className="font-medium">Business Hours:</p>
                        <p className="text-sm text-muted-foreground">
                          Monday - Friday: 9:00 AM - 6:00 PM
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            window.location.href = "tel:+1-800-SCANBIT";
                          }}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call Support
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="w-5 h-5" />
                        Knowledge Base
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        Browse our comprehensive documentation and guides.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("search")}
                      >
                        <Book className="w-4 h-4 mr-2" />
                        Browse Articles
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Support Resources</CardTitle>
                    <CardDescription>Additional resources to help you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <h4 className="font-semibold mb-2">Documentation</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Comprehensive guides and tutorials
                        </p>
                        <Button variant="link" className="p-0 h-auto">
                          View Docs <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <h4 className="font-semibold mb-2">Video Tutorials</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Step-by-step video guides
                        </p>
                        <Button variant="link" className="p-0 h-auto">
                          Watch Videos <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <h4 className="font-semibold mb-2">Community Forum</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Connect with other users
                        </p>
                        <Button variant="link" className="p-0 h-auto">
                          Join Forum <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <h4 className="font-semibold mb-2">Status Page</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Check system status and uptime
                        </p>
                        <Button variant="link" className="p-0 h-auto" asChild>
                          <Link to="/status">
                            View Status <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Still Need Help?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
                    <Ticket className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Create Support Ticket</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submit a detailed ticket for complex issues
                  </p>
                  <Button onClick={() => setActiveTab("ticket")} className="w-full">
                    Create Ticket
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chat with our team in real-time
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("contact")} className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-purple-100 mx-auto mb-4 flex items-center justify-center">
                    <Book className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Browse Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Search our comprehensive help articles
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("search")} className="w-full">
                    Browse Articles
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
