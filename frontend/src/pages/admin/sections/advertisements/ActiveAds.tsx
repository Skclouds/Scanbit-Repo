import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Activity, RefreshCw, Eye, Pause, BarChart3, Edit, Trash2, Copy, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ActiveAds() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await api.getAdvertisements({ status: "active" });
      if (response.success && response.data) {
        setAds(response.data);
      }
    } catch (error) {

      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handlePauseAd = async (adId: string) => {
    try {
      await api.updateAdvertisementStatus(adId, "paused");
      toast.success("Advertisement paused successfully");
      fetchAds();
    } catch (error) {
      toast.error("Failed to pause advertisement");
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

  const filteredAds = ads.filter(ad =>
    ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.campaignName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.analytics?.impressions ?? ad.impressions ?? 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.analytics?.clicks ?? ad.clicks ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Active Campaigns</h2>
            <p className="text-slate-600 mt-1">Monitor currently running ad campaigns</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAds}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Campaigns</p>
                <p className="text-3xl font-bold mt-2 text-green-900">{ads.length}</p>
              </div>
              <Activity className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Impressions</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">
                  {totalImpressions >= 1000 ? `${(totalImpressions / 1000).toFixed(1)}K` : totalImpressions}
                </p>
              </div>
              <Eye className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Clicks</p>
                <p className="text-3xl font-bold mt-2 text-purple-900">
                  {totalClicks >= 1000 ? `${(totalClicks / 1000).toFixed(1)}K` : totalClicks}
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Active Campaigns</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search ads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
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
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active campaigns</h3>
              <p className="text-gray-600">Create your first ad campaign to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad) => {
                  const impressions = ad.analytics?.impressions ?? ad.impressions ?? 0;
                  const clicks = ad.analytics?.clicks ?? ad.clicks ?? 0;
                  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
                  return (
                    <TableRow key={ad._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ad.title || ad.campaignName}</p>
                          <p className="text-xs text-gray-500">{ad.headline || ad.description?.substring(0, 50) || ''}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ad.adType?.replace(/-/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>{impressions.toLocaleString()}</TableCell>
                      <TableCell>{clicks.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{ctr}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" title="Edit" onClick={() => setSearchParams({ activeTab: 'ads-create', editId: ad._id })}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="View Analytics">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Pause" onClick={() => handlePauseAd(ad._id)}>
                            <Pause className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Duplicate" onClick={() => handleDuplicateAd(ad._id)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete" onClick={() => { setSelectedAd(ad); setDeleteDialogOpen(true); }}>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAd?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAd} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
