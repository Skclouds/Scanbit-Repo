import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Save, Palette, Info, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


const COLOR_PRESETS = [
  {
    name: 'Default',
    colors: { primary: '#ff6b2c', secondary: '#1f2937', background: '#ffffff', text: '#111827' }
  },
  {
    name: 'Ocean Blue',
    colors: { primary: '#0ea5e9', secondary: '#0f172a', background: '#ffffff', text: '#1e293b' }
  },
  {
    name: 'Forest Green',
    colors: { primary: '#10b981', secondary: '#064e3b', background: '#ffffff', text: '#111827' }
  },
  {
    name: 'Royal Purple',
    colors: { primary: '#a855f7', secondary: '#4c1d95', background: '#ffffff', text: '#1f2937' }
  },
  {
    name: 'Sunset Orange',
    colors: { primary: '#f97316', secondary: '#7c2d12', background: '#ffffff', text: '#1c1917' }
  },
  {
    name: 'Dark Mode',
    colors: { primary: '#3b82f6', secondary: '#e2e8f0', background: '#0f172a', text: '#f1f5f9' }
  },
];

export default function ColorsTheme() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    primary: '#ff6b2c',
    secondary: '#1f2937',
    background: '#ffffff',
    text: '#111827',
  });

  useEffect(() => {
    if (settings?.colors) {
      setFormData({
        primary: settings.colors.primary || '#ff6b2c',
        secondary: settings.colors.secondary || '#1f2937',
        background: settings.colors.background || '#ffffff',
        text: settings.colors.text || '#111827',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData(preset.colors);
    toast({
      title: 'Preset Applied',
      description: `${preset.name} color scheme has been applied.`,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.updateColorsSettings(formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Color settings saved successfully!',
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
            <Palette className="h-8 w-8 text-primary" />
            Colors & Theme
          </h1>
          <p className="text-muted-foreground mt-1">
            Define your brand colors and visual theme
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-pink-200 bg-pink-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-pink-600" />
            <CardTitle className="text-lg text-pink-900">Color Theory Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-pink-800 space-y-1">
            <li>• Primary color is used for buttons, links, and key actions</li>
            <li>• Secondary color provides contrast and emphasis</li>
            <li>• Ensure sufficient contrast between text and background (WCAG AA: 4.5:1)</li>
            <li>• Test your colors in both light and dark environments</li>
          </ul>
        </CardContent>
      </Card>

      {/* Color Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Color Presets</CardTitle>
          <CardDescription>
            Choose from pre-designed color schemes or customize your own
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group relative border-2 rounded-lg p-4 hover:border-primary transition-all"
              >
                <div className="flex gap-2 mb-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: preset.colors.primary }} />
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: preset.colors.secondary }} />
                  <div className="w-8 h-8 rounded border" style={{ backgroundColor: preset.colors.background }} />
                </div>
                <p className="text-sm font-medium text-center">{preset.name}</p>
                <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Primary Color */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Color</CardTitle>
          <CardDescription>
            Main brand color used for buttons, links, and primary elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="primary">Hex Color</Label>
              <Input
                id="primary"
                value={formData.primary}
                onChange={(e) => handleChange('primary', e.target.value)}
                placeholder="#ff6b2c"
              />
            </div>
            <div className="space-y-2">
              <Label>Color Picker</Label>
              <input
                type="color"
                value={formData.primary}
                onChange={(e) => handleChange('primary', e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
            </div>
          </div>

          {/* Primary Color Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="border rounded-lg p-4" style={{ backgroundColor: formData.primary }}>
              <p className="text-white font-medium text-sm">Button</p>
            </div>
            <div className="border rounded-lg p-4 bg-white">
              <p style={{ color: formData.primary }} className="font-medium text-sm">Link Text</p>
            </div>
            <div className="border rounded-lg p-4 bg-white flex items-center justify-center">
              <div className="h-8 w-8 rounded-full" style={{ backgroundColor: formData.primary }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Color */}
      <Card>
        <CardHeader>
          <CardTitle>Secondary Color</CardTitle>
          <CardDescription>
            Accent color for secondary elements and contrast
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="secondary">Hex Color</Label>
              <Input
                id="secondary"
                value={formData.secondary}
                onChange={(e) => handleChange('secondary', e.target.value)}
                placeholder="#1f2937"
              />
            </div>
            <div className="space-y-2">
              <Label>Color Picker</Label>
              <input
                type="color"
                value={formData.secondary}
                onChange={(e) => handleChange('secondary', e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="border rounded-lg p-4" style={{ backgroundColor: formData.secondary }}>
              <p className="text-white font-medium text-sm">Header</p>
            </div>
            <div className="border rounded-lg p-4" style={{ backgroundColor: formData.secondary, opacity: 0.1 }}>
              <p className="font-medium text-sm" style={{ color: formData.secondary }}>Badge</p>
            </div>
            <div className="border rounded-lg p-4 bg-white">
              <div className="h-2 rounded" style={{ backgroundColor: formData.secondary }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Color */}
      <Card>
        <CardHeader>
          <CardTitle>Background Color</CardTitle>
          <CardDescription>
            Main background color for your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="background">Hex Color</Label>
              <Input
                id="background"
                value={formData.background}
                onChange={(e) => handleChange('background', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
            <div className="space-y-2">
              <Label>Color Picker</Label>
              <input
                type="color"
                value={formData.background}
                onChange={(e) => handleChange('background', e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Color */}
      <Card>
        <CardHeader>
          <CardTitle>Text Color</CardTitle>
          <CardDescription>
            Primary text color for body content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="text">Hex Color</Label>
              <Input
                id="text"
                value={formData.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="#111827"
              />
            </div>
            <div className="space-y-2">
              <Label>Color Picker</Label>
              <input
                type="color"
                value={formData.text}
                onChange={(e) => handleChange('text', e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
            </div>
          </div>

          {/* Contrast Check */}
          <div className="p-4 rounded-lg border" style={{ backgroundColor: formData.background, color: formData.text }}>
            <p className="font-medium mb-2">Readability Preview</p>
            <p className="text-sm">
              This is how your text will appear on the background. Ensure there's sufficient contrast for easy reading.
              The text should be clear and legible without causing eye strain.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Complete Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Theme Preview</CardTitle>
          <CardDescription>
            See how all your colors work together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4" style={{ backgroundColor: formData.secondary }}>
              <h3 className="text-white font-semibold text-lg">Website Header</h3>
            </div>
            <div className="p-6" style={{ backgroundColor: formData.background, color: formData.text }}>
              <h2 className="text-2xl font-bold mb-3">Welcome to Your Website</h2>
              <p className="mb-4">
                This is a preview of how your content will look with the selected color scheme.
                Your primary and secondary colors create visual hierarchy and guide user attention.
              </p>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded-md font-medium text-white"
                  style={{ backgroundColor: formData.primary }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded-md font-medium border-2"
                  style={{ borderColor: formData.primary, color: formData.primary }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Colors'}
        </Button>
      </div>
    </div>
    </CustomizationLayout>
  );
}
