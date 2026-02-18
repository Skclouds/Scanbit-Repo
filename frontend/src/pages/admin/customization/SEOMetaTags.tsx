import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import {
  Save,
  Search,
  Info,
  X,
  Plus,
  Globe,
  Share2,
  Twitter,
  Bot,
  BarChart3,
  Code2,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

type ExtraMetaTag = { name?: string; property?: string; content: string };

const defaultSeo = {
  metaTitle: '',
  metaDescription: '',
  metaKeywords: [] as string[],
  canonicalUrl: '',
  author: '',
  themeColor: '',
  locale: 'en_IN',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogType: 'website' as 'website' | 'article' | 'product' | 'profile',
  ogSiteName: '',
  ogLocale: '',
  ogUrl: '',
  twitterCard: 'summary_large_image' as 'summary' | 'summary_large_image' | 'app' | 'player',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  twitterSite: '',
  twitterCreator: '',
  robotsIndex: 'index' as 'index' | 'noindex',
  robotsFollow: 'follow' as 'follow' | 'nofollow',
  robotsExtra: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  googleSiteVerification: '',
  bingSiteVerification: '',
  jsonLdOrganization: '',
  jsonLdWebSite: '',
  jsonLdBreadcrumb: '',
  extraMetaTags: [] as ExtraMetaTag[],
};

export default function SEOMetaTags() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [formData, setFormData] = useState(defaultSeo);

  useEffect(() => {
    if (settings?.seo) {
      const s = settings.seo as Record<string, unknown>;
      setFormData({
        metaTitle: (s.metaTitle as string) ?? '',
        metaDescription: (s.metaDescription as string) ?? '',
        metaKeywords: Array.isArray(s.metaKeywords) ? s.metaKeywords : [],
        canonicalUrl: (s.canonicalUrl as string) ?? '',
        author: (s.author as string) ?? '',
        themeColor: (s.themeColor as string) ?? '',
        locale: (s.locale as string) ?? 'en_IN',
        ogTitle: (s.ogTitle as string) ?? '',
        ogDescription: (s.ogDescription as string) ?? '',
        ogImage: (s.ogImage as string) ?? '',
        ogImageWidth: typeof s.ogImageWidth === 'number' ? s.ogImageWidth : 1200,
        ogImageHeight: typeof s.ogImageHeight === 'number' ? s.ogImageHeight : 630,
        ogType: (s.ogType as 'website' | 'article' | 'product' | 'profile') ?? 'website',
        ogSiteName: (s.ogSiteName as string) ?? '',
        ogLocale: (s.ogLocale as string) ?? '',
        ogUrl: (s.ogUrl as string) ?? '',
        twitterCard: (s.twitterCard as 'summary' | 'summary_large_image' | 'app' | 'player') ?? 'summary_large_image',
        twitterTitle: (s.twitterTitle as string) ?? '',
        twitterDescription: (s.twitterDescription as string) ?? '',
        twitterImage: (s.twitterImage as string) ?? '',
        twitterSite: (s.twitterSite as string) ?? '',
        twitterCreator: (s.twitterCreator as string) ?? '',
        robotsIndex: (s.robotsIndex as 'index' | 'noindex') ?? 'index',
        robotsFollow: (s.robotsFollow as 'follow' | 'nofollow') ?? 'follow',
        robotsExtra: (s.robotsExtra as string) ?? '',
        googleAnalyticsId: (s.googleAnalyticsId as string) ?? '',
        googleTagManagerId: (s.googleTagManagerId as string) ?? '',
        googleSiteVerification: (s.googleSiteVerification as string) ?? '',
        bingSiteVerification: (s.bingSiteVerification as string) ?? '',
        jsonLdOrganization: (s.jsonLdOrganization as string) ?? '',
        jsonLdWebSite: (s.jsonLdWebSite as string) ?? '',
        jsonLdBreadcrumb: (s.jsonLdBreadcrumb as string) ?? '',
        extraMetaTags: Array.isArray(s.extraMetaTags)
          ? (s.extraMetaTags as ExtraMetaTag[])
          : [],
      });
    }
  }, [settings]);

  const handleChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.metaKeywords.includes(newKeyword.trim())) {
      handleChange('metaKeywords', [...formData.metaKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    handleChange('metaKeywords', formData.metaKeywords.filter((k) => k !== keyword));
  };

  const addExtraMetaTag = () => {
    handleChange('extraMetaTags', [...formData.extraMetaTags, { content: '' }]);
  };

  const updateExtraMetaTag = (index: number, patch: Partial<ExtraMetaTag>) => {
    const next = [...formData.extraMetaTags];
    next[index] = { ...next[index], ...patch };
    handleChange('extraMetaTags', next);
  };

  const removeExtraMetaTag = (index: number) => {
    handleChange(
      'extraMetaTags',
      formData.extraMetaTags.filter((_, i) => i !== index)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        extraMetaTags: formData.extraMetaTags.filter((t) => t.content && (t.name || t.property)),
      };
      const response = await api.updateSeoSettings(payload);
      if (response.success) {
        toast({
          title: 'Saved',
          description: 'SEO settings saved successfully.',
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

  const titleLength = formData.metaTitle.length;
  const descLength = formData.metaDescription.length;

  const ogTitle = formData.ogTitle || formData.metaTitle;
  const ogDesc = formData.ogDescription || formData.metaDescription;
  const ogImg = formData.ogImage || settings?.media?.heroImageUrl || '';
  const twTitle = formData.twitterTitle || formData.metaTitle;
  const twDesc = formData.twitterDescription || formData.metaDescription;
  const twImg = formData.twitterImage || formData.ogImage || settings?.media?.heroImageUrl || '';

  const robotsContent = [
    formData.robotsIndex,
    formData.robotsFollow,
    formData.robotsExtra ? formData.robotsExtra.trim() : '',
  ]
    .filter(Boolean)
    .join(', ');

  const scoreChecks = {
    title: titleLength >= 30 && titleLength <= 60,
    description: descLength >= 120 && descLength <= 160,
    ogImage: !!(formData.ogImage || settings?.media?.heroImageUrl),
    canonical: !!formData.canonicalUrl.trim(),
  };
  const scoreTotal = Object.values(scoreChecks).filter(Boolean).length;
  const scorePct = Math.round((scoreTotal / 4) * 100);

  return (
    <CustomizationLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Search className="h-8 w-8 text-primary" />
              SEO & Meta Tags
            </h1>
            <p className="text-muted-foreground mt-1">
              Control how your site appears in Google and on social networks. All options are applied live when saved.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save all SEO settings'}
          </Button>
        </div>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg text-emerald-900">Best practices</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-emerald-800 space-y-1">
              <li>• <strong>Title:</strong> 50–60 characters for Google; include your brand.</li>
              <li>• <strong>Description:</strong> 150–160 characters; add a clear call-to-action.</li>
              <li>• <strong>Canonical URL:</strong> Prevents duplicate-content issues (use your main site URL).</li>
              <li>• <strong>Open Graph / Twitter:</strong> Use a 1200×630 image for best sharing.</li>
              <li>• <strong>Structured data (JSON-LD):</strong> Helps Google show rich results.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 1. Basic meta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Basic meta tags
            </CardTitle>
            <CardDescription>Core tags used by Google and other search engines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meta title *</Label>
              <Input
                value={formData.metaTitle}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                placeholder="e.g. ScanBit – One QR. One Digital Look."
                maxLength={70}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50–60 chars ideal for Google</span>
                <span className={titleLength > 60 ? 'text-red-600' : titleLength >= 50 ? 'text-green-600' : ''}>
                  {titleLength} / 70
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meta description *</Label>
              <Textarea
                value={formData.metaDescription}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                placeholder="Short summary for search snippets. Include keywords and a call-to-action."
                rows={3}
                maxLength={320}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>150–160 chars ideal</span>
                <span className={descLength > 160 ? 'text-red-600' : descLength >= 120 ? 'text-green-600' : ''}>
                  {descLength} / 320
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input
                  value={formData.canonicalUrl}
                  onChange={(e) => handleChange('canonicalUrl', e.target.value)}
                  placeholder="https://yoursite.com"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label>Author (meta author)</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  placeholder="Company or name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Theme color (meta theme-color)</Label>
                <Input
                  value={formData.themeColor}
                  onChange={(e) => handleChange('themeColor', e.target.value)}
                  placeholder="#f97316"
                />
              </div>
              <div className="space-y-2">
                <Label>Locale</Label>
                <Input
                  value={formData.locale}
                  onChange={(e) => handleChange('locale', e.target.value)}
                  placeholder="en_IN"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meta keywords (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Add keyword"
                />
                <Button type="button" variant="outline" onClick={addKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.metaKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.metaKeywords.map((k) => (
                    <Badge key={k} variant="secondary" className="gap-1">
                      {k}
                      <button type="button" onClick={() => removeKeyword(k)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Open Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Open Graph (Facebook, LinkedIn, etc.)
            </CardTitle>
            <CardDescription>How your link looks when shared. Leave blank to fallback to meta title/description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>og:title</Label>
                <Input
                  value={formData.ogTitle}
                  onChange={(e) => handleChange('ogTitle', e.target.value)}
                  placeholder="Defaults to meta title"
                />
              </div>
              <div className="space-y-2">
                <Label>og:type</Label>
                <Select
                  value={formData.ogType}
                  onValueChange={(v: 'website' | 'article' | 'product' | 'profile') => handleChange('ogType', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">website</SelectItem>
                    <SelectItem value="article">article</SelectItem>
                    <SelectItem value="product">product</SelectItem>
                    <SelectItem value="profile">profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>og:description</Label>
              <Textarea
                value={formData.ogDescription}
                onChange={(e) => handleChange('ogDescription', e.target.value)}
                placeholder="Defaults to meta description"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>og:image (absolute URL)</Label>
              <Input
                value={formData.ogImage}
                onChange={(e) => handleChange('ogImage', e.target.value)}
                placeholder="https://yoursite.com/og-image.jpg"
                type="url"
              />
              <p className="text-xs text-muted-foreground">Recommended: 1200×630 px. Falls back to hero image if empty.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>og:image:width</Label>
                <Input
                  type="number"
                  value={formData.ogImageWidth}
                  onChange={(e) => handleChange('ogImageWidth', parseInt(e.target.value, 10) || 1200)}
                />
              </div>
              <div className="space-y-2">
                <Label>og:image:height</Label>
                <Input
                  type="number"
                  value={formData.ogImageHeight}
                  onChange={(e) => handleChange('ogImageHeight', parseInt(e.target.value, 10) || 630)}
                />
              </div>
              <div className="space-y-2">
                <Label>og:site_name</Label>
                <Input
                  value={formData.ogSiteName}
                  onChange={(e) => handleChange('ogSiteName', e.target.value)}
                  placeholder={settings?.general?.siteName || 'Site name'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>og:url</Label>
                <Input
                  value={formData.ogUrl}
                  onChange={(e) => handleChange('ogUrl', e.target.value)}
                  placeholder="https://yoursite.com"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label>og:locale</Label>
                <Input
                  value={formData.ogLocale}
                  onChange={(e) => handleChange('ogLocale', e.target.value)}
                  placeholder="en_IN"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Twitter Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5" />
              Twitter Card
            </CardTitle>
            <CardDescription>Preview when your link is shared on X (Twitter).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>twitter:card</Label>
              <Select
                value={formData.twitterCard}
                onValueChange={(v: 'summary' | 'summary_large_image' | 'app' | 'player') => handleChange('twitterCard', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">summary</SelectItem>
                  <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                  <SelectItem value="app">app</SelectItem>
                  <SelectItem value="player">player</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>twitter:title</Label>
                <Input
                  value={formData.twitterTitle}
                  onChange={(e) => handleChange('twitterTitle', e.target.value)}
                  placeholder="Defaults to meta title"
                />
              </div>
              <div className="space-y-2">
                <Label>twitter:image</Label>
                <Input
                  value={formData.twitterImage}
                  onChange={(e) => handleChange('twitterImage', e.target.value)}
                  placeholder="Absolute URL; defaults to og:image"
                  type="url"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>twitter:description</Label>
              <Textarea
                value={formData.twitterDescription}
                onChange={(e) => handleChange('twitterDescription', e.target.value)}
                placeholder="Defaults to meta description"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>twitter:site (@username)</Label>
                <Input
                  value={formData.twitterSite}
                  onChange={(e) => handleChange('twitterSite', e.target.value)}
                  placeholder="@yourhandle"
                />
              </div>
              <div className="space-y-2">
                <Label>twitter:creator (@username)</Label>
                <Input
                  value={formData.twitterCreator}
                  onChange={(e) => handleChange('twitterCreator', e.target.value)}
                  placeholder="@author"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Robots & indexing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Robots & indexing
            </CardTitle>
            <CardDescription>Control how search engines crawl and index your site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Index</Label>
                <Select
                  value={formData.robotsIndex}
                  onValueChange={(v: 'index' | 'noindex') => handleChange('robotsIndex', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index">index (allow)</SelectItem>
                    <SelectItem value="noindex">noindex (block)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Follow links</Label>
                <Select
                  value={formData.robotsFollow}
                  onValueChange={(v: 'follow' | 'nofollow') => handleChange('robotsFollow', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow">follow</SelectItem>
                    <SelectItem value="nofollow">nofollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Extra robots directives (e.g. noarchive, nosnippet)</Label>
              <Input
                value={formData.robotsExtra}
                onChange={(e) => handleChange('robotsExtra', e.target.value)}
                placeholder="noarchive, nosnippet"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Resulting robots meta: <code className="bg-muted px-1 rounded">{robotsContent || 'index, follow'}</code>
            </p>
          </CardContent>
        </Card>

        {/* 5. Analytics & verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics & verification
            </CardTitle>
            <CardDescription>Tracking and search console verification. Scripts are injected when IDs are set.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Google Analytics (GA4 Measurement ID)</Label>
              <Input
                value={formData.googleAnalyticsId}
                onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Google Tag Manager ID</Label>
              <Input
                value={formData.googleTagManagerId}
                onChange={(e) => handleChange('googleTagManagerId', e.target.value)}
                placeholder="GTM-XXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Google Search Console verification (meta content)</Label>
              <Input
                value={formData.googleSiteVerification}
                onChange={(e) => handleChange('googleSiteVerification', e.target.value)}
                placeholder="Paste the content value from Google Search Console"
              />
            </div>
            <div className="space-y-2">
              <Label>Bing Webmaster verification (meta content)</Label>
              <Input
                value={formData.bingSiteVerification}
                onChange={(e) => handleChange('bingSiteVerification', e.target.value)}
                placeholder="Paste the content value from Bing Webmaster"
              />
            </div>
          </CardContent>
        </Card>

        {/* 6. Structured data (JSON-LD) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Structured data (JSON-LD)
            </CardTitle>
            <CardDescription>Valid JSON-LD for Organization and/or WebSite. Helps Google show rich results.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization schema (JSON)</Label>
              <Textarea
                value={formData.jsonLdOrganization}
                onChange={(e) => handleChange('jsonLdOrganization', e.target.value)}
                placeholder={'{"@context":"https://schema.org","@type":"Organization","name":"ScanBit","url":"https://scanbit.in"}'}
                rows={6}
                className="font-mono text-sm resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>WebSite schema (JSON)</Label>
              <Textarea
                value={formData.jsonLdWebSite}
                onChange={(e) => handleChange('jsonLdWebSite', e.target.value)}
                placeholder={'{"@context":"https://schema.org","@type":"WebSite","name":"ScanBit","url":"https://scanbit.in"}'}
                rows={6}
                className="font-mono text-sm resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>BreadcrumbList schema (optional, JSON)</Label>
              <Textarea
                value={formData.jsonLdBreadcrumb}
                onChange={(e) => handleChange('jsonLdBreadcrumb', e.target.value)}
                placeholder='{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[]}'
                rows={4}
                className="font-mono text-sm resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* 7. Extra meta tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Custom meta tags
            </CardTitle>
            <CardDescription>Add any name or property meta tag. Use either name or property per row.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.extraMetaTags.map((tag, i) => (
              <div key={i} className="flex flex-wrap items-end gap-2 p-3 border rounded-lg">
                <Input
                  placeholder="name (e.g. custom)"
                  value={tag.name || ''}
                  onChange={(e) => updateExtraMetaTag(i, { name: e.target.value })}
                  className="w-32"
                />
                <Input
                  placeholder="property (e.g. og:video)"
                  value={tag.property || ''}
                  onChange={(e) => updateExtraMetaTag(i, { property: e.target.value })}
                  className="w-40"
                />
                <Input
                  placeholder="content"
                  value={tag.content}
                  onChange={(e) => updateExtraMetaTag(i, { content: e.target.value })}
                  className="flex-1 min-w-[120px]"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeExtraMetaTag(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addExtraMetaTag}>
              <Plus className="h-4 w-4 mr-2" />
              Add meta tag
            </Button>
          </CardContent>
        </Card>

        {/* Previews */}
        <Card>
          <CardHeader>
            <CardTitle>Previews</CardTitle>
            <CardDescription>How your site may appear in search and when shared.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Google search</p>
              <div className="p-4 bg-slate-50 rounded-lg border space-y-1">
                <p className="text-xl text-blue-700 hover:underline">
                  {formData.metaTitle || 'Your page title'}
                  {formData.metaTitle.length > 60 && '…'}
                </p>
                <p className="text-xs text-green-700">
                  {formData.canonicalUrl || 'yoursite.com'}
                </p>
                <p className="text-sm text-slate-600">
                  {formData.metaDescription ? formData.metaDescription.slice(0, 160) + (formData.metaDescription.length > 160 ? '…' : '') : 'Meta description'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Social (OG / Twitter)</p>
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm max-w-md">
                {ogImg && <img src={ogImg} alt="" className="w-full h-48 object-cover" />}
                <div className="p-3 space-y-1">
                  <p className="text-xs text-slate-500">yoursite.com</p>
                  <p className="font-semibold line-clamp-2">{ogTitle || 'Title'}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{ogDesc || 'Description'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO score */}
        <Card>
          <CardHeader>
            <CardTitle>SEO readiness</CardTitle>
            <CardDescription>Quick checks (saved values are used on the live site).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold">{scorePct}%</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {scoreChecks.title ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-600" />}
                  Meta title length 30–60 chars
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {scoreChecks.description ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-600" />}
                  Meta description 120–160 chars
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {scoreChecks.ogImage ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-600" />}
                  OG / social image set
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {scoreChecks.canonical ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-600" />}
                  Canonical URL set
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save all SEO settings'}
          </Button>
        </div>
      </div>
    </CustomizationLayout>
  );
}
