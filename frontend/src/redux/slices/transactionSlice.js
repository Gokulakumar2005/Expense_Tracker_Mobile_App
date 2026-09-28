import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await transactionService.getTransactions(params);
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Failed to fetch transactions.';
      return rejectWithValue(msg);
    }
  }
);

export const fetchTransactionDetail = createAsyncThunk(
  'transactions/fetchTransactionDetail',
  async (id, { rejectWithValue }) => {
    try {
      const data = await transactionService.getTransaction(id);
      return data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to load transaction details.';
      return rejectWithValue(msg);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const data = await transactionService.createTransaction(transactionData);
      return data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.amount?.[0] ||
        error.response?.data?.title?.[0] ||
        error.response?.data?.category?.[0] ||
        error.response?.data?.transaction_date?.[0] ||
        error.response?.data?.detail ||
        'Failed to save transaction.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, data: transactionData }, { rejectWithValue }) => {
    try {
      const data = await transactionService.updateTransaction(id, transactionData);
      return data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.amount?.[0] ||
        error.response?.data?.title?.[0] ||
        error.response?.data?.detail ||
        'Failed to update transaction.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      await transactionService.deleteTransaction(id);
      return id;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to delete transaction.';
      return rejectWithValue(msg);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'transactions/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await transactionService.getCategories();
      return data;
    } catch (error) {
      return rejectWithValue('Failed to load categories.');
    }
  }
);

const initialState = {
  transactions: [],
  totalCount: 0,
  selectedTransaction: null,
  categories: {
    expense_categories: [],
    income_categories: [],
  },
  filters: {
    transaction_type: '',
    category: '',
    search: '',
    ordering: 'newest',
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        transaction_type: '',
        category: '',
        search: '',
        ordering: 'newest',
      };
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
    clearTransactionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(action.payload)) {
          state.transactions = action.payload;
          state.totalCount = action.payload.length;
        } else if (action.payload && Array.isArray(action.payload.results)) {
          state.transactions = action.payload.results;
          state.totalCount = action.payload.count || action.payload.results.length;
        } else {
          state.transactions = [];
          state.totalCount = 0;
        }
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchTransactionDetail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactionDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTransaction = action.payload;
      })
      .addCase(fetchTransactionDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createTransaction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.transactions.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(updateTransaction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.selectedTransaction = action.payload;
        const index = state.transactions.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(deleteTransaction.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.transactions = state.transactions.filter((t) => t.id !== action.payload);
        if (state.selectedTransaction?.id === action.payload) {
          state.selectedTransaction = null;
        }
        if (state.totalCount > 0) state.totalCount -= 1;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  clearSelectedTransaction,
  clearTransactionError,
} = transactionSlice.actions;

export default transactionSlice.reducer;
