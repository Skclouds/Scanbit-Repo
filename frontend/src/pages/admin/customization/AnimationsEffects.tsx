import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Save, Zap, Info, Play } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


export default function AnimationsEffects() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [playDemo, setPlayDemo] = useState(false);
  const [formData, setFormData] = useState({
    enabled: true,
    durationMs: 300,
  });

  useEffect(() => {
    if (settings?.animations) {
      setFormData({
        enabled: settings.animations.enabled !== undefined ? settings.animations.enabled : true,
        durationMs: settings.animations.durationMs || 300,
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.updateAnimationsSettings(formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Animation settings saved successfully!',
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

  const runDemo = () => {
    setPlayDemo(true);
    setTimeout(() => setPlayDemo(false), formData.durationMs + 100);
  };

  return (
    <CustomizationLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Animations & Effects
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure animations and transition effects for your website
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg text-amber-900">Animation Best Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Animations enhance user experience but shouldn't distract</li>
            <li>• Shorter durations (200-300ms) feel snappier</li>
            <li>• Longer durations (400-600ms) feel more relaxed</li>
            <li>• Consider user preferences for reduced motion</li>
            <li>• Test animations on different devices and connections</li>
          </ul>
        </CardContent>
      </Card>

      {/* Enable/Disable Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Animation Control</CardTitle>
          <CardDescription>
            Enable or disable all animations across your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enabled" className="text-base">Enable Animations</Label>
              <p className="text-sm text-muted-foreground">
                Turn animations on or off globally
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => handleChange('enabled', checked)}
            />
          </div>

          {!formData.enabled && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Disabling animations will make all transitions instant. 
                This can improve performance on slower devices but may reduce visual polish.
              </p>
            </div>
          )}

          {formData.enabled && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Animations are enabled. Users will experience smooth transitions and effects.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Animation Duration */}
      {formData.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Animation Duration</CardTitle>
            <CardDescription>
              Control the speed of animations and transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="durationMs">Duration: {formData.durationMs}ms</Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {formData.durationMs < 200 && 'Very Fast'}
                  {formData.durationMs >= 200 && formData.durationMs < 300 && 'Fast'}
                  {formData.durationMs >= 300 && formData.durationMs < 400 && 'Normal'}
                  {formData.durationMs >= 400 && formData.durationMs < 500 && 'Slow'}
                  {formData.durationMs >= 500 && 'Very Slow'}
                </span>
              </div>
              
              <div className="px-2">
                <Slider
                  id="durationMs"
                  min={100}
                  max={1000}
                  step={50}
                  value={[formData.durationMs]}
                  onValueChange={(value) => handleChange('durationMs', value[0])}
                  className="w-full"
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground px-2">
                <span>100ms (Instant)</span>
                <span>300ms (Default)</span>
                <span>1000ms (1 second)</span>
              </div>
            </div>

            {/* Duration Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t">
              <button
                onClick={() => handleChange('durationMs', 200)}
                className={`p-3 border rounded-lg text-left hover:border-primary transition-colors ${
                  formData.durationMs === 200 ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <p className="font-semibold text-sm">Fast (200ms)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Snappy, responsive feel
                </p>
              </button>
              <button
                onClick={() => handleChange('durationMs', 300)}
                className={`p-3 border rounded-lg text-left hover:border-primary transition-colors ${
                  formData.durationMs === 300 ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <p className="font-semibold text-sm">Normal (300ms)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Balanced, recommended
                </p>
              </button>
              <button
                onClick={() => handleChange('durationMs', 500)}
                className={`p-3 border rounded-lg text-left hover:border-primary transition-colors ${
                  formData.durationMs === 500 ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <p className="font-semibold text-sm">Slow (500ms)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Smooth, elegant feel
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animation Preview */}
      {formData.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Animation Preview</CardTitle>
            <CardDescription>
              Test how animations will look with your current settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button onClick={runDemo} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Play Demo
              </Button>
              <span className="text-sm text-muted-foreground">
                Watch animations with {formData.durationMs}ms duration
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fade In */}
              <div className="border rounded-lg p-6 bg-slate-50">
                <p className="text-xs font-medium text-muted-foreground mb-3">Fade In</p>
                <div
                  className={`bg-white border-2 rounded-lg p-4 text-center ${
                    playDemo ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    transition: `opacity ${formData.durationMs}ms ease-in-out`,
                  }}
                >
                  <p className="font-medium">Content appears</p>
                </div>
              </div>

              {/* Slide In */}
              <div className="border rounded-lg p-6 bg-slate-50 overflow-hidden">
                <p className="text-xs font-medium text-muted-foreground mb-3">Slide In</p>
                <div
                  className={`bg-white border-2 rounded-lg p-4 text-center ${
                    playDemo ? 'translate-x-0' : '-translate-x-full'
                  }`}
                  style={{
                    transition: `transform ${formData.durationMs}ms ease-in-out`,
                  }}
                >
                  <p className="font-medium">Content slides</p>
                </div>
              </div>

              {/* Scale Up */}
              <div className="border rounded-lg p-6 bg-slate-50">
                <p className="text-xs font-medium text-muted-foreground mb-3">Scale Up</p>
                <div
                  className={`bg-white border-2 rounded-lg p-4 text-center ${
                    playDemo ? 'scale-100' : 'scale-75'
                  }`}
                  style={{
                    transition: `transform ${formData.durationMs}ms ease-in-out`,
                  }}
                >
                  <p className="font-medium">Content grows</p>
                </div>
              </div>

              {/* Bounce */}
              <div className="border rounded-lg p-6 bg-slate-50">
                <p className="text-xs font-medium text-muted-foreground mb-3">Hover Effect</p>
                <div
                  className="bg-primary hover:bg-primary/80 border-2 border-primary rounded-lg p-4 text-center cursor-pointer"
                  style={{
                    transition: `all ${formData.durationMs}ms ease-in-out`,
                  }}
                >
                  <p className="font-medium text-white">Hover me</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animation Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Animation Types Used</CardTitle>
          <CardDescription>
            Overview of animations applied throughout your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Page Transitions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Navigation menu open/close</li>
                <li>• Modal and dialog appearances</li>
                <li>• Dropdown menu animations</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Interactive Elements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Button hover and click effects</li>
                <li>• Card hover elevations</li>
                <li>• Form input focus states</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Content Loading</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Skeleton loading animations</li>
                <li>• Image fade-ins</li>
                <li>• Content reveal on scroll</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Feedback</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Toast notifications</li>
                <li>• Loading spinners</li>
                <li>• Success/error indicators</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Note */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Accessibility Considerations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800">
            The website automatically respects the user's "prefers-reduced-motion" system setting. 
            Users who have enabled reduced motion in their operating system will experience minimal 
            or no animations, regardless of these settings, ensuring an accessible experience for all.
          </p>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Animation Settings'}
        </Button>
      </div>
    </div>
    </CustomizationLayout>
  );
}
