import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const ACCESS_TOKEN_KEY = '@pockettrack_access_token';
export const REFRESH_TOKEN_KEY = '@pockettrack_refresh_token';
export const USER_KEY = '@pockettrack_user';

export const LIVE_BACKEND_URL = 'https://expense-tracker-mobile-app-backend-j1ep.onrender.com';
export const LIVE_API_URL = `${LIVE_BACKEND_URL}/api`;

export const getLocalBaseUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }
  return 'http://localhost:8000/api';
};

export const getDefaultBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_USE_LIVE_API === 'true' || process.env.EXPO_PUBLIC_API_ENV === 'live') {
    return process.env.EXPO_PUBLIC_LIVE_API_URL || LIVE_API_URL;
  }
  if (process.env.EXPO_PUBLIC_USE_LIVE_API === 'false' || process.env.EXPO_PUBLIC_API_ENV === 'local') {
    return getLocalBaseUrl();
  }
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return getLocalBaseUrl();
};

export const BASE_AXIOS_URL = getDefaultBaseUrl();
export const API_BASE_URL = BASE_AXIOS_URL;

const api = axios.create({
  baseURL: BASE_AXIOS_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const setBaseAxiosUrl = (url) => {
  api.defaults.baseURL = url;
};

export const getBaseAxiosUrl = () => api.defaults.baseURL;

export const switchToLiveBackend = () => {
  setBaseAxiosUrl(LIVE_API_URL);
  return LIVE_API_URL;
};

export const switchToLocalBackend = () => {
  const localUrl = getLocalBaseUrl();
  setBaseAxiosUrl(localUrl);
  return localUrl;
};

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

let onUnauthorizedCallback = null;
export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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

        const currentBaseUrl = api.defaults.baseURL || BASE_AXIOS_URL;
        const response = await axios.post(`${currentBaseUrl}/auth/refresh/`, {
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
