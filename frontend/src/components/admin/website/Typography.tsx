import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Save, Type } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const fontOptions = [
  { value: 'Inter', label: 'Inter', category: 'Sans-serif' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans-serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Sans-serif' },
  { value: 'Lato', label: 'Lato', category: 'Sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans-serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'Georgia', label: 'Georgia', category: 'Serif' },
  { value: 'Fira Code', label: 'Fira Code', category: 'Monospace' },
];

export default function Typography() {
  const [loading, setLoading] = useState(false);
  const [typography, setTypography] = useState({
    primaryFont: 'Inter',
    headingFont: 'Poppins',
    monoFont: 'Fira Code',
    baseFontSize: 16,
    headingScale: 1.25,
    lineHeight: 1.6,
    letterSpacing: 0,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSiteSettings();
      if (res.success && res.data?.typography) {
        setTypography(prev => ({
          ...prev,
          primaryFont: res.data.typography.fontFamily?.split(',')[0]?.trim() || 'Inter',
          baseFontSize: res.data.typography.baseFontSize || 16,
        }));
      }
    } catch (e) {

    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateAdminSiteSettings({
        typography: {
          fontFamily: typography.primaryFont,
          baseFontSize: typography.baseFontSize,
        }
      });
      toast.success('Typography settings saved');
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
          <h2 className="text-2xl font-bold">Typography</h2>
          <p className="text-muted-foreground">Configure fonts and text styling</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Font Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Font Families
            </CardTitle>
            <CardDescription>Choose fonts for different elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Font (Body Text)</Label>
              <Select value={typography.primaryFont} onValueChange={(v) => setTypography({ ...typography, primaryFont: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map(f => (
                    <SelectItem key={f.value} value={f.value}>
                      <span style={{ fontFamily: f.value }}>{f.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">({f.category})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select value={typography.headingFont} onValueChange={(v) => setTypography({ ...typography, headingFont: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map(f => (
                    <SelectItem key={f.value} value={f.value}>
                      <span style={{ fontFamily: f.value }}>{f.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monospace Font (Code)</Label>
              <Select value={typography.monoFont} onValueChange={(v) => setTypography({ ...typography, monoFont: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fira Code">Fira Code</SelectItem>
                  <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                  <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                  <SelectItem value="Monaco">Monaco</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Font Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Font Sizes & Spacing</CardTitle>
            <CardDescription>Adjust text sizes and spacing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Base Font Size</Label>
                <span className="text-sm text-muted-foreground">{typography.baseFontSize}px</span>
              </div>
              <Slider
                value={[typography.baseFontSize]}
                onValueChange={([v]) => setTypography({ ...typography, baseFontSize: v })}
                min={12}
                max={20}
                step={1}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Heading Scale</Label>
                <span className="text-sm text-muted-foreground">{typography.headingScale.toFixed(2)}</span>
              </div>
              <Slider
                value={[typography.headingScale * 100]}
                onValueChange={([v]) => setTypography({ ...typography, headingScale: v / 100 })}
                min={100}
                max={150}
                step={5}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Line Height</Label>
                <span className="text-sm text-muted-foreground">{typography.lineHeight.toFixed(1)}</span>
              </div>
              <Slider
                value={[typography.lineHeight * 10]}
                onValueChange={([v]) => setTypography({ ...typography, lineHeight: v / 10 })}
                min={12}
                max={20}
                step={1}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See your typography choices in action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-4 border rounded-lg" style={{ fontFamily: typography.primaryFont, fontSize: typography.baseFontSize, lineHeight: typography.lineHeight }}>
            <h1 className="text-4xl font-bold" style={{ fontFamily: typography.headingFont }}>
              Heading 1 Example
            </h1>
            <h2 className="text-3xl font-semibold" style={{ fontFamily: typography.headingFont }}>
              Heading 2 Example
            </h2>
            <h3 className="text-2xl font-medium" style={{ fontFamily: typography.headingFont }}>
              Heading 3 Example
            </h3>
            <p>
              This is a paragraph of body text using your selected primary font. 
              Typography is a crucial aspect of design that affects readability and 
              user experience. Good typography makes content easy to read and visually appealing.
            </p>
            <p className="text-sm text-muted-foreground">
              This is smaller muted text often used for captions and helper text.
            </p>
            <code className="text-sm bg-muted px-2 py-1 rounded" style={{ fontFamily: typography.monoFont }}>
              const code = "monospace example";
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
