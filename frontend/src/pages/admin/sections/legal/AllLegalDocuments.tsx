import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  FileText, RefreshCw, Search, Plus, Edit, Trash2, Eye, Copy, Link as LinkIcon,
  CheckCircle2, XCircle, Shield, Calendar, Globe, ExternalLink, Download
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { format } from "date-fns";
import { env } from "@/lib/api";

interface LegalDocument {
  _id: string;
  title: string;
  slug: string;
  type: string;
  content: string;
  shortDescription?: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  isActive: boolean;
  isDefault: boolean;
  language: string;
  views: number;
  requiresAcceptance: boolean;
  acceptanceRequiredFor: string[];
  createdAt: string;
  updatedAt: string;
}

interface AllLegalDocumentsProps {
  defaultType?: string;
}

export default function AllLegalDocuments({ defaultType = undefined }: AllLegalDocumentsProps = {}) {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(defaultType || "all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "privacy-policy",
    content: "",
    shortDescription: "",
    version: "1.0",
    effectiveDate: new Date().toISOString().split('T')[0],
    isActive: true,
    isDefault: false,
    language: "en",
    requiresAcceptance: false,
    acceptanceRequiredFor: [] as string[],
  });

  const documentTypes = [
    { value: "all", label: "All Types" },
    { value: "privacy-policy", label: "Privacy Policy" },
    { value: "terms-conditions", label: "Terms & Conditions" },
    { value: "cookie-policy", label: "Cookie Policy" },
    { value: "refund-policy", label: "Refund Policy" },
    { value: "shipping-policy", label: "Shipping Policy" },
    { value: "user-agreement", label: "User Agreement" },
    { value: "other", label: "Other" },
  ];

  const languages = [
    { value: "all", label: "All Languages" },
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
    { value: "hi", label: "Hindi" },
  ];

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter, languageFilter]);

  useEffect(() => {
    if (search) {
      const debounce = setTimeout(() => {
        fetchDocuments();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      fetchDocuments();
    }
  }, [search]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.getAllLegalDocuments({
        type: typeFilter !== "all" ? typeFilter : undefined,
        language: languageFilter !== "all" ? languageFilter : undefined,
        search: search || undefined,
      });
      if (response.success) {
        setDocuments(response.data || []);
      }
    } catch (error) {

      toast.error("Failed to load legal documents");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDocument(null);
    setFormData({
      title: "",
      type: "privacy-policy",
      content: "",
      shortDescription: "",
      version: "1.0",
      effectiveDate: new Date().toISOString().split('T')[0],
      isActive: true,
      isDefault: false,
      language: "en",
      requiresAcceptance: false,
      acceptanceRequiredFor: [],
    });
    setShowDialog(true);
  };

  const handleEdit = (doc: LegalDocument) => {
    setEditingDocument(doc);
    setFormData({
      title: doc.title,
      type: doc.type,
      content: doc.content,
      shortDescription: doc.shortDescription || "",
      version: doc.version,
      effectiveDate: doc.effectiveDate ? format(new Date(doc.effectiveDate), "yyyy-MM-dd") : new Date().toISOString().split('T')[0],
      isActive: doc.isActive,
      isDefault: doc.isDefault,
      language: doc.language,
      requiresAcceptance: doc.requiresAcceptance,
      acceptanceRequiredFor: doc.acceptanceRequiredFor || [],
    });
    setShowDialog(true);
  };

  const handleView = async (doc: LegalDocument) => {
    try {
      const response = await api.getLegalDocumentById(doc._id);
      if (response.success && response.data) {
        setSelectedDocument(response.data);
        setViewDialog(true);
      } else {
        setSelectedDocument(doc);
        setViewDialog(true);
      }
    } catch (error) {

      setSelectedDocument(doc);
      setViewDialog(true);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingDocument) {
        await api.updateLegalDocument(editingDocument._id, formData);
        toast.success("Document updated successfully");
      } else {
        await api.createLegalDocument(formData);
        toast.success("Document created successfully");
      }
      setShowDialog(false);
      fetchDocuments();
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to save document");
    }
  };

  const handleDelete = async () => {
    if (!editingDocument) return;

    try {
      await api.deleteLegalDocument(editingDocument._id);
      toast.success("Document deleted successfully");
      setDeleteDialog(false);
      setShowDialog(false);
      fetchDocuments();
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to delete document");
    }
  };

  const handleCopyLink = (doc: LegalDocument) => {
    const url = `${window.location.origin}/legal/${doc.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      "privacy-policy": "Privacy Policy",
      "terms-conditions": "Terms & Conditions",
      "cookie-policy": "Cookie Policy",
      "refund-policy": "Refund Policy",
      "shipping-policy": "Shipping Policy",
      "user-agreement": "User Agreement",
      "other": "Other",
    };
    return typeMap[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      "privacy-policy": "bg-blue-100 text-blue-800",
      "terms-conditions": "bg-green-100 text-green-800",
      "cookie-policy": "bg-orange-100 text-orange-800",
      "refund-policy": "bg-purple-100 text-purple-800",
      "shipping-policy": "bg-yellow-100 text-yellow-800",
      "user-agreement": "bg-red-100 text-red-800",
      "other": "bg-gray-100 text-gray-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };

  const activeCount = documents.filter(d => d.isActive).length;
  const defaultCount = documents.filter(d => d.isDefault).length;
  const totalViews = documents.reduce((sum, d) => sum + (d.views || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Legal Documents</h2>
            <p className="text-slate-600 mt-1">Manage privacy policies, terms & conditions, and other legal documents</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Documents</p>
                <p className="text-3xl font-bold mt-2">{documents.length}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{activeCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Default</p>
                <p className="text-3xl font-bold mt-2 text-purple-600">{defaultCount}</p>
              </div>
              <Shield className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Views</p>
                <p className="text-3xl font-bold mt-2 text-orange-600">{totalViews}</p>
              </div>
              <Eye className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No documents found</p>
              <p className="text-slate-500 text-sm">Create your first legal document</p>
              <Button className="mt-4" onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Document
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <Card key={doc._id} className={!doc.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <Badge className={getTypeBadgeColor(doc.type)}>
                        {getTypeLabel(doc.type)}
                      </Badge>
                      {doc.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" />Inactive
                        </Badge>
                      )}
                      {doc.isDefault && (
                        <Badge className="bg-purple-100 text-purple-800">
                          <Shield className="w-3 h-3 mr-1" />Default
                        </Badge>
                      )}
                      <Badge variant="outline" className="uppercase">
                        {doc.language}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Eye className="w-3 h-3" />
                        {doc.views} views
                      </div>
                    </div>
                    {doc.shortDescription && (
                      <CardDescription className="mt-2">{doc.shortDescription}</CardDescription>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Effective: {format(new Date(doc.effectiveDate), "MMM d, yyyy")}
                      </div>
                      <div>Version: {doc.version}</div>
                      {doc.requiresAcceptance && (
                        <Badge variant="outline" className="text-xs">
                          Requires Acceptance
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(doc)}
                        className="mr-2"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                      <a
                        href={`/legal/${doc.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Public Page
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleView(doc)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(doc)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingDocument(doc);
                        setDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDocument ? "Edit Document" : "Create New Document"}</DialogTitle>
            <DialogDescription>
              {editingDocument ? "Update the legal document" : "Create a new privacy policy, terms & conditions, or other legal document"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Privacy Policy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Document Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.filter(t => t.value !== "all").map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief description of the document"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Load professional template based on type
                    const templates: Record<string, string> = {
                      "privacy-policy": `<h1>Privacy Policy</h1>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>1. Introduction</h2>
<p>ScanBit ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital menu platform and services.</p>

<h2>2. Information We Collect</h2>
<h3>2.1 Information You Provide</h3>
<ul>
  <li><strong>Account Information:</strong> Name, email address, phone number, business information</li>
  <li><strong>Business Data:</strong> Restaurant name, address, menu items, prices, images</li>
  <li><strong>Payment Information:</strong> Billing details (processed securely through third-party providers)</li>
</ul>

<h3>2.2 Automatically Collected Information</h3>
<ul>
  <li><strong>Usage Data:</strong> QR code scans, menu views, interaction patterns</li>
  <li><strong>Device Information:</strong> Device type, browser, IP address</li>
  <li><strong>Cookies and Tracking:</strong> Cookies, web beacons, and similar technologies</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use the collected information to:</p>
<ul>
  <li>Provide, maintain, and improve our services</li>
  <li>Process transactions and manage subscriptions</li>
  <li>Send administrative information and updates</li>
  <li>Respond to inquiries and provide customer support</li>
  <li>Analyze usage patterns and improve user experience</li>
  <li>Comply with legal obligations</li>
</ul>

<h2>4. Data Security</h2>
<p>We implement appropriate security measures including SSL/TLS encryption, encrypted storage, and access controls to protect your information.</p>

<h2>5. Your Rights</h2>
<p>You have the right to access, correct, delete, or restrict processing of your personal information. To exercise these rights, please contact us.</p>

<h2>6. Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at privacy@scanbit.com</p>`,
                      "terms-conditions": `<h1>Terms and Conditions</h1>
<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

<h2>1. Agreement to Terms</h2>
<p>By accessing or using ScanBit's services, you agree to be bound by these Terms and Conditions. If you do not agree, you may not use our services.</p>

<h2>2. Use of Services</h2>
<h3>2.1 Permitted Use</h3>
<p>You may use our Services for lawful business purposes in accordance with these Terms.</p>

<h3>2.2 Prohibited Activities</h3>
<p>You agree not to:</p>
<ul>
  <li>Use the Services for any illegal purpose</li>
  <li>Violate any laws or regulations</li>
  <li>Infringe upon intellectual property rights</li>
  <li>Upload malicious code or harmful content</li>
</ul>

<h2>3. Payment Terms</h2>
<p>Our Services are offered on a subscription basis. Fees are charged at the beginning of each billing cycle and are non-refundable except as required by law.</p>

<h2>4. Limitation of Liability</h2>
<p>To the maximum extent permitted by law, ScanBit shall not be liable for any indirect, incidental, or consequential damages.</p>

<h2>5. Contact Information</h2>
<p>For questions about these Terms, contact us at legal@scanbit.com</p>`,
                    };
                    if (templates[formData.type]) {
                      setFormData({ ...formData, content: templates[formData.type] });
                      toast.success("Professional template loaded!");
                    } else {
                      toast.info("No template available for this document type");
                    }
                  }}
                >
                  Load Professional Template
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter the full legal document content (HTML supported)"
                rows={20}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                You can use HTML formatting. Click "Load Professional Template" to start with an industry-standard template.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.filter(l => l.value !== "all").map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isDefault">Set as Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresAcceptance"
                  checked={formData.requiresAcceptance}
                  onChange={(e) => setFormData({ ...formData, requiresAcceptance: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="requiresAcceptance">Requires User Acceptance</Label>
              </div>
            </div>
            {formData.requiresAcceptance && (
              <div className="space-y-2">
                <Label>Acceptance Required For</Label>
                <div className="flex flex-wrap gap-2">
                  {["signup", "checkout", "download", "all"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.acceptanceRequiredFor.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              acceptanceRequiredFor: [...formData.acceptanceRequiredFor, option],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              acceptanceRequiredFor: formData.acceptanceRequiredFor.filter((a) => a !== option),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {editingDocument && (
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDialog(false);
                  setDeleteDialog(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingDocument ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.shortDescription || "Legal Document"}
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getTypeBadgeColor(selectedDocument.type)}>
                  {getTypeLabel(selectedDocument.type)}
                </Badge>
                <Badge variant="outline" className="uppercase">
                  {selectedDocument.language}
                </Badge>
                <div className="text-sm text-slate-500">
                  Version {selectedDocument.version} • Effective {format(new Date(selectedDocument.effectiveDate), "MMM d, yyyy")}
                </div>
              </div>
              <div className="prose max-w-none border-t pt-4">
                <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: selectedDocument.content }} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(false)}>Close</Button>
            {selectedDocument && (
              <Button onClick={() => handleCopyLink(selectedDocument)}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document "{editingDocument?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
