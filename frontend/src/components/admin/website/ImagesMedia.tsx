import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Upload, Image, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ImagesMedia() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [media, setMedia] = useState({
    heroImage: '',
    heroVideo: '',
    aboutImage: '',
    contactImage: '',
    defaultPlaceholder: '',
    ogImage: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSiteSettings();
      if (res.success && res.data?.media) {
        setMedia(prev => ({
          ...prev,
          heroImage: res.data.media.heroImageUrl || '',
          bannerImage: res.data.media.bannerImageUrl || '',
        }));
      }
    } catch (e) {

    }
  };

  const handleUpload = async (field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = field.includes('Video') ? 'video/*' : 'image/*';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setUploading(field);
      try {
        const url = await api.uploadImage(file, 'media');
        setMedia(prev => ({ ...prev, [field]: url }));
        toast.success('File uploaded successfully');
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
      await api.updateAdminSiteSettings({
        media: {
          heroImageUrl: media.heroImage,
          bannerImageUrl: media.aboutImage,
        }
      });
      toast.success('Media settings saved');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const MediaUploader = ({ label, field, description, accept = 'image' }: { label: string; field: keyof typeof media; description: string; accept?: 'image' | 'video' }) => (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="aspect-video w-full border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
        {media[field] ? (
          accept === 'video' ? (
            <video src={media[field]} className="max-w-full max-h-full object-cover" controls />
          ) : (
            <img src={media[field]} alt={label} className="max-w-full max-h-full object-cover" />
          )
        ) : (
          <div className="text-center p-4">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No {accept} selected</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => handleUpload(field)}
          disabled={uploading === field}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading === field ? 'Uploading...' : 'Upload'}
        </Button>
        {media[field] && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(media[field], '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => setMedia(prev => ({ ...prev, [field]: '' }))}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Images & Media</h2>
          <p className="text-muted-foreground">Manage website images and media files</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Main banner images and videos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MediaUploader
              label="Hero Image"
              field="heroImage"
              description="Main homepage banner (1920x1080 recommended)"
            />
            <MediaUploader
              label="Hero Video"
              field="heroVideo"
              description="Background video (optional)"
              accept="video"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Images</CardTitle>
            <CardDescription>Images for specific pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MediaUploader
              label="About Page Image"
              field="aboutImage"
              description="Image for about section"
            />
            <MediaUploader
              label="Contact Page Image"
              field="contactImage"
              description="Image for contact page"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Images</CardTitle>
            <CardDescription>Fallback and placeholder images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MediaUploader
              label="Default Placeholder"
              field="defaultPlaceholder"
              description="Shown when images fail to load"
            />
            <MediaUploader
              label="Social Share Image (OG Image)"
              field="ogImage"
              description="Displayed when sharing on social media (1200x630)"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
            <CardDescription>Best practices for images</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Use WebP format for better compression
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Optimize images before uploading (max 500KB)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Hero images: 1920x1080px or 2:1 aspect ratio
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                OG images: 1200x630px for social sharing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Use descriptive file names for SEO
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
