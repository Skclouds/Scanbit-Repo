import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MdHelpOutline,
  MdPhone,
  MdBusiness,
  MdSupportAgent,
  MdAdd,
  MdReply,
  MdChevronRight,
  MdSchedule,
  MdCheck,
  MdError,
} from "react-icons/md";
import { FiMail, FiPlus, FiMessageCircle } from "react-icons/fi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { env } from "@/lib/api";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "technical", label: "Technical" },
  { value: "billing", label: "Billing" },
  { value: "account", label: "Account" },
  { value: "subscription", label: "Subscription" },
  { value: "feature-request", label: "Feature Request" },
  { value: "bug-report", label: "Bug Report" },
  { value: "other", label: "Other" },
] as const;

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

interface SupportTicket {
  _id: string;
  ticketNumber?: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  messages?: Array<{
    _id?: string;
    message: string;
    user: { name?: string; email?: string; role?: string };
    isInternal?: boolean;
    createdAt: string;
  }>;
  user?: { name?: string; email?: string };
  restaurant?: { name?: string; businessName?: string; email?: string };
  createdAt: string;
  updatedAt?: string;
}

interface SupportProps {
  restaurant?: any;
  businessCategory?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "open":
      return <MdHelpOutline className="w-4 h-4" />;
    case "in-progress":
      return <MdSchedule className="w-4 h-4" />;
    case "resolved":
      return <MdCheck className="w-4 h-4" />;
    case "closed":
      return <MdError className="w-4 h-4" />;
    default:
      return <MdSchedule className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "in-progress":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "resolved":
      return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
    case "closed":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-500/10 text-red-700 dark:text-red-300";
    case "high":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case "medium":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "low":
      return "bg-green-500/10 text-green-700 dark:text-green-300";
    default:
      return "bg-gray-500/10 text-gray-600";
  }
};

