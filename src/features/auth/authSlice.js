import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const PERMISSION_KEYS = ['dashboard', 'competitors', 'ai_assistant', 'reports', 'settings'];

const loadPermissions = () => {
  try {
    const raw = localStorage.getItem('userPermissions');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const loadUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const hasPermissionKeys = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  return PERMISSION_KEYS.some((key) => key in obj);
};

const normalizePermissions = (raw) => ({
  dashboard: !!raw?.dashboard,
  competitors: !!raw?.competitors,
  ai_assistant: !!raw?.ai_assistant,
  reports: !!raw?.reports,
  settings: !!raw?.settings,
});

const extractDynamicPermissions = (userRecord = {}) => {
  if (!userRecord || typeof userRecord !== 'object') return null;

  if (hasPermissionKeys(userRecord.permissions)) {
    return normalizePermissions(userRecord.permissions);
  }

  if (hasPermissionKeys(userRecord.role?.permissions)) {
    return normalizePermissions(userRecord.role.permissions);
  }

  if (hasPermissionKeys(userRecord.role_permissions)) {
    return normalizePermissions(userRecord.role_permissions);
  }

  if (hasPermissionKeys(userRecord)) {
    return normalizePermissions(userRecord);
  }

  return null;
};

const initialState = {
  user: loadUser(),
  token: localStorage.getItem('authToken') || null,
  isAuthenticated: !!localStorage.getItem('authToken'),
  permissions: loadPermissions(),
  userType: localStorage.getItem('userType') || null,
  permissionsLoaded: false,
  loading: false,
  error: null,
};

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userPermissions');
  localStorage.removeItem('userType');
  return null;
});

export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const user = loadUser() || {};
      const userType = user.user_type || user.userType || localStorage.getItem('userType') || 'user';

      const fromUser = extractDynamicPermissions(user);
      const fromCache = hasPermissionKeys(loadPermissions()) ? normalizePermissions(loadPermissions()) : null;

      const resolvedPermissions =
        userType === 'super_admin' || user.is_superuser
          ? {
              dashboard: true,
              competitors: true,
              ai_assistant: true,
              reports: true,
              settings: true,
            }
          : fromCache || fromUser; // fromCache = fresh DB permissions (via loadUserPermissions), takes priority

      localStorage.setItem('userType', userType);
      localStorage.setItem('user', JSON.stringify(user));

      if (resolvedPermissions) {
        localStorage.setItem('userPermissions', JSON.stringify(resolvedPermissions));
      } else {
        localStorage.removeItem('userPermissions');
        console.warn('[auth] Missing backend permissions in auth payload for non-super-admin user.');
      }

      return { token, user, permissions: resolvedPermissions, userType };
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load authenticated user data');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload.permissions;
      state.userType = action.payload.userType;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = null;
      state.userType = null;
      state.permissionsLoaded = false;
      state.loading = false;
      state.error = null;
    });

    builder.addCase(bootstrapAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(bootstrapAuth.fulfilled, (state, action) => {
      const payload = action.payload;
      if (!payload) {
        state.loading = false;
        state.permissionsLoaded = false;
        return;
      }

      state.user = payload.user || state.user;
      state.token = payload.token || state.token;
      state.isAuthenticated = !!(payload.token || state.token);
      state.permissions = payload.permissions || null;
      state.userType = payload.userType || null;
      state.permissionsLoaded = true;
      state.loading = false;

      if (payload.user) localStorage.setItem('user', JSON.stringify(payload.user));
      if (payload.token) localStorage.setItem('authToken', payload.token);
      if (payload.permissions) localStorage.setItem('userPermissions', JSON.stringify(payload.permissions));
      if (payload.userType) localStorage.setItem('userType', payload.userType);
    });

    builder.addCase(bootstrapAuth.rejected, (state, action) => {
      state.loading = false;
      state.permissionsLoaded = true;
      state.error = action.payload || action.error?.message || null;
    });
  },
});

export const { setUser, setPermissions, clearError } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectPermissions = (state) => state.auth.permissions;
export const selectUserType = (state) => state.auth.userType;
export const selectPermissionsLoaded = (state) => state.auth.permissionsLoaded;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
