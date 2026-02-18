import { Eye, Rocket, Monitor, Smartphone, Tablet, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';
import api from '@/lib/api';


export default function PreviewPublish() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const isDraft = settings?.publish?.isDraft !== false;
  const lastPublished = settings?.publish?.publishedAt 
    ? new Date(settings.publish.publishedAt).toLocaleString() 
    : 'Never';

  const handlePreview = async () => {
    try {
      // Apply current settings for preview
      await api.previewSiteSettings();
      toast({
        title: 'Preview Mode',
        description: 'Preview mode activated. Your changes are visible only to you.',
      });
      // Open homepage in new tab for preview
      window.open('/', '_blank');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to activate preview mode',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const response = await api.publishSiteSettings();
      if (response.success) {
        toast({
          title: 'Published!',
          description: 'Your website changes are now live.',
        });
        refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish changes';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  return (
    <CustomizationLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            Preview & Publish
          </h1>
          <p className="text-muted-foreground mt-1">
            Review your changes and publish to make them live
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handlePreview} variant="outline" size="lg">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handlePublish} disabled={publishing} size="lg">
            <Rocket className="h-4 w-4 mr-2" />
            {publishing ? 'Publishing...' : 'Publish Changes'}
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className={isDraft ? 'border-yellow-200 bg-yellow-50/50' : 'border-green-200 bg-green-50/50'}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {isDraft ? (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <CardTitle className={isDraft ? 'text-yellow-900' : 'text-green-900'}>
              {isDraft ? 'Draft Mode - Changes Not Live' : 'Published - Changes are Live'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDraft ? 'text-yellow-800' : 'text-green-800'}`}>
              {isDraft 
                ? 'You have unpublished changes. Click "Publish Changes" to make them live.'
                : 'Your website is live with the latest changes.'
              }
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last published: {lastPublished}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                Preview your website across different devices
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 rounded-lg p-6 flex justify-center">
            <div 
              className="bg-white rounded-lg border-2 shadow-2xl overflow-hidden transition-all duration-300"
              style={{ width: getDeviceWidth(), minHeight: '600px' }}
            >
              {/* Mock Preview */}
              <div className="relative h-full">
                {/* Header Preview */}
                <div 
                  className="p-4 flex items-center justify-between"
                  style={{ 
                    backgroundColor: settings?.colors?.secondary || '#1f2937',
                    fontFamily: settings?.typography?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  {settings?.branding?.logoUrl ? (
                    <img src={settings.branding.logoUrl} alt="Logo" className="h-8 object-contain" />
                  ) : (
                    <div className="text-white font-bold">{settings?.general?.siteName || 'Your Site'}</div>
                  )}
                  <div className="flex gap-3 text-white text-xs">
                    <span>Home</span>
                    <span>About</span>
                    <span>Contact</span>
                  </div>
                </div>

                {/* Hero Section Preview */}
                {settings?.media?.heroImageUrl ? (
                  <div className="relative h-64">
                    <img 
                      src={settings.media.heroImageUrl} 
                      alt="Hero" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center text-white space-y-2 p-4">
                        <h1 className="text-2xl font-bold" style={{ fontFamily: settings?.typography?.fontFamily }}>
                          {settings?.general?.siteName || 'Your Website'}
                        </h1>
                        <p style={{ fontSize: `${settings?.typography?.baseFontSize || 16}px` }}>
                          {settings?.general?.siteDescription || 'Your description here'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="h-64 flex items-center justify-center"
                    style={{ 
                      backgroundColor: settings?.colors?.primary || '#ff6b2c',
                      color: '#ffffff'
                    }}
                  >
                    <div className="text-center space-y-2 p-4">
                      <h1 className="text-2xl font-bold" style={{ fontFamily: settings?.typography?.fontFamily }}>
                        {settings?.general?.siteName || 'Your Website'}
                      </h1>
                      <p style={{ fontSize: `${settings?.typography?.baseFontSize || 16}px` }}>
                        {settings?.general?.siteDescription || 'Your description here'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Content Sections Preview */}
                <div className="p-6 space-y-6" style={{ 
                  backgroundColor: settings?.colors?.background || '#ffffff',
                  color: settings?.colors?.text || '#111827',
                  fontFamily: settings?.typography?.fontFamily || 'Inter, sans-serif'
                }}>
                  {settings?.sections?.showFeatures && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Features</h2>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="text-center p-3 border rounded-lg">
                            <div className="h-8 w-8 bg-primary/20 rounded-full mx-auto mb-2" style={{ backgroundColor: `${settings?.colors?.primary}20` }} />
                            <div className="text-xs">Feature {i}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settings?.sections?.showPricing && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Pricing</h2>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border rounded-lg p-3">
                            <div className="font-bold text-sm mb-2">Plan {i}</div>
                            <div className="text-xs text-muted-foreground">$99/mo</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Preview */}
                <div 
                  className="p-4 text-center text-white text-xs"
                  style={{ backgroundColor: settings?.colors?.secondary || '#1f2937' }}
                >
                  © 2024 {settings?.general?.siteName || 'Your Company'}. All rights reserved.
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Viewing in {previewDevice} mode ({previewDevice === 'desktop' ? 'Full width' : previewDevice === 'tablet' ? '768px' : '375px'})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Settings Summary</CardTitle>
          <CardDescription>
            Overview of your website customization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Site Name</span>
                <span className="text-sm text-muted-foreground">{settings?.general?.siteName || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Logo</span>
                <span className="text-sm text-muted-foreground">
                  {settings?.branding?.logoUrl ? 'Configured' : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Primary Color</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-4 w-8 rounded border" 
                    style={{ backgroundColor: settings?.colors?.primary || '#ff6b2c' }}
                  />
                  <span className="text-xs font-mono">{settings?.colors?.primary || '#ff6b2c'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Typography</span>
                <span className="text-sm text-muted-foreground">
                  {settings?.typography?.baseFontSize || 16}px base
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Layout</span>
                <span className="text-sm text-muted-foreground capitalize">
                  {settings?.layout?.contentWidth || 'Full width'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Animations</span>
                <span className="text-sm text-muted-foreground">
                  {settings?.animations?.enabled ? `Enabled (${settings.animations.durationMs}ms)` : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Active Sections</span>
                <span className="text-sm text-muted-foreground">
                  {Object.values(settings?.sections || {}).filter(Boolean).length} visible
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">SEO Title</span>
                <span className="text-sm text-muted-foreground">
                  {settings?.seo?.metaTitle ? 'Configured' : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-publish Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Publish Checklist</CardTitle>
          <CardDescription>
            Ensure everything is ready before going live
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ChecklistItem 
              checked={!!settings?.general?.siteName}
              label="Site name configured"
            />
            <ChecklistItem 
              checked={!!settings?.branding?.logoUrl}
              label="Logo uploaded"
            />
            <ChecklistItem 
              checked={!!settings?.seo?.metaTitle && settings.seo.metaTitle.length >= 50}
              label="SEO title optimized (50+ characters)"
            />
            <ChecklistItem 
              checked={!!settings?.seo?.metaDescription && settings.seo.metaDescription.length >= 120}
              label="Meta description complete (120+ characters)"
            />
            <ChecklistItem 
              checked={!!settings?.colors?.primary}
              label="Brand colors selected"
            />
            <ChecklistItem 
              checked={Object.values(settings?.sections || {}).some(Boolean)}
              label="At least one section enabled"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Need to make changes?</h3>
          </div>
          <p className="text-sm text-blue-800 mb-4">
            Use the navigation to update specific sections before publishing.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { label: 'General', path: '/admin/customization/general' },
              { label: 'Branding', path: '/admin/customization/branding' },
              { label: 'Typography', path: '/admin/customization/typography' },
              { label: 'Colors', path: '/admin/customization/colors' },
              { label: 'SEO', path: '/admin/customization/seo' },
            ].map((item) => (
              <Button
                key={item.path}
                variant="outline"
                size="sm"
                onClick={() => navigate(item.path)}
                className="bg-white"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Publish Button (Bottom) */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button onClick={handlePreview} variant="outline" size="lg">
          <Eye className="h-4 w-4 mr-2" />
          Preview Changes
        </Button>
        <Button onClick={handlePublish} disabled={publishing} size="lg">
          <Rocket className="h-4 w-4 mr-2" />
          {publishing ? 'Publishing...' : 'Publish to Live Site'}
        </Button>
      </div>
    </div>
    </CustomizationLayout>
  );
}

function ChecklistItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <div className={`h-5 w-5 rounded flex items-center justify-center ${
        checked ? 'bg-green-500' : 'bg-slate-200'
      }`}>
        {checked && <CheckCircle className="h-4 w-4 text-white" />}
      </div>
      <span className={`text-sm ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
