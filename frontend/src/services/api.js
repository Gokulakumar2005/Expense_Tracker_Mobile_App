import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const ACCESS_TOKEN_KEY = '@pockettrack_access_token';
export const REFRESH_TOKEN_KEY = '@pockettrack_refresh_token';
export const USER_KEY = '@pockettrack_user';

// Determine default API base URL strictly from environment variables
const getDefaultBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = getDefaultBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Logout callback registry for Redux synchronization
let onUnauthorizedCallback = null;
export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve access token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Automatic Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop if refresh itself fails
      if (originalRequest.url?.includes('/auth/refresh/') || originalRequest.url?.includes('/auth/login/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clean up stored tokens on session expiration
        await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
