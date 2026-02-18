import { MdImage, MdCloudUpload, MdDelete, MdEdit, MdGridView, MdViewList, MdSearch, MdFilterList, MdFolder, MdInsertPhoto, MdRestaurantMenu, MdShoppingBag, MdBrush, MdWork, MdPhotoLibrary } from "react-icons/md";
import { FiUpload, FiTrash2, FiEdit, FiDownload, FiEye, FiCopy, FiCheck, FiGrid, FiList, FiImage, FiFolder, FiPlus } from "react-icons/fi";
import { compressImageToMaxSize } from "@/lib/compressImage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";
import { safeImageSrc, IMAGE_PLACEHOLDER } from "@/lib/imageUtils";


interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'logo' | 'banner';
  category?: string;
  size: number;
  uploadedAt: string;
  dimensions?: { width: number; height: number };
}

interface MediaLibraryProps {
  restaurant: any;
  menuItems?: any[];
  onUpdate?: () => void;
}

export const MediaLibrary = ({ restaurant, menuItems = [], onUpdate }: MediaLibraryProps) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [gallerySaving, setGallerySaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Get business-specific folder names
  const getBusinessFolders = () => {
    const base = ['all', 'logos', 'banners'];
    if (restaurant?.businessCategory?.includes('Retail')) {
      return [...base, 'products', 'categories'];
    }
    if (restaurant?.businessCategory?.includes('Creative')) {
      return [...base, 'portfolio', 'projects'];
    }
    if (restaurant?.businessCategory?.includes('Professional')) {
      return [...base, 'services', 'team'];
    }
    return [...base, 'menu-items', 'categories'];
  };

  const folders = getBusinessFolders();

  useEffect(() => {
    loadMedia();
  }, [restaurant]);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      
      // Build media from restaurant and menu items
      const mediaList: MediaItem[] = [];
      
      // Restaurant logo
      if (restaurant?.logo) {
        mediaList.push({
          id: 'logo-1',
          name: `${restaurant.name} Logo`,
          url: restaurant.logo,
          type: 'logo',
          category: 'logos',
          size: 0,
          uploadedAt: restaurant.createdAt || new Date().toISOString(),
        });
      }
      
      // Restaurant banner/cover
      if (restaurant?.coverImage) {
        mediaList.push({
          id: 'banner-1',
          name: 'Cover Image',
          url: restaurant.coverImage,
          type: 'banner',
          category: 'banners',
          size: 0,
          uploadedAt: restaurant.updatedAt || new Date().toISOString(),
        });
      }
      
      // Menu item images
      menuItems.forEach((item, index) => {
        if (item.image) {
          mediaList.push({
            id: `menu-${item._id || item.id || index}`,
            name: item.name,
            url: item.image,
            type: 'image',
            category: getItemCategory(),
            size: 0,
            uploadedAt: item.createdAt || new Date().toISOString(),
          });
        }
      });
      
      setMedia(mediaList);
      setGalleryImages(Array.isArray(restaurant?.foodImages) ? [...restaurant.foodImages] : []);
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };

  const GALLERY_MAX = 10;

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = GALLERY_MAX - galleryImages.length;
    if (remaining <= 0) {
      toast.error(`Gallery is full. Maximum ${GALLERY_MAX} images allowed.`);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      return;
    }

    const toAdd = Math.min(remaining, files.length);
    try {
      setIsUploading(true);
      const urls: string[] = [];
      for (let i = 0; i < toAdd; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImageToMaxSize(file, 500 * 1024);
        const url = await api.uploadImage(compressed, 'gallery');
        urls.push(url);
      }
      const updated = [...galleryImages, ...urls].slice(0, GALLERY_MAX);
      setGallerySaving(true);
      const restRes = await api.getMyRestaurant();
      if (restRes?.success && restRes?.data) {
        await api.updateRestaurant(restRes.data._id || restRes.data.id, { foodImages: updated });
      } else {
        throw new Error('Restaurant not found');
      }
      setGalleryImages(updated);
      toast.success(`${urls.length} image(s) added to gallery (compressed to max 500KB)`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload gallery images');
    } finally {
      setIsUploading(false);
      setGallerySaving(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGalleryImage = async (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index);
    try {
      setGallerySaving(true);
      const restRes = await api.getMyRestaurant();
      if (restRes?.success && restRes?.data) {
        await api.updateRestaurant(restRes.data._id || restRes.data.id, { foodImages: updated });
      } else {
        throw new Error('Restaurant not found');
      }
      setGalleryImages(updated);
      onUpdate?.();
      toast.success('Image removed from gallery');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update gallery');
    } finally {
      setGallerySaving(false);
    }
  };

  const getItemCategory = () => {
    if (restaurant?.businessCategory?.includes('Retail')) return 'products';
    if (restaurant?.businessCategory?.includes('Creative')) return 'portfolio';
    if (restaurant?.businessCategory?.includes('Professional')) return 'services';
    return 'menu-items';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const url = await api.uploadImage(file, 'media');
      
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        name: file.name,
        url,
        type: 'image',
        category: selectedFolder === 'all' ? getItemCategory() : selectedFolder,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      
      setMedia([newMedia, ...media]);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteMedia = (id: string) => {
    setMedia(media.filter(m => m.id !== id));
    toast.success('Image deleted');
    setSelectedMedia(null);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredMedia = media.filter(m => {
    if (selectedFolder !== 'all' && m.category !== selectedFolder) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getBusinessIcon = () => {
    if (restaurant?.businessCategory?.includes('Retail')) return <MdShoppingBag className="w-5 h-5" />;
    if (restaurant?.businessCategory?.includes('Creative')) return <MdBrush className="w-5 h-5" />;
    if (restaurant?.businessCategory?.includes('Professional')) return <MdWork className="w-5 h-5" />;
    return <MdRestaurantMenu className="w-5 h-5" />;
  };

  const getItemLabel = () => {
    if (restaurant?.businessCategory?.includes('Retail')) return 'Product Images';
    if (restaurant?.businessCategory?.includes('Creative')) return 'Portfolio Images';
    if (restaurant?.businessCategory?.includes('Professional')) return 'Service Images';
    return 'Menu Item Images';
  };

  return (
    <div className="space-y-6 mt-20">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white">
              <MdImage className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Media Library</h1>
              <p className="text-sm text-muted-foreground">
                Manage all your images and media assets • {media.length} files
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <FiUpload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MdPhotoLibrary className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Gallery</h2>
              <p className="text-sm text-muted-foreground">
                Add up to {GALLERY_MAX} images for your public gallery (auto-compressed to max 500KB)
              </p>
            </div>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            className="hidden"
          />
          <Button
            onClick={() => galleryInputRef.current?.click()}
            disabled={isUploading || gallerySaving || galleryImages.length >= GALLERY_MAX}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : galleryImages.length >= GALLERY_MAX ? 'Gallery full' : 'Add to Gallery'}
          </Button>
        </div>
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {galleryImages.map((url, index) => (
              <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-secondary">
                <img
                  src={safeImageSrc(url)}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = IMAGE_PLACEHOLDER; }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="w-10 h-10"
                    onClick={() => removeGalleryImage(index)}
                    disabled={gallerySaving}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <MdPhotoLibrary className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No gallery images yet. Add images to showcase on your menu page.</p>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <FiGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <FiList className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Folder Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedFolder === folder
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <FiFolder className="w-4 h-4" />
              {folder.charAt(0).toUpperCase() + folder.slice(1).replace('-', ' ')}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {folder === 'all' ? media.length : media.filter(m => m.category === folder).length}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <MdImage className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">No media found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try a different search term' : 'Upload your first image to get started'}
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <FiUpload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-secondary cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => setSelectedMedia(item)}
              >
                <img
                  src={safeImageSrc(item.url)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = IMAGE_PLACEHOLDER;
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="w-8 h-8">
                    <FiEye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="w-8 h-8"
                    onClick={(e) => { e.stopPropagation(); deleteMedia(item.id); }}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs truncate">{item.name}</p>
                </div>
                {item.type === 'logo' && (
                  <Badge className="absolute top-2 right-2 text-xs">Logo</Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img
                    src={safeImageSrc(item.url)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = IMAGE_PLACEHOLDER;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{formatFileSize(item.size)}</span>
                    <span>•</span>
                    <span>{formatDate(item.uploadedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}>
                    {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteMedia(item.id); }}>
                    <FiTrash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Images Summary */}
      {menuItems.length > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            {getBusinessIcon()}
            <h3 className="font-display text-lg font-semibold">{getItemLabel()}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-xl">
              <p className="text-2xl font-bold text-foreground">{menuItems.length}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
            <div className="p-4 bg-background rounded-xl">
              <p className="text-2xl font-bold text-foreground">
                {menuItems.filter(i => i.image).length}
              </p>
              <p className="text-sm text-muted-foreground">With Images</p>
            </div>
            <div className="p-4 bg-background rounded-xl">
              <p className="text-2xl font-bold text-foreground">
                {menuItems.filter(i => !i.image).length}
              </p>
              <p className="text-sm text-muted-foreground">Without Images</p>
            </div>
            <div className="p-4 bg-background rounded-xl">
              <p className="text-2xl font-bold text-foreground">
                {menuItems.length > 0 
                  ? Math.round((menuItems.filter(i => i.image).length / menuItems.length) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Coverage</p>
            </div>
          </div>
        </div>
      )}

      {/* Media Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.name}</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                <img
                  src={safeImageSrc(selectedMedia.url)}
                  alt={selectedMedia.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = IMAGE_PLACEHOLDER;
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedMedia.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{selectedMedia.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Size</Label>
                  <p className="font-medium">{formatFileSize(selectedMedia.size)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Uploaded</Label>
                  <p className="font-medium">{formatDate(selectedMedia.uploadedAt)}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={selectedMedia.url} readOnly className="font-mono text-xs" />
                  <Button variant="outline" onClick={() => copyUrl(selectedMedia.url)}>
                    {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={selectedMedia.url} download target="_blank">
                    <FiDownload className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => deleteMedia(selectedMedia.id)}
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibrary;
