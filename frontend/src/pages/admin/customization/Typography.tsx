import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Save, Type, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter (Modern Sans)' },
  { value: 'Roboto, system-ui, sans-serif', label: 'Roboto (Clean Sans)' },
  { value: 'Poppins, system-ui, sans-serif', label: 'Poppins (Rounded)' },
  { value: 'Montserrat, system-ui, sans-serif', label: 'Montserrat (Geometric)' },
  { value: 'Open Sans, system-ui, sans-serif', label: 'Open Sans (Friendly)' },
  { value: 'Lato, system-ui, sans-serif', label: 'Lato (Professional)' },
  { value: 'Georgia, serif', label: 'Georgia (Elegant Serif)' },
  { value: 'Merriweather, serif', label: 'Merriweather (Classic Serif)' },
  { value: '"Courier New", monospace', label: 'Courier New (Monospace)' },
];

export default function Typography() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fontFamily: 'Inter, system-ui, sans-serif',
    baseFontSize: 16,
  });

  useEffect(() => {
    if (settings?.typography) {
      setFormData({
        fontFamily: settings.typography.fontFamily || 'Inter, system-ui, sans-serif',
        baseFontSize: settings.typography.baseFontSize || 16,
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.updateTypographySettings(formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Typography settings saved successfully!',
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
            <Type className="h-8 w-8 text-primary" />
            Typography
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize fonts and text sizing for your website
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg text-indigo-900">Typography Best Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>• Choose fonts that align with your brand personality</li>
            <li>• Sans-serif fonts are generally more readable on screens</li>
            <li>• Base font size of 16px ensures good readability across devices</li>
            <li>• Maintain consistent typography throughout your website</li>
          </ul>
        </CardContent>
      </Card>

      {/* Font Family Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Font Family</CardTitle>
          <CardDescription>
            Select the primary typeface for your website content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Primary Font</Label>
            <Select
              value={formData.fontFamily}
              onValueChange={(value) => handleChange('fontFamily', value)}
            >
              <SelectTrigger id="fontFamily">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The selected font will be applied to all text on your website
            </p>
          </div>

          {/* Font Preview */}
          <div className="space-y-3 pt-4 border-t">
            <Label>Font Preview</Label>
            <div className="border rounded-lg p-6 bg-white space-y-4" style={{ fontFamily: formData.fontFamily }}>
              <h1 className="text-4xl font-bold">Heading 1 - The Quick Brown Fox</h1>
              <h2 className="text-3xl font-semibold">Heading 2 - Typography Matters</h2>
              <h3 className="text-2xl font-medium">Heading 3 - Design Excellence</h3>
              <p className="text-base">
                Body text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                The selected font influences readability and user experience.
              </p>
              <p className="text-sm text-muted-foreground">
                Small text: Additional details and captions appear in smaller text throughout the interface.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Base Font Size */}
      <Card>
        <CardHeader>
          <CardTitle>Base Font Size</CardTitle>
          <CardDescription>
            Control the foundational text size (affects all relative sizing)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="baseFontSize">Base Size: {formData.baseFontSize}px</Label>
              <span className="text-sm text-muted-foreground">
                {formData.baseFontSize < 14 && 'Too Small'}
                {formData.baseFontSize >= 14 && formData.baseFontSize <= 18 && 'Optimal'}
                {formData.baseFontSize > 18 && 'Large'}
              </span>
            </div>
            
            <div className="px-2">
              <Slider
                id="baseFontSize"
                min={12}
                max={24}
                step={1}
                value={[formData.baseFontSize]}
                onValueChange={(value) => handleChange('baseFontSize', value[0])}
                className="w-full"
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground px-2">
              <span>12px</span>
              <span>16px (Default)</span>
              <span>24px</span>
            </div>
          </div>

          {/* Size Preview */}
          <div className="space-y-3 pt-4 border-t">
            <Label>Size Preview</Label>
            <div className="border rounded-lg p-6 bg-white space-y-3">
              <p style={{ fontSize: `${formData.baseFontSize}px`, fontFamily: formData.fontFamily }}>
                <strong>Base Text ({formData.baseFontSize}px):</strong> This is how regular paragraph text will appear on your website.
              </p>
              <p style={{ fontSize: `${formData.baseFontSize * 0.875}px`, fontFamily: formData.fontFamily }} className="text-muted-foreground">
                <strong>Small Text ({Math.round(formData.baseFontSize * 0.875)}px):</strong> Captions and secondary information.
              </p>
              <p style={{ fontSize: `${formData.baseFontSize * 1.5}px`, fontFamily: formData.fontFamily }} className="font-semibold">
                <strong>Large Text ({Math.round(formData.baseFontSize * 1.5)}px):</strong> Subheadings and emphasis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Scale Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <CardDescription>
            Preview of the complete type hierarchy based on your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" style={{ fontFamily: formData.fontFamily }}>
            <div className="flex items-baseline gap-4 pb-2 border-b">
              <span className="text-xs text-muted-foreground w-20">Display</span>
              <span style={{ fontSize: `${formData.baseFontSize * 2.5}px` }} className="font-bold">
                Extra Large Heading
              </span>
            </div>
            <div className="flex items-baseline gap-4 pb-2 border-b">
              <span className="text-xs text-muted-foreground w-20">H1</span>
              <span style={{ fontSize: `${formData.baseFontSize * 2}px` }} className="font-bold">
                Primary Heading
              </span>
            </div>
            <div className="flex items-baseline gap-4 pb-2 border-b">
              <span className="text-xs text-muted-foreground w-20">H2</span>
              <span style={{ fontSize: `${formData.baseFontSize * 1.75}px` }} className="font-semibold">
                Secondary Heading
              </span>
            </div>
            <div className="flex items-baseline gap-4 pb-2 border-b">
              <span className="text-xs text-muted-foreground w-20">H3</span>
              <span style={{ fontSize: `${formData.baseFontSize * 1.5}px` }} className="font-medium">
                Tertiary Heading
              </span>
            </div>
            <div className="flex items-baseline gap-4 pb-2 border-b">
              <span className="text-xs text-muted-foreground w-20">Body</span>
              <span style={{ fontSize: `${formData.baseFontSize}px` }}>
                Regular body text paragraph
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground w-20">Small</span>
              <span style={{ fontSize: `${formData.baseFontSize * 0.875}px` }}>
                Small text and captions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Typography'}
        </Button>
      </div>
    </div>
    </CustomizationLayout>
  );
}
