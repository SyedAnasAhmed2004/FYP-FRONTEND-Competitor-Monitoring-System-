/**
 * Settings Service
 * Handles Users and Roles CRUD operations for the Settings pages
 */

import { api, API_ENDPOINTS } from '../config/api';

// ─── Users ───────────────────────────────────────────────────────────────────

export const fetchUsers = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.accounts.users.list);
    return response;
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return { success: false, error: error.message || 'Error fetching users' };
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post(API_ENDPOINTS.accounts.users.create, userData);
    return response;
  } catch (error) {
    console.error('Create User Error:', error);
    return { success: false, error: error.message || 'Error creating user' };
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(API_ENDPOINTS.accounts.users.update(id), userData);
    return response;
  } catch (error) {
    console.error('Update User Error:', error);
    return { success: false, error: error.message || 'Error updating user' };
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(API_ENDPOINTS.accounts.users.delete(id));
    return response;
  } catch (error) {
    console.error('Delete User Error:', error);
    return { success: false, error: error.message || 'Error deleting user' };
  }
};

// ─── Roles ───────────────────────────────────────────────────────────────────

export const fetchRoles = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.accounts.roles.list);
    return response;
  } catch (error) {
    console.error('Fetch Roles Error:', error);
    return { success: false, error: error.message || 'Error fetching roles' };
  }
};

export const createRole = async (data) => {
  try {
    const response = await api.post(API_ENDPOINTS.accounts.roles.create, data);
    return response;
  } catch (error) {
    console.error('Create Role Error:', error);
    return { success: false, error: error.message || 'Error creating role' };
  }
};

export const updateRole = async (id, data) => {
  try {
    const response = await api.put(API_ENDPOINTS.accounts.roles.update(id), data);
    return response;
  } catch (error) {
    console.error('Update Role Error:', error);
    return { success: false, error: error.message || 'Error updating role' };
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await api.delete(API_ENDPOINTS.accounts.roles.delete(id));
    return response;
  } catch (error) {
    console.error('Delete Role Error:', error);
    return { success: false, error: error.message || 'Error deleting role' };
  }
};

export const updateRolePermissions = async (id, permissions) => {
  try {
    const response = await api.patch(API_ENDPOINTS.accounts.roles.permissions(id), permissions);
    return response;
  } catch (error) {
    console.error('Update Role Permissions Error:', error);
    return { success: false, error: error.message || 'Error updating role permissions' };
  }
};

export default {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
};