export const Support = ({ restaurant, businessCategory }: SupportProps) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [activeView, setActiveView] = useState<"tickets" | "create" | "faqs">("tickets");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    subject: "",
    description: "",
    category: "general" as (typeof CATEGORIES)[number]["value"],
    priority: "medium" as (typeof PRIORITIES)[number]["value"],
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState("all");

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await api.getSupportTickets({ limit: 50 });
      if (res?.success && Array.isArray(res.data)) {
        setTickets(res.data);
      } else {
        setTickets([]);
      }
    } catch (e) {
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  const fetchFaqs = useCallback(async () => {
    setFaqsLoading(true);
    try {
      const res = await api.getFAQs({
        search: faqSearch || undefined,
        category: faqCategory !== "all" ? faqCategory : undefined,
      });
      if (res?.success && Array.isArray(res.data)) {
        setFaqs(res.data);
      } else {
        setFaqs([]);
      }
    } catch (e) {
      setFaqs([]);
    } finally {
      setFaqsLoading(false);
    }
  }, [faqSearch, faqCategory]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (activeView === "faqs") {
      fetchFaqs();
    }
  }, [activeView, fetchFaqs]);

  const fetchTicketDetail = async (id: string) => {
    setTicketDetailLoading(true);
    try {
      const res = await api.getSupportTicket(id);
      if (res?.success && res.data) {
        setSelectedTicket(res.data);
      }
    } catch (e) {
      toast.error("Failed to load ticket");
      setSelectedTicket(null);
    } finally {
      setTicketDetailLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!createForm.subject.trim() || !createForm.description.trim()) {
      toast.error("Subject and description are required");
      return;
    }
    setCreateSubmitting(true);
    try {
      const res = await api.createSupportTicket({
        subject: createForm.subject.trim(),
        description: createForm.description.trim(),
        category: createForm.category,
        priority: createForm.priority,
      });
      if (res?.success) {
        toast.success(res.message || "Ticket created successfully");
        setCreateForm({
          subject: "",
          description: "",
          category: "general",
          priority: "medium",
        });
        setCreateOpen(false);
        fetchTickets();
      } else {
        throw new Error(res?.message || "Failed to create ticket");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to create ticket");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleAddReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setReplySending(true);
    try {
      const res = await api.addTicketMessage(selectedTicket._id, {
        message: replyMessage.trim(),
      });
      if (res?.success && res.data) {
        setSelectedTicket(res.data);
        setReplyMessage("");
        toast.success("Reply sent");
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to send reply");
    } finally {
      setReplySending(false);
    }
  };

  const businessName = restaurant?.name || restaurant?.businessName || "Your Business";
  const businessEmail = restaurant?.email || "";
  const businessPhone = restaurant?.phone || "";
  const category = businessCategory || restaurant?.businessCategory || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Support</h2>
          <p className="text-muted-foreground mt-1">
            Get help, manage tickets, and browse FAQs
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <FiPlus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      {/* Account info + Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MdBusiness className="w-5 h-5 text-primary" />
              Your Account
            </CardTitle>
            <CardDescription>Details on file for support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Business:</span> {businessName || "—"}</p>
            <p><span className="text-muted-foreground">Email:</span> {businessEmail || "—"}</p>
            {businessPhone && (
              <p><span className="text-muted-foreground">Phone:</span> {businessPhone}</p>
            )}
            {category && (
              <p><span className="text-muted-foreground">Category:</span> {category}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MdSupportAgent className="w-5 h-5 text-primary" />
              Contact Support
            </CardTitle>
            <CardDescription>Direct contact options</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href={`mailto:${env.SUPPORT_EMAIL}`}>
                <FiMail className="w-4 h-4" />
                Email
              </a>
            </Button>
            {env.SUPPORT_PHONE && (
              <Button variant="outline" size="sm" asChild className="gap-2">
                <a href={`tel:${env.SUPPORT_PHONE.replace(/\s/g, "")}`}>
                  <MdPhone className="w-4 h-4" />
                  Call
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/help-center" className="gap-2">
                <FiMessageCircle className="w-4 h-4 mr-2" />
                Help Center
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Button
          variant={activeView === "tickets" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveView("tickets")}
        >
          My Tickets ({tickets.length})
        </Button>
        <Button
          variant={activeView === "faqs" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveView("faqs")}
        >
          FAQs
        </Button>
      </div>

      {/* My Tickets */}
      {activeView === "tickets" && (
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>
              View and manage your support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-12 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading tickets…</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <MdHelpOutline className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No support tickets yet</p>
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                  <MdAdd className="w-4 h-4" />
                  Create your first ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium truncate">{t.subject}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${getStatusColor(t.status)}`}
                        >
                          {getStatusIcon(t.status)}
                          <span className="ml-1">{t.status}</span>
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-xs capitalize ${getPriorityColor(t.priority)}`}
                        >
                          {t.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        #{t.ticketNumber || t._id.slice(-8)} · {t.category} ·{" "}
                        {format(new Date(t.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 shrink-0"
                      onClick={() => {
                        setSelectedTicket(t);
                        setTicketDetailLoading(true);
                        fetchTicketDetail(t._id);
                      }}
                    >
                      View <MdChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FAQs */}
      {activeView === "faqs" && (
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers from our knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search FAQs…"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="max-w-xs"
              />
              <Select value={faqCategory} onValueChange={setFaqCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {["general", "billing", "technical", "account", "subscription", "features", "troubleshooting"].map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchFaqs} disabled={faqsLoading}>
                {faqsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </Button>
            </div>
            {faqsLoading ? (
              <div className="flex items-center justify-center py-12 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">No FAQs found</p>
                <Button variant="outline" asChild>
                  <Link to="/help-center">Browse Help Center</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq._id}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <p className="font-medium text-foreground mb-2">{faq.question}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue. We typically respond within 24–48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject *</label>
              <Input
                placeholder="Brief description"
                value={createForm.subject}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={createForm.category}
                  onValueChange={(v) =>
                    setCreateForm((f) => ({
                      ...f,
                      category: v as typeof createForm.category,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={createForm.priority}
                  onValueChange={(v) =>
                    setCreateForm((f) => ({
                      ...f,
                      priority: v as typeof createForm.priority,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                placeholder="Describe your issue in detail…"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTicket}
                disabled={createSubmitting || !createForm.subject.trim() || !createForm.description.trim()}
              >
                {createSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              #{selectedTicket?.ticketNumber || selectedTicket?._id?.slice(-8)} ·{" "}
              {selectedTicket?.category} ·{" "}
              {selectedTicket?.createdAt &&
                format(new Date(selectedTicket.createdAt), "PPp")}
            </DialogDescription>
          </DialogHeader>
          {ticketDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedTicket ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={getStatusColor(selectedTicket.status)}
                >
                  {getStatusIcon(selectedTicket.status)}
                  <span className="ml-1 capitalize">{selectedTicket.status}</span>
                </Badge>
                <Badge
                  variant="secondary"
                  className={getPriorityColor(selectedTicket.priority)}
                >
                  {selectedTicket.priority}
                </Badge>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Conversation</p>
                {(selectedTicket.messages || []).map((m) => (
                  <div
                    key={m._id || m.createdAt}
                    className={`p-4 rounded-lg border ${
                      m.isInternal
                        ? "bg-amber-500/5 border-amber-200 dark:border-amber-900"
                        : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>
                        {m.user?.name || "Support"}
                        {m.isInternal && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Internal
                          </Badge>
                        )}
                      </span>
                      <span>
                        {format(new Date(m.createdAt), "PPp")}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                  </div>
                ))}
              </div>
              {(selectedTicket.status === "open" ||
                selectedTicket.status === "in-progress") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add reply</label>
                  <Textarea
                    placeholder="Type your message…"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleAddReply}
                    disabled={!replyMessage.trim() || replySending}
                    className="gap-2"
                  >
                    {replySending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MdReply className="w-4 h-4" />
                    )}
                    Send Reply
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
