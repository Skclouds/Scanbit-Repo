import { Globe, Sparkles, Type, Palette, Layout, Image, Zap, LayoutGrid, Search, Eye, ChevronRight, } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';


const customizationPages = [
  {
    name: 'General Settings',
    path: '/admin/customization/general',
    icon: Globe,
    description: 'Site name, description, and contact info',
  },
  {
    name: 'Logo & Branding',
    path: '/admin/customization/branding',
    icon: Sparkles,
    description: 'Upload logo and favicon',
  },
  {
    name: 'Typography',
    path: '/admin/customization/typography',
    icon: Type,
    description: 'Fonts and text sizing',
  },
  {
    name: 'Colors & Theme',
    path: '/admin/customization/colors',
    icon: Palette,
    description: 'Brand colors and theme',
  },
  {
    name: 'Layout & Structure',
    path: '/admin/customization/layout',
    icon: Layout,
    description: 'Page layout and structure',
  },
  {
    name: 'Images & Media',
    path: '/admin/customization/media',
    icon: Image,
    description: 'Hero images and banners',
  },
  {
    name: 'Animations & Effects',
    path: '/admin/customization/animations',
    icon: Zap,
    description: 'Transition effects and animations',
  },
  {
    name: 'Sections & Components',
    path: '/admin/customization/sections',
    icon: LayoutGrid,
    description: 'Toggle page sections',
  },
  {
    name: 'SEO & Meta Tags',
    path: '/admin/customization/seo',
    icon: Search,
    description: 'Search engine optimization',
  },
  {
    name: 'Preview & Publish',
    path: '/admin/customization/preview',
    icon: Eye,
    description: 'Preview and publish changes',
  },
];

/** Set to false to hide the website customization sidebar block (intro + list of sections removed). */
export const SHOW_CUSTOMIZATION_SIDEBAR = false;

export function CustomizationNav() {
  // Section removed per request: no sidebar block for "Website Customization" / General Settings, Logo & Branding, etc.
  return null;
}

export function CustomizationBreadcrumb() {
  const location = useLocation();
  const currentPage = customizationPages.find(page => page.path === location.pathname);

  if (!currentPage) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link to="/admin/dashboard" className="hover:text-foreground">
        Admin Dashboard
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span>Website Customization</span>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground font-medium">{currentPage.name}</span>
    </div>
  );
}
