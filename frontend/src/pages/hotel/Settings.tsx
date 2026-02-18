import { FiSettings, FiBell, FiLock, FiGlobe, FiSave, FiEye, FiMoon, FiSun, FiSmartphone, FiMail, FiShield, FiTrash2, FiDownload, FiCreditCard, FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";
import { MdLanguage, MdPalette, MdNotifications, MdSecurity, MdPayment, MdDelete, MdDownload, MdRestaurantMenu, MdQrCode } from "react-icons/md";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getBusinessConfig } from "./sections/menu";

interface SettingsState {
  // General
  publicMenu: boolean;
  showPrices: boolean;
  showImages: boolean;
  enableOrdering: boolean;
  // Menu Display
  menuLayout: 'grid' | 'list' | 'compact';
  showOutOfStock: boolean;
  showCalories: boolean;
  showAllergens: boolean;
  currency: string;
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderAlerts: boolean;
  scanAlerts: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
  // Privacy
  showAnalytics: boolean;
  allowFeedback: boolean;
  shareData: boolean;
  // QR Code
  trackScans: boolean;
  requireVerification: boolean;
  // Appearance
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

const Settings = ({ restaurant, onUpdate }: { restaurant: any; onUpdate: () => void }) => {
  const businessConfig = getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType);
  const displaySectionName =
    businessConfig.pageTitle === 'Catalog' ? 'Catalog Display' :
    businessConfig.pageTitle === 'Product Catalog' ? 'Catalog Display' :
    businessConfig.pageTitle === 'Agency Portfolio' || businessConfig.pageTitle === 'Portfolio' ? 'Portfolio Display' :
    'Menu Display';
  const displayContentLabel = businessConfig.pageTitle === 'Catalog' ? 'catalog' : businessConfig.pageTitle === 'Product Catalog' ? 'catalog' : businessConfig.pageTitle === 'Agency Portfolio' || businessConfig.pageTitle === 'Portfolio' ? 'portfolio' : 'menu';
  const itemsLabel = businessConfig.itemLabelPlural.toLowerCase();

