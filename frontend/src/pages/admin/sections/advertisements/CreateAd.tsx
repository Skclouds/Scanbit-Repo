import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Image as ImageIcon, Calendar, Target, Eye, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

const emptyFormData = {
  title: "",
  campaignName: "",
  headline: "",
  subHeadline: "",
  description: "",
  adType: "header-banner",
  status: "draft" as "draft" | "active" | "paused" | "scheduled",
  priority: "medium" as "high" | "medium" | "low",
  image: "",
  ctaButtonText: "Learn More",
  ctaButtonLink: "",
  ctaType: "internal" as "internal" | "external" | "whatsapp" | "payment" | "contact",
  backgroundColor: "#3b82f6",
  textColor: "#ffffff",
  pageTargeting: [] as string[],
  businessCategoryTargeting: ["all"] as string[],
  startDate: "",
  endDate: "",
  timezone: "Asia/Kolkata",
  schedulingRules: {
    showOnlyOnWeekends: false,
    showXTimesPerUser: null as number | null,
    showOncePerSession: false,
    delaySeconds: 0,
    scrollTriggerPercent: null as number | null,
  },
  displaySettings: {
    position: "top",
    showOnMobile: true,
    showOnDesktop: true,
    closeable: true,
    dismissible: true,
  },
};

export default function CreateAd() {
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("editId");
  const [loading, setLoading] = useState(false);
  const [loadingAd, setLoadingAd] = useState(!!editId);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (!editId) return;
    const loadAd = async () => {
      setLoadingAd(true);
      try {
        const response = await api.getAdvertisement(editId);
        if (response.success && response.data) {
          const ad = response.data;
          const start = ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 16) : "";
          const end = ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 16) : "";
          setFormData({
            title: ad.title || "",
            campaignName: ad.campaignName || "",
            headline: ad.headline || "",
            subHeadline: ad.subHeadline || "",
            description: ad.description || "",
            adType: ad.adType || "header-banner",
            status: ad.status || "draft",
            priority: ad.priority || "medium",
            image: ad.image || "",
            ctaButtonText: ad.ctaButtonText || "Learn More",
            ctaButtonLink: ad.ctaButtonLink || "",
            ctaType: ad.ctaType || "internal",
            backgroundColor: ad.backgroundColor || "#3b82f6",
            textColor: ad.textColor || "#ffffff",
            pageTargeting: Array.isArray(ad.pageTargeting) ? ad.pageTargeting : [],
            businessCategoryTargeting: Array.isArray(ad.businessCategoryTargeting) ? ad.businessCategoryTargeting : ["all"],
            startDate: start,
            endDate: end,
            timezone: ad.timezone || "Asia/Kolkata",
            schedulingRules: {
              showOnlyOnWeekends: ad.schedulingRules?.showOnlyOnWeekends ?? false,
              showXTimesPerUser: ad.schedulingRules?.showXTimesPerUser ?? null,
              showOncePerSession: ad.schedulingRules?.showOncePerSession ?? false,
              delaySeconds: ad.schedulingRules?.delaySeconds ?? 0,
              scrollTriggerPercent: ad.schedulingRules?.scrollTriggerPercent ?? null,
            },
            displaySettings: {
              position: ad.displaySettings?.position || "top",
              showOnMobile: ad.displaySettings?.showOnMobile ?? true,
              showOnDesktop: ad.displaySettings?.showOnDesktop ?? true,
              closeable: ad.displaySettings?.closeable ?? true,
              dismissible: ad.displaySettings?.dismissible ?? true,
            },
          });
          if (ad.image) setImagePreview(ad.image);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load advertisement");
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete("editId");
          return next;
        });
      } finally {
        setLoadingAd(false);
      }
    };
    loadAd();
  }, [editId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setLoading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);
      formDataUpload.append("folder", "advertisements");

      const response = await api.uploadImage(formDataUpload);
      if (response.success && response.data?.url) {
        setFormData(prev => ({ ...prev, image: response.data.url }));
        setImagePreview(response.data.url);
        toast.success("Image uploaded successfully");
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error: any) {

      toast.error(error.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.campaignName || !formData.headline || !formData.ctaButtonLink) {
      toast.error("Please fill in all required fields: Title, Campaign Name, Headline, and CTA Link");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (formData.pageTargeting.length === 0) {
      toast.error("Please select at least one page for targeting");
      return;
    }

    try {
      setLoading(true);

      const startDate = new Date(formData.startDate).toISOString();
      const endDate = new Date(formData.endDate).toISOString();
      const payload = { ...formData, startDate, endDate };

      if (editId) {
        const response = await api.updateAdvertisement(editId, payload);
        if (response.success) {
          toast.success("Advertisement updated successfully!");
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("editId");
            return next;
          });
          setFormData(emptyFormData);
          setImagePreview("");
        }
      } else {
        const response = await api.createAdvertisement(payload);
        if (response.success) {
          toast.success("Advertisement created successfully!");
          setFormData(emptyFormData);
          setImagePreview("");
        }
      }
    } catch (error: any) {
      toast.error(error.message || (editId ? "Failed to update advertisement" : "Failed to create advertisement"));
    } finally {
      setLoading(false);
    }
  };

  const togglePageTargeting = (page: string) => {
    setFormData(prev => ({
      ...prev,
      pageTargeting: prev.pageTargeting.includes(page)
        ? prev.pageTargeting.filter(p => p !== page)
        : [...prev.pageTargeting, page]
    }));
  };

  const pages = ['home', 'menu', 'product-listing', 'product-detail', 'cart', 'checkout', 'portfolio', 'contact'];

  if (loadingAd) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-24">
          <div className="animate-pulse text-slate-500">Loading advertisement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {editId ? "Edit Advertisement" : "Create Advertisement"}
          </h2>
          <p className="text-slate-600 mt-1">
            {editId ? "Update your ad campaign" : "Create new ad campaigns and promotions"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ad Title * (Unique identifier for the ad)</Label>
                <Input 
                  placeholder="e.g., New Year Sale Banner" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label>Campaign Name * (Campaign identifier)</Label>
                <Input 
                  placeholder="e.g., New Year 2026 Campaign" 
                  value={formData.campaignName} 
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label>Headline * (Main headline shown in ad)</Label>
                <Input 
                  placeholder="e.g., 🎉 Get 50% Off on All Plans!" 
                  value={formData.headline} 
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label>Sub Headline (Optional secondary text)</Label>
                <Input 
                  placeholder="e.g., Limited Time Offer" 
                  value={formData.subHeadline} 
                  onChange={(e) => setFormData({ ...formData, subHeadline: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Additional description text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  rows={3} 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Ad Type</Label>
                  <Select value={formData.adType} onValueChange={(value) => setFormData({ ...formData, adType: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header-banner">Header Banner</SelectItem>
                      <SelectItem value="sticky-top-bar">Sticky Top Bar</SelectItem>
                      <SelectItem value="popup-modal">Popup Modal</SelectItem>
                      <SelectItem value="slide-in-popup">Slide-In Popup</SelectItem>
                      <SelectItem value="announcement-bar">Announcement Bar</SelectItem>
                      <SelectItem value="full-width-banner">Full Width Banner</SelectItem>
                      <SelectItem value="cta-floating-button">CTA Floating Button</SelectItem>
                      <SelectItem value="exit-intent-popup">Exit Intent Popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Call-to-Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CTA Button Link * (URL or path)</Label>
                <Input 
                  placeholder="e.g., /pricing or https://example.com" 
                  value={formData.ctaButtonLink} 
                  onChange={(e) => setFormData({ ...formData, ctaButtonLink: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input 
                    placeholder="e.g., Learn More" 
                    value={formData.ctaButtonText} 
                    onChange={(e) => setFormData({ ...formData, ctaButtonText: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>CTA Type</Label>
                  <Select value={formData.ctaType} onValueChange={(value: any) => setFormData({ ...formData, ctaType: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal Link</SelectItem>
                      <SelectItem value="external">External Link</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="w-4 h-4" />Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2" 
                      onClick={() => { 
                        setImagePreview(""); 
                        setFormData({ ...formData, image: "" }); 
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-4 h-4" />Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input 
                    type="datetime-local" 
                    value={formData.startDate} 
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input 
                    type="datetime-local" 
                    value={formData.endDate} 
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold text-sm">Scheduling Rules</h4>
                <div className="flex items-center justify-between">
                  <Label>Show Once Per Session</Label>
                  <Switch 
                    checked={formData.schedulingRules.showOncePerSession} 
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      schedulingRules: { ...formData.schedulingRules, showOncePerSession: checked } 
                    })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Only on Weekends</Label>
                  <Switch 
                    checked={formData.schedulingRules.showOnlyOnWeekends} 
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      schedulingRules: { ...formData.schedulingRules, showOnlyOnWeekends: checked } 
                    })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delay (seconds) before showing</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={formData.schedulingRules.delaySeconds} 
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedulingRules: { ...formData.schedulingRules, delaySeconds: parseInt(e.target.value) || 0 } 
                    })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="w-4 h-4" />Page Targeting *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {pages.map(page => (
                  <label key={page} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.pageTargeting.includes(page)}
                      onChange={() => togglePageTargeting(page)}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{page.replace(/-/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Business Category Targeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select categories to target (or All)</Label>
                <Select 
                  value={formData.businessCategoryTargeting.join(',')} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    businessCategoryTargeting: value === 'all' ? ['all'] : [value] 
                  })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Food Mall">Food Mall</SelectItem>
                    <SelectItem value="Retail / E-Commerce Businesses">Retail / E-Commerce</SelectItem>
                    <SelectItem value="Creative & Design">Creative & Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={formData.backgroundColor} 
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input 
                      value={formData.backgroundColor} 
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={formData.textColor} 
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input 
                      value={formData.textColor} 
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show on Mobile</Label>
                <Switch 
                  checked={formData.displaySettings.showOnMobile} 
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    displaySettings: { ...formData.displaySettings, showOnMobile: checked } 
                  })} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show on Desktop</Label>
                <Switch 
                  checked={formData.displaySettings.showOnDesktop} 
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    displaySettings: { ...formData.displaySettings, showOnDesktop: checked } 
                  })} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Closeable</Label>
                <Switch 
                  checked={formData.displaySettings.closeable} 
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    displaySettings: { ...formData.displaySettings, closeable: checked } 
                  })} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Dismissible</Label>
                <Switch 
                  checked={formData.displaySettings.dismissible} 
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    displaySettings: { ...formData.displaySettings, dismissible: checked } 
                  })} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Preview & Submit */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="w-4 h-4" />Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg p-4 text-center"
                style={{
                  backgroundColor: formData.backgroundColor,
                  color: formData.textColor,
                }}
              >
                {imagePreview ? (
                  <div className="space-y-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                  </div>
                ) : (
                  <ImageIcon className="w-8 h-8 mx-auto opacity-50 mb-2" />
                )}
                <h3 className="font-bold text-sm">{formData.headline || "Ad Headline"}</h3>
                <p className="text-xs opacity-75 mt-1">{formData.description || "Ad description"}</p>
                {formData.ctaButtonLink && (
                  <Button size="sm" className="mt-2">{formData.ctaButtonText}</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-semibold">Type:</span> {formData.adType}</p>
              <p><span className="font-semibold">Status:</span> {formData.status}</p>
              <p><span className="font-semibold">Priority:</span> {formData.priority}</p>
              <p><span className="font-semibold">Pages:</span> {formData.pageTargeting.length > 0 ? formData.pageTargeting.length : 'None'}</p>
              <p><span className="font-semibold">Mobile:</span> {formData.displaySettings.showOnMobile ? 'Yes' : 'No'}</p>
              <p><span className="font-semibold">Desktop:</span> {formData.displaySettings.showOnDesktop ? 'Yes' : 'No'}</p>
            </CardContent>
          </Card>

          <Button 
            className="w-full" 
            onClick={handleSubmit} 
            disabled={loading}
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? (editId ? "Updating..." : "Creating...") : (editId ? "Update Advertisement" : "Create Advertisement")}
          </Button>
        </div>
      </div>
    </div>
  );
}
