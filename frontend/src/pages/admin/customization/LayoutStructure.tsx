import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Layout as LayoutIcon, Info, Box } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


export default function LayoutStructure() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    contentWidth: 'full',
    headerStyle: 'solid',
    footerStyle: 'minimal',
  });

  useEffect(() => {
    if (settings?.layout) {
      setFormData({
        contentWidth: settings.layout.contentWidth || 'full',
        headerStyle: settings.layout.headerStyle || 'solid',
        footerStyle: settings.layout.footerStyle || 'minimal',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.updateLayoutSettings(formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Layout settings saved successfully!',
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
            <LayoutIcon className="h-8 w-8 text-primary" />
            Layout & Structure
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure the overall layout and structure of your website
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-cyan-200 bg-cyan-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-cyan-600" />
            <CardTitle className="text-lg text-cyan-900">Layout Guidelines</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-cyan-800 space-y-1">
            <li>• Full-width layouts are modern and immersive</li>
            <li>• Boxed layouts provide better focus on content</li>
            <li>• Transparent headers create seamless hero sections</li>
            <li>• Choose layouts that complement your content type</li>
          </ul>
        </CardContent>
      </Card>

      {/* Content Width */}
      <Card>
        <CardHeader>
          <CardTitle>Content Width</CardTitle>
          <CardDescription>
            Choose how content is displayed across the page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={formData.contentWidth}
            onValueChange={(value) => handleChange('contentWidth', value)}
          >
            <div className="space-y-4">
              {/* Full Width Option */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="full" id="full" />
                <div className="flex-1">
                  <Label htmlFor="full" className="font-medium cursor-pointer">
                    Full Width
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Content spans the entire width of the browser window
                  </p>
                  <div className="mt-3 border-2 rounded-lg overflow-hidden bg-white">
                    <div className="bg-slate-200 p-2 text-xs text-center font-medium">Header</div>
                    <div className="bg-slate-100 p-8 text-xs text-center">Full Width Content Area</div>
                    <div className="bg-slate-200 p-2 text-xs text-center font-medium">Footer</div>
                  </div>
                </div>
              </div>

              {/* Boxed Option */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="boxed" id="boxed" />
                <div className="flex-1">
                  <Label htmlFor="boxed" className="font-medium cursor-pointer">
                    Boxed (Contained)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Content is centered with maximum width constraints
                  </p>
                  <div className="mt-3 border-2 rounded-lg overflow-hidden bg-slate-50">
                    <div className="bg-slate-200 p-2 text-xs text-center font-medium">Header</div>
                    <div className="flex justify-center p-4">
                      <div className="bg-white border-2 border-dashed border-slate-300 p-6 w-3/4 text-xs text-center">
                        Boxed Content Area
                      </div>
                    </div>
                    <div className="bg-slate-200 p-2 text-xs text-center font-medium">Footer</div>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Header Style */}
      <Card>
        <CardHeader>
          <CardTitle>Header Style</CardTitle>
          <CardDescription>
            Choose how your header is displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={formData.headerStyle}
            onValueChange={(value) => handleChange('headerStyle', value)}
          >
            <div className="space-y-4">
              {/* Solid Header */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="solid" id="solid" />
                <div className="flex-1">
                  <Label htmlFor="solid" className="font-medium cursor-pointer">
                    Solid Background
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Header has a solid background color
                  </p>
                  <div className="mt-3 border-2 rounded-lg overflow-hidden">
                    <div className="bg-slate-800 text-white p-4 text-xs font-medium flex items-center justify-between">
                      <span>LOGO</span>
                      <div className="flex gap-3">
                        <span>Home</span>
                        <span>About</span>
                        <span>Contact</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-xs text-center text-muted-foreground">
                      Content Below Header
                    </div>
                  </div>
                </div>
              </div>

              {/* Transparent Header */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="transparent" id="transparent" />
                <div className="flex-1">
                  <Label htmlFor="transparent" className="font-medium cursor-pointer">
                    Transparent
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Header overlays content with transparent background
                  </p>
                  <div className="mt-3 border-2 rounded-lg overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm text-white p-4 text-xs font-medium flex items-center justify-between">
                      <span>LOGO</span>
                      <div className="flex gap-3">
                        <span>Home</span>
                        <span>About</span>
                        <span>Contact</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-12 text-xs text-center text-white font-medium">
                      Hero Section with Transparent Header
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Footer Style */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Style</CardTitle>
          <CardDescription>
            Choose the complexity of your footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={formData.footerStyle}
            onValueChange={(value) => handleChange('footerStyle', value)}
          >
            <div className="space-y-4">
              {/* Minimal Footer */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="minimal" id="minimal" />
                <div className="flex-1">
                  <Label htmlFor="minimal" className="font-medium cursor-pointer">
                    Minimal
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Simple footer with essential information only
                  </p>
                  <div className="mt-3 border-2 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-8 text-xs text-center text-muted-foreground">
                      Page Content
                    </div>
                    <div className="bg-slate-800 text-white p-4 text-xs text-center">
                      © 2024 Your Company. All rights reserved.
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Footer */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="detailed" id="detailed" />
                <div className="flex-1">
                  <Label htmlFor="detailed" className="font-medium cursor-pointer">
                    Detailed
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive footer with multiple sections and links
                  </p>
                  <div className="mt-3 border-2 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-8 text-xs text-center text-muted-foreground">
                      Page Content
                    </div>
                    <div className="bg-slate-800 text-white p-6">
                      <div className="grid grid-cols-3 gap-4 text-xs mb-4">
                        <div>
                          <div className="font-bold mb-2">Company</div>
                          <div className="space-y-1 text-slate-300">
                            <div>About</div>
                            <div>Careers</div>
                            <div>Contact</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold mb-2">Resources</div>
                          <div className="space-y-1 text-slate-300">
                            <div>Blog</div>
                            <div>Help</div>
                            <div>FAQ</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold mb-2">Legal</div>
                          <div className="space-y-1 text-slate-300">
                            <div>Privacy</div>
                            <div>Terms</div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-700 pt-4 text-xs text-center">
                        © 2024 Your Company. All rights reserved.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Complete Layout Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Layout Preview</CardTitle>
          <CardDescription>
            Visualize your complete page structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 rounded-lg overflow-hidden bg-slate-50">
            {/* Preview Header */}
            <div className={`
              ${formData.headerStyle === 'transparent' ? 'bg-black/20 backdrop-blur-sm text-white' : 'bg-slate-800 text-white'}
              p-4 text-xs font-medium flex items-center justify-between
            `}>
              <Box className="h-4 w-4" />
              <div className="flex gap-3">
                <span>Navigation</span>
                <span>Links</span>
                <span>Here</span>
              </div>
            </div>

            {/* Preview Content */}
            <div className={`
              ${formData.contentWidth === 'boxed' ? 'flex justify-center p-6' : 'p-6'}
              bg-white
            `}>
              <div className={formData.contentWidth === 'boxed' ? 'w-3/4 border-2 border-dashed border-slate-300 p-6' : ''}>
                <div className="text-xs space-y-4">
                  <div className="h-8 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                  <div className="h-4 bg-slate-100 rounded w-4/6" />
                </div>
              </div>
            </div>

            {/* Preview Footer */}
            {formData.footerStyle === 'minimal' ? (
              <div className="bg-slate-800 text-white p-4 text-xs text-center">
                Minimal Footer
              </div>
            ) : (
              <div className="bg-slate-800 text-white p-6">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-1">
                      <div className="h-2 bg-slate-600 rounded w-2/3" />
                      <div className="h-1 bg-slate-700 rounded" />
                      <div className="h-1 bg-slate-700 rounded w-4/5" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-700 pt-3 text-xs text-center">
                  Detailed Footer
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Layout'}
        </Button>
      </div>
    </div>
    </CustomizationLayout>
  );
}