  const [settings, setSettings] = useState<SettingsState>({
    publicMenu: true,
    showPrices: true,
    showImages: true,
    enableOrdering: false,
    menuLayout: 'grid',
    showOutOfStock: false,
    showCalories: false,
    showAllergens: true,
    currency: 'INR',
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    scanAlerts: false,
    weeklyReports: true,
    marketingEmails: false,
    showAnalytics: true,
    allowFeedback: true,
    shareData: false,
    trackScans: true,
    requireVerification: false,
    theme: 'system',
    primaryColor: '#f97316',
    accentColor: '#3b82f6',
  });
  
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showClearMenuDialog, setShowClearMenuDialog] = useState(false);
  const [clearingMenuData, setClearingMenuData] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [activeSection, setActiveSection] = useState('general');

  // Reset activeSection if it's not in available sections
  useEffect(() => {
    const validIds = ['general', 'menu', 'security'];
    if (!validIds.includes(activeSection)) setActiveSection('general');
  }, [activeSection]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <FiCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-800">Settings Saved!</p>
            <p className="text-sm text-green-600">Your preferences have been updated</p>
          </div>
        </div>,
        { duration: 4000 }
      );
      onUpdate();
    } catch (error: any) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <FiX className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-red-800">Save Failed</p>
            <p className="text-sm text-red-600">{error.message || 'Failed to save settings'}</p>
          </div>
        </div>,
        { duration: 4000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Password changed successfully');
      setShowPasswordDialog(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleExportData = async (type: 'menu' | 'analytics' | 'all') => {
    toast.success(`Exporting ${type} data...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully!`);
    setShowExportDialog(false);
  };

  const handleDeleteAccount = async () => {
    toast.error('Account deletion is not available in this demo');
    setShowDeleteDialog(false);
  };

  const handleClearMenuData = async () => {
    setClearingMenuData(true);
    try {
      const response = await api.clearMenuData();
      if (response.success) {
        toast.success(
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <FiCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-800">
                {(() => {
                  const config = getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType);
                  return config.pageTitle === 'Menu Management' ? 'Menu Data Cleared!' :
                         config.pageTitle === 'Catalog' ? 'Catalog Data Cleared!' :
                         config.pageTitle === 'Product Catalog' ? 'Catalog Data Cleared!' :
                         config.pageTitle === 'Portfolio' || config.pageTitle === 'Agency Portfolio' ? 'Portfolio Data Cleared!' :
                         'Data Cleared!';
                })()}
              </p>
              <p className="text-sm text-green-600">
                Deleted {response.data.categoriesDeleted} categories and {response.data.itemsDeleted} items
              </p>
            </div>
          </div>,
          { duration: 5000 }
        );
        setShowClearMenuDialog(false);
        onUpdate(); // Refresh data
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear menu data');
    } finally {
      setClearingMenuData(false);
    }
  };

  // Show only basic settings for all users (section names match business type)
  const sections = [
    { id: 'general', name: 'General', icon: FiSettings },
    { id: 'menu', name: displaySectionName, icon: MdRestaurantMenu },
    { id: 'security', name: 'Security', icon: FiLock },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
              <FiSettings className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your account preferences and display options
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="shrink-0">
            <FiSave className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border shadow-sm p-2 sticky top-24">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">General Settings</h2>
                <p className="text-sm text-muted-foreground">Configure basic display and visibility options</p>
              </div>
              <div className="space-y-4">
                <SettingRow
                  title={`Public ${displaySectionName.replace(' Display', '')}`}
                  description={`Allow anyone to view your ${displayContentLabel} without signing in`}
                  checked={settings.publicMenu}
                  onChange={(checked) => setSettings({ ...settings, publicMenu: checked })}
                />
                <SettingRow
                  title="Show Prices"
                  description={`Display prices for ${itemsLabel} on your ${displayContentLabel}`}
                  checked={settings.showPrices}
                  onChange={(checked) => setSettings({ ...settings, showPrices: checked })}
                />
                <SettingRow
                  title="Show Images"
                  description={`Display images for ${itemsLabel} on your ${displayContentLabel}`}
                  checked={settings.showImages}
                  onChange={(checked) => setSettings({ ...settings, showImages: checked })}
                />
              </div>
            </div>
          )}

          {/* Menu / Catalogue / Portfolio Display Settings */}
          {activeSection === 'menu' && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{displaySectionName}</h2>
                <p className="text-sm text-muted-foreground">Customize how your {displayContentLabel} appears to customers</p>
              </div>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">{displaySectionName.replace(' Display', '')} Layout</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose how {itemsLabel} are displayed</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['grid', 'list', 'compact'].map((layout) => (
                      <button
                        key={layout}
                        onClick={() => setSettings({ ...settings, menuLayout: layout as any })}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          settings.menuLayout === layout
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-sm font-medium capitalize">{layout}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <SettingRow
                  title="Show Out of Stock"
                  description="Display unavailable items (greyed out)"
                  checked={settings.showOutOfStock}
                  onChange={(checked) => setSettings({ ...settings, showOutOfStock: checked })}
                />
                <SettingRow
                  title="Show Calories"
                  description="Display calorie information for items"
                  checked={settings.showCalories}
                  onChange={(checked) => setSettings({ ...settings, showCalories: checked })}
                />
                <SettingRow
                  title="Show Allergens"
                  description="Display allergen warnings for items"
                  checked={settings.showAllergens}
                  onChange={(checked) => setSettings({ ...settings, showAllergens: checked })}
                />
                
                <div>
                  <Label className="text-base font-medium">Currency</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select your currency format</p>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full max-w-xs px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="INR">₹ Indian Rupee (INR)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                    <option value="GBP">£ British Pound (GBP)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings — removed, showing only basic options */}
          {false && activeSection === 'notifications' && (
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h2 className="font-display text-xl font-bold mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div className="pb-4 border-b border-border">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">Delivery Methods</h3>
                  <div className="space-y-4">
                    <SettingRow
                      title="Push Notifications"
                      description="Receive browser push notifications"
                      checked={settings.pushNotifications}
                      onChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                    />
                    <SettingRow
                      title="Email Notifications"
                      description="Receive notifications via email"
                      checked={settings.emailNotifications}
                      onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                    <SettingRow
                      title="SMS Notifications"
                      description="Receive text message alerts"
                      checked={settings.smsNotifications}
                      onChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                      badge="Premium"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">Notification Types</h3>
                  <div className="space-y-4">
                    <SettingRow
                      title="Order Alerts"
                      description="Get notified for new orders"
                      checked={settings.orderAlerts}
                      onChange={(checked) => setSettings({ ...settings, orderAlerts: checked })}
                    />
                    <SettingRow
                      title="QR Scan Alerts"
                      description="Get notified when your QR is scanned"
                      checked={settings.scanAlerts}
                      onChange={(checked) => setSettings({ ...settings, scanAlerts: checked })}
                    />
                    <SettingRow
                      title="Weekly Reports"
                      description="Receive weekly analytics summary"
                      checked={settings.weeklyReports}
                      onChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
                    />
                    <SettingRow
                      title="Marketing Emails"
                      description="Receive news and special offers"
                      checked={settings.marketingEmails}
                      onChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings — removed, showing only basic options */}
          {false && activeSection === 'privacy' && (
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h2 className="font-display text-xl font-bold mb-6">Privacy Settings</h2>
              <div className="space-y-6">
                <SettingRow
                  title="Show Analytics"
                  description="Display analytics dashboard"
                  checked={settings.showAnalytics}
                  onChange={(checked) => setSettings({ ...settings, showAnalytics: checked })}
                />
                <SettingRow
                  title="Allow Customer Feedback"
                  description="Let customers leave reviews"
                  checked={settings.allowFeedback}
                  onChange={(checked) => setSettings({ ...settings, allowFeedback: checked })}
                />
                <SettingRow
                  title="Share Anonymous Data"
                  description="Help improve our service"
                  checked={settings.shareData}
                  onChange={(checked) => setSettings({ ...settings, shareData: checked })}
                />
              </div>
            </div>
          )}

          {/* QR Code Settings — removed, showing only basic options */}
          {false && activeSection === 'qr' && (
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h2 className="font-display text-xl font-bold mb-6">QR Code Settings</h2>
              <div className="space-y-6">
                <SettingRow
                  title="Track Scans"
                  description="Record QR code scan analytics"
                  checked={settings.trackScans}
                  onChange={(checked) => setSettings({ ...settings, trackScans: checked })}
                />
                <SettingRow
                  title="Require Age Verification"
                  description="Ask for age verification before showing menu"
                  checked={settings.requireVerification}
                  onChange={(checked) => setSettings({ ...settings, requireVerification: checked })}
                />
              </div>
            </div>
          )}

          {/* Appearance Settings — removed, showing only basic options */}
          {false && activeSection === 'appearance' && (
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h2 className="font-display text-xl font-bold mb-6">Appearance</h2>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', icon: FiSun, label: 'Light' },
                      { id: 'dark', icon: FiMoon, label: 'Dark' },
                      { id: 'system', icon: FiSmartphone, label: 'System' },
                    ].map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setSettings({ ...settings, theme: theme.id as any })}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            settings.theme === theme.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-2" />
                          <span className="text-sm font-medium">{theme.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium">Primary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Accent Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Security</h2>
                <p className="text-sm text-muted-foreground">Manage your account security and access</p>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowPasswordDialog(true)}>
                  <FiLock className="w-4 h-4 mr-3" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FiShield className="w-4 h-4 mr-3" />
                  Two-Factor Authentication
                  <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FiSmartphone className="w-4 h-4 mr-3" />
                  Active Sessions
                </Button>
              </div>
            </div>
          )}

          {/* Data Settings — removed, showing only basic options */}
          {false && activeSection === 'data' && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border shadow-card p-6">
                <h2 className="font-display text-xl font-bold mb-6">Export Data</h2>
                <p className="text-sm text-muted-foreground mb-4">Download your data for backup or migration</p>
                <Button variant="outline" onClick={() => setShowExportDialog(true)}>
                  <FiDownload className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
              
              <div className="bg-card rounded-2xl border border-orange-200 shadow-card p-6">
                <h2 className="font-display text-xl font-bold mb-2 text-orange-600">Clear Menu Data</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Remove all categories and menu items. This is useful if you want to start fresh 
                  or remove demo/test data.
                </p>
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50" onClick={() => setShowClearMenuDialog(true)}>
                  <MdRestaurantMenu className="w-4 h-4 mr-2" />
                  Clear All Menu Data
                </Button>
              </div>
              
              <div className="bg-card rounded-2xl border border-destructive/20 shadow-card p-6">
                <h2 className="font-display text-xl font-bold mb-2 text-destructive">Danger Zone</h2>
                <p className="text-sm text-muted-foreground mb-4">Irreversible and destructive actions</p>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleChangePassword} className="flex-1">
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('menu')}>
              <MdRestaurantMenu className="w-4 h-4 mr-3" />
              Export {displaySectionName.replace(' Display', '')} Data
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('analytics')}>
              <FiDownload className="w-4 h-4 mr-3" />
              Export Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('all')}>
              <FiDownload className="w-4 h-4 mr-3" />
              Export All Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm">
                This action is <strong>irreversible</strong>. All your data including menu items, 
                analytics, and settings will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">
                Delete Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for setting rows
const SettingRow = ({ 
  title, 
  description, 
  checked, 
  onChange,
  badge
}: { 
  title: string; 
  description: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  badge?: string;
}) => (
  <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <Label className="text-base font-semibold text-foreground">{title}</Label>
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} className="shrink-0" />
  </div>
);

export default Settings;
