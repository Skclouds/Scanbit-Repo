import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  History,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Send,
  Users,
  Building2,
  List,
  Calendar,
  User,
  Paperclip,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface EmailLog {
  _id: string;
  subject: string;
  recipientType: string;
  filters?: { role?: string; businessCategory?: string; subscriptionStatus?: string };
  total: number;
  sent: number;
  failed: number;
  failedEmails?: string[];
  attachmentCount?: number;
  sentBy?: { name?: string; email?: string };
  createdAt: string;
}

const RECIPIENT_LABELS: Record<string, string> = {
  all: "All Users & Businesses",
  users: "Users Only",
  businesses: "Businesses Only",
  custom: "Custom List",
};

function RecipientIcon({ type }: { type: string }) {
  switch (type) {
    case "users":
      return <Users className="w-4 h-4" />;
    case "businesses":
      return <Building2 className="w-4 h-4" />;
    case "custom":
      return <List className="w-4 h-4" />;
    default:
      return <Send className="w-4 h-4" />;
  }
}

export default function EmailHistory() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.getEmailHistory({
        page,
        limit,
        search: searchInput.trim() || undefined,
      });

      if (response.success) {
        setLogs(response.data || []);
        setTotal(response.pagination?.total || 0);
      }
    } catch (error) {
      toast.error("Failed to load email history");
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, search]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const totalSent = logs.reduce((sum, l) => sum + l.sent, 0);
  const totalFailed = logs.reduce((sum, l) => sum + l.failed, 0);
  const totalEmails = logs.reduce((sum, l) => sum + l.total, 0);
  const successRate = totalEmails > 0 ? Math.round((totalSent / totalEmails) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Email History</h2>
            <p className="text-slate-600 mt-1">View sent bulk email campaigns and delivery status</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchHistory} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Campaigns</p>
                <p className="text-2xl font-bold mt-1">{total}</p>
              </div>
              <History className="w-10 h-10 text-slate-400 opacity-30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Emails Delivered</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{totalSent.toLocaleString()}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Failed</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">{totalFailed.toLocaleString()}</p>
              </div>
              <XCircle className="w-10 h-10 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Success Rate</p>
                <p className="text-2xl font-bold mt-1">{successRate}%</p>
              </div>
              <Send className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </CardTitle>
          <CardDescription>Find campaigns by subject line</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by subject..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Campaigns</CardTitle>
          <CardDescription>
            {total > 0
              ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} campaigns`
              : "No email campaigns yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No email history yet</h3>
              <p className="text-slate-500 max-w-sm">
                Sent bulk emails will appear here. Use the Bulk Emails section to send your first campaign.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Recipients</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Delivery</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Sent By</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 line-clamp-2">{log.subject}</span>
                          {log.attachmentCount && log.attachmentCount > 0 && (
                            <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" title={`${log.attachmentCount} attachment(s)`} />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs font-normal">
                            <RecipientIcon type={log.recipientType} />
                            <span className="ml-1">{RECIPIENT_LABELS[log.recipientType] || log.recipientType}</span>
                          </Badge>
                          {log.filters && (log.filters.role || log.filters.businessCategory || log.filters.subscriptionStatus) && (
                            <span className="text-xs text-slate-500">
                              {[log.filters.role, log.filters.businessCategory, log.filters.subscriptionStatus].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{log.total}</span>
                        <span className="text-slate-500 text-sm ml-1">recipients</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {log.sent}
                          </Badge>
                          {log.failed > 0 && (
                            <Badge className="bg-amber-100 text-amber-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              {log.failed}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {log.sentBy?.name || log.sentBy?.email || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
