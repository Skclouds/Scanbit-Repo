import { MdRestaurantMenu, MdShoppingBag, MdBrush, MdRestaurant, MdLocalCafe, MdHotel, MdFastfood, MdCake, MdLocalBar, MdStorefront, MdIcecream, MdLocalDrink, MdStore, MdEvent, MdInventory, MdChair, MdDevices, MdToys, MdPrint, MdDesignServices, MdPalette, MdWork, MdCampaign, } from "react-icons/md";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X, GripVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";


// Icon mapping
const iconMap: Record<string, any> = {
  MdRestaurantMenu,
  MdShoppingBag,
  MdBrush,
  MdRestaurant,
  MdLocalCafe,
  MdHotel,
  MdFastfood,
  MdCake,
  MdLocalBar,
  MdStorefront,
  MdIcecream,
  MdLocalDrink,
  MdStore,
  MdEvent,
  MdInventory,
  MdChair,
  MdDevices,
  MdToys,
  MdPrint,
  MdDesignServices,
  MdPalette,
  MdWork,
  MdCampaign,
};

interface BusinessType {
  _id?: string;
  name: string;
  icon: string;
  description: string;
  order: number;
  isActive: boolean;
}

interface BusinessCategory {
  _id: string;
  name: string;
  icon: string;
  iconColor: string;
  description: string;
  layout: string;
  order: number;
  isActive: boolean;
  businessTypes: BusinessType[];
}

