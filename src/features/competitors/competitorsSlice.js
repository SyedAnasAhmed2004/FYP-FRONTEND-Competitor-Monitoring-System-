import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  competitors: [],
  selectedCompetitor: null,
  filters: {
    search: '',
    category: 'all',
    status: 'all',
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchCompetitors = createAsyncThunk(
  'competitors/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/competitors');
      if (!response.ok) throw new Error('Failed to fetch competitors');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCompetitor = createAsyncThunk(
  'competitors/add',
  async (competitorData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(competitorData),
      });
      if (!response.ok) throw new Error('Failed to add competitor');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCompetitor = createAsyncThunk(
  'competitors/delete',
  async (competitorId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/competitors/${competitorId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete competitor');
      return competitorId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const competitorsSlice = createSlice({
  name: 'competitors',
  initialState,
  reducers: {
    setSelectedCompetitor: (state, action) => {
      state.selectedCompetitor = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch competitors
    builder
      .addCase(fetchCompetitors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetitors.fulfilled, (state, action) => {
        state.loading = false;
        state.competitors = action.payload;
      })
      .addCase(fetchCompetitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Add competitor
    builder
      .addCase(addCompetitor.fulfilled, (state, action) => {
        state.competitors.push(action.payload);
      });
    
    // Delete competitor
    builder
      .addCase(deleteCompetitor.fulfilled, (state, action) => {
        state.competitors = state.competitors.filter(
          (c) => c.id !== action.payload
        );
      });
  },
});

// Actions
export const { setSelectedCompetitor, updateFilters, clearFilters, clearError } = 
  competitorsSlice.actions;

// Selectors
export const selectCompetitors = (state) => state.competitors.competitors;
export const selectSelectedCompetitor = (state) => state.competitors.selectedCompetitor;
export const selectCompetitorsFilters = (state) => state.competitors.filters;
export const selectCompetitorsLoading = (state) => state.competitors.loading;
export const selectCompetitorsError = (state) => state.competitors.error;

// Filtered competitors selector
export const selectFilteredCompetitors = (state) => {
  const { competitors, filters } = state.competitors;
  return competitors.filter((competitor) => {
    const matchesSearch = competitor.name?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || competitor.category === filters.category;
    const matchesStatus = filters.status === 'all' || competitor.status === filters.status;
    return matchesSearch && matchesCategory && matchesStatus;
  });
};

// Reducer
export default competitorsSlice.reducer;
