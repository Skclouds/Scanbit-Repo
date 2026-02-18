import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, RefreshCw, Eye, Play, Edit, Trash2, Copy, Search, Clock, 
  CalendarDays, X, CheckCircle2, AlertCircle
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { format, parseISO, isBefore, isAfter, differenceInDays, differenceInHours } from "date-fns";

export default function ScheduledAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await api.getAdvertisements({ status: "scheduled" });
      if (response.success && response.data) {
        setAds(response.data);
      }
    } catch (error) {

      toast.error("Failed to load scheduled advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (ad: any) => {
    setSelectedAd(ad);
    setEditFormData({
      startDate: ad.startDate ? format(new Date(ad.startDate), "yyyy-MM-dd'T'HH:mm") : "",
      endDate: ad.endDate ? format(new Date(ad.endDate), "yyyy-MM-dd'T'HH:mm") : "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!selectedAd) return;
    try {
      await api.updateAdvertisement(selectedAd._id, {
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
      });
      toast.success("Schedule updated successfully");
      setEditDialogOpen(false);
      setSelectedAd(null);
      fetchAds();
    } catch (error) {
      toast.error("Failed to update schedule");
    }
  };

  const handleActivateEarly = async () => {
    if (!selectedAd) return;
    try {
      await api.updateAdvertisementStatus(selectedAd._id, "active");
      toast.success("Advertisement activated successfully");
      setActivateDialogOpen(false);
      setSelectedAd(null);
      fetchAds();
    } catch (error) {
      toast.error("Failed to activate advertisement");
    }
  };

  const handleCancelSchedule = async () => {
    if (!selectedAd) return;
    try {
      await api.updateAdvertisementStatus(selectedAd._id, "draft");
      toast.success("Schedule cancelled successfully");
      setDeleteDialogOpen(false);
      setSelectedAd(null);
      fetchAds();
    } catch (error) {
      toast.error("Failed to cancel schedule");
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

  const getTimeUntilStart = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    
    if (isBefore(start, now)) {
      return { text: "Started", status: "started" };
    }
    
    const days = differenceInDays(start, now);
    const hours = differenceInHours(start, now) % 24;
    
    if (days > 0) {
      return { text: `${days}d ${hours}h`, status: "upcoming" };
    } else {
      return { text: `${hours}h`, status: "soon" };
    }
  };

  const filteredAds = ads.filter(ad =>
    ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.campaignName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort ads by start date
  const sortedAds = [...filteredAds].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateA - dateB;
  });

  const upcomingAds = sortedAds.filter(ad => isAfter(new Date(ad.startDate), new Date()));
  const startedAds = sortedAds.filter(ad => isBefore(new Date(ad.startDate), new Date()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Scheduled Ads</h2>
            <p className="text-slate-600 mt-1">View and manage scheduled ad campaigns</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAds}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Scheduled</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">{ads.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Upcoming</p>
                <p className="text-3xl font-bold mt-2 text-green-900">{upcomingAds.length}</p>
              </div>
              <Clock className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Started (Not Active)</p>
                <p className="text-3xl font-bold mt-2 text-orange-900">{startedAds.length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Scheduled Campaigns</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search ads..." 
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
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No scheduled campaigns</h3>
              <p className="text-gray-600">Schedule your first ad campaign to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Time Until Start</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAds.map((ad) => {
                  const timeInfo = getTimeUntilStart(ad.startDate);
                  const isStarted = isBefore(new Date(ad.startDate), new Date());
                  
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
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(ad.startDate), "MMM dd, yyyy HH:mm")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(ad.endDate), "MMM dd, yyyy HH:mm")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isStarted ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Started
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {timeInfo.text}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Edit Schedule"
                            onClick={() => handleEditSchedule(ad)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!isStarted && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Activate Early"
                              onClick={() => {
                                setSelectedAd(ad);
                                setActivateDialogOpen(true);
                              }}
                            >
                              <Play className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
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
                            title="Cancel Schedule"
                            onClick={() => {
                              setSelectedAd(ad);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <X className="w-4 h-4 text-orange-600" />
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

      {/* Edit Schedule Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update the start and end dates for "{selectedAd?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={editFormData.startDate}
                onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={editFormData.endDate}
                onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Early Dialog */}
      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Advertisement Early</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate "{selectedAd?.title}" now? 
              It will start running immediately instead of waiting for the scheduled start date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivateEarly} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Activate Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel/Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Schedule / Delete Advertisement</AlertDialogTitle>
            <AlertDialogDescription>
              What would you like to do with "{selectedAd?.title}"?
              <br />
              <br />
              <strong>Cancel Schedule:</strong> Move to draft status (can be scheduled again later)
              <br />
              <strong>Delete:</strong> Permanently remove this advertisement
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Button 
              variant="outline" 
              onClick={handleCancelSchedule}
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Cancel Schedule
            </Button>
            <AlertDialogAction 
              onClick={handleDeleteAd} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
