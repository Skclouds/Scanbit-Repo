import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload, Image, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';


export default function LogoBranding() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [branding, setBranding] = useState({
    mainLogo: '',
    darkLogo: '',
    favicon: '',
    mobileLogo: '',
    footerLogo: '',
    appIcon: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSiteSettings();
      if (res.success && res.data?.branding) {
        setBranding({
          mainLogo: res.data.branding.logoUrl || '',
          darkLogo: res.data.branding.darkLogoUrl || '',
          favicon: res.data.branding.faviconUrl || '',
          mobileLogo: res.data.branding.mobileLogoUrl || '',
          footerLogo: res.data.branding.footerLogoUrl || '',
          appIcon: res.data.branding.appIconUrl || '',
        });
      }
    } catch (e) {

    }
  };

  const handleUpload = async (field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setUploading(field);
      try {
        const url = await api.uploadImage(file, 'branding');
        setBranding(prev => ({ ...prev, [field]: url }));
        toast.success('Image uploaded successfully');
      } catch (err) {
        toast.error((err as Error).message || 'Upload failed');
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.updateBrandingSettings({
        logoUrl: branding.mainLogo,
        darkLogoUrl: branding.darkLogo,
        mobileLogoUrl: branding.mobileLogo,
        footerLogoUrl: branding.footerLogo,
        faviconUrl: branding.favicon,
        appIconUrl: branding.appIcon,
      });
      
      if (response.success) {
        toast.success('Branding settings saved successfully!');
        // Reload settings to confirm
        await loadSettings();
      } else {
        toast.error('Failed to save branding settings');
      }
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || 'Failed to save branding settings');
    } finally {
      setLoading(false);
    }
  };

  const LogoUploader = ({ label, field, description, recommended }: { label: string; field: keyof typeof branding; description: string; recommended: string }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label>{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-32 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
          {branding[field] ? (
            <img src={branding[field]} alt={label} className="max-w-full max-h-full object-contain" />
          ) : (
            <Image className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpload(field)}
            disabled={uploading === field}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading === field ? 'Uploading...' : 'Upload'}
          </Button>
          {branding[field] && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => setBranding(prev => ({ ...prev, [field]: '' }))}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{recommended}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Logo & Branding</h2>
          <p className="text-muted-foreground">Manage your website logos and brand assets</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Primary Logos</CardTitle>
            <CardDescription>Main logos used across the website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LogoUploader
              label="Main Logo"
              field="mainLogo"
              description="Primary logo for header"
              recommended="Recommended: 200x60px, PNG/SVG"
            />
            <LogoUploader
              label="Dark Mode Logo"
              field="darkLogo"
              description="Logo for dark backgrounds"
              recommended="Recommended: 200x60px, PNG/SVG"
            />
            <LogoUploader
              label="Mobile Logo"
              field="mobileLogo"
              description="Compact logo for mobile"
              recommended="Recommended: 120x40px, PNG"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Icons & Favicons</CardTitle>
            <CardDescription>Browser icons and app icons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LogoUploader
              label="Favicon"
              field="favicon"
              description="Browser tab icon"
              recommended="Recommended: 32x32px or 64x64px, ICO/PNG"
            />
            <LogoUploader
              label="App Icon"
              field="appIcon"
              description="PWA and app icon"
              recommended="Recommended: 512x512px, PNG"
            />
            <LogoUploader
              label="Footer Logo"
              field="footerLogo"
              description="Logo displayed in footer"
              recommended="Recommended: 150x50px, PNG/SVG"
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your branding looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-background border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Light Header</p>
              <div className="h-12 flex items-center">
                {branding.mainLogo ? (
                  <img src={branding.mainLogo} alt="Logo" className="h-8 object-contain" />
                ) : (
                  <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-900 border rounded-lg">
              <p className="text-xs text-gray-400 mb-2">Dark Header</p>
              <div className="h-12 flex items-center">
                {branding.darkLogo || branding.mainLogo ? (
                  <img src={branding.darkLogo || branding.mainLogo} alt="Logo" className="h-8 object-contain" />
                ) : (
                  <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
                )}
              </div>
            </div>
            <div className="p-4 bg-muted border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Browser Tab</p>
              <div className="flex items-center gap-2">
                {branding.favicon ? (
                  <img src={branding.favicon} alt="Favicon" className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 bg-primary/20 rounded" />
                )}
                <span className="text-sm truncate">Your Site Name</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
