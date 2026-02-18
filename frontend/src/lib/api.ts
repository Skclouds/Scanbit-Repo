// Ensure HTTPS when page is loaded over HTTPS (prevents mixed content).
// VITE_API_URL must be a SINGLE URL. No comma-separated list. Manual parsing for iOS Safari compatibility.
// When empty, use same-origin /api (works when frontend and API share a host via reverse proxy).
// Runtime override: set window.__SCANBIT_API_URL__ in index.html to force API URL without rebuild.
function getApiBaseUrl(): string {
  try {
    if (typeof window !== 'undefined' && (window as unknown as { __SCANBIT_API_URL__?: string }).__SCANBIT_API_URL__) {
      let runtime = String((window as unknown as { __SCANBIT_API_URL__: string }).__SCANBIT_API_URL__).trim();
      if (runtime) {
        if (runtime.indexOf(',') !== -1) runtime = runtime.split(',')[0].trim();
        if (!/^https?:\/\//i.test(runtime)) runtime = 'https://' + runtime.replace(/^\/+/, '');
        if (runtime.length > 1 && runtime.endsWith('/')) runtime = runtime.slice(0, -1);
        return runtime;
      }
    }
    let envUrl = String(import.meta.env?.VITE_API_URL || '').trim();
    if (!envUrl && typeof window !== 'undefined') {
      envUrl = (window.location?.origin || '') + '/api';
    }
    if (!envUrl) envUrl = 'http://localhost:5006/api';
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
  } catch {
    return typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin + '/api'
      : 'https://server.scanbit.in/api';
  }
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
    if (typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem('token');
      } catch {
        this.token = null;
      }
    }
  }

  setToken(token: string | null) {
    this.token = token;
    this.clearUserCache();
    if (typeof window !== 'undefined') {
      try {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
      } catch {}
    }
  }

  private getToken(): string | null {
    const t = this.token;
    if (t) return t;
    if (typeof window !== 'undefined') {
      try {
        const fromStorage = localStorage.getItem('token');
        if (fromStorage) this.token = fromStorage;
        return fromStorage;
      } catch {
        return null;
      }
    }
    return null;
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

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      const err = new Error(error.message || 'Request failed') as Error & { status?: number };
      err.status = response.status;
      throw err;
    }

    return response.json();
  }

  // Public request (no auth token). Supports AbortSignal for timeout (iOS Safari).
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
      credentials: 'include',
      mode: 'cors',
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
    businessCategory?: string;
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

  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      token: string;
      user: any;
      restaurant: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  private _userCache: { data: { success: boolean; user: any }; expires: number } | null = null;
  private static USER_CACHE_MS = 60000; // 1 min - reduces 429s when many components call

  async getCurrentUser() {
    const now = Date.now();
    if (this._userCache && this._userCache.expires > now) {
      return this._userCache.data;
    }
    try {
      const data = await this.request<{ success: boolean; user: any }>('/auth/me');
      this._userCache = { data, expires: now + ApiClient.USER_CACHE_MS };
      return data;
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.clearUserCache();
        return { success: false, user: null };
      }
      throw e;
    }
  }

  async logout() {
    try {
      await this.request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
        body: '{}',
      });
    } finally {
      this.setToken(null);
    }
  }

  clearUserCache() {
    this._userCache = null;
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
    return this.request<{ success: boolean; message: string; otp?: string }>('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  async verifyOTP(email: string, otp: string, type?: 'registration' | 'login') {
    return this.request<{ success: boolean; message: string; verified: boolean }>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp, ...(type ? { type } : {}) }),
    });
  }

  async checkOTPStatus(email: string) {
    return this.request<{ success: boolean; verified: boolean; message: string }>(`/otp/status/${encodeURIComponent(email)}`);
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

  async getEmailOptions() {
    return this.request<{ success: boolean; data: { businessCategories: string[]; subscriptionStatuses: string[]; roles: string[] } }>('/admin/emails/options');
  }

  async getEmailHistory(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/admin/emails/history${query ? `?${query}` : ''}`);
  }

  async getEmailRecipients(params?: { role?: string; businessCategory?: string; subscriptionStatus?: string; limit?: number; recipientType?: 'all' | 'users' | 'businesses' }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: { totalUniqueCount: number; userCount: number; restaurantCount: number; previewEmails: { email: string; name?: string; source: string }[] } }>(`/admin/emails/recipients${query ? `?${query}` : ''}`);
  }

  async sendBulkEmail(data: { subject: string; htmlBody: string; recipientType: 'all' | 'users' | 'businesses' | 'custom'; customEmails?: string[]; role?: string; businessCategory?: string; subscriptionStatus?: string; attachments?: File[] }) {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('htmlBody', data.htmlBody);
    formData.append('recipientType', data.recipientType);
    if (data.customEmails?.length) {
      formData.append('customEmailsJson', JSON.stringify(data.customEmails));
    }
    if (data.role && data.role !== 'all') formData.append('role', data.role);
    if (data.businessCategory && data.businessCategory !== 'all') formData.append('businessCategory', data.businessCategory);
    if (data.subscriptionStatus && data.subscriptionStatus !== 'all') formData.append('subscriptionStatus', data.subscriptionStatus);
    (data.attachments || []).forEach((file) => formData.append('attachments', file));

    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseURL}/admin/emails/bulk`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
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
    return this.request<{ success: boolean; data: any[]; pagination?: any }>(`/admin/restaurants${query ? `?${query}` : ''}`);
  }

  async getAdminRestaurant(id: string) {
    return this.request<{ success: boolean; data: any }>(`/admin/restaurants/${id}`);
  }

  async updateAdminRestaurant(id: string, data: any) {
    return this.request<{ success: boolean; data: any; message: string }>(`/admin/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminRestaurant(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/restaurants/${id}`, {
      method: 'DELETE',
    });
  }

  // Public featured businesses (logos for homepage)
  async getFeaturedBusinesses(limit: number = 20) {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const query = `?limit=${safeLimit}`;
    return this.request<{ success: boolean; data: any[]; count?: number }>(`/public/featured-businesses${query}`);
  }

  // Public restaurants (no auth required)
  async getPublicRestaurants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    businessCategory?: string;
    businessType?: string;
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
    return this.request<{ success: boolean; data: any[]; pagination?: any }>(`/public/restaurants${query ? `?${query}` : ''}`);
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

  // Business Information (dedicated collection)
  async getBusinessInformation() {
    return this.request<{ success: boolean; data: any }>('/business-information/me');
  }

  async updateBusinessInformation(data: any) {
    return this.request<{ success: boolean; data: any }>('/business-information', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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

  // Upload generic file (e.g. CV / resume) to Cloudinary (raw)
  async uploadFile(file: File, folder: string = 'scanbit-resumes'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/upload/file?folder=${folder}`;
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
      throw new Error(error.message || 'Failed to upload file');
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

  // Clear all menu data (categories and items)
  async clearMenuData() {
    return this.request<{ success: boolean; data: { categoriesDeleted: number; itemsDeleted: number } }>('/restaurants/clear-menu-data', {
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

  // Menus (Public). Pass { cache: 'no-store' } to avoid stale portfolio data (e.g. hero background).
  async getMenu(restaurantId: string, fetchOptions?: RequestInit) {
    return this.request<{
      success: boolean;
      restaurant: any;
      categories: any[];
    }>(`/menus/${restaurantId}`, { ...fetchOptions, method: 'GET' });
  }

  // Analytics
  async getDashboardAnalytics(timeRange?: string) {
    const query = timeRange ? `?timeRange=${timeRange}` : '';
    return this.request<{ success: boolean; data: any }>(`/analytics/dashboard${query}`);
  }

  // Brochure Download (public - no auth)
  async downloadBrochure(data: { name: string; email: string; mobile: string }) {
    return this.publicRequest<{ success: boolean; message?: string }>('/public/download-brochure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // QR
  async getQRCode(restaurantId: string) {
    return this.request<{ success: boolean; data: any }>(`/qr/${restaurantId}`);
  }

  // Custom link (slug)
  async checkSlugAvailability(slug: string, excludeRestaurantId?: string) {
    const q = excludeRestaurantId ? `?excludeRestaurantId=${excludeRestaurantId}` : '';
    return this.request<{ success: boolean; available: boolean; message: string }>(`/restaurants/check-slug/${encodeURIComponent(slug)}${q}`);
  }

  async updateCustomSlug(restaurantId: string, customSlug: string | null) {
    return this.request<{ success: boolean; data: { customSlug: string | null }; message: string }>(`/restaurants/${restaurantId}/custom-slug`, {
      method: 'PUT',
      body: JSON.stringify({ customSlug }),
    });
  }

  // Payments
  async createPaymentOrder(data: {
    plan: string;
    businessCategory?: string;
    billingCycle?: string;
    autopayEnabled?: boolean;
    gstin?: string;
    billingAddress?: string;
    companyLegalName?: string;
  }) {
    return this.request<{ success: boolean; order: any; paymentId: string; keyId: string }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    return this.request<{ success: boolean; message: string; payment: any; testMode?: boolean }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Test payment simulation (only works in development/test mode)
  async simulateTestPayment(orderId: string) {
    return this.request<{ 
      success: boolean; 
      testMode: boolean; 
      message: string; 
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      payment: any 
    }>('/payments/test-payment', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
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

  /** Download invoice for a completed payment. Returns blob and suggested filename. */
  async downloadPaymentInvoice(paymentId: string): Promise<{ blob: Blob; filename: string }> {
    const url = `${this.baseURL}/payments/${paymentId}/invoice`;
    const headers: HeadersInit = {};
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { headers, credentials: 'include', mode: 'cors' });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Failed to download invoice' }));
      throw new Error(err.message || 'Failed to download invoice');
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition');
    const match = disposition?.match(/filename="?([^";]+)"?/);
    const filename = match ? match[1].trim() : `ScanBit-Invoice-${paymentId}.pdf`;
    return { blob, filename };
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

  // Aliases for plan management (for backward compatibility)
  async createPlan(data: any) {
    return this.createAdminPlan(data);
  }

  async updatePlan(id: string, data: any) {
    return this.updateAdminPlan(id, data);
  }

  async deletePlan(id: string) {
    return this.deleteAdminPlan(id);
  }

  async resetAndCreatePlans() {
    return this.request<{ success: boolean; message: string; data: any }>('/admin/plans/reset-and-create', {
      method: 'POST',
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

  // Admin Brochure Downloads (who downloaded brochure from website)
  async getAdminBrochureDownloads(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any }>(`/admin/brochure-downloads${query ? `?${query}` : ''}`);
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

  /** Plan capabilities for subscription page (by planName + businessCategory). From DB or defaults. */
  async getPlanCapabilities(params: { planName: string; businessCategory?: string }) {
    const q = new URLSearchParams();
    q.set('planName', params.planName);
    if (params.businessCategory) q.set('businessCategory', params.businessCategory);
    return this.publicRequest<{
      success: boolean;
      data: { planName: string; businessCategory: string; description: string; capabilities: string[]; itemLabel: string };
    }>(`/plans/capabilities?${q.toString()}`);
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

  // Reviews
  async getReviews(restaurantId?: string) {
    const endpoint = restaurantId ? `/restaurants/${restaurantId}/reviews` : '/restaurants/my-restaurant/reviews';
    return this.request<{ success: boolean; data: any[] }>(endpoint);
  }

  async submitReview(restaurantId: string, data: {
    rating: number;
    comment: string;
    reviewerName: string;
    reviewerEmail: string;
    reviewerMobile?: string;
  }) {
    return this.publicRequest<{ success: boolean; message: string }>(`/restaurants/${restaurantId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReviewStatus(reviewId: string, status: 'published' | 'hidden') {
    return this.request<{ success: boolean; message: string }>(`/reviews/${reviewId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getPublicSiteSettings(): Promise<{ success: boolean; data?: any }> {
    try {
      return await this.publicRequest<{ success: boolean; data: any }>(`/site-settings/public`);
    } catch {
      return { success: false };
    }
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
  async updateGeneralSettings(data: { 
    siteName?: string; 
    tagline?: string;
    siteDescription?: string; 
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  }) {
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

  async updateSeoSettings(data: Record<string, unknown>) {
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

  async getCategoriesAnalytics() {
    return this.request<{ success: boolean; data: { categories: any[]; totals: any; lastUpdated: string } }>('/admin/analytics/categories-analytics');
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

  async deleteSupportTicket(id: string) {
    return this.request<{ success: boolean; message: string }>(`/support/tickets/${id}`, {
      method: 'DELETE',
    });
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

  // Knowledge Base
  async getKnowledgeBaseArticles(params?: { category?: string; search?: string; featured?: boolean; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any }>(`/support/knowledge-base${query ? `?${query}` : ''}`);
  }

  async getKnowledgeBaseArticle(slug: string) {
    return this.request<{ success: boolean; data: any }>(`/support/knowledge-base/${slug}`);
  }

  async createKnowledgeBaseArticle(data: any) {
    return this.request<{ success: boolean; message: string; data: any }>('/support/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKnowledgeBaseArticle(id: string, data: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/support/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKnowledgeBaseArticle(id: string) {
    return this.request<{ success: boolean; message: string }>(`/support/knowledge-base/${id}`, {
      method: 'DELETE',
    });
  }

  async submitKnowledgeBaseFeedback(id: string, helpful: boolean) {
    return this.request<{ success: boolean; message: string }>(`/support/knowledge-base/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  }

  // Legal Documents
  async getLegalDocuments(params?: { type?: string; language?: string; slug?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[] }>(`/legal-documents${query ? `?${query}` : ''}`);
  }

  async getLegalDocument(slug: string) {
    return this.request<{ success: boolean; data: any }>(`/legal-documents/${slug}`);
  }

  async getLegalDocumentByType(type: string) {
    return this.request<{ success: boolean; data: any }>(`/legal-documents/type/${type}`);
  }

  async getAllLegalDocuments(params?: { type?: string; language?: string; page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any }>(`/legal-documents/admin/all${query ? `?${query}` : ''}`);
  }

  async getLegalDocumentById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/legal-documents/admin/${id}`);
  }

  async createLegalDocument(data: any) {
    return this.request<{ success: boolean; message: string; data: any }>('/legal-documents/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLegalDocument(id: string, data: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/legal-documents/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLegalDocument(id: string) {
    return this.request<{ success: boolean; message: string }>(`/legal-documents/admin/${id}`, {
      method: 'DELETE',
    });
  }

  // Blogs (public)
  async getBlogs(params?: { page?: number; limit?: number; category?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.publicRequest<{ success: boolean; data: any[]; pagination: any }>(`/blogs${query ? `?${query}` : ''}`);
  }

  async getBlogBySlug(slug: string) {
    return this.publicRequest<{ success: boolean; data: any }>(`/blogs/${slug}`);
  }

  // Blogs (admin)
  async getAllBlogs(params?: { page?: number; limit?: number; search?: string; isPublished?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ success: boolean; data: any[]; pagination: any }>(`/blogs/admin/all${query ? `?${query}` : ''}`);
  }

  async getBlogById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/blogs/admin/${id}`);
  }

  async createBlog(data: any) {
    return this.request<{ success: boolean; message: string; data: any }>('/blogs/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlog(id: string, data: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/blogs/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBlog(id: string) {
    return this.request<{ success: boolean; message: string }>(`/blogs/admin/${id}`, {
      method: 'DELETE',
    });
  }

  // Business Categories
  async getBusinessCategories() {
    return this.publicRequest<{ success: boolean; data: any[]; count: number }>('/business-categories');
  }

  async getBusinessCategory(id: string) {
    return this.request<{ success: boolean; data: any }>(`/business-categories/${id}`);
  }

  async createBusinessCategory(data: any) {
    return this.request<{ success: boolean; data: any }>('/business-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusinessCategory(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/business-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBusinessCategory(id: string) {
    return this.request<{ success: boolean }>(`/business-categories/${id}`, {
      method: 'DELETE',
    });
  }

  async addBusinessType(categoryId: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/business-categories/${categoryId}/business-types`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusinessType(categoryId: string, typeId: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/business-categories/${categoryId}/business-types/${typeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBusinessType(categoryId: string, typeId: string) {
    return this.request<{ success: boolean; data: any }>(`/business-categories/${categoryId}/business-types/${typeId}`, {
      method: 'DELETE',
    });
  }

  // Promotions (placeholder implementations)
  async getPromotions() {
    return this.request<{ success: boolean; data: any[] }>('/promotions');
  }

  async createPromotion(data: any) {
    return this.request<{ success: boolean; data: any }>('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePromotion(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePromotion(id: string) {
    return this.request<{ success: boolean }>(`/promotions/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments History
  async getPayments(params?: { status?: string }) {
    const query = params?.status ? `?status=${params.status}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/payments/history${query}`);
  }

  // Reports (placeholder implementations)
  async getReports(params?: { type?: string }) {
    const query = params?.type ? `?type=${params.type}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/reports${query}`);
  }

  async generateReport(data: any) {
    return this.request<{ success: boolean; data: any }>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Integrations (placeholder implementations)
  async addIntegration(data: any) {
    return this.request<{ success: boolean; data: any }>('/integrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIntegration(data: any) {
    return this.request<{ success: boolean; data: any }>(`/integrations/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIntegration(data: { id: string }) {
    return this.request<{ success: boolean }>(`/integrations/${data.id}`, {
      method: 'DELETE',
    });
  }

  // Support Tickets
  async replyToTicket(data: { ticketId: string; message: string }) {
    return this.request<{ success: boolean; data: any }>(`/support/tickets/${data.ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message: data.message }),
    });
  }

  async deleteTicket(data: { ticketId: string }) {
    return this.request<{ success: boolean }>(`/support/tickets/${data.ticketId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
