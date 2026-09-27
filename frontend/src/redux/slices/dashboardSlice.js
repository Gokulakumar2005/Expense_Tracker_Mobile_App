import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getDashboard();
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to load dashboard data.';
      return rejectWithValue(msg);
    }
  }
);

export const fetchReports = createAsyncThunk(
  'dashboard/fetchReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getReports(params);
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to load reports data.';
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  data: {
    total_balance: 0,
    total_income: 0,
    total_expense: 0,
    monthly_income: 0,
    monthly_expense: 0,
    monthly_budget: 0,
    remaining_budget: 0,
    budget_spent: 0,
    budget_percentage: 0,
    recent_transactions: [],
    category_summary: [],
    current_month: new Date().getMonth() + 1,
    current_year: new Date().getFullYear(),
    current_month_name: '',
  },
  reports: {
    period: 'current_month',
    period_label: '',
    target_month: new Date().getMonth() + 1,
    target_year: new Date().getFullYear(),
    income_total: 0,
    expense_total: 0,
    net_savings: 0,
    savings_rate: 0,
    category_breakdown: [],
    monthly_trends: [],
    budget_usage: [],
  },
  isLoading: false,
  isReportsLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchReports
      .addCase(fetchReports.pending, (state) => {
        state.isReportsLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isReportsLoading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isReportsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
