import axios from 'axios';
import { jwtHelper } from './jwtHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance for JWT-based authentication
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // JWT doesn't need cookies
  timeout: 30000, // 30s timeout - allow backend time for email/push operations
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = jwtHelper.getToken();
  if (token) {
    // console.log('[API] Adding JWT token to request');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // console.log('[API] No JWT token found');
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized - clearing auth');
      jwtHelper.removeToken();
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);

export default api;
