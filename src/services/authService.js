import { api, API_ENDPOINTS } from '@config/api';

const flattenPermissions = (value) => {
  if (!value || typeof value !== 'object') return null;

  const hasPermissionKeys = (obj) =>
    !!obj && typeof obj === 'object' && ['dashboard', 'competitors', 'ai_assistant', 'reports', 'settings'].some((key) => key in obj);

  const raw =
    hasPermissionKeys(value.permissions)
      ? value.permissions
      : hasPermissionKeys(value.role?.permissions)
        ? value.role.permissions
        : hasPermissionKeys(value.role_permissions)
          ? value.role_permissions
          : hasPermissionKeys(value)
            ? value
            : null;

  if (!raw) return null;

  return {
    dashboard: !!(raw.dashboard ?? false),
    competitors: !!(raw.competitors ?? false),
    ai_assistant: !!(raw.ai_assistant ?? false),
    reports: !!(raw.reports ?? false),
    settings: !!(raw.settings ?? false),
  };
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken',
  PERMISSIONS: 'userPermissions',
  USER_TYPE: 'userType',
};

// Ordered list used to find the first page the user can access after login.
const ROUTE_PERMISSION_ORDER = [
  { permission: 'dashboard',   path: '/dashboard' },
  { permission: 'competitors', path: '/competitors' },
  { permission: 'ai_assistant', path: '/ai-assistant' },
  { permission: 'reports',     path: '/reports' },
  { permission: 'settings',    path: '/settings/users-roles' },
];

class AuthService {
  // ── Login ──────────────────────────────────────────────────────────────────
  async login(username, password) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.login, { username, password });

      // API wrapper returns { success: true, data: { user, token } }
      const responseData = response.data || response;

      if (responseData && responseData.user && responseData.token) {
        const rawUser = responseData.user;
        console.log('[auth] login response', responseData);

        const responsePermissions =
          responseData.permissions ||
          rawUser.permissions ||
          rawUser.role?.permissions ||
          null;

        localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
        localStorage.removeItem(STORAGE_KEYS.USER_TYPE);

        const authData = {
          token: responseData.token,
          user: {
            ...rawUser,
            id: rawUser.id,
            username: rawUser.username,
            email: rawUser.email,
            name: rawUser.name || rawUser.username,
            role: rawUser.role || rawUser.role_name || null,
            role_id: rawUser.role_id || rawUser.roleId || rawUser.role?.id || null,
            role_name: rawUser.role_name || rawUser.roleName || rawUser.role?.name || rawUser.role || null,
            user_type: rawUser.user_type || rawUser.userType || null,
            is_superuser: rawUser.is_superuser || false,
            is_staff: rawUser.is_staff || false,
          },
          permissions: responsePermissions,
        };

        this.setAuthData(authData);
        const flattenedPermissions = flattenPermissions(responsePermissions);
        if (flattenedPermissions) {
          localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(flattenedPermissions));
        }

        return { success: true, data: authData };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed',
      };
    }
  }

  // ── Permission loading (called right after login) ─────────────────────────
  /**
   * Fetches the logged-in user's profile (user_type, role_id) and then the
   * matching role's permissions, storing everything in localStorage so that
   * ProtectedRoute can read them synchronously on every render.
   */
  async loadUserPermissions() {
    try {
      const resp = await api.get(API_ENDPOINTS.accounts.myPermissions);
      if (!resp.success) {
        console.warn('[perms] my-permissions fetch failed:', resp);
        return;
      }

      const data = resp.data?.data || resp.data || {};
      const { user_type, ...perms } = data;

      if (user_type) {
        localStorage.setItem(STORAGE_KEYS.USER_TYPE, user_type);
      }

      const permissions = {
        dashboard:    !!perms.dashboard,
        competitors:  !!perms.competitors,
        ai_assistant: !!perms.ai_assistant,
        reports:      !!perms.reports,
        settings:     !!perms.settings,
      };
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
    } catch (error) {
      console.error('[perms] Failed to load user permissions:', error);
    }
  }

  // ── Permission helpers ────────────────────────────────────────────────────

  /** Returns the raw permissions object, or null if not yet loaded. */
  getPermissions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Returns the user type string ('super_admin' | 'user'), or null. */
  getUserType() {
    return localStorage.getItem(STORAGE_KEYS.USER_TYPE);
  }

  /**
   * Returns true if the current user has the given permission key.
   * Passing null/undefined means "no specific permission required" → always true.
   * If permissions haven't been loaded yet, access is granted as a safe fallback.
   */
  hasPermission(key) {
    if (!key) return true;
    if (this.getUserType() === 'super_admin') return true;
    const perms = this.getPermissions();
    if (!perms) return false;
    return perms[key] === true;
  }

  /**
   * Returns the path of the first page this user has permission to see.
   * Used by Login.jsx to decide where to redirect after a successful login.
   */
  getFirstAccessibleRoute() {
    for (const { permission, path } of ROUTE_PERMISSION_ORDER) {
      if (this.hasPermission(permission)) return path;
    }
    return null;
  }

  // ── Register ───────────────────────────────────────────────────────────────
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.register, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password_confirm,
      });

      if (response && response.user && response.token) {
        const authData = {
          token: response.token,
          user: {
            id: response.user.id,
            username: response.user.username,
            email: response.user.email,
            name: response.user.username,
            role: 'user',
          },
        };
        this.setAuthData(authData);
        return { success: true, data: authData };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.response?.data || error.message || 'Registration failed' };
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout() {
    this.clearAuthData();
  }

  // ── Password helpers ──────────────────────────────────────────────────────
  async forgotPassword(email) {
    try {
      return await api.post(API_ENDPOINTS.auth.forgotPassword, { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error.message };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      return await api.post(API_ENDPOINTS.auth.resetPassword, { token, password: newPassword });
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  async getProfile() {
    try {
      const response = await api.get(API_ENDPOINTS.user.profile);
      if (response.success && response.data) this.setUser(response.data);
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProfile(userData) {
    try {
      const response = await api.put(API_ENDPOINTS.user.update, userData);
      if (response.success && response.data) this.setUser(response.data);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // ── Storage helpers ───────────────────────────────────────────────────────
  setAuthData(data) {
    if (data.token || data.accessToken) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token || data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    if (data.user) this.setUser(data.user);
  }

  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  getUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.USER_TYPE);
  }
}

export default new AuthService();
