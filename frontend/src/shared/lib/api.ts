// Ensure HTTPS when page is loaded over HTTPS. VITE_API_URL = single URL only. Manual parsing for iOS.
function getApiBaseUrl(): string {
  let envUrl = String(import.meta.env.VITE_API_URL || 'https://localhost:5000/api').trim();
  if (envUrl.indexOf(',') !== -1) envUrl = envUrl.split(',')[0].trim();
  const lower = envUrl.toLowerCase();
  const hasProtocol = lower.startsWith('http://') || lower.startsWith('https://');
  if (!hasProtocol) {
    while (envUrl.length > 0 && envUrl.charAt(0) === '/') envUrl = envUrl.slice(1);
    envUrl = 'https://' + envUrl;
  }
  if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && envUrl.toLowerCase().startsWith('http://')) {
    envUrl = 'https://' + envUrl.slice(7);
  }
  while (envUrl.length > 1 && envUrl.endsWith('/')) envUrl = envUrl.slice(0, -1);
  return envUrl;
}
const API_BASE_URL = getApiBaseUrl();

// Export environment variables for use throughout the app
export const env = {
  API_URL: API_BASE_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Scanbit',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'One QR. One Digital Look.',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME || 'Rudransh Infotech Private Limited',
  COMPANY_EMAIL: import.meta.env.VITE_COMPANY_EMAIL || 'support@scanbit.in',
  COMPANY_PHONE: import.meta.env.VITE_COMPANY_PHONE || '+91 98765 43210',
  COMPANY_WEBSITE: import.meta.env.VITE_COMPANY_WEBSITE || 'https://www.scanbit.in',
  COMPANY_ADDRESS: import.meta.env.VITE_COMPANY_ADDRESS || '123 Main Street, Mumbai, Maharashtra 400001, India',
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@scanbit.com',
  SUPPORT_PHONE: import.meta.env.VITE_SUPPORT_PHONE || '+91 98765 43210',
  HELP_CENTER_URL: import.meta.env.VITE_HELP_CENTER_URL || '/help-center',
  PRIVACY_POLICY_URL: import.meta.env.VITE_PRIVACY_POLICY_URL || '/privacy-policy',
  TERMS_OF_SERVICE_URL: import.meta.env.VITE_TERMS_OF_SERVICE_URL || '/terms-of-service',
  SOCIAL_FACEBOOK: import.meta.env.VITE_SOCIAL_FACEBOOK || '',
  SOCIAL_TWITTER: import.meta.env.VITE_SOCIAL_TWITTER || '',
  SOCIAL_INSTAGRAM: import.meta.env.VITE_SOCIAL_INSTAGRAM || '',
  SOCIAL_LINKEDIN: import.meta.env.VITE_SOCIAL_LINKEDIN || '',
  FREE_PLAN_ITEMS_LIMIT: parseInt(import.meta.env.VITE_FREE_PLAN_ITEMS_LIMIT || '10'),
  FREE_PLAN_TRIAL_DAYS: parseInt(import.meta.env.VITE_FREE_PLAN_TRIAL_DAYS || '7'),
  BASIC_PLAN_ITEMS_LIMIT: parseInt(import.meta.env.VITE_BASIC_PLAN_ITEMS_LIMIT || '100'),
  PRO_PLAN_ITEMS_LIMIT: import.meta.env.VITE_PRO_PLAN_ITEMS_LIMIT || 'unlimited',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
};

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Public request (no auth token)
  private async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(data: {
    name: string;
    email: string;
    password: string;
    businessName: string;
    businessType: string;
    phone?: string;
    address?: any;
  }) {
    const response = await this.request<{
      success: boolean;
      token: string;
      user: any;
      restaurant: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(email: string, password: string, otp?: string) {
    const response = await this.request<{
      success: boolean;
      token: string;
      user: any;
      restaurant: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(otp ? { otp } : {}) }),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  async updateProfile(data: {
    name?: string;
    phone?: string;
    address?: any;
    bio?: string;
    profileImage?: string;
  }) {
    return this.request<{ success: boolean; user: any; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // OTP
  async sendOTP(email: string, type: 'registration' | 'login' = 'registration') {
    return this.publicRequest<{ success: boolean; message: string; otp?: string }>('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  async verifyOTP(email: string, otp: string, type?: 'registration' | 'login') {
    return this.publicRequest<{ success: boolean; message: string; verified: boolean }>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp, ...(type ? { type } : {}) }),
    });
  }

  async checkOTPStatus(email: string) {
    return this.publicRequest<{ success: boolean; verified: boolean; message: string }>(`/otp/status/${encodeURIComponent(email)}`);
  }

  // Password Reset
  async forgotPassword(email: string) {
    return this.request<{ success: boolean; emailSent: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(code: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ code, password: newPassword }),
    });
  }

  // Admin
  async getAdminStats(params?: { dateRange?: string; [key: string]: any }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any }>(`/admin/stats${query ? `?${query}` : ''}`);
  }

  async getAdminUsers(params?: { page?: number; limit?: number; role?: string; search?: string; sortBy?: string; sortOrder?: string; includeAdmins?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any }>(`/admin/users${query ? `?${query}` : ''}`);
  }

  async getAdminUser(id: string) {
    return this.request<{ success: boolean; data: any }>(`/admin/users/${id}`);
  }

  async updateAdminUser(id: string, data: { 
    isActive?: boolean; 
    role?: 'admin' | 'user'; 
    permissions?: Record<string, boolean>; 
    hasAdminAccess?: boolean;
    name?: string;
    email?: string;
    phone?: string;
    businessName?: string;
    businessType?: string;
    businessCategory?: string;
    address?: any;
  }) {
    return this.request<{ success: boolean; data: any; message: string }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async assignPlanToUser(userId: string, planId: string) {
    return this.request<{ success: boolean; message: string; data: any }>(`/admin/users/${userId}/assign-plan`, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async deleteAdminUser(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async adminCreateUser(data: {
    name: string;
    email: string;
    password: string;
    businessName: string;
    businessType: string;
    businessCategory?: string;
    phone?: string;
    address?: any;
  }) {
    return this.request<{ success: boolean; data: any; message: string }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminRestaurants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    businessCategory?: string;
    businessType?: string;
    verificationStatus?: string;
    isArchived?: boolean;
    subscriptionStatus?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination?: any }>(`/restaurants${query ? `?${query}` : ''}`);
  }

  // Public featured businesses (logos for homepage)
  async getFeaturedBusinesses(limit: number = 20) {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const query = `?limit=${safeLimit}`;
    return this.request<{ success: boolean; data: any[]; count?: number }>(`/public/featured-businesses${query}`);
  }

  // Restaurants
  async getMyRestaurant() {
    return this.request<{ success: boolean; data: any }>('/restaurants/my-restaurant');
  }

  async updateRestaurant(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRestaurant(id: string) {
    return this.request<{ success: boolean; message: string }>(`/restaurants/${id}`, {
      method: 'DELETE',
    });
  }

  async updateMyRestaurant(data: any) {
    // First get restaurant ID, then update
    const restaurantRes = await this.getMyRestaurant();
    if (restaurantRes.success && restaurantRes.data) {
      return this.updateRestaurant(restaurantRes.data._id || restaurantRes.data.id, data);
    }
    throw new Error('Restaurant not found');
  }

  // Upload image to backend (which uploads to Cloudinary)
  async uploadImage(file: File, folder: string = 'scanbit'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/upload/image?folder=${folder}`;
    const headers: HeadersInit = {
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Failed to upload image');
    }

    const data = await response.json();
    if (!data.success || !data.url) {
      throw new Error(data.message || 'Upload failed - no URL returned');
    }

    return data.url;
  }

  // Upload multiple images
  async uploadMultipleImages(files: File[], folder: string = 'scanbit'): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const url = `${this.baseURL}/upload/multiple?folder=${folder}`;
    const headers: HeadersInit = {
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Failed to upload images');
    }

    const data = await response.json();
    if (!data.success || !data.urls) {
      throw new Error(data.message || 'Upload failed - no URLs returned');
    }

    return data.urls;
  }

  // Categories
  async getCategories(restaurantId?: string) {
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/categories${query}`);
  }

  async createCategory(data: any) {
    return this.request<{ success: boolean; data: any }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request<{ success: boolean }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Menu Items
  async getMenuItems(restaurantId?: string, categoryId?: string, available?: boolean) {
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurantId', restaurantId);
    if (categoryId) params.append('categoryId', categoryId);
    if (available !== undefined) params.append('available', String(available));
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/menu-items${query}`);
  }

  async createMenuItem(data: any) {
    return this.request<{ success: boolean; data: any }>('/menu-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(id: string) {
    return this.request<{ success: boolean }>(`/menu-items/${id}`, {
      method: 'DELETE',
    });
  }

  // Menus (Public)
  async getMenu(restaurantId: string) {
    return this.request<{
      success: boolean;
      restaurant: any;
      categories: any[];
    }>(`/menus/${restaurantId}`);
  }

  // Analytics
  async getDashboardAnalytics() {
    return this.request<{ success: boolean; data: any }>('/analytics/dashboard');
  }

  // QR
  async getQRCode(restaurantId: string) {
    return this.request<{ success: boolean; data: any }>(`/qr/${restaurantId}`);
  }

  // Payments
  async createPaymentOrder(data: { plan: string; businessCategory?: string; billingCycle?: string }) {
    return this.request<{ success: boolean; order: any; paymentId: string; keyId: string }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    return this.request<{ success: boolean; message: string; payment: any }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentHistory(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any }>(`/payments/history${query ? `?${query}` : ''}`);
  }

  // Admin Plans
  async getAdminPlans(params?: { businessCategory?: string; isActive?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[] }>(`/admin/plans${query ? `?${query}` : ''}`);
  }

  async getAdminPlan(id: string) {
    return this.request<{ success: boolean; data: any }>(`/admin/plans/${id}`);
  }

  async createAdminPlan(data: any) {
    // Use custom plan endpoint if it's a custom plan
    const endpoint = data.isCustom ? '/admin/plans/custom' : '/admin/plans';
    return this.request<{ success: boolean; message: string; data: any }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminPlan(id: string, data: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminPlan(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Custom Plans
  async getCustomPlansForUser(userId: string) {
    return this.request<{ success: boolean; data: any[]; count: number }>(`/admin/plans/custom/user/${userId}`);
  }

  async getAllPlansWithCustom() {
    return this.request<{ success: boolean; data: any[]; regularPlans: any[]; customPlans: any[]; stats: any }>('/admin/plans/all-with-custom');
  }

  // Admin Subscriptions
  async getAdminSubscriptions(params?: { page?: number; limit?: number; status?: string; plan?: string; businessCategory?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any }>(`/admin/subscriptions${query ? `?${query}` : ''}`);
  }

  // Admin Payments
  async getAdminPayments(params?: { page?: number; limit?: number; status?: string; plan?: string; businessCategory?: string; startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any; totals: any }>(`/admin/payments${query ? `?${query}` : ''}`);
  }

  // Admin Renewals
  async getAdminRenewals(params?: { days?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; count: number }>(`/admin/renewals${query ? `?${query}` : ''}`);
  }

  // Seed Plans
  async seedPlans() {
    return this.request<{ success: boolean; message: string; results: any }>('/admin/plans/seed', {
      method: 'POST',
    });
  }

  // Seed Demo Advertisements
  async seedAdvertisements() {
    return this.request<{ success: boolean; message: string; results: any }>('/advertisements/seed', {
      method: 'POST',
    });
  }

  // Public Plans — uses publicRequest so plans load from DB even when token is expired (e.g. trial expired)
  async getPlans(params?: { businessCategory?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.publicRequest<{ success: boolean; data: any[]; grouped: any }>(`/plans${query ? `?${query}` : ''}`);
  }

  async getPlansByCategory(category: string) {
    return this.publicRequest<{ success: boolean; data: any[] }>(`/plans/${category}`);
  }

  // Advertisements
  async getAdvertisements(params?: { page?: number; limit?: number; status?: string; adType?: string; businessCategory?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any }>(`/advertisements${query ? `?${query}` : ''}`);
  }

  async getAdvertisement(id: string) {
    return this.request<{ success: boolean; data: any }>(`/advertisements/${id}`);
  }

  async createAdvertisement(data: any) {
    return this.request<{ success: boolean; message: string; data: any }>('/advertisements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdvertisement(id: string, data: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/advertisements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdvertisement(id: string) {
    return this.request<{ success: boolean; message: string }>(`/advertisements/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateAdvertisement(id: string) {
    return this.request<{ success: boolean; message: string; data: any }>(`/advertisements/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async updateAdvertisementStatus(id: string, status: string) {
    return this.request<{ success: boolean; message: string; data: any }>(`/advertisements/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getAdvertisementDashboard(params?: { businessCategory?: string; dateRange?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any }>(`/advertisements/dashboard${query ? `?${query}` : ''}`);
  }

  async getAdvertisementAnalytics(id: string, params?: { dateRange?: string; groupBy?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any }>(`/advertisements/${id}/analytics${query ? `?${query}` : ''}`);
  }

  // Public Advertisements
  async getActiveAdvertisements(params?: { page?: string; businessCategory?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.publicRequest<{ success: boolean; data: any[] }>(`/advertisements/public/active${query ? `?${query}` : ''}`);
  }

  async logAdImpression(data: any) {
    return this.publicRequest<{ success: boolean; message: string }>('/advertisements/public/impression', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logAdClick(data: any) {
    return this.publicRequest<{ success: boolean; message: string }>('/advertisements/public/click', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Site Settings
  async getPublicSiteSettings() {
    return this.publicRequest<{ success: boolean; data: any }>(`/site-settings/public`);
  }

  async getAdminSiteSettings() {
    return this.request<{ success: boolean; data: any }>(`/site-settings`);
  }

  async updateAdminSiteSettings(data: any) {
    return this.request<{ success: boolean; data: any }>(`/site-settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async publishSiteSettings() {
    return this.request<{ success: boolean; data: any }>(`/site-settings/publish`, {
      method: 'POST',
    });
  }

  // Site Settings - Section specific updates
  async updateGeneralSettings(data: { siteName?: string; siteDescription?: string; contactEmail?: string }) {
    return this.request<{ success: boolean; data: any }>(`/site-settings/general`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateBrandingSettings(data: { 
    logoUrl?: string; 
    darkLogoUrl?: string; 
    mobileLogoUrl?: string; 
    footerLogoUrl?: string; 
    faviconUrl?: string; 
    appIconUrl?: string;
  }) {
    return this.request<{ success: boolean; data: any }>(`/site-settings/branding`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateTypographySettings(data: { fontFamily?: string; baseFontSize?: number }) {
    return this.request<{ success: boolean; data: any }>(`/site-settings/typography`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateColorsSettings(data: { primary?: string; secondary?: string; background?: string; text?: string }) {
    return this.request<{ success: boolean; data: any }>(`/site-settings/colors`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateLayoutSettings(data: { contentWidth?: string; headerStyle?: string; footerStyle?: string }) {
    return this.request<{ success: boolean; data: any }>(`/site-settings/layout`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateMediaSettings(data: { heroImageUrl?: string; bannerImageUrl?: string }) {
    return this.request<{ success: boolean; data: any }>(`/site-settings/media`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAnimationsSettings(data: { enabled?: boolean; durationMs?: number }) {
    return this.request<{ success: boolean; data: any }>(`/site-settings/animations`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateSectionsSettings(data: { showFeatures?: boolean; showPricing?: boolean; showTestimonials?: boolean; showFAQ?: boolean }) {
    return this.request<{ success: boolean; data: any }>(`/site-settings/sections`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateSeoSettings(data: { metaTitle?: string; metaDescription?: string; metaKeywords?: string[] }) {
    return this.request<{ success: boolean; data: any }>(`/site-settings/seo`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async previewSiteSettings() {
    return this.request<{ success: boolean; previewUrl?: string }>(`/site-settings/preview`, {
      method: 'POST',
    });
  }

  // Admin Analytics
  async getOverviewAnalytics(params?: { dateRange?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any }>(`/admin/analytics/overview${query ? `?${query}` : ''}`);
  }

  async getBusinessAnalytics(params?: { dateRange?: string; businessCategory?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any }>(`/admin/analytics/businesses${query ? `?${query}` : ''}`);
  }

  async getRevenueAnalytics(params?: { dateRange?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any }>(`/admin/analytics/revenue${query ? `?${query}` : ''}`);
  }

  async getQRScanAnalytics(params?: { dateRange?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any }>(`/admin/analytics/qr-scans${query ? `?${query}` : ''}`);
  }

  // Support Tickets
  async getSupportTickets(params?: { status?: string; priority?: string; category?: string; assignedTo?: string; page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any }>(`/support/tickets${query ? `?${query}` : ''}`);
  }

  async getSupportTicket(id: string) {
    return this.request<{ success: boolean; data: any }>(`/support/tickets/${id}`);
  }

  async createSupportTicket(data: any) {
    return this.request<{ success: boolean; message: string; data: any }>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPublicSupportTicket(data: {
    subject: string;
    description: string;
    category: string;
    priority: string;
    userEmail: string;
    userPhone: string;
    userQuery: string;
    selectedQuestion?: string;
    selectedAnswer?: string;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/support/tickets/public', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupportTicket(id: string, data: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/support/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addTicketMessage(id: string, data: { message: string; isInternal?: boolean; attachments?: any[] }) {
    return this.request<{ success: boolean; message: string; data: any }>(`/support/tickets/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitTicketRating(id: string, data: { rating: number; feedback?: string }) {
    return this.request<{ success: boolean; message: string }>(`/support/tickets/${id}/rating`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTicketStats(params?: { dateRange?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any }>(`/support/tickets/stats/overview${query ? `?${query}` : ''}`);
  }

  // FAQs
  async getFAQs(params?: { category?: string; search?: string; featured?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[] }>(`/support/faqs${query ? `?${query}` : ''}`);
  }

  async getFAQ(id: string) {
    return this.request<{ success: boolean; data: any }>(`/support/faqs/${id}`);
  }

  async createFAQ(data: any) {
    return this.request<{ success: boolean; message: string; data: any }>('/support/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFAQ(id: string, data: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/support/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFAQ(id: string) {
    return this.request<{ success: boolean; message: string }>(`/support/faqs/${id}`, {
      method: 'DELETE',
    });
  }

  async submitFAQFeedback(id: string, helpful: boolean) {
    return this.request<{ success: boolean; message: string }>(`/support/faqs/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
