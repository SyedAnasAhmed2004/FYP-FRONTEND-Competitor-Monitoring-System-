import { api, API_ENDPOINTS } from '@config/api';

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken',
};

class AuthService {
  // Login - Dynamic API call to Django backend
  async login(username, password) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.login, { 
        username, 
        password 
      });

      // API wrapper returns {success: true, data: {user: ..., token: ...}}
      const responseData = response.data || response;
      
      if (responseData && responseData.user && responseData.token) {
        // Store auth data
        const authData = {
          token: responseData.token,
          user: {
            id: responseData.user.id,
            username: responseData.user.username,
            email: responseData.user.email,
            name: responseData.user.username, // Using username as name
            role: 'admin', // Default role
          }
        };
        
        this.setAuthData(authData);
        
        return { 
          success: true, 
          data: authData 
        };
      } else {
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    }
  }

  // Register - Dynamic API call to Django backend
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.register, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password_confirm
      });

      if (response && response.user && response.token) {
        // Store auth data
        const authData = {
          token: response.token,
          user: {
            id: response.user.id,
            username: response.user.username,
            email: response.user.email,
            name: response.user.username,
            role: 'user',
          }
        };
        
        this.setAuthData(authData);
        
        return { 
          success: true, 
          data: authData 
        };
      } else {
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data || error.message || 'Registration failed' 
      };
    }
  }

  // Logout
  logout() {
    this.clearAuthData();
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
