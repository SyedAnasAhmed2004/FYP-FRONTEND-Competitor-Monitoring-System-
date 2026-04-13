import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as settingsService from '@services/settingsService';

// ─── Async Thunks: Users ──────────────────────────────────────────────────────

export const fetchUsers = createAsyncThunk(
  'settings/fetchUsers',
  async (_, { rejectWithValue }) => {
    const response = await settingsService.fetchUsers();
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);

export const createUser = createAsyncThunk(
  'settings/createUser',
  async (userData, { rejectWithValue }) => {
    const response = await settingsService.createUser(userData);
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);

export const updateUser = createAsyncThunk(
  'settings/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    const response = await settingsService.updateUser(id, userData);
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  'settings/deleteUser',
  async (id, { rejectWithValue }) => {
    const response = await settingsService.deleteUser(id);
    if (!response.success) return rejectWithValue(response.error);
    return id;
  }
);

// ─── Async Thunks: Roles ──────────────────────────────────────────────────────

export const fetchRoles = createAsyncThunk(
  'settings/fetchRoles',
  async (_, { rejectWithValue }) => {
    const response = await settingsService.fetchRoles();
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);

export const createRole = createAsyncThunk(
  'settings/createRole',
  async (data, { rejectWithValue }) => {
    const response = await settingsService.createRole(data);
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);

export const updateRole = createAsyncThunk(
  'settings/updateRole',
  async ({ id, data }, { rejectWithValue }) => {
    const response = await settingsService.updateRole(id, data);
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);

export const deleteRole = createAsyncThunk(
  'settings/deleteRole',
  async (id, { rejectWithValue }) => {
    const response = await settingsService.deleteRole(id);
    if (!response.success) return rejectWithValue(response.error);
    return id;
  }
);

export const updateRolePermissions = createAsyncThunk(
  'settings/updateRolePermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    const response = await settingsService.updateRolePermissions(id, permissions);
    if (!response.success) return rejectWithValue(response.error);
    // Return the server response if available, otherwise the sent permissions
    return { id, permissions, data: response.data };
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  users: [],
  roles: [],
  usersLoading: false,
  rolesLoading: false,
  error: null,
  selectedUser: null,
  selectedRole: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchUsers ──
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      });

    // ── createUser ──
    builder
      .addCase(createUser.fulfilled, (state, action) => {
        if (action.payload) state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── updateUser ──
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.users.findIndex((u) => u.id === action.payload.id);
          if (idx !== -1) state.users[idx] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── deleteUser ──
    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── fetchRoles ──
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.rolesLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.rolesLoading = false;
        state.error = action.payload;
      });

    // ── createRole ──
    builder
      .addCase(createRole.fulfilled, (state, action) => {
        if (action.payload) state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── updateRole ──
    builder
      .addCase(updateRole.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.roles.findIndex((r) => r.id === action.payload.id);
          if (idx !== -1) state.roles[idx] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── deleteRole ──
    builder
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── updateRolePermissions ──
    builder
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        const { id, permissions, data } = action.payload;
        const role = state.roles.find((r) => r.id === id);
        if (role) {
          // Server returns flat RolePermissionSerializer data; store under role.permissions
          role.permissions = { ...(role.permissions || {}), ...(data || permissions) };
        }
      })
      .addCase(updateRolePermissions.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export const { setSelectedUser, setSelectedRole, clearError } = settingsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUsers = (state) => state.settings.users;
export const selectRoles = (state) => state.settings.roles;
export const selectUsersLoading = (state) => state.settings.usersLoading;
export const selectRolesLoading = (state) => state.settings.rolesLoading;
export const selectSettingsLoading = (state) =>
  state.settings.usersLoading || state.settings.rolesLoading;
export const selectSettingsError = (state) => state.settings.error;
export const selectSelectedUser = (state) => state.settings.selectedUser;
export const selectSelectedRole = (state) => state.settings.selectedRole;

// kept for any legacy import
export const selectPermissions = (state) => state.settings.roles;

export default settingsSlice.reducer;
