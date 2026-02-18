import { useSiteSettings } from '@/context/SiteSettingsContext';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';


const SectionHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="mb-4">
    <h2 className="text-xl font-semibold">{title}</h2>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
  </div>
);

export default function WebsiteCustomization() {
  const { settings, applyToDocument } = useSiteSettings();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings as Record<string, unknown>);
  }, [settings]);

  const setNested = (path: string, value: unknown) => {
    setForm((prev: Record<string, unknown>) => {
      const next = { ...prev };
      const parts = path.split('.');
      let cur = next as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = cur[parts[i]] || {};
        cur = cur[parts[i]] as Record<string, unknown>;
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const previewApply = () => {
    setPreviewing(true);
    applyToDocument(form);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await api.updateAdminSiteSettings(form);
      if (res.success) {
        setForm(res.data as Record<string, unknown>);
      }
    } catch (e) {

    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    try {
      await api.publishSiteSettings();
    } catch (e) {

    }
    setSaving(false);
  };

  const input = (label: string, path: string, type: 'text' | 'color' | 'number' = 'text', placeholder?: string) => {
    const value = path.split('.').reduce((acc: Record<string, unknown> | unknown, key: string) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : ''), form) || '';
    return (
      <label className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <input
          className="border rounded-md px-3 py-2"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setNested(path, type === 'number' ? Number(e.target.value) : e.target.value)}
        />
      </label>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <SectionHeader title="General Website Settings" />
        {input('Site Name', 'general.siteName', 'text', 'Menu Maestro')}
        {input('Description', 'general.siteDescription', 'text', 'Digital menu and QR solutions')}
        {input('Contact Email', 'general.contactEmail', 'text', 'support@example.com')}

        <SectionHeader title="Logo & Branding" />
        {input('Logo URL', 'branding.logoUrl', 'text', 'https://...')}
        {input('Favicon URL', 'branding.faviconUrl', 'text', 'https://...')}

        <SectionHeader title="Typography" />
        {input('Font Family', 'typography.fontFamily', 'text', 'Inter, system-ui, ...')}
        {input('Base Font Size', 'typography.baseFontSize', 'number', '16')}

        <SectionHeader title="Colors & Theme" />
        {input('Primary Color', 'colors.primary', 'color')}
        {input('Secondary Color', 'colors.secondary', 'color')}
        {input('Background Color', 'colors.background', 'color')}
        {input('Text Color', 'colors.text', 'color')}

        <SectionHeader title="Layout & Structure" />
        <div className="grid grid-cols-2 gap-4">
          {input('Content Width (boxed/full)', 'layout.contentWidth', 'text', 'full')}
          {input('Header Style (transparent/solid)', 'layout.headerStyle', 'text', 'solid')}
          {input('Footer Style (minimal/detailed)', 'layout.footerStyle', 'text', 'minimal')}
        </div>

        <SectionHeader title="Images & Media" />
        {input('Hero Image URL', 'media.heroImageUrl', 'text', 'https://...')}
        {input('Banner Image URL', 'media.bannerImageUrl', 'text', 'https://...')}

        <SectionHeader title="Animations & Effects" />
        <div className="grid grid-cols-2 gap-4">
          {input('Enable Animations (true/false)', 'animations.enabled', 'text', 'true')}
          {input('Duration (ms)', 'animations.durationMs', 'number', '300')}
        </div>

        <SectionHeader title="Sections & Components" />
        <div className="grid grid-cols-2 gap-4">
          {input('Show Features (true/false)', 'sections.showFeatures', 'text', 'true')}
          {input('Show Pricing (true/false)', 'sections.showPricing', 'text', 'true')}
          {input('Show Testimonials (true/false)', 'sections.showTestimonials', 'text', 'true')}
          {input('Show FAQs (true/false)', 'sections.showFAQ', 'text', 'true')}
        </div>

        <SectionHeader title="SEO & Meta Tags" />
        {input('Meta Title', 'seo.metaTitle', 'text', 'Menu Maestro')}
        {input('Meta Description', 'seo.metaDescription', 'text', '...')}
        {input('Meta Keywords (comma separated)', 'seo.metaKeywords', 'text', 'menu, qr, restaurant')}

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={previewApply} disabled={saving}>Preview</Button>
          <Button variant="default" onClick={saveChanges} disabled={saving}>Save</Button>
          <Button variant="outline" onClick={publish} disabled={saving}>Publish</Button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="border rounded-lg p-6 bg-[var(--bg-color)] text-[var(--text-color)]">
        <SectionHeader title="Preview & Publish" description="Quick preview of your current selections" />
        <div className="flex items-center gap-3 mb-6">
          {form?.branding?.logoUrl ? (
            <img src={form.branding.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-contain" />
          ) : (
            <div className="w-12 h-12 rounded-xl" style={{ background: 'var(--primary-color)' }} />
          )}
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: form?.typography?.fontFamily }}>
              {form?.general?.siteName || 'Site Name'}
            </div>
            <div className="text-sm text-muted-foreground">
              {form?.general?.siteDescription || 'Site description'}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="p-4 rounded-md border" style={{ borderColor: 'var(--secondary-color)' }}>
            This is a sample section block.
          </div>
          <Button style={{ background: 'var(--primary-color)' }}>Primary Button</Button>
        </div>
      </div>
    </div>
  );
}
