import { configureStore } from '@reduxjs/toolkit';
import authReducer, { forceLogout } from './slices/authSlice';
import transactionReducer from './slices/transactionSlice';
import budgetReducer from './slices/budgetSlice';
import dashboardReducer from './slices/dashboardSlice';
import { setOnUnauthorizedCallback } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    budgets: budgetReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Configure automatic logout when token refresh fails
setOnUnauthorizedCallback(() => {
  store.dispatch(forceLogout());
});

export default store;
