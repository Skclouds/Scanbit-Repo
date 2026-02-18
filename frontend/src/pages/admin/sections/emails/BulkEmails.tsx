import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  Users,
  Building2,
  List,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  ListOrdered,
  Link,
  Heading2,
  AlignLeft,
  Paperclip,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const RECIPIENT_TYPES = [
  { id: "all", label: "All Users & Businesses", icon: Users },
  { id: "users", label: "Users Only", icon: Users },
  { id: "businesses", label: "Businesses Only", icon: Building2 },
  { id: "custom", label: "Custom Email List", icon: List },
];

const EMAIL_TEMPLATES = [
  { id: "announcement", subject: "Important Announcement", body: "Hello,\n\nWe have an important update to share with you.\n\nBest regards,\nScanBit Team" },
  { id: "newsletter", subject: "Your Monthly Newsletter", body: "Dear valued customer,\n\nHere's what's new this month...\n\nThank you for being with us!\nScanBit Team" },
  { id: "maintenance", subject: "Scheduled Maintenance Notice", body: "Hello,\n\nWe will be performing scheduled maintenance. Our services may be temporarily unavailable.\n\nWe apologize for any inconvenience.\nScanBit Team" },
];

function plainTextToHtml(text: string): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const formatInline = (s: string) => {
    const e = escape(s);
    return e
      .replace(/\*\*(.+?)\*\*/g, (_, c) => `<strong>${c}</strong>`)
      .replace(/__(.+?)__/g, (_, c) => `<strong>${c}</strong>`)
      .replace(/\*(.+?)\*/g, (_, c) => `<em>${c}</em>`)
      .replace(/_(.+?)_/g, (_, c) => `<em>${c}</em>`)
      .replace(/~~(.+?)~~/g, (_, c) => `<s>${c}</s>`)
      .replace(/\[(.+?)\]\((.+?)\)/g, (_, t, u) => `<a href="${u}" style="color:#f97316;text-decoration:underline">${t}</a>`);
  };

  const lines = text.split("\n");
  let html = "";
  let inList = false;
  let listType = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      if (inList) {
        html += listType === "ul" ? "</ul>" : "</ol>";
        inList = false;
      }
      html += `<h2 style="font-size:1.25rem;margin:16px 0 8px">${formatInline(trimmed.slice(3))}</h2>`;
    } else if (/^[•\-*]\s/.test(trimmed) || trimmed.startsWith("• ")) {
      const content = trimmed.replace(/^[•\-*]\s*/, "");
      if (!inList || listType !== "ul") {
        if (inList) html += listType === "ul" ? "</ul>" : "</ol>";
        html += "<ul style='margin:8px 0;padding-left:24px'>";
        inList = true;
        listType = "ul";
      }
      html += `<li>${formatInline(content)}</li>`;
    } else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s*/, "");
      if (!inList || listType !== "ol") {
        if (inList) html += listType === "ul" ? "</ul>" : "</ol>";
        html += "<ol style='margin:8px 0;padding-left:24px'>";
        inList = true;
        listType = "ol";
      }
      html += `<li>${formatInline(content)}</li>`;
    } else {
      if (inList) {
        html += listType === "ul" ? "</ul>" : "</ol>";
        inList = false;
      }
      if (!trimmed) {
        html += "<p><br/></p>";
      } else {
        html += `<p style="margin:8px 0;line-height:1.6">${formatInline(trimmed)}</p>`;
      }
    }
  }
  if (inList) html += listType === "ul" ? "</ul>" : "</ol>";
  return html || "<p><br/></p>";
}

