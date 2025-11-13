import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  reports: [],
  selectedReport: null,
  reportData: null,
  filters: {
    dateRange: 'month',
    category: 'all',
    status: 'all',
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/reports?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateReport = createAsyncThunk(
  'reports/generate',
  async (reportConfig, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportConfig),
      });
      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportReport = createAsyncThunk(
  'reports/export',
  async ({ reportId, format }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export?format=${format}`);
      if (!response.ok) throw new Error('Failed to export report');
      const blob = await response.blob();
      return { blob, format, reportId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setSelectedReport: (state, action) => {
      state.selectedReport = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearReportData: (state) => {
      state.reportData = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch reports
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Generate report
    builder
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload;
        state.reports.unshift(action.payload);
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Export report
    builder
      .addCase(exportReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { 
  setSelectedReport, 
  updateFilters, 
  clearFilters, 
  clearReportData,
  clearError 
} = reportsSlice.actions;

// Selectors
export const selectReports = (state) => state.reports.reports;
export const selectSelectedReport = (state) => state.reports.selectedReport;
export const selectReportData = (state) => state.reports.reportData;
export const selectReportsFilters = (state) => state.reports.filters;
export const selectReportsLoading = (state) => state.reports.loading;
export const selectReportsError = (state) => state.reports.error;

// Filtered reports selector
export const selectFilteredReports = (state) => {
  const { reports, filters } = state.reports;
  return reports.filter((report) => {
    const matchesCategory = filters.category === 'all' || report.category === filters.category;
    const matchesStatus = filters.status === 'all' || report.status === filters.status;
    return matchesCategory && matchesStatus;
  });
};

// Reducer
export default reportsSlice.reducer;
