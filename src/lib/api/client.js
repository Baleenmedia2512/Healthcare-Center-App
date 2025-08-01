/**
 * API Client Module
 * 
 * Centralized API client configuration
 */

import axios from 'axios';
import { API_CONFIG } from '../../config';
import { transformJsonFields } from './transform';

// Create axios instance with enhanced configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  // Retry configuration
  retry: 3,
  retryDelay: 1000,
});

// Request interceptor - prepare requests
apiClient.interceptors.request.use(
  (config) => {
    // NextAuth handles authentication through session cookies
    // No need to add Authorization headers
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle common errors, transform data
apiClient.interceptors.response.use(
  (response) => {
    // Transform JSON string fields to objects if needed
    if (response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(transformJsonFields);
      } else {
        response.data = transformJsonFields(response.data);
      }
    }
    return response;
  },
  (error) => {
    // Log detailed error information for debugging
    console.error('API Client Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle common HTTP errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login if needed
          if (typeof window !== 'undefined') {
            console.warn('Session expired, redirecting to login');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
