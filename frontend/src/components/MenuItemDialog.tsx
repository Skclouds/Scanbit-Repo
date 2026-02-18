import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FiUpload, FiX } from "react-icons/fi";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { toast } from "sonner";
import api from "@/lib/api";


interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessCategory?: string;
  categories: any[];
  onSuccess: (item: any) => void;
}

export const MenuItemDialog = ({
  open,
  onOpenChange,
  businessCategory,
  categories,
  onSuccess,
}: MenuItemDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    isVeg: true,
    isSpicy: false,
    isPopular: false,
    isAvailable: true,
    stock: 0,
    sku: "",
    duration: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      setUploading(true);
      let imageUrl = "";

      // Upload image if provided
      if (image) {
        imageUrl = await api.uploadImage(image, "menu-items");
      }

      const itemData = {
        ...formData,
        image: imageUrl,
      };

      const response = await api.createMenuItem(itemData);

      if (response.success) {
        toast.success("Item added successfully!");
        onSuccess(response.data);
        resetForm();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add item");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "",
      isVeg: true,
      isSpicy: false,
      isPopular: false,
      isAvailable: true,
      stock: 0,
      sku: "",
      duration: "",
    });
    removeImage();
  };

  const isRetail = businessCategory === "Retail / E-Commerce Businesses";
  const isServices = businessCategory === "Professional Services";
  const isFoodMall = businessCategory === "Food Mall";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isRetail ? "Add New Product" : isServices ? "Add New Service" : "Add New Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Image Upload */}
          <div>
            <Label>Item Image</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
                >
                  <FiUpload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">Max size: 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isRetail ? "Product name" : isServices ? "Service name" : "Item name"}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background resize-none mt-1"
              />
            </div>

            <div>
              <Label>Price (₹) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category *</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background mt-1"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Retail-specific fields */}
            {isRetail && (
              <>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-001"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {/* Services-specific fields */}
            {isServices && (
              <div className="md:col-span-2">
                <Label>Duration</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 1 hour, 2 days"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Food-specific toggles */}
          {isFoodMall && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <Label className="cursor-pointer">Vegetarian</Label>
                <Switch
                  checked={formData.isVeg}
                  onCheckedChange={(val) => setFormData({ ...formData, isVeg: val })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <Label className="cursor-pointer">Spicy</Label>
                <Switch
                  checked={formData.isSpicy}
                  onCheckedChange={(val) => setFormData({ ...formData, isSpicy: val })}
                />
              </div>
            </div>
          )}

          {/* Common toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label className="cursor-pointer">Popular</Label>
              <Switch
                checked={formData.isPopular}
                onCheckedChange={(val) => setFormData({ ...formData, isPopular: val })}
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label className="cursor-pointer">Available</Label>
              <Switch
                checked={formData.isAvailable}
                onCheckedChange={(val) => setFormData({ ...formData, isAvailable: val })}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
            {uploading ? "Adding..." : isRetail ? "Add Product" : isServices ? "Add Service" : "Add Menu Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
