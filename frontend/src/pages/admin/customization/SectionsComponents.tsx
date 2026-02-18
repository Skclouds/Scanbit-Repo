import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { Save, LayoutGrid, Info, Eye, EyeOff } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


export default function SectionsComponents() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    showFeatures: true,
    showPricing: true,
    showTestimonials: true,
    showFAQ: true,
  });

  useEffect(() => {
    if (settings?.sections) {
      setFormData({
        showFeatures: settings.sections.showFeatures !== undefined ? settings.sections.showFeatures : true,
        showPricing: settings.sections.showPricing !== undefined ? settings.sections.showPricing : true,
        showTestimonials: settings.sections.showTestimonials !== undefined ? settings.sections.showTestimonials : true,
        showFAQ: settings.sections.showFAQ !== undefined ? settings.sections.showFAQ : true,
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.updateSectionsSettings(formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Section settings saved successfully!',
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

  const sections = [
    {
      key: 'showFeatures',
      title: 'Features Section',
      description: 'Showcase your product features and capabilities',
      preview: 'Displays feature cards with icons, titles, and descriptions',
      icon: '✨',
    },
    {
      key: 'showPricing',
      title: 'Pricing Section',
      description: 'Display pricing plans and subscription options',
      preview: 'Shows pricing tiers with features and call-to-action buttons',
      icon: '💰',
    },
    {
      key: 'showTestimonials',
      title: 'Testimonials Section',
      description: 'Feature customer reviews and success stories',
      preview: 'Displays customer quotes, ratings, and profile information',
      icon: '⭐',
    },
    {
      key: 'showFAQ',
      title: 'FAQ Section',
      description: 'Answer frequently asked questions',
      preview: 'Shows expandable question-answer pairs for common inquiries',
      icon: '❓',
    },
  ];

  const visibleCount = Object.values(formData).filter(Boolean).length;

  return (
    <CustomizationLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-8 w-8 text-primary" />
            Sections & Components
          </h1>
          <p className="text-muted-foreground mt-1">
            Control which sections appear on your website
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-violet-200 bg-violet-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-violet-600" />
            <CardTitle className="text-lg text-violet-900">Section Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-violet-800 mb-2">
            Toggle sections on or off to customize your homepage layout. Disabled sections will not 
            appear on your website, allowing you to create a focused experience for your visitors.
          </p>
          <p className="text-sm text-violet-800">
            <strong>Currently displaying: {visibleCount} of {sections.length} sections</strong>
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Enable or disable all sections at once
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setFormData({
                showFeatures: true,
                showPricing: true,
                showTestimonials: true,
                showFAQ: true,
              });
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Show All
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFormData({
                showFeatures: false,
                showPricing: false,
                showTestimonials: false,
                showFAQ: false,
              });
            }}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Hide All
          </Button>
        </CardContent>
      </Card>

      {/* Section Controls */}
      {sections.map((section) => (
        <Card key={section.key} className={!formData[section.key as keyof typeof formData] ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{section.icon}</span>
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  {section.description}
                </CardDescription>
              </div>
              <Switch
                checked={formData[section.key as keyof typeof formData]}
                onCheckedChange={(checked) => handleChange(section.key, checked)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                formData[section.key as keyof typeof formData]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {formData[section.key as keyof typeof formData] ? (
                  <>
                    <Eye className="h-3 w-3" />
                    Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    Hidden
                  </>
                )}
              </span>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-slate-50">
              <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
              <p className="text-sm">{section.preview}</p>
            </div>

            {/* Visual Mockup */}
            {formData[section.key as keyof typeof formData] && (
              <div className="border-2 border-dashed rounded-lg p-6 bg-white">
                {section.key === 'showFeatures' && (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="text-center space-y-2">
                        <div className="h-12 w-12 bg-primary/20 rounded-full mx-auto" />
                        <div className="h-2 bg-slate-200 rounded" />
                        <div className="h-1 bg-slate-100 rounded w-3/4 mx-auto" />
                      </div>
                    ))}
                  </div>
                )}
                {section.key === 'showPricing' && (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`border rounded-lg p-3 ${i === 2 ? 'border-primary border-2' : ''}`}>
                        <div className="h-3 bg-slate-200 rounded mb-2" />
                        <div className="h-6 bg-slate-300 rounded mb-2" />
                        <div className="space-y-1">
                          <div className="h-1 bg-slate-100 rounded" />
                          <div className="h-1 bg-slate-100 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {section.key === 'showTestimonials' && (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="h-10 w-10 bg-slate-300 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2 bg-slate-200 rounded w-3/4" />
                          <div className="h-1 bg-slate-100 rounded w-full" />
                          <div className="h-1 bg-slate-100 rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {section.key === 'showFAQ' && (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div className="h-2 bg-slate-200 rounded w-2/3" />
                          <div className="h-3 w-3 bg-slate-300 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Page Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Homepage Layout Preview</CardTitle>
          <CardDescription>
            Visual representation of your homepage with current section settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 rounded-lg overflow-hidden">
            {/* Hero Section (Always visible) */}
            <div className="bg-gradient-to-r from-primary/20 to-purple-200 p-8 text-center">
              <div className="h-4 bg-slate-400 rounded w-1/3 mx-auto mb-3" />
              <div className="h-2 bg-slate-300 rounded w-1/2 mx-auto mb-4" />
              <div className="h-8 bg-primary/30 rounded w-32 mx-auto" />
            </div>

            {/* Dynamic Sections */}
            <div className="divide-y">
              {formData.showFeatures && (
                <div className="p-6 bg-white">
                  <div className="text-center mb-4">
                    <div className="h-3 bg-slate-300 rounded w-32 mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">✨ Features Section</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded" />
                    ))}
                  </div>
                </div>
              )}
              
              {formData.showPricing && (
                <div className="p-6 bg-slate-50">
                  <div className="text-center mb-4">
                    <div className="h-3 bg-slate-300 rounded w-32 mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">💰 Pricing Section</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-white rounded border" />
                    ))}
                  </div>
                </div>
              )}
              
              {formData.showTestimonials && (
                <div className="p-6 bg-white">
                  <div className="text-center mb-4">
                    <div className="h-3 bg-slate-300 rounded w-32 mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">⭐ Testimonials Section</div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 bg-slate-100 rounded" />
                    ))}
                  </div>
                </div>
              )}
              
              {formData.showFAQ && (
                <div className="p-6 bg-slate-50">
                  <div className="text-center mb-4">
                    <div className="h-3 bg-slate-300 rounded w-32 mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">❓ FAQ Section</div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-white rounded border" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer (Always visible) */}
            <div className="bg-slate-800 p-4 text-center">
              <div className="h-2 bg-slate-600 rounded w-48 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning if all sections hidden */}
      {visibleCount === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Warning:</strong> All sections are currently hidden. Your homepage will only 
              display the hero section and footer. Consider enabling at least one section to provide 
              more content for your visitors.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Section Settings'}
        </Button>
      </div>
    </div>
    </CustomizationLayout>
  );
}
