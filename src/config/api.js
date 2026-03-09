// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 60000, // 60 seconds for RAG queries
};

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/monitoring/auth/login/',
    register: '/api/monitoring/auth/register/',
    logout: '/api/monitoring/auth/logout/',
    refreshToken: '/api/monitoring/auth/refresh',
    forgotPassword: '/api/monitoring/auth/forgot-password',
    resetPassword: '/api/monitoring/auth/reset-password',
  },
  user: {
    profile: '/api/user/profile',
    update: '/api/user/update',
    delete: '/api/user/delete',
  },
  competitors: {
    list: '/api/monitoring/competitors/',
    detail: (id) => `/api/monitoring/competitors/${id}/`,
    create: '/api/monitoring/competitors/',
    update: (id) => `/api/monitoring/competitors/${id}/`,
    partialUpdate: (id) => `/api/monitoring/competitors/${id}/`,
    delete: (id) => `/api/monitoring/competitors/${id}/`,
    // Scraping endpoints (async tasks)
    extractLinks: (id) => `/api/monitoring/competitors/${id}/extract_links/`,
    scrapeHtml: (id) => `/api/monitoring/competitors/${id}/scrape_html/`,
    extractMetadata: (id) => `/api/monitoring/competitors/${id}/extract_metadata/`,
    runFullPipeline: (id) => `/api/monitoring/competitors/${id}/run_full_pipeline/`,
  },
  // Data storage endpoints
  dataStorage: {
    extractedLinks: '/api/monitoring/extracted-links/',
    filteredLinks: '/api/monitoring/filtered-links/',
    dailyScraperLinks: '/api/monitoring/daily-scraper-links/',
    htmlContent: '/api/monitoring/html-content/',
    metadata: '/api/monitoring/metadata/',
  },
  rag: {
    query: '/api/rag/query/',
    search: '/api/rag/search/',
    stats: '/api/rag/stats/',
    competitors: '/api/rag/competitors/',
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
      ...(token && { Authorization: `Token ${token}` }), // Django uses 'Token' not 'Bearer'
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Handle different status codes
    if (response.status === 401) {
      // Unauthorized - clear auth and redirect
      console.error('❌ 401 Unauthorized - Invalid or expired token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
      console.error('❌ 403 Forbidden');
      throw new Error('Access forbidden');
    }

    if (response.status === 404) {
      console.error('❌ 404 Not Found:', url);
      throw new Error('Resource not found');
    }

    if (response.status === 500) {
      console.error('❌ 500 Server Error');
      throw new Error('Server error. Please try again later.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:', response.status, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('⏱️ Request timeout');
      return { success: false, error: 'Request timeout' };
    }

    // Don't log if we already logged above
    if (!error.message.includes('Session expired') && !error.message.includes('HTTP error')) {
      console.error('🔴 API Error:', error);
    }
    
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
