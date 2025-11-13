// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
};

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refreshToken: '/api/auth/refresh',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  user: {
    profile: '/api/user/profile',
    update: '/api/user/update',
    delete: '/api/user/delete',
  },
};

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Build full URL
const getApiUrl = (endpoint) => `${API_CONFIG.baseURL}${endpoint}`;

// API Call with timeout and error handling
const apiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const token = getAuthToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  const config = {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Handle different status codes
    if (response.status === 401) {
      // Unauthorized - clear auth and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
      throw new Error('Access forbidden');
    }

    if (response.status === 404) {
      throw new Error('Resource not found');
    }

    if (response.status === 500) {
      throw new Error('Server error. Please try again later.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }

    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};

// API Methods
export const api = {
  get: (endpoint, config = {}) => 
    apiCall(endpoint, { method: 'GET', ...config }),

  post: (endpoint, data, config = {}) => 
    apiCall(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data),
      ...config 
    }),

  put: (endpoint, data, config = {}) => 
    apiCall(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data),
      ...config 
    }),

  patch: (endpoint, data, config = {}) => 
    apiCall(endpoint, { 
      method: 'PATCH', 
      body: JSON.stringify(data),
      ...config 
    }),

  delete: (endpoint, config = {}) => 
    apiCall(endpoint, { method: 'DELETE', ...config }),
};

export default API_CONFIG;
