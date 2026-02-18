import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Palette, Sun, Moon, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const presetThemes = [
  { name: 'Orange Warmth', primary: '#ff6b2c', secondary: '#1f2937', accent: '#10b981' },
  { name: 'Ocean Blue', primary: '#3b82f6', secondary: '#1e293b', accent: '#06b6d4' },
  { name: 'Forest Green', primary: '#22c55e', secondary: '#15803d', accent: '#fbbf24' },
  { name: 'Royal Purple', primary: '#8b5cf6', secondary: '#4c1d95', accent: '#f472b6' },
  { name: 'Sunset Pink', primary: '#ec4899', secondary: '#831843', accent: '#f59e0b' },
  { name: 'Slate Modern', primary: '#64748b', secondary: '#1e293b', accent: '#0ea5e9' },
];

export default function ColorsTheme() {
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState({
    primary: '#ff6b2c',
    secondary: '#1f2937',
    accent: '#10b981',
    background: '#ffffff',
    foreground: '#111827',
    muted: '#f3f4f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSiteSettings();
      if (res.success && res.data?.colors) {
        setColors(prev => ({
          ...prev,
          primary: res.data.colors.primary || '#ff6b2c',
          secondary: res.data.colors.secondary || '#1f2937',
          background: res.data.colors.background || '#ffffff',
          foreground: res.data.colors.text || '#111827',
        }));
      }
    } catch (e) {

    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateAdminSiteSettings({
        colors: {
          primary: colors.primary,
          secondary: colors.secondary,
          background: colors.background,
          text: colors.foreground,
        }
      });
      toast.success('Color settings saved');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof presetThemes[0]) => {
    setColors(prev => ({
      ...prev,
      primary: preset.primary,
      secondary: preset.secondary,
      accent: preset.accent,
    }));
    toast.success(`Applied "${preset.name}" theme`);
  };

  const ColorInput = ({ label, field, description }: { label: string; field: keyof typeof colors; description?: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={colors[field]}
          onChange={(e) => setColors({ ...colors, [field]: e.target.value })}
          className="w-12 h-10 p-1 cursor-pointer"
        />
        <Input
          value={colors[field]}
          onChange={(e) => setColors({ ...colors, [field]: e.target.value })}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Colors & Theme</h2>
          <p className="text-muted-foreground">Customize your website color scheme</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadSettings()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Preset Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Preset Themes
          </CardTitle>
          <CardDescription>Quick start with a pre-designed color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {presetThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-3 border rounded-lg hover:border-primary transition-colors text-left"
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-6 h-6 rounded-full" style={{ background: preset.primary }} />
                  <div className="w-6 h-6 rounded-full" style={{ background: preset.secondary }} />
                  <div className="w-6 h-6 rounded-full" style={{ background: preset.accent }} />
                </div>
                <p className="text-xs font-medium">{preset.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="brand">
        <TabsList>
          <TabsTrigger value="brand">Brand Colors</TabsTrigger>
          <TabsTrigger value="ui">UI Colors</TabsTrigger>
          <TabsTrigger value="status">Status Colors</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Main colors that define your brand identity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <ColorInput label="Primary Color" field="primary" description="Main brand color for buttons and links" />
                <ColorInput label="Secondary Color" field="secondary" description="Supporting color for headers" />
                <ColorInput label="Accent Color" field="accent" description="Highlight color for emphasis" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>UI Colors</CardTitle>
              <CardDescription>Colors for interface elements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <ColorInput label="Background" field="background" description="Page background color" />
                <ColorInput label="Foreground" field="foreground" description="Main text color" />
                <ColorInput label="Muted" field="muted" description="Subtle backgrounds" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Colors</CardTitle>
              <CardDescription>Colors for feedback and states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <ColorInput label="Success" field="success" description="Positive actions and states" />
                <ColorInput label="Warning" field="warning" description="Cautionary messages" />
                <ColorInput label="Error" field="error" description="Error states and alerts" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>See your color choices in action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Light Preview */}
            <div className="p-4 rounded-lg border" style={{ background: colors.background, color: colors.foreground }}>
              <div className="flex items-center gap-2 mb-4">
                <Sun className="w-4 h-4" />
                <span className="font-medium">Light Mode</span>
              </div>
              <div className="space-y-3">
                <button className="px-4 py-2 rounded-md text-white text-sm" style={{ background: colors.primary }}>
                  Primary Button
                </button>
                <button className="px-4 py-2 rounded-md text-white text-sm ml-2" style={{ background: colors.secondary }}>
                  Secondary
                </button>
                <p className="text-sm">Regular text content</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded text-xs text-white" style={{ background: colors.success }}>Success</span>
                  <span className="px-2 py-1 rounded text-xs text-white" style={{ background: colors.warning }}>Warning</span>
                  <span className="px-2 py-1 rounded text-xs text-white" style={{ background: colors.error }}>Error</span>
                </div>
              </div>
            </div>
            
            {/* Dark Preview */}
            <div className="p-4 rounded-lg border bg-gray-900 text-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Moon className="w-4 h-4" />
                <span className="font-medium">Dark Mode</span>
              </div>
              <div className="space-y-3">
                <button className="px-4 py-2 rounded-md text-white text-sm" style={{ background: colors.primary }}>
                  Primary Button
                </button>
                <button className="px-4 py-2 rounded-md text-sm ml-2 border border-gray-600">
                  Secondary
                </button>
                <p className="text-sm text-gray-300">Regular text content</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded text-xs" style={{ background: colors.accent, color: '#fff' }}>Accent</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
