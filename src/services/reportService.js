import { api, API_ENDPOINTS } from '../config/api';

export const generateReport = async ({ title, report_type, period_start, period_end, competitor_ids }) => {
  try {
    const response = await api.post(API_ENDPOINTS.reports.generate, {
      title,
      report_type,
      period_start,
      period_end,
      competitor_ids,
    });
    return response;
  } catch (error) {
    console.error('Generate Report Error:', error);
    return { success: false, error: error.message || 'Error generating report' };
  }
};

export const getReport = async (id) => {
  try {
    const response = await api.get(API_ENDPOINTS.reports.detail(id));
    return response;
  } catch (error) {
    console.error('Get Report Error:', error);
    return { success: false, error: error.message || 'Error fetching report' };
  }
};

export const listReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    ).toString();
    const endpoint = params
      ? `${API_ENDPOINTS.reports.list}?${params}`
      : API_ENDPOINTS.reports.list;
    const response = await api.get(endpoint);
    return response;
  } catch (error) {
    console.error('List Reports Error:', error);
    return { success: false, error: error.message || 'Error fetching reports' };
  }
};

export const downloadReportPdf = async (id, filename = 'report') => {
  try {
    const token = localStorage.getItem('authToken');
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseURL}${API_ENDPOINTS.reports.pdf(id)}`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to download PDF');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Download PDF Error:', error);
    return { success: false, error: error.message || 'Error downloading PDF' };
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await api.delete(API_ENDPOINTS.reports.delete(id));
    return response;
  } catch (error) {
    console.error('Delete Report Error:', error);
    return { success: false, error: error.message || 'Error deleting report' };
  }
};

export default { generateReport, getReport, listReports, downloadReportPdf, deleteReport };
