import api, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async register({ firstName, lastName, email, password, confirmPassword }) {
    const response = await api.post('/auth/register/', {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirm_password: confirmPassword,
    });

    const { tokens, user } = response.data;
    if (tokens) {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, tokens.access],
        [REFRESH_TOKEN_KEY, tokens.refresh],
        [USER_KEY, JSON.stringify(user)],
      ]);
    }
    return response.data;
  },

  async login({ email, password }) {
    const response = await api.post('/auth/login/', {
      email: email.trim().toLowerCase(),
      password,
    });

    const { tokens, user } = response.data;
    if (tokens) {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, tokens.access],
        [REFRESH_TOKEN_KEY, tokens.refresh],
        [USER_KEY, JSON.stringify(user)],
      ]);
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile/');
    const user = response.data;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async updateProfile({ firstName, lastName }) {
    const response = await api.put('/auth/profile/', {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    });
    const user = response.data;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.warn('Error clearing stored session:', e);
    }
  },

  async getStoredAuth() {
    try {
      const [accessToken, refreshToken, userString] = await AsyncStorage.multiGet([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
      ]);

      const access = accessToken[1];
      const refresh = refreshToken[1];
      const user = userString[1] ? JSON.parse(userString[1]) : null;

      if (access && user) {
        return {
          tokens: { access, refresh },
          user,
        };
      }
      return null;
    } catch (e) {
      console.warn('Failed to load stored auth session', e);
      return null;
    }
  },
};

export default authService;
