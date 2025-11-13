import { api, API_ENDPOINTS } from '@config/api';

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken',
};

class AuthService {
  // Login (Static for development - no API call)
  async login(email, password) {
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, accept any credentials and create a mock user
      const mockResponse = {
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          user: {
            id: 1,
            email: email,
            name: 'Super Admin',
            role: 'admin',
          },
        },
      };

      this.setAuthData(mockResponse.data);
      return mockResponse;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Register (Static for development)
  async register(userData) {
    try {
      const mockResponse = {
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          user: {
            id: 1,
            email: userData.email,
            name: userData.name || 'New User',
            role: 'user',
          },
        },
      };

      this.setAuthData(mockResponse.data);
      return mockResponse;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout() {
    try {
      await api.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Forgot Password
  async forgotPassword(email) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.forgotPassword, { email });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset Password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.resetPassword, { 
        token, 
        password: newPassword 
      });
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Profile
  async getProfile() {
    try {
      const response = await api.get(API_ENDPOINTS.user.profile);
      
      if (response.success && response.data) {
        this.setUser(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Profile
  async updateProfile(userData) {
    try {
      const response = await api.put(API_ENDPOINTS.user.update, userData);
      
      if (response.success && response.data) {
        this.setUser(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Set auth data (token + user)
  setAuthData(data) {
    if (data.token || data.accessToken) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token || data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    if (data.user) {
      this.setUser(data.user);
    }
  }

  // Set user data
  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // Get current user
  getUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Get token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // Check authentication
  isAuthenticated() {
    return !!this.getToken();
  }

  // Clear auth data
  clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
}

export default new AuthService();
