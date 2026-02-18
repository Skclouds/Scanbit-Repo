import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Ticket, RefreshCw, Search, Filter, Eye, MessageSquare, Clock, CheckCircle2, 
  XCircle, AlertCircle, MoreVertical, Edit, Trash2, UserPlus, Tag, FileText,
  Copy, Download, Send, X, Save, Star, StarOff, UserMinus, FileDown, CheckSquare,
  Square, ArrowUpDown, Calendar, Mail, Phone, Building2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SupportTicket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  restaurant?: {
    _id: string;
    businessName: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  resolvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  tags?: string[];
  resolution?: string;
  messages?: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
      role?: string;
    };
    message: string;
    isInternal: boolean;
    attachments?: any[];
    createdAt: string;
  }>;
  satisfactionRating?: number;
  satisfactionFeedback?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Form states
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [editForm, setEditForm] = useState({ subject: "", description: "", category: "" });
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [page, limit, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    if (search) {
      const debounce = setTimeout(() => {
        fetchTickets();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      fetchTickets();
    }
  }, [search]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getSupportTickets({
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      });

      if (response.success) {
        setTickets(response.data || []);
        setTotal(response.pagination?.total || 0);
      }
    } catch (error) {

      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.getAdminUsers({ 
        limit: 100, 
        includeAdmins: true,
        role: undefined 
      });
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {

      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTickets();
    setIsRefreshing(false);
  };

  const handleViewTicket = async (ticket: SupportTicket) => {
    try {
      // Fetch full ticket details with messages
      const response = await api.getSupportTicket(ticket._id);
      if (response.success && response.data) {
        setSelectedTicket(response.data);
        setViewDialogOpen(true);
      } else {
        // Fallback to ticket from list if API fails
        setSelectedTicket(ticket);
        setViewDialogOpen(true);
      }
    } catch (error) {

      // Fallback to ticket from list
      setSelectedTicket(ticket);
      setViewDialogOpen(true);
    }
  };

  const handleReply = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyMessage("");
    setIsInternalNote(false);
    setReplyDialogOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      const response = await api.addTicketMessage(selectedTicket._id, {
        message: replyMessage,
        isInternal: isInternalNote,
      });

      if (response.success) {
        toast.success("Message added successfully");
        setReplyMessage("");
        // Update selected ticket with new data
        if (response.data) {
          setSelectedTicket(response.data);
        }
        // Refresh ticket list
        await fetchTickets();
        // Keep reply dialog open if view dialog is open, otherwise close
        if (!viewDialogOpen) {
          setReplyDialogOpen(false);
        }
      }
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to send message");
    }
  };

  const handleEdit = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setEditForm({
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTicket) return;

    if (!editForm.subject.trim() || !editForm.description.trim()) {
      toast.error("Subject and description are required");
      return;
    }

    try {
      const response = await api.updateSupportTicket(selectedTicket._id, {
        subject: editForm.subject,
        description: editForm.description,
        category: editForm.category,
      });

      if (response.success) {
        toast.success("Ticket updated successfully");
        // Update selected ticket if view dialog is open
        if (response.data && viewDialogOpen) {
          setSelectedTicket(response.data);
        }
        setEditDialogOpen(false);
        await fetchTickets();
      }
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to update ticket");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return;

    try {
      const response = await api.updateSupportTicket(selectedTicket._id, {
        status: newStatus,
      });

      if (response.success) {
        toast.success("Status updated successfully");
        // Update selected ticket if view dialog is open
        if (response.data && viewDialogOpen) {
          setSelectedTicket(response.data);
        }
        setStatusDialogOpen(false);
        setNewStatus("");
        await fetchTickets();
      }
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to update status");
    }
  };

  const handleUpdatePriority = async () => {
    if (!selectedTicket || !newPriority) return;

    try {
      const response = await api.updateSupportTicket(selectedTicket._id, {
        priority: newPriority,
      });

      if (response.success) {
        toast.success("Priority updated successfully");
        // Update selected ticket if view dialog is open
        if (response.data && viewDialogOpen) {
          setSelectedTicket(response.data);
        }
        setPriorityDialogOpen(false);
        setNewPriority("");
        await fetchTickets();
      }
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to update priority");
    }
  };

  const handleAssign = async () => {
    if (!selectedTicket) return;

    try {
      const response = await api.updateSupportTicket(selectedTicket._id, {
        assignedTo: selectedUser || null,
      });

      if (response.success) {
        toast.success(selectedUser ? "Ticket assigned successfully" : "Assignment removed");
        // Update selected ticket if view dialog is open
        if (response.data && viewDialogOpen) {
          setSelectedTicket(response.data);
        }
        setAssignDialogOpen(false);
        setSelectedUser("");
        await fetchTickets();
      }
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to assign ticket");
    }
  };

  const handleUpdateTags = async () => {
    if (!selectedTicket) return;

    try {
      const response = await api.updateSupportTicket(selectedTicket._id, {
        tags: tags,
      });

      if (response.success) {
        toast.success("Tags updated successfully");
        // Update selected ticket if view dialog is open
        if (response.data && viewDialogOpen) {
          setSelectedTicket(response.data);
        }
        setTagsDialogOpen(false);
        setTags([]);
        setTagInput("");
        await fetchTickets();
      }
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to update tags");
    }
  };

  const handleAddResolution = async () => {
    if (!selectedTicket || !resolution.trim()) {
      toast.error("Please enter a resolution");
      return;
    }

    try {
      const response = await api.updateSupportTicket(selectedTicket._id, {
        resolution: resolution,
        status: "resolved",
      });

      if (response.success) {
        toast.success("Resolution added and ticket marked as resolved");
        // Update selected ticket if view dialog is open
        if (response.data && viewDialogOpen) {
          setSelectedTicket(response.data);
        }
        setResolutionDialogOpen(false);
        setResolution("");
        await fetchTickets();
      }
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to add resolution");
    }
  };

  const handleDelete = async () => {
    if (!selectedTicket) return;

    try {
      const response = await api.deleteSupportTicket(selectedTicket._id);

      if (response.success) {
        toast.success("Ticket deleted successfully");
        setDeleteDialogOpen(false);
        setViewDialogOpen(false);
        setSelectedTicket(null);
        await fetchTickets();
      }
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to delete ticket");
    }
  };

  const handleCopyTicketNumber = (ticketNumber: string) => {
    navigator.clipboard.writeText(ticketNumber);
    toast.success("Ticket number copied to clipboard");
  };

  const handleExport = () => {
    const csv = [
      ["Ticket Number", "Subject", "Status", "Priority", "Category", "User", "Created At"],
      ...tickets.map(t => [
        t.ticketNumber,
        t.subject,
        t.status,
        t.priority,
        t.category,
        t.user?.email || "",
        format(new Date(t.createdAt), "yyyy-MM-dd HH:mm:ss")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `support-tickets-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Tickets exported successfully");
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTickets.size === 0) {
      toast.error("Please select at least one ticket");
      return;
    }

    try {
      const promises = Array.from(selectedTickets).map(async (ticketId) => {
        try {
          switch (action) {
            case "delete":
              return await api.deleteSupportTicket(ticketId);
            case "open":
              return await api.updateSupportTicket(ticketId, { status: "open" });
            case "in-progress":
              return await api.updateSupportTicket(ticketId, { status: "in-progress" });
            case "resolved":
              return await api.updateSupportTicket(ticketId, { status: "resolved" });
            case "closed":
              return await api.updateSupportTicket(ticketId, { status: "closed" });
            default:
              return { success: true };
          }
        } catch (error) {

          return { success: false, error };
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r?.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        toast.success(`Successfully ${action} ${successCount} ticket(s)`);
      } else {
        toast.warning(`${action} completed: ${successCount} succeeded, ${failCount} failed`);
      }

      setSelectedTickets(new Set());
      await fetchTickets();
    } catch (error: any) {

      toast.error(error?.response?.data?.message || error?.message || "Failed to perform bulk action");
    }
  };

  const toggleSelectTicket = (ticketId: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTickets.size === tickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(tickets.map(t => t._id)));
    }
  };

  const getStatusBadge = (status: string) => {
    // Handle both "in-progress" and "in_progress" for compatibility
    const normalizedStatus = status === "in_progress" ? "in-progress" : status;
    
    switch (normalizedStatus) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Open</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Closed</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const totalPages = Math.ceil(total / limit);
  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in-progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-slate-600 mt-2">Manage and resolve customer support requests</p>
        </div>
        <div className="flex gap-2">
          {selectedTickets.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Bulk Actions ({selectedTickets.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction("open")}>
                  Mark as Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("in-progress")}>
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("resolved")}>
                  Mark as Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("closed")}>
                  Mark as Closed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Tickets</p>
                <p className="text-3xl font-bold mt-2">{total}</p>
              </div>
              <Ticket className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Open</p>
                <p className="text-3xl font-bold mt-2 text-blue-600">{openCount}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-3xl font-bold mt-2 text-yellow-600">{inProgressCount}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Resolved</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{resolvedCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value) => {
              setPriorityFilter(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="feature-request">Feature Request</SelectItem>
                <SelectItem value="bug-report">Bug Report</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tickets List</CardTitle>
              <CardDescription>
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} tickets
              </CardDescription>
            </div>
            <Select value={String(limit)} onValueChange={(value) => {
              setLimit(parseInt(value));
              setPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ticket className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No tickets found</p>
              <p className="text-slate-500 text-sm">No support tickets match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-left w-12">
                      <Checkbox
                        checked={selectedTickets.size === tickets.length && tickets.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Ticket #</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Priority</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Assigned To</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Created</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedTickets.has(ticket._id)}
                          onCheckedChange={() => toggleSelectTicket(ticket._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-600">{ticket.ticketNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyTicketNumber(ticket.ticketNumber)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{ticket.subject}</p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{ticket.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{ticket.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{ticket.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{ticket.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-4 py-3">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">{ticket.category || 'General'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback>{ticket.assignedTo.name?.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-600">{ticket.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">
                          {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                        </span>
                        <p className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewTicket(ticket)} className="cursor-pointer gap-2">
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReply(ticket)} className="cursor-pointer gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Reply / Add Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setSelectedTicket(ticket);
                              setNewStatus(ticket.status);
                              setStatusDialogOpen(true);
                            }} className="cursor-pointer gap-2">
                              <ArrowUpDown className="w-4 h-4" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTicket(ticket);
                              setNewPriority(ticket.priority);
                              setPriorityDialogOpen(true);
                            }} className="cursor-pointer gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Change Priority
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTicket(ticket);
                              setSelectedUser(ticket.assignedTo?._id || "");
                              fetchUsers();
                              setAssignDialogOpen(true);
                            }} className="cursor-pointer gap-2">
                              {ticket.assignedTo ? (
                                <>
                                  <UserMinus className="w-4 h-4" />
                                  Reassign / Unassign
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4" />
                                  Assign to User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(ticket)} className="cursor-pointer gap-2">
                              <Edit className="w-4 h-4" />
                              Edit Ticket
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTicket(ticket);
                              setTags(ticket.tags || []);
                              setTagsDialogOpen(true);
                            }} className="cursor-pointer gap-2">
                              <Tag className="w-4 h-4" />
                              Manage Tags
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTicket(ticket);
                              setResolution(ticket.resolution || "");
                              setResolutionDialogOpen(true);
                            }} className="cursor-pointer gap-2">
                              <FileText className="w-4 h-4" />
                              Add Resolution
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setDeleteDialogOpen(true);
                              }} 
                              className="cursor-pointer gap-2 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => {
        setViewDialogOpen(open);
        // Refresh ticket when dialog opens
        if (open && selectedTicket) {
          api.getSupportTicket(selectedTicket._id)
            .then(response => {
              if (response.success && response.data) {
                setSelectedTicket(response.data);
              }
            })
            .catch(error => {

            });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Ticket Details
            </DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Category</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">{selectedTicket.category}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Created</Label>
                  <div className="mt-1 text-sm text-slate-600">
                    {format(new Date(selectedTicket.createdAt), "PPpp")}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Subject</Label>
                <p className="mt-1 font-medium">{selectedTicket.subject}</p>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Description</Label>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {selectedTicket.user && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-slate-500 mb-2 block">User Information</Label>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{selectedTicket.user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedTicket.user.name}</p>
                      <p className="text-sm text-slate-600">{selectedTicket.user.email}</p>
                      {selectedTicket.user.phone && (
                        <p className="text-sm text-slate-600">{selectedTicket.user.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedTicket.assignedTo && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-slate-500 mb-2 block">Assigned To</Label>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{selectedTicket.assignedTo.name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedTicket.assignedTo.name}</p>
                      <p className="text-sm text-slate-600">{selectedTicket.assignedTo.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-slate-500 mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTicket.resolution && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-slate-500 mb-2 block">Resolution</Label>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-green-50 p-3 rounded">{selectedTicket.resolution}</p>
                </div>
              )}

              {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-slate-500 mb-2 block">Messages ({selectedTicket.messages.length})</Label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedTicket.messages.map((msg) => (
                      <div key={msg._id} className={`p-3 rounded ${msg.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{msg.user.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{msg.user.name}</span>
                            {msg.isInternal && (
                              <Badge variant="outline" className="text-xs">Internal Note</Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={async () => {
                if (selectedTicket) {
                  try {
                    const response = await api.getSupportTicket(selectedTicket._id);
                    if (response.success && response.data) {
                      setSelectedTicket(response.data);
                      toast.success("Ticket refreshed");
                    }
                  } catch (error) {

                  }
                }
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            {selectedTicket && (
              <Button onClick={() => {
                handleReply(selectedTicket);
              }}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Reply
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber} - {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Enter your message..."
                rows={6}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="internal"
                checked={isInternalNote}
                onCheckedChange={(checked) => setIsInternalNote(checked as boolean)}
              />
              <Label htmlFor="internal" className="text-sm font-normal cursor-pointer">
                Mark as internal note (not visible to customer)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReply} disabled={!replyMessage.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={6}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="feature-request">Feature Request</SelectItem>
                  <SelectItem value="bug-report">Bug Report</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Priority Dialog */}
      <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Priority</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newPriority} onValueChange={setNewPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriorityDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePriority} disabled={!newPriority}>
              Update Priority
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {loadingUsers ? (
              <div className="flex justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user to assign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassign</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>
              <UserPlus className="w-4 h-4 mr-2" />
              {selectedUser ? "Assign" : "Unassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Dialog */}
      <Dialog open={tagsDialogOpen} onOpenChange={setTagsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    if (!tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()]);
                    }
                    setTagInput("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                    setTags([...tags, tagInput.trim()]);
                    setTagInput("");
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTags}>
              <Save className="w-4 h-4 mr-2" />
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog open={resolutionDialogOpen} onOpenChange={setResolutionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Resolution</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber} - This will mark the ticket as resolved
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter resolution details..."
              rows={6}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolutionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddResolution} disabled={!resolution.trim()}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Add Resolution & Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete ticket {selectedTicket?.ticketNumber}.
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
