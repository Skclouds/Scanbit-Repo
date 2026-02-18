import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Save, Layers, GripVertical, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const defaultSections = [
  { id: 'hero', name: 'Hero Section', description: 'Main banner with CTA', enabled: true },
  { id: 'features', name: 'Features', description: 'Product/service features', enabled: true },
  { id: 'pricing', name: 'Pricing', description: 'Pricing plans table', enabled: true },
  { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews', enabled: true },
  { id: 'faq', name: 'FAQ', description: 'Frequently asked questions', enabled: true },
  { id: 'cta', name: 'Call to Action', description: 'Final conversion section', enabled: true },
  { id: 'partners', name: 'Partners/Clients', description: 'Logo showcase', enabled: false },
  { id: 'blog', name: 'Blog Preview', description: 'Recent articles', enabled: false },
  { id: 'newsletter', name: 'Newsletter', description: 'Email subscription', enabled: true },
  { id: 'contact', name: 'Contact Form', description: 'Get in touch section', enabled: true },
];

export default function SectionsComponents() {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState(defaultSections);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSiteSettings();
      if (res.success && res.data?.sections) {
        const s = res.data.sections;
        setSections(prev => prev.map(section => ({
          ...section,
          enabled: s[`show${section.id.charAt(0).toUpperCase() + section.id.slice(1)}`] ?? section.enabled
        })));
      }
    } catch (e) {

    }
  };

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const sectionsData: Record<string, boolean> = {};
      sections.forEach(s => {
        sectionsData[`show${s.id.charAt(0).toUpperCase() + s.id.slice(1)}`] = s.enabled;
      });
      await api.updateAdminSiteSettings({ sections: sectionsData });
      toast.success('Section settings saved');
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
          <h2 className="text-2xl font-bold">Sections & Components</h2>
          <p className="text-muted-foreground">Manage homepage sections visibility</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Homepage Sections
            </CardTitle>
            <CardDescription>Toggle sections on your homepage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    section.enabled ? 'bg-background' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <div>
                      <p className="font-medium text-sm">{section.name}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {section.enabled ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={section.enabled}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Section Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {sections.filter(s => s.enabled).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-muted-foreground">
                    {sections.filter(s => !s.enabled).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Hidden</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Page Preview</CardTitle>
              <CardDescription>Visual representation of enabled sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 p-2 bg-muted rounded-lg">
                {sections.filter(s => s.enabled).map((section, i) => (
                  <div
                    key={section.id}
                    className="h-8 bg-primary/20 rounded flex items-center justify-center text-xs font-medium"
                    style={{ opacity: 1 - (i * 0.08) }}
                  >
                    {section.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setSections(prev => prev.map(s => ({ ...s, enabled: true })))}
              >
                <Eye className="w-4 h-4 mr-2" />
                Show All Sections
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setSections(defaultSections)}
              >
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
