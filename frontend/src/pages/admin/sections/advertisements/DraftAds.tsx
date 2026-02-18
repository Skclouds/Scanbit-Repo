import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, RefreshCw, Edit, Trash2, Copy, Search, Send, 
  Calendar, Eye, Clock
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DraftAds() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await api.getAdvertisements({ status: "draft" });
      if (response.success && response.data) {
        setAds(response.data);
      }
    } catch (error) {

      toast.error("Failed to load draft advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAd = async () => {
    if (!selectedAd) return;
    try {
      // Check if ad has valid dates
      const now = new Date();
      const startDate = selectedAd.startDate ? new Date(selectedAd.startDate) : null;
      const endDate = selectedAd.endDate ? new Date(selectedAd.endDate) : null;

      // If start date is in the future, set status to scheduled, otherwise active
      let status = "active";
      if (startDate && startDate > now) {
        status = "scheduled";
      } else if (!startDate || !endDate) {
        // If no dates set, activate immediately
        status = "active";
      }

      await api.updateAdvertisementStatus(selectedAd._id, status);
      toast.success(`Advertisement ${status === "scheduled" ? "scheduled" : "published"} successfully`);
      setPublishDialogOpen(false);
      setSelectedAd(null);
      fetchAds();
    } catch (error) {
      toast.error("Failed to publish advertisement");
    }
  };

  const handleDeleteAd = async () => {
    if (!selectedAd) return;
    try {
      await api.deleteAdvertisement(selectedAd._id);
      toast.success("Advertisement deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedAd(null);
      fetchAds();
    } catch (error) {
      toast.error("Failed to delete advertisement");
    }
  };

  const handleDuplicateAd = async (adId: string) => {
    try {
      await api.duplicateAdvertisement(adId);
      toast.success("Advertisement duplicated successfully");
      fetchAds();
    } catch (error) {
      toast.error("Failed to duplicate advertisement");
    }
  };

  const handleEditAd = (ad: any) => {
    setSearchParams({ activeTab: 'ads-create', editId: ad._id });
  };

  const filteredAds = ads.filter(ad =>
    ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.campaignName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by most recently created
  const sortedAds = [...filteredAds].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getAdStatus = (ad: any) => {
    if (!ad.startDate || !ad.endDate) {
      return { text: "Incomplete", color: "bg-yellow-100 text-yellow-800" };
    }
    const now = new Date();
    const startDate = new Date(ad.startDate);
    const endDate = new Date(ad.endDate);
    
    if (startDate > now) {
      return { text: "Ready to Schedule", color: "bg-blue-100 text-blue-800" };
    } else if (endDate < now) {
      return { text: "Expired Dates", color: "bg-red-100 text-red-800" };
    } else {
      return { text: "Ready to Publish", color: "bg-green-100 text-green-800" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Draft Ads</h2>
            <p className="text-slate-600 mt-1">View and manage draft ad campaigns</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAds}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Drafts</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{ads.length}</p>
              </div>
              <FileText className="w-10 h-10 text-gray-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Ready to Publish</p>
                <p className="text-3xl font-bold mt-2 text-green-900">
                  {ads.filter(ad => {
                    const status = getAdStatus(ad);
                    return status.text === "Ready to Publish" || status.text === "Ready to Schedule";
                  }).length}
                </p>
              </div>
              <Send className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Incomplete</p>
                <p className="text-3xl font-bold mt-2 text-yellow-900">
                  {ads.filter(ad => getAdStatus(ad).text === "Incomplete").length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Draft Campaigns</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search drafts..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : sortedAds.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No draft campaigns</h3>
              <p className="text-gray-600">Create your first ad campaign to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAds.map((ad) => {
                  const status = getAdStatus(ad);
                  
                  return (
                    <TableRow key={ad._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ad.title || ad.campaignName}</p>
                          <p className="text-xs text-gray-500">{ad.headline?.substring(0, 50)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {ad.adType?.replace(/-/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(ad.createdAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ad.startDate && ad.endDate ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {format(new Date(ad.startDate), "MMM dd")} - {format(new Date(ad.endDate), "MMM dd")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Edit"
                            onClick={() => handleEditAd(ad)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Publish"
                            onClick={() => {
                              setSelectedAd(ad);
                              setPublishDialogOpen(true);
                            }}
                            disabled={status.text === "Incomplete" || status.text === "Expired Dates"}
                          >
                            <Send className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Duplicate"
                            onClick={() => handleDuplicateAd(ad._id)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Delete"
                            onClick={() => {
                              setSelectedAd(ad);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Publish Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Advertisement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish "{selectedAd?.title}"?
              <br />
              <br />
              {selectedAd?.startDate && new Date(selectedAd.startDate) > new Date() ? (
                <>
                  This ad will be <strong>scheduled</strong> to start on{" "}
                  {format(new Date(selectedAd.startDate), "MMM dd, yyyy HH:mm")}.
                </>
              ) : (
                <>
                  This ad will be <strong>activated immediately</strong> and start running now.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishAd} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft Advertisement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAd?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAd} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
