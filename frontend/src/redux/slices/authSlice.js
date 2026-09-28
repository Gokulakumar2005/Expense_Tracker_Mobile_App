import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

export const checkStoredAuth = createAsyncThunk(
  'auth/checkStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const stored = await authService.getStoredAuth();
      return stored;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.email?.[0] ||
        error.response?.data?.password?.[0] ||
        error.response?.data?.confirm_password?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Registration failed. Please check your information.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Invalid email or password.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getProfile();
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch profile.');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const user = await authService.updateProfile(userData);
      return user;
    } catch (error) {
      const errorMsg =
        error.response?.data?.first_name?.[0] ||
        error.response?.data?.last_name?.[0] ||
        error.response?.data?.detail ||
        'Failed to update profile.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await authService.logout();
    return true;
  }
);

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  isActionLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    forceLogout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isActionLoading = false;
      state.error = 'Session expired. Please log in again.';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.tokens = action.payload.tokens;
          state.user = action.payload.user;
        } else {
          state.isAuthenticated = false;
          state.tokens = null;
          state.user = null;
        }
      })
      .addCase(checkStoredAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.tokens = null;
        state.user = null;
      })

      .addCase(registerUser.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isActionLoading = false;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.isAuthenticated = true;
        state.tokens = action.payload.tokens;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isActionLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isActionLoading = false;
        state.error = null;
      });
  },
});

export const { clearAuthError, forceLogout } = authSlice.actions;
export default authSlice.reducer;
