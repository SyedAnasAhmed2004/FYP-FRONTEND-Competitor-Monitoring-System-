import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as alertsService from '@services/alertsService';

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (params = {}, { rejectWithValue }) => {
    const response = await alertsService.getAlerts(params);
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);

export const fetchAlertPreference = createAsyncThunk(
  'alerts/fetchAlertPreference',
  async (_, { rejectWithValue }) => {
    const response = await alertsService.getAlertPreference();
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);

export const saveAlertPreference = createAsyncThunk(
  'alerts/saveAlertPreference',
  async (data, { rejectWithValue }) => {
    const response = await alertsService.updateAlertPreference(data);
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);

const initialState = {
  alerts: [],
  alertsCount: 0,
  alertsDays: 7,
  preference: null,
  alertsLoading: false,
  preferenceLoading: false,
  preferenceUpdating: false,
  error: null,
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.alertsLoading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.alertsLoading = false;
        state.alerts = action.payload?.alerts || [];
        state.alertsCount = action.payload?.count || 0;
        state.alertsDays = action.payload?.days || 7;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.alertsLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchAlertPreference.pending, (state) => {
        state.preferenceLoading = true;
      })
      .addCase(fetchAlertPreference.fulfilled, (state, action) => {
        state.preferenceLoading = false;
        state.preference = action.payload;
      })
      .addCase(fetchAlertPreference.rejected, (state, action) => {
        state.preferenceLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(saveAlertPreference.pending, (state) => {
        state.preferenceUpdating = true;
      })
      .addCase(saveAlertPreference.fulfilled, (state, action) => {
        state.preferenceUpdating = false;
        state.preference = action.payload;
      })
      .addCase(saveAlertPreference.rejected, (state, action) => {
        state.preferenceUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = alertsSlice.actions;

export const selectAlerts = (state) => state.alerts.alerts;
export const selectAlertsCount = (state) => state.alerts.alertsCount;
export const selectAlertsLoading = (state) => state.alerts.alertsLoading;
export const selectAlertPreference = (state) => state.alerts.preference;
export const selectPreferenceLoading = (state) => state.alerts.preferenceLoading;
export const selectPreferenceUpdating = (state) => state.alerts.preferenceUpdating;
export const selectAlertsError = (state) => state.alerts.error;

export default alertsSlice.reducer;
