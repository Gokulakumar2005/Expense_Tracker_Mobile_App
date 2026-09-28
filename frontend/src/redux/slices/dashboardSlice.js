import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getDashboard(params);
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

export const downloadReportPdf = createAsyncThunk(
  'dashboard/downloadReportPdf',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await dashboardService.downloadReportPdf(params);
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to generate PDF report.';
      return rejectWithValue(msg);
    }
  }
);

const now = new Date();

const initialState = {
  data: {
    total_balance: 0,
    total_income: 0,
    total_expense: 0,
    monthly_income: 0,
    monthly_expense: 0,
    monthly_budget: 0,
    remaining_budget: 0,
    savings: 0,
    budget_spent: 0,
    budget_percentage: 0,
    recent_transactions: [],
    category_summary: [],
    category_budgets: [],
    current_month: now.getMonth() + 1,
    current_year: now.getFullYear(),
    current_month_name: '',
  },
  reports: {
    period: 'current_month',
    period_label: '',
    target_month: now.getMonth() + 1,
    target_year: now.getFullYear(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    total_income: 0,
    total_budget: 0,
    total_expenses: 0,
    income_total: 0,
    expense_total: 0,
    remaining_budget: 0,
    savings: 0,
    net_savings: 0,
    savings_rate: 0,
    categories: [],
    category_breakdown: [],
    monthly_trends: [],
    budget_usage: [],
    transactions: [],
  },
  isLoading: false,
  isReportsLoading: false,
  isPdfDownloading: false,
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
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = {
          ...state.data,
          ...action.payload,
          savings: Number(action.payload.savings ?? (action.payload.monthly_income - action.payload.monthly_expense)) || 0,
          remaining_budget: Number(action.payload.remaining_budget ?? (action.payload.monthly_budget - action.payload.monthly_expense)) || 0,
        };
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchReports.pending, (state) => {
        state.isReportsLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isReportsLoading = false;
        state.reports = {
          ...action.payload,
          total_income: Number(action.payload.total_income ?? action.payload.income_total) || 0,
          total_budget: Number(action.payload.total_budget) || 0,
          total_expenses: Number(action.payload.total_expenses ?? action.payload.expense_total) || 0,
          remaining_budget: Number(action.payload.remaining_budget) || 0,
          savings: Number(action.payload.savings ?? action.payload.net_savings) || 0,
        };
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isReportsLoading = false;
        state.error = action.payload;
      })

      .addCase(downloadReportPdf.pending, (state) => {
        state.isPdfDownloading = true;
        state.error = null;
      })
      .addCase(downloadReportPdf.fulfilled, (state) => {
        state.isPdfDownloading = false;
      })
      .addCase(downloadReportPdf.rejected, (state, action) => {
        state.isPdfDownloading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
