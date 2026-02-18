import { useState, useMemo } from "react";
import { MdInventory, MdList, MdImage } from "react-icons/md";
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSearch, FiFilter, FiCheckCircle, FiX, FiUpload } from "react-icons/fi";
import { FaLeaf, FaFire } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";
import { safeImageSrc } from "@/lib/imageUtils";
import { getBusinessConfig } from "./config";

interface MenuItem {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: string | { _id: string; name: string };
  isVeg?: boolean;
  isSpicy?: boolean;
  isPopular?: boolean;
  isAvailable?: boolean;
  image?: string;
  images?: string[];
  duration?: string;
  client?: string;
  deliverables?: string;
  stock?: number;
  sku?: string;
  brand?: string;
  year?: string;
  tools?: string;
  expertise?: string;
}

interface Category {
  _id?: string;
  id?: string;
  name: string;
  emoji?: string;
}

interface ItemsProps {
  menuItems: MenuItem[];
  categories: Category[];
  restaurant: any;
  selectedCategory: string | null;
  onItemsChange: (items: MenuItem[]) => void;
  formatCurrency: (amount: number) => string;
}

export const Items = ({
  menuItems,
  categories,
  restaurant,
  selectedCategory,
  onItemsChange,
  formatCurrency
}: ItemsProps) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isVeg: true,
    isSpicy: false,
    isPopular: false,
    isAvailable: true,
    duration: "",
    client: "",
    deliverables: "",
    stock: "",
    sku: "",
    brand: "",
    year: "",
    tools: "",
    expertise: "",
    images: [] as string[],
  });

  const [uploadingImages, setUploadingImages] = useState(false);

  const config = getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType);

  // Filter items based on selected category and search
  const filteredItems = useMemo(() => {
    return (menuItems || []).filter(item => {
      // Category filter
      if (selectedCategory) {
        const itemCategory = item.category ? (typeof item.category === "object" ? (item.category as any)._id : item.category) : null;
        if (itemCategory !== selectedCategory) return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(query) || false;
        const descMatch = item.description?.toLowerCase().includes(query) || false;
        if (!nameMatch && !descMatch) {
          return false;
        }
      }
      
      // Availability filter
      if (filterAvailable !== null && item.isAvailable !== filterAvailable) {
        return false;
      }
      
      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, filterAvailable]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.images.length >= 1) {
      toast.error("Only one Service Asset image is allowed");
      return;
    }

    try {
      setUploadingImages(true);
      const url = await api.uploadImage(file, "menu-items");
      setFormData(prev => ({
        ...prev,
        images: [url]
      }));
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddItem = async () => {
    if (!formData.name.trim()) {
      toast.error(`Please enter a ${config.itemLabel.toLowerCase()} name`);
      return;
    }
    if (formData.price === "" || parseFloat(formData.price) < 0) {
      toast.error("Please enter a valid price (cannot be negative)");
      return;
    }
    if (!formData.category) {
      toast.error(`Please select a ${config.categoryLabel.toLowerCase()}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.createMenuItem({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        isVeg: formData.isVeg,
        isSpicy: formData.isSpicy,
        isPopular: formData.isPopular,
        isAvailable: formData.isAvailable,
        duration: formData.duration,
        client: formData.client,
        deliverables: formData.deliverables,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        sku: formData.sku,
        brand: formData.brand,
        year: formData.year,
        tools: formData.tools,
        expertise: formData.expertise,
        image: formData.images[0], // Keep backward compatibility for single image
        images: formData.images,
      });

      if (response.success) {
        onItemsChange([...menuItems, response.data]);
        
        toast.success(
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-800">{config.itemLabel} Added!</p>
              <p className="text-sm text-green-600">{formData.name} has been added successfully</p>
            </div>
          </div>,
          { duration: 4000 }
        );
        
        resetForm();
        setIsAddingItem(false);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to add ${config.itemLabel.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !formData.name.trim()) {
      toast.error(`Please enter a ${config.itemLabel.toLowerCase()} name`);
      return;
    }
    if (formData.price === "" || parseFloat(formData.price) < 0) {
      toast.error("Please enter a valid price (cannot be negative)");
      return;
    }

    try {
      setIsSubmitting(true);
      const itemId = editingItem._id || editingItem.id;
      const response = await api.updateMenuItem(itemId!, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        isVeg: formData.isVeg,
        isSpicy: formData.isSpicy,
        isPopular: formData.isPopular,
        isAvailable: formData.isAvailable,
        duration: formData.duration,
        client: formData.client,
        deliverables: formData.deliverables,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        sku: formData.sku,
        brand: formData.brand,
        year: formData.year,
        tools: formData.tools,
        expertise: formData.expertise,
        image: formData.images[0], // Keep backward compatibility
        images: formData.images,
      });

      if (response.success) {
        const updatedItems = (menuItems || []).map(item => 
          (item._id || item.id) === itemId ? response.data : item
        );
        onItemsChange(updatedItems);
        
        toast.success(
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <FiEdit className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-800">{config.itemLabel} Updated!</p>
              <p className="text-sm text-blue-600">{formData.name} has been updated successfully</p>
            </div>
          </div>,
          { duration: 4000 }
        );
        
        resetForm();
        setEditingItem(null);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to update ${config.itemLabel.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItemId) return;

    try {
      setIsSubmitting(true);
      await api.deleteMenuItem(deletingItemId);
      
      const updatedItems = menuItems.filter(item => 
        (item._id || item.id) !== deletingItemId
      );
      onItemsChange(updatedItems);
      
      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <FiTrash2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-red-800">{config.itemLabel} Deleted</p>
            <p className="text-sm text-red-600">The item has been removed</p>
          </div>
        </div>,
        { duration: 4000 }
      );
      
      setDeletingItemId(null);
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${config.itemLabel.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    try {
      const itemId = item._id || item.id;
      const response = await api.updateMenuItem(itemId!, {
        isAvailable: !item.isAvailable,
      });

      if (response.success) {
        const updatedItems = menuItems.map(i => 
          (i._id || i.id) === itemId ? { ...i, isAvailable: !item.isAvailable } : i
        );
        onItemsChange(updatedItems);
        
        toast.success(
          item.isAvailable 
            ? `${item.name} marked as unavailable` 
            : `${item.name} marked as available`
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update availability");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: selectedCategory || "",
      isVeg: true,
      isSpicy: false,
      isPopular: false,
      isAvailable: true,
      duration: "",
      client: "",
      deliverables: "",
      stock: "",
      sku: "",
      brand: "",
      year: "",
      tools: "",
      expertise: "",
      images: [],
    });
  };

  const openEditDialog = (item: any) => {
    const categoryId = item.category ? (typeof item.category === "object" ? item.category._id : item.category) : "";
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category: categoryId || "",
      isVeg: item.isVeg ?? true,
      isSpicy: item.isSpicy ?? false,
      isPopular: item.isPopular ?? false,
      isAvailable: item.isAvailable ?? true,
      duration: item.duration || "",
      client: item.client || "",
      deliverables: item.deliverables || "",
      stock: item.stock?.toString() || "",
      sku: item.sku || "",
      brand: item.brand || "",
      year: item.year || "",
      tools: item.tools || "",
      expertise: item.expertise || "",
      images: (item.images || (item.image ? [item.image] : [])).slice(0, 1),
    });
    setEditingItem(item);
  };

  const getCategoryName = (categoryId: string) => {
    const cat = (categories || []).find(c => (c._id || c.id) === categoryId);
    return cat?.name || "Uncategorized";
  };

  // Show food-specific options only based on business config
  const showFoodOptions = config.showVegOption || config.showSpicyOption;

  const renderFormFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={config.itemNamePlaceholder}
            className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-bold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{config.categoryLabel} *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-orange-500 font-bold text-sm outline-none cursor-pointer"
          >
            <option value="">Select Category</option>
            {(categories || []).map((cat) => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{config.descriptionLabel}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={config.itemDescPlaceholder}
          className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-orange-500 font-medium text-sm outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{config.priceLabel} *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || parseFloat(val) >= 0) {
                  setFormData({ ...formData, price: val });
                }
              }}
              placeholder="0.00"
              className="h-12 pl-8 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-black"
            />
          </div>
        </div>

        {/* Business Specific Fields - DYNAMICALLY RENDERED */}
        {(config as any).showDuration && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement Duration</label>
            <Input
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 30 mins, 1 month"
              className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-bold"
            />
          </div>
        )}

        {(config as any).showStock && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inventory Level</label>
            <Input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="Units available"
              className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-bold"
            />
          </div>
        )}
      </div>

      {/* Media Section - 1 Service Asset only */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Asset (1 Image - Optional)</label>
        <div className="grid grid-cols-1 max-w-[200px] gap-4">
          {(formData.images || []).map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50">
              <img src={safeImageSrc(url)} alt="Service asset" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(formData.images || []).length < 1 && (
            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-orange-300 transition-all group max-w-[200px]">
              <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-orange-500 shadow-sm transition-colors ${uploadingImages ? 'animate-pulse' : ''}`}>
                {uploadingImages ? <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <FiUpload className="w-5 h-5" />}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase mt-2 group-hover:text-orange-600 transition-colors text-center px-2">
                {uploadingImages ? "Uploading..." : "Add Image"}
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImages} />
            </label>
          )}
        </div>
      </div>

      {/* More Business Specific Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(config as any).showClient && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client / Project</label>
            <Input
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="Client name"
              className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-bold"
            />
          </div>
        )}
        {(config as any).showSKU && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Identifier</label>
            <Input
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Product SKU"
              className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-bold"
            />
          </div>
        )}
      </div>

      {/* Strategic Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-orange-200 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
              <HiSparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Featured</p>
              <p className="text-[10px] font-medium text-slate-400">Mark as popular</p>
            </div>
          </div>
          <Switch
            checked={formData.isPopular}
            onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
            className="data-[state=checked]:bg-yellow-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-orange-200 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <FiEye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Visibility</p>
              <p className="text-[10px] font-medium text-slate-400">Publicly visible</p>
            </div>
          </div>
          <Switch
            checked={formData.isAvailable}
            onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </div>

      {/* Food Specific Toggles - DYNAMICALLY RENDERED */}
      {showFoodOptions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.showVegOption && (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-orange-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                  <FaLeaf className="w-4 h-4" />
                </div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Vegetarian</p>
              </div>
              <Switch
                checked={formData.isVeg}
                onCheckedChange={(checked) => setFormData({ ...formData, isVeg: checked })}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          )}
          {config.showSpicyOption && (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-orange-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
                  <FaFire className="w-4 h-4" />
                </div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Spicy</p>
              </div>
              <Switch
                checked={formData.isSpicy}
                onCheckedChange={(checked) => setFormData({ ...formData, isSpicy: checked })}
                className="data-[state=checked]:bg-red-600"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Search and Filters Control Bar */}
      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors w-5 h-5" />
            <Input
              placeholder={`Search ${config.itemLabelPlural.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-orange-500 font-medium"
            />
          </div>
          <Button onClick={() => { resetForm(); setIsAddingItem(true); }} className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95">
            <FiPlus className="w-5 h-5 mr-2" />
            Add {config.itemLabel}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Status Filter:</span>
          {[
            { label: 'All', value: null },
            { label: 'Available', value: true },
            { label: 'Unavailable', value: false }
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => setFilterAvailable(btn.value)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterAvailable === btn.value 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <MdList className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
              {searchQuery ? `No matching ${config.itemLabelPlural.toLowerCase()}` : `No ${config.itemLabelPlural.toLowerCase()} yet`}
            </h3>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              {searchQuery ? "Try adjusting your search query or filters to find what you're looking for." : `Start populating your ${config.pageTitle.toLowerCase()} by adding your primary business offerings.`}
            </p>
            {!searchQuery && (
              <Button onClick={() => { resetForm(); setIsAddingItem(true); }} className="h-12 px-8 bg-slate-900 text-white font-black rounded-xl">
                Add First {config.itemLabel}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredItems || []).map((item) => {
            const itemId = item._id || item.id;
            const categoryId = item.category ? (typeof item.category === "object" ? (item.category as any)._id : item.category) : null;
            
            return (
              <div
                key={itemId}
                className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group ${
                  !item.isAvailable ? 'opacity-70 grayscale-[0.5]' : ''
                }`}
              >
                {/* Enhanced Image Presentation */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  {item.image ? (
                    <img 
                      src={safeImageSrc(item.image)} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdList className="w-12 h-12 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {item.isPopular && (
                      <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1">
                        <HiSparkles className="w-3 h-3" />
                        Popular
                      </span>
                    )}
                    {!item.isAvailable && (
                      <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1">
                        <FiEyeOff className="w-3 h-3" />
                        Hidden
                      </span>
                    )}
                  </div>
                  {showFoodOptions && (
                    <div className="absolute top-4 right-4">
                      {item.isVeg ? (
                        <div className="w-6 h-6 bg-white rounded-md border-2 border-green-600 flex items-center justify-center p-1 shadow-md">
                          <div className="w-full h-full bg-green-600 rounded-full" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-white rounded-md border-2 border-red-600 flex items-center justify-center p-1 shadow-md">
                          <div className="w-full h-full bg-red-600 rounded-full" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1">{getCategoryName(categoryId)}</p>
                      <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight">{item.name}</h3>
                    </div>
                    <p className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(item.price)}</p>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed mb-6 h-10">{item.description}</p>
                  )}
                  
                  {/* Strategic Control Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                        item.isAvailable ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => toggleItemAvailability(item)}
                          className="scale-75 data-[state=checked]:bg-green-600"
                        />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          item.isAvailable ? 'text-green-700' : 'text-slate-400'
                        }`}>
                          {item.isAvailable ? 'Active' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDialog(item)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Configuration"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeletingItemId(itemId!)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove Item"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
            <h2 className="text-2xl font-black uppercase tracking-tight">Initialize {config.itemLabel}</h2>
            <p className="text-orange-100 font-medium text-sm mt-1">Configure a new professional offering for your catalog.</p>
          </div>
          <div className="p-8 bg-white max-h-[70vh] overflow-y-auto">
            {renderFormFields()}
          </div>
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="ghost" onClick={() => { resetForm(); setIsAddingItem(false); }} className="flex-1 h-12 rounded-xl font-bold text-slate-500">
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={isSubmitting || uploadingImages} className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg shadow-orange-600/20">
              {isSubmitting ? "Deploying..." : `Create ${config.itemLabel}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white">
            <h2 className="text-2xl font-black uppercase tracking-tight">Configure Entity</h2>
            <p className="text-slate-400 font-medium text-sm mt-1">Modify existing {config.itemLabel.toLowerCase()} parameters.</p>
          </div>
          <div className="p-8 bg-white max-h-[70vh] overflow-y-auto">
            {renderFormFields()}
          </div>
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="ghost" onClick={() => { resetForm(); setEditingItem(null); }} className="flex-1 h-12 rounded-xl font-bold text-slate-500">
              Cancel
            </Button>
            <Button onClick={handleEditItem} disabled={isSubmitting || uploadingImages} className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl">
              {isSubmitting ? "Syncing..." : "Update Settings"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingItemId} onOpenChange={(open) => !open && setDeletingItemId(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] p-8 border-none shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 flex items-center justify-center border border-red-100 text-red-600">
              <FiTrash2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Confirm Removal</h3>
              <p className="text-slate-500 font-medium text-sm mt-2">
                Are you sure you want to decommission this {config.itemLabel.toLowerCase()}? This action is permanent.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="destructive" onClick={handleDeleteItem} disabled={isSubmitting} className="h-12 w-full font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-red-600/20">
                {isSubmitting ? "Processing..." : "Confirm Deletion"}
              </Button>
              <Button variant="ghost" onClick={() => setDeletingItemId(null)} className="h-12 w-full font-bold text-slate-400">
                Abort
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Items;