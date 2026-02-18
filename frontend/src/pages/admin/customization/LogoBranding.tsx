import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload, Image as ImageIcon, Sparkles, Info } from 'lucide-react';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


export default function LogoBranding() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null);
  const [formData, setFormData] = useState({
    logoUrl: '',
    faviconUrl: '',
  });

  useEffect(() => {
    if (settings?.branding) {
      setFormData({
        logoUrl: settings.branding.logoUrl || '',
        faviconUrl: settings.branding.faviconUrl || '',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (type: 'logo' | 'favicon', file: File) => {
    setUploading(type);
    try {
      const imageUrl = await api.uploadImage(file, 'branding');
      handleChange(type === 'logo' ? 'logoUrl' : 'faviconUrl', imageUrl);
      toast({
        title: 'Success',
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`,
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
      const response = await api.updateBrandingSettings(formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Branding settings saved successfully!',
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
            <Sparkles className="h-8 w-8 text-primary" />
            Logo & Branding
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your website's logo and favicon
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg text-purple-900">Branding Guidelines</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Logo: PNG or SVG format recommended, transparent background preferred</li>
            <li>• Recommended logo size: 200x60px to 400x120px for optimal display</li>
            <li>• Favicon: 32x32px or 64x64px, ICO, PNG, or SVG format</li>
            <li>• Maximum file size: 2MB for logo, 100KB for favicon</li>
          </ul>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Website Logo</CardTitle>
          <CardDescription>
            Main logo displayed in the header and throughout your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Logo Preview */}
          {formData.logoUrl && (
            <div className="space-y-2">
              <Label>Current Logo</Label>
              <div className="border rounded-lg p-6 bg-slate-50 flex items-center justify-center">
                <img
                  src={formData.logoUrl}
                  alt="Logo"
                  className="max-h-24 max-w-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Logo URL Input */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct URL to your logo image or upload below
            </p>
          </div>

          {/* Upload Button */}
          <div className="space-y-2">
            <Label>Upload New Logo</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={uploading === 'logo'}
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading === 'logo' ? 'Uploading...' : 'Choose File'}
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('logo', file);
                }}
              />
              <span className="text-sm text-muted-foreground">
                PNG, JPG, SVG (Max 2MB)
              </span>
            </div>
          </div>

          {/* Logo Display Examples */}
          {formData.logoUrl && (
            <div className="space-y-3 pt-4 border-t">
              <Label>Preview in Different Contexts</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-white">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Light Background</p>
                  <div className="bg-white p-4 rounded flex items-center justify-center">
                    <img src={formData.logoUrl} alt="Logo" className="h-12 object-contain" />
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-slate-800">
                  <p className="text-xs font-medium text-slate-300 mb-2">Dark Background</p>
                  <div className="bg-slate-900 p-4 rounded flex items-center justify-center">
                    <img src={formData.logoUrl} alt="Logo" className="h-12 object-contain" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favicon Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Favicon</CardTitle>
          <CardDescription>
            Small icon displayed in browser tabs and bookmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Favicon Preview */}
          {formData.faviconUrl && (
            <div className="space-y-2">
              <Label>Current Favicon</Label>
              <div className="border rounded-lg p-6 bg-slate-50 flex items-center justify-center">
                <div className="relative">
                  <img
                    src={formData.faviconUrl}
                    alt="Favicon"
                    className="h-16 w-16 object-contain"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 border shadow-sm">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Favicon URL Input */}
          <div className="space-y-2">
            <Label htmlFor="faviconUrl">Favicon URL</Label>
            <Input
              id="faviconUrl"
              value={formData.faviconUrl}
              onChange={(e) => handleChange('faviconUrl', e.target.value)}
              placeholder="https://example.com/favicon.ico"
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct URL to your favicon or upload below
            </p>
          </div>

          {/* Upload Button */}
          <div className="space-y-2">
            <Label>Upload New Favicon</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={uploading === 'favicon'}
                onClick={() => document.getElementById('favicon-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading === 'favicon' ? 'Uploading...' : 'Choose File'}
              </Button>
              <input
                id="favicon-upload"
                type="file"
                accept="image/*,.ico"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('favicon', file);
                }}
              />
              <span className="text-sm text-muted-foreground">
                ICO, PNG (32x32 or 64x64)
              </span>
            </div>
          </div>

          {/* Favicon Browser Preview */}
          {formData.faviconUrl && (
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-xs font-medium text-muted-foreground mb-3">Browser Tab Preview:</p>
              <div className="bg-white rounded-md border shadow-sm p-2 inline-flex items-center gap-2">
                <img src={formData.faviconUrl} alt="Favicon" className="h-4 w-4" />
                <span className="text-sm font-medium">{settings?.general?.siteName || 'Your Website'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Branding'}
        </Button>
      </div>
    </div>
    </CustomizationLayout>
  );
}
