import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Search, Globe, Share2, Code, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function SEOMetaTags() {
  const [loading, setLoading] = useState(false);
  const [seo, setSeo] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [] as string[],
    ogTitle: '',
    ogDescription: '',
    twitterCard: 'summary_large_image',
    canonicalUrl: '',
    robots: 'index, follow',
    structuredData: '',
  });
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSiteSettings();
      if (res.success && res.data?.seo) {
        setSeo(prev => ({
          ...prev,
          metaTitle: res.data.seo.metaTitle || '',
          metaDescription: res.data.seo.metaDescription || '',
          metaKeywords: res.data.seo.metaKeywords || [],
        }));
      }
    } catch (e) {

    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !seo.metaKeywords.includes(newKeyword.trim())) {
      setSeo(prev => ({ ...prev, metaKeywords: [...prev.metaKeywords, newKeyword.trim()] }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeo(prev => ({ ...prev, metaKeywords: prev.metaKeywords.filter(k => k !== keyword) }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateAdminSiteSettings({
        seo: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          metaKeywords: seo.metaKeywords,
        }
      });
      toast.success('SEO settings saved');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const titleLength = seo.metaTitle.length;
  const descLength = seo.metaDescription.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO & Meta Tags</h2>
          <p className="text-muted-foreground">Optimize your website for search engines</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Basic SEO
            </CardTitle>
            <CardDescription>Essential meta tags for search engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Meta Title</Label>
                <span className={`text-xs ${titleLength > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {titleLength}/60
                </span>
              </div>
              <Input
                value={seo.metaTitle}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                placeholder="Your Website Title"
              />
              {titleLength > 60 && (
                <p className="text-xs text-destructive">Title should be under 60 characters</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Meta Description</Label>
                <span className={`text-xs ${descLength > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {descLength}/160
                </span>
              </div>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                placeholder="Brief description of your website"
              />
            </div>

            <div className="space-y-2">
              <Label>Meta Keywords</Label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                />
                <Button variant="outline" onClick={addKeyword}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {seo.metaKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    {keyword}
                    <button onClick={() => removeKeyword(keyword)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Social Media (Open Graph)
            </CardTitle>
            <CardDescription>How your site appears when shared</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>OG Title</Label>
              <Input
                value={seo.ogTitle}
                onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                placeholder="Title for social shares"
              />
            </div>
            <div className="space-y-2">
              <Label>OG Description</Label>
              <textarea
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={seo.ogDescription}
                onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                placeholder="Description for social shares"
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter Card Type</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={seo.twitterCard}
                onChange={(e) => setSeo({ ...seo, twitterCard: e.target.value })}
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
                <option value="app">App</option>
                <option value="player">Player</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Advanced */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription>Technical SEO configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input
                value={seo.canonicalUrl}
                onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Robots Meta</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={seo.robots}
                onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
              >
                <option value="index, follow">Index, Follow (Recommended)</option>
                <option value="noindex, follow">No Index, Follow</option>
                <option value="index, nofollow">Index, No Follow</option>
                <option value="noindex, nofollow">No Index, No Follow</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Search Preview
            </CardTitle>
            <CardDescription>How your site appears in Google</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
              <p className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer truncate">
                {seo.metaTitle || 'Your Website Title'}
              </p>
              <p className="text-green-700 dark:text-green-500 text-sm">
                {seo.canonicalUrl || 'https://yourwebsite.com'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mt-1">
                {seo.metaDescription || 'Your website description will appear here. Make it compelling to increase click-through rates.'}
              </p>
            </div>

            {/* Social Preview */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Facebook/LinkedIn Preview</p>
              <div className="bg-background rounded border overflow-hidden">
                <div className="h-32 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm">
                  OG Image
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground uppercase">yourwebsite.com</p>
                  <p className="font-semibold text-sm">{seo.ogTitle || seo.metaTitle || 'Title'}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {seo.ogDescription || seo.metaDescription || 'Description'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
