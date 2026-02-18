import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  Search, 
  Store,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Tag,
  Grid3x3,
  Settings
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import api from "@/lib/api";

interface BusinessCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  layout: string;
  businessTypes: BusinessType[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface BusinessType {
  _id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
}

interface BusinessCategoriesManagerProps {
  onCategorySelect?: (category: string | null) => void;
}

const BusinessCategoriesManager: React.FC<BusinessCategoriesManagerProps> = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  
  // Category Management
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<BusinessCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "MdStore",
    iconColor: "text-primary",
    layout: "Product catalog layout",
    order: 0,
    isActive: true
  });

  // Business Type Management
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [editingType, setEditingType] = useState<{ categoryId: string; type: BusinessType | null } | null>(null);
  const [showDeleteTypeDialog, setShowDeleteTypeDialog] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<{ categoryId: string; type: BusinessType } | null>(null);
  const [typeForm, setTypeForm] = useState({
    name: "",
    description: "",
    icon: "MdBusiness",
    order: 0,
    isActive: true
  });

  // Load business categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getBusinessCategories();
      
      if (response.success && response.data) {
        const sortedCategories = response.data
          .filter((cat: BusinessCategory) => cat.isActive !== false)
          .sort((a: BusinessCategory, b: BusinessCategory) => a.order - b.order);
        setCategories(sortedCategories);
        
        if (sortedCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(sortedCategories[0]);
        }
      } else {
        toast.error('Failed to load business categories');
      }
    } catch (error: any) {

      toast.error(`Failed to load categories: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Category Management Functions
  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const response = await api.createBusinessCategory({
        ...categoryForm,
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || `${categoryForm.name} businesses`,
        businessTypes: []
      });

      if (response.success) {
        toast.success('Category created successfully!');
        resetCategoryForm();
        setShowCreateCategory(false);
        await loadCategories();
      } else {
        toast.error('Failed to create category');
      }
    } catch (error: any) {
      toast.error(`Failed to create category: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !categoryForm.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const response = await api.updateBusinessCategory(selectedCategory._id, {
        ...categoryForm,
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim()
      });

      if (response.success) {
        toast.success('Category updated successfully!');
        setShowEditCategory(false);
        await loadCategories();
      } else {
        toast.error('Failed to update category');
      }
    } catch (error: any) {
      toast.error(`Failed to update category: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await api.deleteBusinessCategory(categoryToDelete._id);
      
      if (response.success) {
        toast.success(`Category "${categoryToDelete.name}" deleted successfully!`);
        setShowDeleteCategoryDialog(false);
        setCategoryToDelete(null);
        
        if (selectedCategory?._id === categoryToDelete._id) {
          setSelectedCategory(null);
        }
        
        await loadCategories();
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error: any) {
      toast.error(`Failed to delete category: ${error.message || 'Unknown error'}`);
    }
  };

  const openEditCategory = (category: BusinessCategory) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      iconColor: category.iconColor,
      layout: category.layout,
      order: category.order,
      isActive: category.isActive
    });
    setShowEditCategory(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      icon: "MdStore",
      iconColor: "text-primary",
      layout: "Product catalog layout",
      order: categories.length,
      isActive: true
    });
  };

  // Business Type Management Functions
  const handleCreateType = async () => {
    if (!typeForm.name.trim()) {
      toast.error('Business type name is required');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    try {
      if (editingType?.type?._id) {
        // Update existing type
        const response = await api.updateBusinessType(
          selectedCategory._id,
          editingType.type._id,
          typeForm
        );
        if (response.success) {
          toast.success('Business type updated successfully');
          setShowTypeDialog(false);
          resetTypeForm();
          await loadCategories();
        }
      } else {
        // Create new type
        const response = await api.addBusinessType(selectedCategory._id, typeForm);
        if (response.success) {
          toast.success('Business type added successfully');
          setShowTypeDialog(false);
          resetTypeForm();
          await loadCategories();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save business type');
    }
  };

  const handleDeleteType = async () => {
    if (!typeToDelete) return;

    try {
      const response = await api.deleteBusinessType(typeToDelete.categoryId, typeToDelete.type._id);
      if (response.success) {
        toast.success('Business type deleted successfully');
        setShowDeleteTypeDialog(false);
        setTypeToDelete(null);
        await loadCategories();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete business type');
    }
  };

  const openEditType = (categoryId: string, type: BusinessType) => {
    setEditingType({ categoryId, type });
    setTypeForm({
      name: type.name,
      description: type.description || "",
      icon: type.icon || "MdBusiness",
      order: type.order,
      isActive: type.isActive
    });
    setShowTypeDialog(true);
  };

  const openAddType = (categoryId: string) => {
    setSelectedCategory(categories.find(c => c._id === categoryId) || null);
    setEditingType(null);
    resetTypeForm();
    setTypeForm(prev => ({ ...prev, order: categories.find(c => c._id === categoryId)?.businessTypes.length || 0 }));
    setShowTypeDialog(true);
  };

  const resetTypeForm = () => {
    setTypeForm({
      name: "",
      description: "",
      icon: "MdBusiness",
      order: 0,
      isActive: true
    });
    setEditingType(null);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.businessTypes.some(type => 
        type.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  const selectedCategoryData = selectedCategory || (categories.length > 0 ? categories[0] : null);
  const activeTypesCount = selectedCategoryData?.businessTypes.filter(t => t.isActive).length || 0;
  const totalTypesCount = selectedCategoryData?.businessTypes.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Business Categories & Types</h2>
          <p className="text-muted-foreground mt-1">
            Manage business categories and their types professionally
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => {
            resetCategoryForm();
            setShowCreateCategory(true);
          }} variant="default" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
          <Button onClick={loadCategories} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search categories or business types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold mt-1">{categories.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Business Types</p>
                <p className="text-2xl font-bold mt-1">
                  {categories.reduce((sum, cat) => sum + cat.businessTypes.length, 0)}
                </p>
              </div>
              <Tag className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Types</p>
                <p className="text-2xl font-bold mt-1">
                  {categories.reduce((sum, cat) => sum + cat.businessTypes.filter(t => t.isActive).length, 0)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories and Types List */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Categories
              </CardTitle>
              <CardDescription>
                {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No categories match your search' : 'No categories found'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      onClick={() => {
                        resetCategoryForm();
                        setShowCreateCategory(true);
                      }} 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Category
                    </Button>
                  )}
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const activeTypes = category.businessTypes.filter(t => t.isActive);
                  const isSelected = selectedCategory?._id === category._id;
                  
                  return (
                    <div key={category._id} className="group">
                      <Collapsible
                        open={expandedCategories.has(category._id)}
                        onOpenChange={() => toggleCategoryExpansion(category._id)}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              if (onCategorySelect) {
                                onCategorySelect(category.name);
                              }
                            }}
                            className={`flex-1 flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "hover:bg-secondary"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0`}>
                              <Store className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{category.name}</div>
                              <div className="text-xs opacity-75">
                                {activeTypes.length} active • {category.businessTypes.length} total types
                              </div>
                            </div>
                          </button>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                {expandedCategories.has(category._id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Category Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditCategory(category)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Category
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openAddType(category._id)}>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Business Type
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setCategoryToDelete(category);
                                    setShowDeleteCategoryDialog(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Category
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <CollapsibleContent className="ml-13 mt-2 space-y-1">
                          {category.businessTypes
                            .sort((a, b) => a.order - b.order)
                            .map((type) => (
                              <div key={type._id} className="group/type flex items-center gap-2 pl-2">
                                <div className={`flex-1 flex items-center gap-2 p-2 rounded text-sm transition-colors ${
                                  type.isActive ? 'hover:bg-secondary' : 'opacity-60'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full ${type.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                  <span className="truncate">{type.name}</span>
                                  {!type.isActive && (
                                    <Badge variant="outline" className="text-xs">Inactive</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover/type:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => openEditType(category._id, type)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-destructive"
                                    onClick={() => {
                                      setTypeToDelete({ categoryId: category._id, type });
                                      setShowDeleteTypeDialog(true);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          {category.businessTypes.length === 0 && (
                            <div className="pl-2 text-sm text-muted-foreground">
                              No business types yet
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Category Details */}
        <div className="lg:col-span-2">
          {selectedCategoryData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      {selectedCategoryData.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedCategoryData.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => openAddType(selectedCategoryData._id)}
                    variant="default"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Type
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedCategoryData.businessTypes.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Business Types</h3>
                    <p className="text-muted-foreground mb-4">
                      This category doesn't have any business types yet. Add one to get started.
                    </p>
                    <Button onClick={() => openAddType(selectedCategoryData._id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Business Type
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {activeTypesCount} Active
                        </Badge>
                        <Badge variant="outline">
                          {totalTypesCount - activeTypesCount} Inactive
                        </Badge>
                        <Badge variant="outline">
                          {totalTypesCount} Total
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {selectedCategoryData.businessTypes
                        .sort((a, b) => a.order - b.order)
                        .map((type) => (
                          <Card key={type._id} className={`transition-all ${!type.isActive ? 'opacity-60' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${type.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <h3 className="font-semibold text-lg">{type.name}</h3>
                                    {!type.isActive && (
                                      <Badge variant="outline">Inactive</Badge>
                                    )}
                                    {type.order !== undefined && (
                                      <Badge variant="secondary" className="text-xs">
                                        Order: {type.order}
                                      </Badge>
                                    )}
                                  </div>
                                  {type.description && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {type.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Icon: {type.icon || 'None'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditType(selectedCategoryData._id, type)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => {
                                      setTypeToDelete({ categoryId: selectedCategoryData._id, type });
                                      setShowDeleteTypeDialog(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Select a Category
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Choose a category from the sidebar to view and manage its business types.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Category Dialog */}
      <Dialog open={showCreateCategory || showEditCategory} onOpenChange={(open) => {
        if (!open) {
          setShowCreateCategory(false);
          setShowEditCategory(false);
          resetCategoryForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showEditCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
            <DialogDescription>
              {showEditCategory ? 'Update category details' : 'Add a new category to organize businesses'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Technology Services"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                placeholder="Brief description of this category..."
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryOrder">Display Order</Label>
                <Input
                  id="categoryOrder"
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label htmlFor="categoryActive">Active Status</Label>
                <Switch
                  id="categoryActive"
                  checked={categoryForm.isActive}
                  onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateCategory(false);
              setShowEditCategory(false);
              resetCategoryForm();
            }}>
              Cancel
            </Button>
            <Button onClick={showEditCategory ? handleUpdateCategory : handleCreateCategory} disabled={!categoryForm.name.trim()}>
              {showEditCategory ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Business Type Dialog */}
      <Dialog open={showTypeDialog} onOpenChange={(open) => {
        if (!open) {
          setShowTypeDialog(false);
          resetTypeForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit Business Type' : 'Add Business Type'}</DialogTitle>
            <DialogDescription>
              {editingType 
                ? `Update business type in "${selectedCategory?.name}" category`
                : `Add a new business type to "${selectedCategory?.name}" category`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="typeName">Business Type Name *</Label>
              <Input
                id="typeName"
                placeholder="e.g., Software Development"
                value={typeForm.name}
                onChange={(e) => setTypeForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="typeDescription">Description</Label>
              <Textarea
                id="typeDescription"
                placeholder="Brief description of this business type..."
                value={typeForm.description}
                onChange={(e) => setTypeForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="typeOrder">Display Order</Label>
                <Input
                  id="typeOrder"
                  type="number"
                  value={typeForm.order}
                  onChange={(e) => setTypeForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label htmlFor="typeActive">Active Status</Label>
                <Switch
                  id="typeActive"
                  checked={typeForm.isActive}
                  onCheckedChange={(checked) => setTypeForm(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTypeDialog(false);
              resetTypeForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateType} disabled={!typeForm.name.trim()}>
              {editingType ? 'Update' : 'Add'} Business Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category <strong>"{categoryToDelete?.name}"</strong>? 
              This action cannot be undone. The category and all its business types will be permanently removed from the database.
              {categoryToDelete && categoryToDelete.businessTypes.length > 0 && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Warning: This category has {categoryToDelete.businessTypes.length} business type(s) that will also be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Business Type Confirmation */}
      <AlertDialog open={showDeleteTypeDialog} onOpenChange={setShowDeleteTypeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the business type <strong>"{typeToDelete?.type.name}"</strong>? 
              This action cannot be undone. The business type will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTypeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteType}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Business Type
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BusinessCategoriesManager;
