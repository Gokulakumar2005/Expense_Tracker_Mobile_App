import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import budgetService from '../../services/budgetService';

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await budgetService.getBudgets(params);
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to fetch budgets.';
      return rejectWithValue(msg);
    }
  }
);

export const fetchBudgetSummary = createAsyncThunk(
  'budgets/fetchBudgetSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await budgetService.getBudgetSummary(params);
      return data;
    } catch (error) {
      return rejectWithValue('Failed to load budget summary.');
    }
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData, { rejectWithValue }) => {
    try {
      const data = await budgetService.createBudget(budgetData);
      return data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.category?.[0] ||
        error.response?.data?.amount?.[0] ||
        error.response?.data?.detail ||
        'Failed to save budget.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, data: budgetData }, { rejectWithValue }) => {
    try {
      const data = await budgetService.updateBudget(id, budgetData);
      return data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.amount?.[0] ||
        error.response?.data?.category?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        'Failed to update budget.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id, { rejectWithValue }) => {
    try {
      await budgetService.deleteBudget(id);
      return id;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to delete budget.';
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  budgets: [],
  summary: {
    total_budget: 0,
    total_spent: 0,
    remaining_budget: 0,
    percentage_used: 0,
    budget_count: 0,
    exceeded_count: 0,
    warning_count: 0,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearBudgetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.results || [];
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchBudgetSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })

      .addCase(createBudget.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.budgets.push(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(updateBudget.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.budgets.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(deleteBudget.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearBudgetError } = budgetSlice.actions;
export default budgetSlice.reducer;
