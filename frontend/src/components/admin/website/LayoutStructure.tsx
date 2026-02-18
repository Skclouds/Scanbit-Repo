import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Layout, Monitor, Smartphone, Tablet } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function LayoutStructure() {
  const [loading, setLoading] = useState(false);
  const [layout, setLayout] = useState({
    contentWidth: 'full',
    headerStyle: 'solid',
    headerPosition: 'fixed',
    footerStyle: 'detailed',
    sidebarPosition: 'left',
    showBreadcrumbs: true,
    showBackToTop: true,
    containerMaxWidth: '1280',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSiteSettings();
      if (res.success && res.data?.layout) {
        setLayout(prev => ({
          ...prev,
          contentWidth: res.data.layout.contentWidth || 'full',
          headerStyle: res.data.layout.headerStyle || 'solid',
          footerStyle: res.data.layout.footerStyle || 'minimal',
        }));
      }
    } catch (e) {

    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateAdminSiteSettings({
        layout: {
          contentWidth: layout.contentWidth,
          headerStyle: layout.headerStyle,
          footerStyle: layout.footerStyle,
        }
      });
      toast.success('Layout settings saved');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Layout & Structure</h2>
          <p className="text-muted-foreground">Configure page layouts and structure</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Content Width */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Content Width
            </CardTitle>
            <CardDescription>Choose how content is displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={layout.contentWidth} onValueChange={(v) => setLayout({ ...layout, contentWidth: v })}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <span className="font-medium">Full Width</span>
                  <p className="text-sm text-muted-foreground">Content spans the entire viewport</p>
                </Label>
                <div className="w-20 h-12 border rounded bg-primary/20" />
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="boxed" id="boxed" />
                <Label htmlFor="boxed" className="flex-1 cursor-pointer">
                  <span className="font-medium">Boxed</span>
                  <p className="text-sm text-muted-foreground">Content is contained in a max-width container</p>
                </Label>
                <div className="w-20 h-12 border rounded flex items-center justify-center">
                  <div className="w-14 h-10 bg-primary/20 rounded" />
                </div>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label>Max Container Width</Label>
              <Select value={layout.containerMaxWidth} onValueChange={(v) => setLayout({ ...layout, containerMaxWidth: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024">1024px (Compact)</SelectItem>
                  <SelectItem value="1280">1280px (Default)</SelectItem>
                  <SelectItem value="1440">1440px (Wide)</SelectItem>
                  <SelectItem value="1920">1920px (Full HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Header Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Header Settings</CardTitle>
            <CardDescription>Configure navigation header</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Header Style</Label>
              <Select value={layout.headerStyle} onValueChange={(v) => setLayout({ ...layout, headerStyle: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid Background</SelectItem>
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="glass">Glass Effect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Header Position</Label>
              <Select value={layout.headerPosition} onValueChange={(v) => setLayout({ ...layout, headerPosition: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed (Always visible)</SelectItem>
                  <SelectItem value="sticky">Sticky (Hides on scroll down)</SelectItem>
                  <SelectItem value="static">Static (Scrolls with page)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Footer Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Footer Settings</CardTitle>
            <CardDescription>Configure page footer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Footer Style</Label>
              <Select value={layout.footerStyle} onValueChange={(v) => setLayout({ ...layout, footerStyle: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal (Copyright only)</SelectItem>
                  <SelectItem value="simple">Simple (Links + Copyright)</SelectItem>
                  <SelectItem value="detailed">Detailed (Full footer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* UI Elements */}
        <Card>
          <CardHeader>
            <CardTitle>UI Elements</CardTitle>
            <CardDescription>Toggle interface elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Breadcrumbs</Label>
                <p className="text-sm text-muted-foreground">Show navigation path</p>
              </div>
              <Switch
                checked={layout.showBreadcrumbs}
                onCheckedChange={(c) => setLayout({ ...layout, showBreadcrumbs: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Back to Top Button</Label>
                <p className="text-sm text-muted-foreground">Floating scroll to top</p>
              </div>
              <Switch
                checked={layout.showBackToTop}
                onCheckedChange={(c) => setLayout({ ...layout, showBackToTop: c })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responsive Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Preview</CardTitle>
          <CardDescription>See how your layout adapts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-6">
            <div className="text-center">
              <Smartphone className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="w-20 h-36 border-2 border-border rounded-lg bg-muted/30 p-1">
                <div className="w-full h-3 bg-primary/30 rounded-sm mb-1" />
                <div className="w-full flex-1 bg-muted rounded-sm" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Mobile</p>
            </div>
            <div className="text-center">
              <Tablet className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="w-32 h-44 border-2 border-border rounded-lg bg-muted/30 p-1">
                <div className="w-full h-4 bg-primary/30 rounded-sm mb-1" />
                <div className="w-full flex-1 bg-muted rounded-sm" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Tablet</p>
            </div>
            <div className="text-center">
              <Monitor className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="w-48 h-32 border-2 border-border rounded-lg bg-muted/30 p-1">
                <div className="w-full h-4 bg-primary/30 rounded-sm mb-1" />
                <div className="flex gap-1 flex-1">
                  <div className="w-10 bg-secondary/30 rounded-sm" />
                  <div className="flex-1 bg-muted rounded-sm" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Desktop</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
