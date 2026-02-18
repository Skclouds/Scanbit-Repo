import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pause, RefreshCw, Play, Trash2, Copy, Search, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { toast } from "sonner";

export default function PausedAds() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await api.getAdvertisements({ status: "paused" });
      if (response.success && response.data) {
        setAds(response.data);
      }
    } catch (error) {
      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeAd = async (adId: string) => {
    try {
      await api.updateAdvertisementStatus(adId, "active");
      toast.success("Advertisement resumed successfully");
      fetchAds();
    } catch (error) {
      toast.error("Failed to resume advertisement");
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      await api.deleteAdvertisement(adId);
      toast.success("Advertisement deleted successfully");
      fetchAds();
    } catch (error) {
      toast.error("Failed to delete advertisement");
    }
  };

  const filteredAds = ads.filter(ad =>
    ad.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Pause className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Paused Ads</h2>
            <p className="text-slate-600 mt-1">View and manage paused ad campaigns</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAds}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Paused Campaigns</p>
              <p className="text-3xl font-bold mt-2 text-orange-900">{ads.length}</p>
            </div>
            <Pause className="w-10 h-10 text-orange-500 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Paused Campaigns</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search ads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-12">
              <Pause className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No paused campaigns</h3>
              <p className="text-gray-600">All your campaigns are either active or in draft</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Paused Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad) => (
                  <TableRow key={ad._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ad.title}</p>
                        <p className="text-xs text-gray-500">{ad.description?.substring(0, 50)}...</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{ad.adType?.replace(/-/g, ' ')}</Badge></TableCell>
                    <TableCell>{new Date(ad.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell><Badge className="bg-orange-100 text-orange-800">Paused</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => setSearchParams({ activeTab: 'ads-create', editId: ad._id })}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Resume" onClick={() => handleResumeAd(ad._id)}>
                          <Play className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDeleteAd(ad._id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
