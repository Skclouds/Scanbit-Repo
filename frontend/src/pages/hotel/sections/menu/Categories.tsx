import { useState } from "react";
import { MdInventory, MdCategory, MdList } from "react-icons/md";
import { FiPlus, FiEdit, FiTrash2, FiEye, FiCheckCircle, FiSearch } from "react-icons/fi";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";
import { safeImageSrc } from "@/lib/imageUtils";
import { getBusinessConfig } from "./config";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  emoji?: string;
  image?: string;
}

interface CategoriesProps {
  categories: Category[];
  restaurant: any;
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onCategoriesChange: (categories: Category[]) => void;
  menuItems: any[];
}

export const Categories = ({
  categories,
  restaurant,
  selectedCategory,
  onSelectCategory,
  onCategoriesChange,
  menuItems
}: CategoriesProps) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryEmoji, setCategoryEmoji] = useState("🍽️");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType);

  const filteredCategories = (categories || []).filter(cat =>
    (cat.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.createCategory({
        name: categoryName.trim(),
        emoji: categoryEmoji,
      });

      if (response.success) {
        onCategoriesChange([...categories, response.data]);
        toast.success(`${config.categoryLabel} initialized successfully.`);
        resetForm();
        setIsAddingCategory(false);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to add ${config.categoryLabel.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setIsSubmitting(true);
      const categoryId = editingCategory._id || editingCategory.id;
      const response = await api.updateCategory(categoryId!, {
        name: categoryName.trim(),
        emoji: categoryEmoji,
      });

      if (response.success) {
        const updatedCategories = categories.map(cat => 
          (cat._id || cat.id) === categoryId ? response.data : cat
        );
        onCategoriesChange(updatedCategories);
        toast.success(`${config.categoryLabel} configuration updated.`);
        resetForm();
        setEditingCategory(null);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to update ${config.categoryLabel.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategoryId) return;

    try {
      setIsSubmitting(true);
      await api.deleteCategory(deletingCategoryId);
      const updatedCategories = categories.filter(cat => 
        (cat._id || cat.id) !== deletingCategoryId
      );
      onCategoriesChange(updatedCategories);
      if (selectedCategory === deletingCategoryId) {
        onSelectCategory(null);
      }
      toast.success(`${config.categoryLabel} successfully removed.`);
      setDeletingCategoryId(null);
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${config.categoryLabel.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryEmoji(config.defaultEmoji);
  };

  const openEditDialog = (category: Category) => {
    setCategoryName(category.name);
    setCategoryEmoji(category.emoji || config.defaultEmoji);
    setEditingCategory(category);
  };

  const getItemCount = (categoryId: string) => {
    return (menuItems || []).filter(item => {
      const itemCategory = item.category ? (typeof item.category === "object" ? item.category._id : item.category) : null;
      return itemCategory === categoryId;
    }).length;
  };

  return (
    <div className="space-y-8">
      {/* Search & Actions Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
        <div className="relative flex-1 max-w-md group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors w-5 h-5" />
          <Input
            placeholder={`Search ${config.categoryLabelPlural.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus:ring-orange-500 font-medium"
          />
        </div>
        <Button onClick={() => setIsAddingCategory(true)} className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95">
          <FiPlus className="w-5 h-5 mr-2" />
          Create {config.categoryLabel}
        </Button>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <MdCategory className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
              {searchQuery ? `No ${config.categoryLabelPlural.toLowerCase()} found` : `Empty ${config.categoryLabelPlural}`}
            </h3>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              {searchQuery ? "Refine your search parameters or reset filters." : `Initialize your first ${config.categoryLabel.toLowerCase()} to professionally organize your business assets.`}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsAddingCategory(true)} className="h-12 px-8 bg-slate-900 text-white font-black rounded-xl">
                Initialize Category
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Professional "All" Selector */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`p-8 rounded-[2rem] border-2 transition-all duration-300 text-left relative group ${
              selectedCategory === null
                ? "border-orange-500 bg-orange-50/30 shadow-xl shadow-orange-600/5"
                : "border-slate-100 bg-white hover:border-orange-200 hover:shadow-lg"
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                selectedCategory === null ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600"
              }`}>
                <MdList className="w-8 h-8" />
              </div>
              {selectedCategory === null && (
                <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center shadow-md">
                  <FiCheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <h3 className={`text-lg font-black tracking-tight uppercase ${selectedCategory === null ? "text-slate-900" : "text-slate-700"}`}>Complete Inventory</h3>
            <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest">{menuItems.length} total {config.itemLabelPlural.toLowerCase()}</p>
          </button>

          {/* Individual Category Entities */}
          {filteredCategories.map((cat) => {
            const categoryId = cat._id || cat.id;
            const itemCount = getItemCount(categoryId!);
            const isActive = selectedCategory === categoryId;

            return (
              <div
                key={categoryId}
                className={`p-8 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer relative group ${
                  isActive
                    ? "border-orange-500 bg-orange-50/30 shadow-xl shadow-orange-600/5"
                    : "border-slate-100 bg-white hover:border-orange-200 hover:shadow-lg"
                }`}
                onClick={() => onSelectCategory(categoryId!)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all ${
                    isActive ? "bg-orange-600 text-white" : "bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:scale-110"
                  }`}>
                    {cat.image ? (
                      <img src={safeImageSrc(cat.image)} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      cat.emoji || config.defaultEmoji
                    )}
                  </div>
                  
                  {/* Strategic Control Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewingCategory(cat); }}
                      className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-200 rounded-xl transition-all shadow-sm"
                      title="Analyze"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditDialog(cat); }}
                      className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm"
                      title="Edit"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingCategoryId(categoryId!); }}
                      className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-all shadow-sm"
                      title="Remove"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className={`text-lg font-black tracking-tight uppercase ${isActive ? "text-slate-900" : "text-slate-700"}`}>{cat.name}</h3>
                <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest">
                  {itemCount} {itemCount === 1 ? config.itemLabel.toLowerCase() : config.itemLabelPlural.toLowerCase()} listed
                </p>
                
                {isActive && (
                  <div className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Menu Category - Professional & Responsive */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:max-w-lg rounded-2xl sm:rounded-[2rem] p-0 overflow-hidden border border-slate-200/80 shadow-2xl max-h-[90dvh] flex flex-col">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-6 md:px-8 py-6 sm:py-8 text-white flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Add {config.categoryLabel}
            </h2>
            <p className="text-orange-100 font-medium text-xs sm:text-sm mt-1">
              Create a new {config.categoryLabel.toLowerCase()} to organize your {config.itemLabelPlural.toLowerCase()}.
            </p>
          </div>
          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 bg-white overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                {config.categoryLabel} Name *
              </label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder={config.categoryPlaceholder}
                className="h-11 sm:h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-semibold text-base min-h-[44px] touch-manipulation"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Icon (Emoji)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 sm:h-16 w-full justify-start gap-3 px-4 rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-orange-200 font-medium min-h-[44px] touch-manipulation"
                  >
                    <span className="text-2xl sm:text-3xl flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      {categoryEmoji}
                    </span>
                    <span className="text-slate-600">Tap to pick emoji</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[min(360px,calc(100vw-3rem))] p-0 border-slate-200 rounded-xl shadow-xl"
                  align="start"
                  sideOffset={8}
                >
                  <EmojiPicker
                    onEmojiClick={(data: EmojiClickData) => setCategoryEmoji(data.emoji)}
                    width="100%"
                    height={360}
                    previewConfig={{ showPreview: false }}
                    searchPlaceHolder="Search emoji..."
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 sm:pt-4">
              <Button
                variant="ghost"
                onClick={() => { resetForm(); setIsAddingCategory(false); }}
                className="flex-1 h-11 sm:h-12 rounded-xl font-bold text-slate-500 min-h-[44px] touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCategory}
                disabled={isSubmitting}
                className="flex-1 h-11 sm:h-12 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg shadow-orange-600/20 min-h-[44px] touch-manipulation"
              >
                {isSubmitting ? "Adding…" : "Add Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category - Professional & Responsive */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:max-w-lg rounded-2xl sm:rounded-[2rem] p-0 overflow-hidden border border-slate-200/80 shadow-2xl max-h-[90dvh] flex flex-col">
          <div className="bg-slate-900 px-4 sm:px-6 md:px-8 py-6 sm:py-8 text-white flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Edit {config.categoryLabel}</h2>
            <p className="text-slate-400 font-medium text-xs sm:text-sm mt-1">
              Update {config.categoryLabel.toLowerCase()} name and icon.
            </p>
          </div>
          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 bg-white overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                {config.categoryLabel} Name *
              </label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder={config.categoryPlaceholder}
                className="h-11 sm:h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-slate-900 font-semibold text-base min-h-[44px] touch-manipulation"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Icon (Emoji)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 sm:h-16 w-full justify-start gap-3 px-4 rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 font-medium min-h-[44px] touch-manipulation"
                  >
                    <span className="text-2xl sm:text-3xl flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      {categoryEmoji}
                    </span>
                    <span className="text-slate-600">Tap to pick emoji</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[min(360px,calc(100vw-3rem))] p-0 border-slate-200 rounded-xl shadow-xl"
                  align="start"
                  sideOffset={8}
                >
                  <EmojiPicker
                    onEmojiClick={(data: EmojiClickData) => setCategoryEmoji(data.emoji)}
                    width="100%"
                    height={360}
                    previewConfig={{ showPreview: false }}
                    searchPlaceHolder="Search emoji..."
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 sm:pt-4">
              <Button
                variant="ghost"
                onClick={() => { resetForm(); setEditingCategory(null); }}
                className="flex-1 h-11 sm:h-12 rounded-xl font-bold text-slate-500 min-h-[44px] touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditCategory}
                disabled={isSubmitting}
                className="flex-1 h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl min-h-[44px] touch-manipulation"
              >
                {isSubmitting ? "Updating…" : "Update Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete modal improved */}
      <Dialog open={!!deletingCategoryId} onOpenChange={(open) => !open && setDeletingCategoryId(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] p-8 border-none shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 flex items-center justify-center border border-red-100 text-red-600">
              <FiTrash2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Confirm Removal</h3>
              <p className="text-slate-500 font-medium text-sm mt-2">
                Are you sure you want to decommission this {config.categoryLabel.toLowerCase()}? This action is permanent.
              </p>
              {deletingCategoryId && getItemCount(deletingCategoryId) > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                    Dependency Alert: {getItemCount(deletingCategoryId)} linked items detected
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="destructive" onClick={handleDeleteCategory} disabled={isSubmitting} className="h-12 w-full font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-red-600/20">
                {isSubmitting ? "Processing..." : "Confirm Deletion"}
              </Button>
              <Button variant="ghost" onClick={() => setDeletingCategoryId(null)} className="h-12 w-full font-bold text-slate-400">
                Abort
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View modal improved */}
      <Dialog open={!!viewingCategory} onOpenChange={(open) => !open && setViewingCategory(null)}>
        <DialogContent className="max-w-sm rounded-[2.5rem] p-8 border-none shadow-2xl text-center">
          {viewingCategory && (
            <div className="space-y-8">
              <div className="relative mx-auto">
                <div className="w-28 h-28 mx-auto rounded-[2rem] bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-5xl shadow-2xl shadow-orange-600/30">
                  {viewingCategory.image ? (
                    <img src={safeImageSrc(viewingCategory.image)} alt={viewingCategory.name} className="w-full h-full object-cover rounded-[2rem]" />
                  ) : (
                    viewingCategory.emoji || config.defaultEmoji
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{config.categoryLabel}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{viewingCategory.name}</h3>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full">
                  <MdList className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{getItemCount(viewingCategory._id || viewingCategory.id || '')} assets listed</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => { 
                    onSelectCategory(viewingCategory._id || viewingCategory.id || null); 
                    setViewingCategory(null); 
                  }} 
                  className="h-14 w-full bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95"
                >
                  Inspect Category Data
                </Button>
                <Button variant="ghost" onClick={() => setViewingCategory(null)} className="font-bold text-slate-400">
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
