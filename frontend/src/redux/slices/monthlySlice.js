import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

export const fetchMonthlySummary = createAsyncThunk(
  'monthly/fetchMonthlySummary',
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getReports({ month, year });
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to load monthly financial summary.';
      return rejectWithValue(msg);
    }
  }
);

export const downloadMonthlyPdf = createAsyncThunk(
  'monthly/downloadMonthlyPdf',
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const data = await dashboardService.downloadReportPdf({ month, year });
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to generate PDF report.';
      return rejectWithValue(msg);
    }
  }
);

const now = new Date();

const initialState = {
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  periodLabel: '',
  totalIncome: 0,
  totalBudget: 0,
  totalExpenses: 0,
  remainingBudget: 0,
  savings: 0,
  savingsRate: 0,
  categories: [],
  categoryBreakdown: [],
  transactions: [],
  monthlyTrends: [],
  loading: false,
  pdfDownloading: false,
  error: null,
};

const monthlySlice = createSlice({
  name: 'monthly',
  initialState,
  reducers: {
    setMonthYear: (state, action) => {
      const { month, year } = action.payload;
      if (month) state.month = month;
      if (year) state.year = year;
    },
    clearMonthlyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch monthly summary
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        state.month = p.target_month || p.month || state.month;
        state.year = p.target_year || p.year || state.year;
        state.periodLabel = p.period_label || '';
        state.totalIncome = Number(p.total_income ?? p.income_total) || 0;
        state.totalBudget = Number(p.total_budget) || 0;
        state.totalExpenses = Number(p.total_expenses ?? p.expense_total) || 0;
        state.remainingBudget = Number(p.remaining_budget) || 0;
        state.savings = Number(p.savings ?? p.net_savings) || 0;
        state.savingsRate = Number(p.savings_rate) || 0;
        state.categories = p.categories || [];
        state.categoryBreakdown = p.category_breakdown || [];
        state.transactions = p.transactions || [];
        state.monthlyTrends = p.monthly_trends || [];
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Download PDF
      .addCase(downloadMonthlyPdf.pending, (state) => {
        state.pdfDownloading = true;
        state.error = null;
      })
      .addCase(downloadMonthlyPdf.fulfilled, (state) => {
        state.pdfDownloading = false;
      })
      .addCase(downloadMonthlyPdf.rejected, (state, action) => {
        state.pdfDownloading = false;
        state.error = action.payload;
      });
  },
});

export const { setMonthYear, clearMonthlyError } = monthlySlice.actions;
export default monthlySlice.reducer;
