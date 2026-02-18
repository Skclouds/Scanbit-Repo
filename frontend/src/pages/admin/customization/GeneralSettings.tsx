import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomizationLayout from '@/components/admin/CustomizationLayout';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Textarea } from '@/components/ui/textarea';
import React, { useState, useEffect } from 'react';
import { Save, Info, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


export default function GeneralSettings() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    tagline: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  useEffect(() => {
    if (settings?.general) {
      setFormData({
        siteName: settings.general.siteName || '',
        tagline: settings.general.tagline || '',
        siteDescription: settings.general.siteDescription || '',
        contactEmail: settings.general.contactEmail || '',
        contactPhone: settings.general.contactPhone || '',
        address: settings.general.address || '',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.siteName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Site name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.contactEmail.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Contact email is required',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.contactPhone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.contactPhone.trim())) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid phone number',
          variant: 'destructive',
        });
        return;
      }
    }

    setSaving(true);
    try {
      // Clean data before sending
      const cleanData = {
        siteName: formData.siteName.trim(),
        tagline: formData.tagline.trim(),
        siteDescription: formData.siteDescription.trim(),
        contactEmail: formData.contactEmail.trim().toLowerCase(),
        contactPhone: formData.contactPhone.trim(),
        address: formData.address.trim(),
      };

      const response = await api.updateGeneralSettings(cleanData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'General settings saved successfully!',
        });
        // Refresh settings context to reflect changes
        await refresh();
      } else {
        throw new Error(response.message || 'Failed to save settings');
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
              <Globe className="h-8 w-8 text-primary" />
              General Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure your website's basic information and contact details
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Information Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-900">About General Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              These settings control the basic identity of your website. The site name appears in browser tabs,
              search results, and throughout the platform. The description helps with SEO and provides context
              for visitors.
            </p>
          </CardContent>
        </Card>

        {/* Site Name */}
        <Card>
        <CardHeader>
          <CardTitle>Site Name</CardTitle>
          <CardDescription>
            The name of your website as it appears to visitors and in search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Website Name *</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              placeholder="Menu Maestro"
              className="text-lg font-medium"
            />
            <p className="text-xs text-muted-foreground">
              Keep it concise (3-5 words). This appears in the browser tab and page titles.
            </p>
          </div>
          
          {formData.siteName && (
            <div className="p-3 bg-slate-50 rounded-md border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
              <p className="text-sm">
                Browser Tab: <span className="font-semibold">{formData.siteName}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tagline */}
      <Card>
        <CardHeader>
          <CardTitle>Tagline</CardTitle>
          <CardDescription>
            A catchy slogan or motto that represents your brand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="One QR. One Digital Look."
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              A memorable phrase that captures your brand essence (optional, max 200 characters)
            </p>
          </div>
          
          {formData.tagline && (
            <div className="p-3 bg-slate-50 rounded-md border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
              <p className="text-sm italic text-gray-700">"{formData.tagline}"</p>
            </div>
          )}
        </CardContent>
        </Card>

        {/* Site Description */}
        <Card>
          <CardHeader>
            <CardTitle>Site Description</CardTitle>
            <CardDescription>
              A brief description of your website's purpose and services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Description</Label>
              <Textarea
                id="siteDescription"
                value={formData.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                placeholder="Create beautiful digital menus for your restaurant with QR code integration..."
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Recommended: 50-160 characters for optimal SEO
                </p>
                <p className="text-xs font-medium">
                  {formData.siteDescription.length} characters
                </p>
              </div>
            </div>

            {formData.siteDescription && (
              <div className="p-3 bg-slate-50 rounded-md border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Search Engine Preview:</p>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-700">{formData.siteName}</p>
                  <p className="text-xs text-gray-600">{formData.siteDescription}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Primary contact details for support and inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="support@example.com"
              />
              <p className="text-xs text-muted-foreground">
                This email will be used for support inquiries and displayed in the footer
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-xs text-muted-foreground">
                Phone number for customer support (optional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main Street, Suite 100, City, State 12345"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Your business address displayed in the footer and contact page (optional)
              </p>
            </div>

            {(formData.contactEmail || formData.contactPhone || formData.address) && (
              <div className="p-3 bg-slate-50 rounded-md border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Contact Display Preview:</p>
                <div className="text-sm space-y-1">
                  {formData.contactEmail && (
                    <p>
                      Email:{' '}
                      <a href={`mailto:${formData.contactEmail}`} className="text-primary font-medium underline">
                        {formData.contactEmail}
                      </a>
                    </p>
                  )}
                  {formData.contactPhone && (
                    <p>
                      Phone:{' '}
                      <a href={`tel:${formData.contactPhone}`} className="text-primary font-medium underline">
                        {formData.contactPhone}
                      </a>
                    </p>
                  )}
                  {formData.address && (
                    <p className="text-gray-600">
                      Address: {formData.address}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save General Settings'}
        </Button>
      </div>
    </div>
    </CustomizationLayout>
  );
}
