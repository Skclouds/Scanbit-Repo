import { useState, useEffect } from "react";
import { MdCampaign, MdAdd, MdEdit, MdDelete, MdVisibility, MdVisibilityOff, MdSchedule, MdTrendingUp, MdImage, MdLocalOffer, MdAnnouncement } from "react-icons/md";
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiCheckCircle, FiClock, FiTarget, FiBarChart2 } from "react-icons/fi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";

interface Advertisement {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  type: 'banner' | 'popup' | 'announcement' | 'promotion';
  image?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  displayOn: ('menu' | 'checkout' | 'thank-you')[];
  impressions: number;
  clicks: number;
  position?: 'top' | 'bottom' | 'popup';
}

interface AdvertisementsProps {
  restaurant: any;
}

const AD_TYPES = [
  { id: 'banner', name: 'Banner Ad', icon: MdImage, description: 'Display at top or bottom of menu', color: 'blue' },
  { id: 'popup', name: 'Popup Modal', icon: MdAnnouncement, description: 'Show on page load or exit', color: 'purple' },
  { id: 'announcement', name: 'Announcement Bar', icon: MdCampaign, description: 'Sticky bar announcement', color: 'orange' },
  { id: 'promotion', name: 'Promotion Card', icon: MdLocalOffer, description: 'Special offers & discounts', color: 'green' },
];

