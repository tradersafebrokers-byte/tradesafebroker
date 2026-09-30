import axios from 'axios';

/**
 * Base API Client configured for PipWise backend
 * withCredentials: true ensures HTTP-Only cookies are sent and received
 */
const getBaseUrl = () => {
  let envUrl =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_API_URL
      : typeof process !== 'undefined'
      ? process.env?.VITE_API_URL
      : '';

  // Auto-upgrade obsolete/dead Render backend URL to active live backend
  if (typeof envUrl === 'string' && envUrl.includes('pip-wise-9lox.onrender.com')) {
    envUrl = 'https://tradesafebroker.onrender.com';
  }

  const isBrowser = typeof window !== 'undefined';
  const isStrictLocalhost =
    isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If running on any hosted domain (tradesafebrokers.com, vercel.app, etc.), guarantee live backend
  if (isBrowser && !isStrictLocalhost) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1') || envUrl.includes('pip-wise-9lox')) {
      return 'https://tradesafebroker.onrender.com/api/v1';
    }
  }

  // If user accidentally entered "VITE_API_URL=https://..." in Vercel Value field
  if (typeof envUrl === 'string' && envUrl.includes('=')) {
    const parts = envUrl.split('=');
    envUrl = parts.slice(1).join('=');
  }

  let clean = String(envUrl || '').trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');

  // If user provided a domain without protocol, auto-prepend https://
  if (clean && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  if (!clean) return 'https://tradesafebroker.onrender.com/api/v1';

  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for reliable SMTP email delivery
});

// Request interceptor to attach Bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('pipwise_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Unable to access localStorage for auth token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let friendlyMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      friendlyMessage = 'Server request timed out. Please try again in a moment.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      friendlyMessage =
        'Unable to reach the server. Please check your internet connection or try again in a few moments.';
    }

    const customError = {
      statusCode: error.response?.status || 500,
      message: friendlyMessage,
      errors: error.response?.data?.errors || [],
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
