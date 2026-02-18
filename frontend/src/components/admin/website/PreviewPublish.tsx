import { Eye, Globe, Smartphone, Tablet, Monitor, RefreshCw, ExternalLink, Check, Clock, AlertCircle, Rocket, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';


interface SiteSettings {
  publish?: {
    isDraft?: boolean;
    publishedAt?: string;
  };
  branding?: {
    logoUrl?: string;
  };
  general?: {
    siteName?: string;
    siteDescription?: string;
  };
  colors?: {
    primary?: string;
  };
  updatedAt?: string;
}

export default function PreviewPublish() {
  const [publishing, setPublishing] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSiteSettings();
      if (res.success) {
        setSettings(res.data as SiteSettings);
      }
    } catch (e) {

    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.publishSiteSettings();
      await loadSettings();
      toast.success('Website published successfully!');
    } catch (e) {
      toast.error('Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const publishHistory = [
    { date: 'Just now', action: 'Settings saved', status: 'draft' },
    { date: '2 hours ago', action: 'Published all changes', status: 'published' },
    { date: '1 day ago', action: 'Updated colors', status: 'published' },
    { date: '3 days ago', action: 'Changed logo', status: 'published' },
  ];

  const previewWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Preview & Publish</h2>
          <p className="text-muted-foreground">Preview changes and publish to your live website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handlePublish} disabled={publishing}>
            <Rocket className="w-4 h-4 mr-2" />
            {publishing ? 'Publishing...' : 'Publish Now'}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {settings?.publish?.isDraft ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-yellow-600">Draft</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-green-600">Published</span>
                    </>
                  )}
                </div>
              </div>
              <Badge variant={settings?.publish?.isDraft ? 'secondary' : 'default'}>
                {settings?.publish?.isDraft ? 'Unpublished Changes' : 'Live'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Published</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">
                    {settings?.publish?.publishedAt 
                      ? new Date(settings.publish.publishedAt as string).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <div className="flex items-center gap-2 mt-1">
                  <History className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">
                    {settings?.updatedAt 
                      ? new Date(settings.updatedAt as string).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preview Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>See how your website looks</CardDescription>
              </div>
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div 
                className={`border-2 border-border rounded-lg overflow-hidden transition-all duration-300 ${previewWidths[previewDevice]}`}
                style={{ maxWidth: '100%' }}
              >
                <div className="bg-muted p-2 flex items-center gap-2 border-b">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 bg-background rounded px-3 py-1 text-xs text-center">
                    yourwebsite.com
                  </div>
                </div>
                <div className="h-[400px] bg-background overflow-hidden">
                  {/* Simulated website preview */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {settings?.branding?.logoUrl ? (
                          <img src={settings.branding.logoUrl} alt="Logo" className="h-8 object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-primary" />
                        )}
                        <span className="font-semibold">{settings?.general?.siteName || 'Your Site'}</span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span>Home</span>
                        <span>Features</span>
                        <span>Pricing</span>
                      </div>
                    </div>
                    
                    {/* Hero */}
                    <div 
                      className="h-32 rounded-lg flex items-center justify-center text-white mb-4"
                      style={{ backgroundColor: settings?.colors?.primary || '#ff6b2c' }}
                    >
                      <div className="text-center">
                        <h1 className="text-xl font-bold">{settings?.general?.siteName || 'Welcome'}</h1>
                        <p className="text-sm opacity-80">{settings?.general?.siteDescription || 'Your tagline here'}</p>
                      </div>
                    </div>
                    
                    {/* Content blocks */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 bg-muted rounded" />
                      <div className="h-16 bg-muted rounded" />
                      <div className="h-16 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-4 gap-2">
              <Button variant="outline" onClick={() => window.open('/', '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Live Site
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Publish History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Publish History
            </CardTitle>
            <CardDescription>Recent changes and publications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publishHistory.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    item.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                View Live Site
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Revert to Last Published
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
