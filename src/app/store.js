import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';
import dashboardReducer from '@features/dashboard/dashboardSlice';
import competitorsReducer from '@features/competitors/competitorsSlice';
import aiAssistantReducer from '@features/aiAssistant/aiAssistantSlice';
import reportsReducer from '@features/reports/reportsSlice';
import settingsReducer from '@features/settings/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    competitors: competitorsReducer,
    aiAssistant: aiAssistantReducer,
    reports: reportsReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['your/action/type'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: import.meta.env.DEV,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export const selectRootState = (state) => state;
