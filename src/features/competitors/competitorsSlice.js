import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, API_ENDPOINTS } from '@config/api';

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
      const response = await api.get(API_ENDPOINTS.competitors.list);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch competitors');
      }
      
      // Backend returns paginated response: {count, next, previous, results}
      // Extract the results array
      const data = response.data;
      console.log('📦 Raw API response:', data);
      
      // If data has 'results' property (paginated), return that array
      // Otherwise, return data as-is (assuming it's already an array)
      const competitorsArray = data?.results || data;
      console.log('📋 Extracted competitors array:', competitorsArray);
      
      return competitorsArray;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCompetitor = createAsyncThunk(
  'competitors/add',
  async (competitorData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.competitors.create, competitorData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to add competitor');
      }
      
      // Django returns {message, competitor, created}
      return response.data.competitor || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCompetitor = createAsyncThunk(
  'competitors/update',
  async ({ id, data, partial = true }, { rejectWithValue }) => {
    try {
      // Use PATCH for partial updates, PUT for full replacement
      const response = partial 
        ? await api.patch(API_ENDPOINTS.competitors.partialUpdate(id), data)
        : await api.put(API_ENDPOINTS.competitors.update(id), data);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update competitor');
      }
      
      // Django returns {message, competitor}
      return response.data.competitor || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCompetitor = createAsyncThunk(
  'competitors/delete',
  async (competitorId, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_ENDPOINTS.competitors.delete(competitorId));
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete competitor');
      }
      
      return competitorId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Scraping async thunks
export const extractLinks = createAsyncThunk(
  'competitors/extractLinks',
  async (competitorId, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.competitors.extractLinks(competitorId));
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to start link extraction');
      }
      
      return response.data; // Returns {status, message, task_id, competitor}
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const scrapeHtml = createAsyncThunk(
  'competitors/scrapeHtml',
  async ({ competitorId, useFilteredLinks = false }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.competitors.scrapeHtml(competitorId),
        { use_filtered_links: useFilteredLinks }
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to start HTML scraping');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const extractMetadata = createAsyncThunk(
  'competitors/extractMetadata',
  async (competitorId, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.competitors.extractMetadata(competitorId));
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to start metadata extraction');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const runFullPipeline = createAsyncThunk(
  'competitors/runFullPipeline',
  async ({ competitorId, useFilteredLinks = false }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.competitors.runFullPipeline(competitorId),
        { use_filtered_links: useFilteredLinks }
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to start full pipeline');
      }
      
      return response.data;
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
        // Ensure we always have an array
        state.competitors = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCompetitors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.competitors = []; // Reset to empty array on error
      });
    
    // Add competitor
    builder
      .addCase(addCompetitor.fulfilled, (state, action) => {
        // Ensure competitors is an array before pushing
        if (!Array.isArray(state.competitors)) {
          state.competitors = [];
        }
        state.competitors.push(action.payload);
      })
      .addCase(addCompetitor.rejected, (state, action) => {
        state.error = action.payload;
      });
    
    // Update competitor
    builder
      .addCase(updateCompetitor.fulfilled, (state, action) => {
        const index = state.competitors.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.competitors[index] = action.payload;
        }
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
