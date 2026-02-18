import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload, Image as ImageIcon, Info, Trash2 } from 'lucide-react';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


export default function ImagesMedia() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'hero' | 'banner' | null>(null);
  const [formData, setFormData] = useState({
    heroImageUrl: '',
    bannerImageUrl: '',
  });

  useEffect(() => {
    if (settings?.media) {
      setFormData({
        heroImageUrl: settings.media.heroImageUrl || '',
        bannerImageUrl: settings.media.bannerImageUrl || '',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (type: 'hero' | 'banner', file: File) => {
    setUploading(type);
    try {
      const imageUrl = await api.uploadImage(file, 'media');
      handleChange(type === 'hero' ? 'heroImageUrl' : 'bannerImageUrl', imageUrl);
      toast({
        title: 'Success',
        description: `${type === 'hero' ? 'Hero' : 'Banner'} image uploaded successfully!`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      toast({
        title: 'Upload Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.updateMediaSettings(formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Media settings saved successfully!',
        });
        refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomizationLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            Images & Media
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage hero images, banners, and other media assets
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg text-green-900">Media Guidelines</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Hero images: 1920x1080px recommended for full-width display</li>
            <li>• Banner images: 1200x400px for optimal aspect ratio</li>
            <li>• Use high-quality images (WebP or optimized JPG/PNG)</li>
            <li>• Keep file sizes under 500KB for fast loading</li>
            <li>• Ensure images are relevant and enhance your message</li>
          </ul>
        </CardContent>
      </Card>

      {/* Hero Image */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Image</CardTitle>
          <CardDescription>
            Main background image for your homepage hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Preview */}
          {formData.heroImageUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Current Hero Image</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChange('heroImageUrl', '')}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden bg-slate-50">
                <img
                  src={formData.heroImageUrl}
                  alt="Hero"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="heroImageUrl">Hero Image URL</Label>
            <Input
              id="heroImageUrl"
              value={formData.heroImageUrl}
              onChange={(e) => handleChange('heroImageUrl', e.target.value)}
              placeholder="https://example.com/hero.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct URL to your hero image or upload below
            </p>
          </div>

          {/* Upload Section */}
          <div className="space-y-2">
            <Label>Upload New Hero Image</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-2">
                {uploading === 'hero' ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                PNG, JPG, WebP up to 5MB (1920x1080px recommended)
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={uploading === 'hero'}
                onClick={() => document.getElementById('hero-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <input
                id="hero-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('hero', file);
                }}
              />
            </div>
          </div>

          {/* Preview in Context */}
          {formData.heroImageUrl && (
            <div className="space-y-2 pt-4 border-t">
              <Label>Hero Section Preview</Label>
              <div className="border rounded-lg overflow-hidden relative h-72">
                <img
                  src={formData.heroImageUrl}
                  alt="Hero Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white space-y-3 p-6">
                    <h1 className="text-4xl font-bold">Welcome to Your Website</h1>
                    <p className="text-lg">This is how your hero image will appear</p>
                    <Button size="lg" className="mt-4">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banner Image */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Image</CardTitle>
          <CardDescription>
            Secondary banner image for promotional sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Preview */}
          {formData.bannerImageUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Current Banner Image</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChange('bannerImageUrl', '')}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden bg-slate-50">
                <img
                  src={formData.bannerImageUrl}
                  alt="Banner"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="bannerImageUrl">Banner Image URL</Label>
            <Input
              id="bannerImageUrl"
              value={formData.bannerImageUrl}
              onChange={(e) => handleChange('bannerImageUrl', e.target.value)}
              placeholder="https://example.com/banner.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct URL to your banner image or upload below
            </p>
          </div>

          {/* Upload Section */}
          <div className="space-y-2">
            <Label>Upload New Banner Image</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-2">
                {uploading === 'banner' ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                PNG, JPG, WebP up to 3MB (1200x400px recommended)
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={uploading === 'banner'}
                onClick={() => document.getElementById('banner-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('banner', file);
                }}
              />
            </div>
          </div>

          {/* Preview in Context */}
          {formData.bannerImageUrl && (
            <div className="space-y-2 pt-4 border-t">
              <Label>Banner Section Preview</Label>
              <div className="border rounded-lg overflow-hidden relative h-48">
                <img
                  src={formData.bannerImageUrl}
                  alt="Banner Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                  <div className="text-white space-y-2 p-8">
                    <h2 className="text-3xl font-bold">Special Offer</h2>
                    <p className="text-lg">Limited time promotion banner</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Image Optimization Tips</CardTitle>
          <CardDescription>
            Best practices for web images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Format Selection</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• WebP: Best compression, modern browsers</li>
                <li>• JPG: Photos and complex images</li>
                <li>• PNG: Graphics with transparency</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Performance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Compress images before upload</li>
                <li>• Use appropriate dimensions</li>
                <li>• Consider lazy loading for speed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Media'}
        </Button>
      </div>
    </div>
    </CustomizationLayout>
  );
}