export default function BulkEmails() {
  const [recipientType, setRecipientType] = useState<"all" | "users" | "businesses" | "custom">("all");
  const [customEmails, setCustomEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [role, setRole] = useState("all");
  const [businessCategory, setBusinessCategory] = useState("all");
  const [subscriptionStatus, setSubscriptionStatus] = useState("all");
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipientData, setRecipientData] = useState<{
    totalUniqueCount: number;
    userCount: number;
    restaurantCount: number;
    previewEmails: { email: string; name?: string; source: string }[];
  } | null>(null);
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [options, setOptions] = useState<{ businessCategories: string[]; subscriptionStatuses: string[]; roles: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await api.getEmailOptions();
        if (res.success && res.data) setOptions(res.data);
      } catch {
        setOptions({ businessCategories: [], subscriptionStatuses: ["active", "inactive", "expired", "cancelled"], roles: ["user"] });
      }
    };
    loadOptions();
  }, []);

  const fetchRecipients = async () => {
    if (recipientType === "custom") {
      const emails = customEmails
        .split(/[\n,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      setRecipientData({
        totalUniqueCount: new Set(emails).size,
        userCount: 0,
        restaurantCount: 0,
        previewEmails: emails.slice(0, 10).map((e) => ({ email: e, source: "custom" })),
      });
      return;
    }

    setLoadingRecipients(true);
    try {
      const response = await api.getEmailRecipients({
        role: role !== "all" ? role : undefined,
        businessCategory: businessCategory !== "all" ? businessCategory : undefined,
        subscriptionStatus: subscriptionStatus !== "all" ? subscriptionStatus : undefined,
        limit: 100,
        recipientType,
      });
      if (response.success && response.data) {
        setRecipientData(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch recipients");
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    if (recipientType !== "custom") {
      fetchRecipients();
    } else {
      setRecipientData(null);
    }
  }, [recipientType, role, businessCategory, subscriptionStatus]);

  useEffect(() => {
    if (recipientType === "custom" && customEmails.trim()) {
      const emails = customEmails
        .split(/[\n,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      setRecipientData({
        totalUniqueCount: new Set(emails).size,
        userCount: 0,
        restaurantCount: 0,
        previewEmails: emails.slice(0, 10).map((e) => ({ email: e, source: "custom" })),
      });
    } else if (recipientType === "custom") {
      setRecipientData(null);
    }
  }, [recipientType, customEmails]);

  const handleTemplateSelect = (templateId: string) => {
    const t = EMAIL_TEMPLATES.find((x) => x.id === templateId);
    if (t && t.subject) {
      setSubject(t.subject);
      setMessageBody(t.body);
    }
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const textarea = document.getElementById("message-body") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = messageBody;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + prefix + (selected || "text") + suffix + after;
    setMessageBody(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const insertAtCursor = (insert: string) => {
    const textarea = document.getElementById("message-body") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = messageBody;
    const newText = text.substring(0, start) + insert + text.substring(end);
    setMessageBody(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insert.length, start + insert.length);
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const valid = files.filter((f) => allowed.includes(f.type));
    if (valid.length < files.length) toast.error("Some files were skipped. Allowed: images, PDF, Word");
    setAttachments((prev) => [...prev, ...valid].slice(0, 5));
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }
    if (!messageBody.trim()) {
      toast.error("Please enter the email body");
      return;
    }

    const customList =
      recipientType === "custom"
        ? customEmails
            .split(/[\n,;]+/)
            .map((e) => e.trim().toLowerCase())
            .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
        : [];

    if (recipientType === "custom" && customList.length === 0) {
      toast.error("Please add at least one valid email address");
      return;
    }

    const htmlBody = plainTextToHtml(messageBody);

    setSending(true);
    setLastResult(null);
    try {
      const response = await api.sendBulkEmail({
        subject: subject.trim(),
        htmlBody,
        recipientType,
        customEmails: recipientType === "custom" ? customList : undefined,
        role: recipientType !== "custom" && role !== "all" ? role : undefined,
        businessCategory: recipientType !== "custom" && businessCategory !== "all" ? businessCategory : undefined,
        subscriptionStatus: recipientType !== "custom" && subscriptionStatus !== "all" ? subscriptionStatus : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (response.success && response.data) {
        setLastResult(response.data);
        toast.success(`Bulk email sent: ${response.data.sent} delivered, ${response.data.failed} failed`);
        if (response.data.failed > 0 && response.data.failedEmails?.length) {
          toast.info(`Failed emails: ${response.data.failedEmails.slice(0, 5).join(", ")}${response.data.failedEmails.length > 5 ? "..." : ""}`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send bulk email");
    } finally {
      setSending(false);
    }
  };

  const recipientCount = recipientData?.totalUniqueCount ?? 0;
  const categories = options?.businessCategories || ["Food Mall", "Retail / E-Commerce Businesses", "Creative & Design"];
  const subStatuses = options?.subscriptionStatuses || ["active", "inactive", "expired", "cancelled"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bulk Emails</h2>
          <p className="text-slate-600 mt-1">Send professional emails to users and businesses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>Write your subject and message. Use formatting options below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template (optional)</Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label>Message Body *</Label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex flex-wrap gap-1 p-2 bg-muted/50 border-b">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Bold" onClick={() => wrapSelection("**", "**")}>
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Italic" onClick={() => wrapSelection("_", "_")}>
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Underline" onClick={() => wrapSelection("<u>", "</u>")}>
                      <Underline className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Strikethrough" onClick={() => wrapSelection("~~", "~~")}>
                      <Strikethrough className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Bullet list" onClick={() => insertAtCursor("\n• ")}>
                      <List className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Numbered list" onClick={() => insertAtCursor("\n1. ")}>
                      <ListOrdered className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Heading" onClick={() => insertAtCursor("\n\n## ")}>
                      <Heading2 className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Link" onClick={() => wrapSelection("[", "](url)")}>
                      <Link className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Line break" onClick={() => insertAtCursor("\n")}>
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    id="message-body"
                    placeholder="Type your message here...&#10;&#10;Use the toolbar above for bold, italic, lists, etc."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    rows={10}
                    className="border-0 rounded-none focus-visible:ring-0 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Attachments (images, PDF, Word — max 5 files, 10MB each)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="w-4 h-4 mr-2" />
                    Add files
                  </Button>
                  {attachments.map((f, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {f.name}
                      <button type="button" onClick={() => removeAttachment(i)} className="hover:bg-muted rounded p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button onClick={handleSend} disabled={sending || recipientCount === 0}>
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send to {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
                {recipientCount > 500 && (
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Max 500 per send. Narrow filters.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {lastResult && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Last send complete</span>
                </div>
                <div className="flex gap-4">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Sent: {lastResult.sent}
                  </Badge>
                  {lastResult.failed > 0 && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">
                      Failed: {lastResult.failed}
                    </Badge>
                  )}
                  <Badge variant="outline">Total: {lastResult.total}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipients</CardTitle>
              <CardDescription>Select who receives this email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {RECIPIENT_TYPES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRecipientType(r.id as any)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                          recipientType === r.id
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {recipientType === "custom" ? (
                <div className="space-y-2">
                  <Label>Email Addresses (one per line or comma-separated)</Label>
                  <Textarea
                    placeholder="user1@example.com&#10;user2@example.com"
                    value={customEmails}
                    onChange={(e) => setCustomEmails(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {(options?.roles || ["user"]).map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Business Category</Label>
                      <Select value={businessCategory} onValueChange={setBusinessCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Subscription</Label>
                      <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {subStatuses.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchRecipients} disabled={loadingRecipients}>
                    {loadingRecipients ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh Count
                  </Button>
                </>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Recipient count</span>
                  <Badge variant="secondary" className="text-base">
                    {loadingRecipients ? "..." : recipientCount}
                  </Badge>
                </div>
                {recipientData?.previewEmails && recipientData.previewEmails.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {recipientData.previewEmails.map((p, i) => (
                      <div key={i} className="truncate">
                        {p.email} {p.name && `(${p.name})`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