export const Advertisements = ({ restaurant }: AdvertisementsProps) => {
  // Start with empty array - only show real data from database
  const [ads, setAds] = useState<Advertisement[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('banner');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'banner' as Advertisement['type'],
    link: '',
    startDate: '',
    endDate: '',
    isActive: true,
    displayOn: ['menu'] as Advertisement['displayOn'],
    position: 'top' as 'top' | 'bottom' | 'popup',
  });

  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const activeAds = ads.filter(ad => ad.isActive).length;

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'banner',
      link: '',
      startDate: '',
      endDate: '',
      isActive: true,
      displayOn: ['menu'],
      position: 'top',
    });
    setSelectedType('banner');
  };

  const handleCreateAd = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter an advertisement title');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const newAd: Advertisement = {
        id: Date.now().toString(),
        ...formData,
        impressions: 0,
        clicks: 0,
      };
      
      setAds([...ads, newAd]);
      
      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <FiCheckCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-800">Advertisement Created!</p>
            <p className="text-sm text-green-600">{formData.title} is now {formData.isActive ? 'live' : 'saved as draft'}</p>
          </div>
        </div>,
        { duration: 4000 }
      );
      
      resetForm();
      setIsCreating(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAd = async () => {
    if (!editingAd || !formData.title.trim()) {
      toast.error('Please enter an advertisement title');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updatedAds = ads.map(ad => 
        (ad._id || ad.id) === (editingAd._id || editingAd.id)
          ? { ...ad, ...formData }
          : ad
      );
      setAds(updatedAds);
      
      toast.success('Advertisement updated successfully!');
      resetForm();
      setEditingAd(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!deletingAdId) return;

    try {
      setIsSubmitting(true);
      setAds(ads.filter(ad => (ad._id || ad.id) !== deletingAdId));
      toast.success('Advertisement deleted successfully!');
      setDeletingAdId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdStatus = (adId: string) => {
    const updatedAds = ads.map(ad => 
      (ad._id || ad.id) === adId ? { ...ad, isActive: !ad.isActive } : ad
    );
    setAds(updatedAds);
    
    const ad = ads.find(a => (a._id || a.id) === adId);
    toast.success(ad?.isActive ? 'Advertisement paused' : 'Advertisement activated');
  };

  const openEditDialog = (ad: Advertisement) => {
    setFormData({
      title: ad.title,
      description: ad.description || '',
      type: ad.type,
      link: ad.link || '',
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      isActive: ad.isActive,
      displayOn: ad.displayOn,
      position: ad.position || 'top',
    });
    setSelectedType(ad.type);
    setEditingAd(ad);
  };

  const getTypeConfig = (type: string) => AD_TYPES.find(t => t.id === type) || AD_TYPES[0];

  return (
    <div className="space-y-6 mt-20">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white">
              <MdCampaign className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Advertisements</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage promotional content for your QR menu pages
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <FiPlus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MdCampaign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold">{ads.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Ads</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold">{activeAds}</span>
          </div>
          <p className="text-sm text-muted-foreground">Active Ads</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FiEye className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-bold">{totalImpressions.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Impressions</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <FiTarget className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-2xl font-bold">{totalClicks.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Clicks</p>
        </div>
      </div>

      {/* Ads List */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Your Advertisements</h2>
        
        {ads.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <MdCampaign className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">No advertisements yet</h3>
            <p className="text-muted-foreground mb-6">Create your first ad to promote offers on your menu pages</p>
            <Button onClick={() => setIsCreating(true)}>
              <FiPlus className="w-4 h-4 mr-2" />
              Create First Ad
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => {
              const typeConfig = getTypeConfig(ad.type);
              const TypeIcon = typeConfig.icon;
              const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0';
              
              return (
                <div 
                  key={ad._id || ad.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    ad.isActive 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-border bg-secondary/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${typeConfig.color}-100 flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className={`w-6 h-6 text-${typeConfig.color}-600`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{ad.title}</h3>
                        <Badge variant={ad.isActive ? 'default' : 'secondary'} className="text-xs">
                          {ad.isActive ? 'Active' : 'Paused'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {typeConfig.name}
                        </Badge>
                      </div>
                      {ad.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{ad.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FiEye className="w-3 h-3" />
                          {ad.impressions.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1">
                          <FiTarget className="w-3 h-3" />
                          {ad.clicks} clicks
                        </span>
                        <span className="flex items-center gap-1">
                          <FiBarChart2 className="w-3 h-3" />
                          {ctr}% CTR
                        </span>
                        <span className="flex items-center gap-1">
                          Displays on: {ad.displayOn.join(', ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ad.isActive}
                        onCheckedChange={() => toggleAdStatus(ad._id || ad.id || '')}
                      />
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(ad)}>
                        <FiEdit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingAdId(ad._id || ad.id || '')}>
                        <FiTrash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editingAd} onOpenChange={(open) => { 
        if (!open) { resetForm(); setIsCreating(false); setEditingAd(null); } 
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Create Advertisement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Ad Type Selection */}
            <div>
              <Label className="mb-3 block">Advertisement Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {AD_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        setFormData({ ...formData, type: type.id as any });
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedType === type.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 text-${type.color}-600 mb-1`} />
                      <p className="font-medium text-sm">{type.name}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Sale - 20% Off"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the offer"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Link URL (optional)</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Display On</Label>
              <div className="flex flex-wrap gap-2">
                {['menu', 'checkout', 'thank-you'].map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      const newDisplayOn = formData.displayOn.includes(page as any)
                        ? formData.displayOn.filter(p => p !== page)
                        : [...formData.displayOn, page as any];
                      setFormData({ ...formData, displayOn: newDisplayOn });
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                      formData.displayOn.includes(page as any)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {(selectedType === 'banner' || selectedType === 'announcement') && (
              <div>
                <Label className="mb-2 block">Position</Label>
                <div className="flex gap-2">
                  {['top', 'bottom'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setFormData({ ...formData, position: pos as any })}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-all ${
                        formData.position === pos
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Start showing this ad immediately</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => { resetForm(); setIsCreating(false); setEditingAd(null); }} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={editingAd ? handleUpdateAd : handleCreateAd} 
                disabled={isSubmitting} 
                className="flex-1"
              >
                {isSubmitting ? 'Saving...' : editingAd ? 'Update Ad' : 'Create Ad'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingAdId} onOpenChange={(open) => !open && setDeletingAdId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Advertisement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this advertisement? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingAdId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAd} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Advertisements;