export default function BusinessCategories() {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BusinessCategory | null>(null);
  const [editingType, setEditingType] = useState<{ categoryId: string; type: BusinessType | null } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'MdStore',
    iconColor: 'text-primary',
    description: '',
    layout: 'Menu layout',
    order: 0,
    isActive: true
  });

  const [typeForm, setTypeForm] = useState({
    name: '',
    icon: 'MdStore',
    description: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getBusinessCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load business categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        toast.error('Category name is required');
        return;
      }

      if (editingCategory) {
        const response = await api.updateBusinessCategory(editingCategory._id, categoryForm);
        if (response.success) {
          toast.success('Category updated successfully');
          setShowCategoryDialog(false);
          resetCategoryForm();
          loadCategories();
        }
      } else {
        const response = await api.createBusinessCategory(categoryForm);
        if (response.success) {
          toast.success('Category created successfully');
          setShowCategoryDialog(false);
          resetCategoryForm();
          loadCategories();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all business types under it.')) {
      return;
    }

    try {
      const response = await api.deleteBusinessCategory(id);
      if (response.success) {
        toast.success('Category deleted successfully');
        loadCategories();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleCreateType = async () => {
    try {
      if (!typeForm.name.trim()) {
        toast.error('Business type name is required');
        return;
      }

      if (!selectedCategoryId) {
        toast.error('Please select a category');
        return;
      }

      if (editingType?.type?._id) {
        const response = await api.updateBusinessType(
          selectedCategoryId,
          editingType.type._id,
          typeForm
        );
        if (response.success) {
          toast.success('Business type updated successfully');
          setShowTypeDialog(false);
          resetTypeForm();
          loadCategories();
        }
      } else {
        const response = await api.addBusinessType(selectedCategoryId, typeForm);
        if (response.success) {
          toast.success('Business type added successfully');
          setShowTypeDialog(false);
          resetTypeForm();
          loadCategories();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save business type');
    }
  };

  const handleDeleteType = async (categoryId: string, typeId: string) => {
    if (!confirm('Are you sure you want to delete this business type?')) {
      return;
    }

    try {
      const response = await api.deleteBusinessType(categoryId, typeId);
      if (response.success) {
        toast.success('Business type deleted successfully');
        loadCategories();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete business type');
    }
  };

  const openEditCategory = (category: BusinessCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      iconColor: category.iconColor,
      description: category.description,
      layout: category.layout,
      order: category.order,
      isActive: category.isActive
    });
    setShowCategoryDialog(true);
  };

  const openEditType = (categoryId: string, type: BusinessType) => {
    setEditingType({ categoryId, type });
    setSelectedCategoryId(categoryId);
    setTypeForm({
      name: type.name,
      icon: type.icon,
      description: type.description,
      order: type.order,
      isActive: type.isActive
    });
    setShowTypeDialog(true);
  };

  const openAddType = (categoryId: string) => {
    setEditingType(null);
    setSelectedCategoryId(categoryId);
    resetTypeForm();
    setShowTypeDialog(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      icon: 'MdStore',
      iconColor: 'text-primary',
      description: '',
      layout: 'Menu layout',
      order: 0,
      isActive: true
    });
    setEditingCategory(null);
  };

  const resetTypeForm = () => {
    setTypeForm({
      name: '',
      icon: 'MdStore',
      description: '',
      order: 0,
      isActive: true
    });
    setEditingType(null);
    setSelectedCategoryId(null);
  };

  const getIconComponent = (iconName: string) => {
    const Icon = iconMap[iconName] || MdStore;
    return Icon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Categories & Types</h2>
          <p className="text-muted-foreground">
            Manage business categories and types used across registration and services pages
          </p>
        </div>
        <Dialog open={showCategoryDialog} onOpenChange={(open) => {
          setShowCategoryDialog(open);
          if (!open) resetCategoryForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetCategoryForm();
              setShowCategoryDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Business Category'}</DialogTitle>
              <DialogDescription>
                Create or edit a business category that will appear in registration and services pages
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category Name *</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., Food Mall"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  >
                    {Object.keys(iconMap).map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Icon Color</Label>
                  <Input
                    value={categoryForm.iconColor}
                    onChange={(e) => setCategoryForm({ ...categoryForm, iconColor: e.target.value })}
                    placeholder="text-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Layout</Label>
                <Input
                  value={categoryForm.layout}
                  onChange={(e) => setCategoryForm({ ...categoryForm, layout: e.target.value })}
                  placeholder="e.g., Menu layout"
                />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="category-active"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="category-active">Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateCategory} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowCategoryDialog(false);
                  resetCategoryForm();
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="grid gap-6">
        {categories.map((category) => {
          const CategoryIcon = getIconComponent(category.icon);
          return (
            <Card key={category._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.iconColor} bg-opacity-10`}>
                      <CategoryIcon className={`w-6 h-6 ${category.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {category.name}
                        {!category.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{category.description || 'No description'}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditCategory(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddType(category._id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Type
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <strong>Layout:</strong> {category.layout} • <strong>Order:</strong> {category.order}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Business Types ({category.businessTypes.length})</h4>
                    {category.businessTypes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No business types added yet</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.businessTypes
                          .sort((a, b) => a.order - b.order)
                          .map((type) => {
                            const TypeIcon = getIconComponent(type.icon);
                            return (
                              <div
                                key={type._id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <TypeIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{type.name}</p>
                                    {type.description && (
                                      <p className="text-xs text-muted-foreground truncate">{type.description}</p>
                                    )}
                                  </div>
                                  {!type.isActive && (
                                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => openEditType(category._id, type)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive"
                                    onClick={() => handleDeleteType(category._id, type._id!)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No business categories found</p>
            <Button onClick={() => {
              resetCategoryForm();
              setShowCategoryDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Business Type Dialog */}
      <Dialog open={showTypeDialog} onOpenChange={(open) => {
        setShowTypeDialog(open);
        if (!open) resetTypeForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType?.type ? 'Edit Business Type' : 'Add Business Type'}</DialogTitle>
            <DialogDescription>
              {!editingType?.type ? 'Select a category and add a new business type' : 'Edit the business type details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Category Selector - Only show when adding new type */}
            {!editingType?.type && (
              <div className="space-y-2">
                <Label>Select Category *</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={selectedCategoryId || ''}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">Choose a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Business Type Name *</Label>
              <Input
                value={typeForm.name}
                onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                placeholder="e.g., Restaurants"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={typeForm.icon}
                onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })}
              >
                {Object.keys(iconMap).map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={typeForm.description}
                onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={typeForm.order}
                  onChange={(e) => setTypeForm({ ...typeForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="type-active"
                  checked={typeForm.isActive}
                  onChange={(e) => setTypeForm({ ...typeForm, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="type-active">Active</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateType} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {editingType?.type ? 'Update' : 'Create'} Type
              </Button>
              <Button variant="outline" onClick={() => {
                setShowTypeDialog(false);
                resetTypeForm();
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
