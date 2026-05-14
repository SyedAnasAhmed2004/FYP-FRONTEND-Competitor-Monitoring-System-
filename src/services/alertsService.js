import { api, API_ENDPOINTS } from '@config/api';

export const getAlerts = (params = {}) => {
  const query = new URLSearchParams();
  if (params.days) query.set('days', params.days);
  if (params.type && params.type !== 'all') query.set('type', params.type);
  const qs = query.toString();
  return api.get(`${API_ENDPOINTS.alerts.list}${qs ? '?' + qs : ''}`);
};

export const getAlertPreference = () => api.get(API_ENDPOINTS.alerts.preference);

export const updateAlertPreference = (data) => api.patch(API_ENDPOINTS.alerts.preference, data);
