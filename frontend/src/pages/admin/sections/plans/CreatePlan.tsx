import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  X, 
  Check,
  Package,
  DollarSign,
  Calendar,
  Tag,
  List,
  RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

export default function CreatePlan() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "30",
    businessCategory: "",
    features: [""],
    isActive: true,
    maxMenuItems: "",
    maxCategories: "",
    customDomain: false,
    analytics: false,
    prioritySupport: false,
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch business categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.getBusinessCategories();
        if (response.success && response.data && Array.isArray(response.data)) {
          const catNames = response.data
            .filter((cat: any) => cat.isActive !== false)
            .map((cat: any) => cat.name)
            .filter(Boolean);
          if (catNames.length > 0) {
            setCategories(catNames);
          } else {
            // Fallback to default categories
            setCategories(['Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design']);
          }
        } else {
          setCategories(['Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design']);
        }
      } catch (error) {

        setCategories(['Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design']);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""]
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter a plan name");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast.error("Please enter a valid duration (days)");
      return;
    }
    if (!formData.businessCategory) {
      toast.error("Please select a business category");
      return;
    }

    const validFeatures = formData.features.filter(f => f.trim());
    if (validFeatures.length === 0) {
      toast.error("Please add at least one feature");
      return;
    }

    try {
      setLoading(true);
      const planData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        businessCategory: formData.businessCategory,
        featuresList: validFeatures,
        features: {
          menuItemsLimit: formData.maxMenuItems ? String(formData.maxMenuItems) : 'unlimited',
          qrScansLimit: 'unlimited',
          analytics: formData.analytics,
          customDomain: formData.customDomain,
          prioritySupport: formData.prioritySupport,
          apiAccess: false,
          customBranding: false
        },
        isActive: formData.isActive,
        billingCycle: 'monthly',
        currency: 'INR'
      };

      const response = await api.createPlan(planData);
      if (response.success) {
        toast.success("Plan created successfully!");
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          duration: "30",
          businessCategory: "",
          features: [""],
          isActive: true,
          maxMenuItems: "",
          maxCategories: "",
          customDomain: false,
          analytics: false,
          prioritySupport: false,
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Plan</h2>
          <p className="text-slate-600 mt-1">Add a new subscription plan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Plan Name *</Label>
                <Input
                  placeholder="e.g., Pro Plan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this plan offers..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price (₹) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Duration (days) *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter days"
                      value={formData.duration}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) > 0 && !isNaN(parseInt(value)))) {
                          setFormData({ ...formData, duration: value });
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === '' || parseInt(value) <= 0) {
                          setFormData({ ...formData, duration: '30' });
                        }
                      }}
                      className="flex-1"
                    />
                    <Select 
                      value={formData.duration} 
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Quick" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="15">15 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">365 days</SelectItem>
                        <SelectItem value="730">730 days (2 years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-slate-500">Enter custom days or select from quick options</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Business Category *
                </Label>
                <Select 
                  value={formData.businessCategory} 
                  onValueChange={(value) => setFormData({ ...formData, businessCategory: value })}
                  disabled={loadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingCategories && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Loading categories...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Features
              </CardTitle>
              <CardDescription>Add features included in this plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <Input
                    placeholder="e.g., Unlimited menu items"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddFeature}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limits & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Menu Items</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxMenuItems}
                    onChange={(e) => setFormData({ ...formData, maxMenuItems: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Categories</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxCategories}
                    onChange={(e) => setFormData({ ...formData, maxCategories: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>Custom Domain</Label>
                    <p className="text-xs text-slate-600">Allow custom domain mapping</p>
                  </div>
                  <Switch
                    checked={formData.customDomain}
                    onCheckedChange={(checked) => setFormData({ ...formData, customDomain: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-xs text-slate-600">Access to analytics dashboard</p>
                  </div>
                  <Switch
                    checked={formData.analytics}
                    onCheckedChange={(checked) => setFormData({ ...formData, analytics: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>Priority Support</Label>
                    <p className="text-xs text-slate-600">24/7 priority customer support</p>
                  </div>
                  <Switch
                    checked={formData.prioritySupport}
                    onCheckedChange={(checked) => setFormData({ ...formData, prioritySupport: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your plan will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{formData.name || "Plan Name"}</h3>
                  <p className="text-sm text-slate-600 mt-1">{formData.description || "Plan description"}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">₹{formData.price || "0"}</span>
                  <span className="text-slate-600">/{formData.duration} days</span>
                </div>

                {formData.businessCategory && (
                  <Badge variant="outline">{formData.businessCategory}</Badge>
                )}

                <div className="space-y-2 pt-4 border-t">
                  {formData.features.filter(f => f.trim()).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <Badge className={formData.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-slate-600">Make plan available immediately</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Plan"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
