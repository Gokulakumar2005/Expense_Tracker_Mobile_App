import api from './api';

export const dashboardService = {
  async getDashboard(params = {}) {
    const response = await api.get('/dashboard/', { params });
    return response.data;
  },

  async getReports(params = {}) {
    const response = await api.get('/dashboard/reports/', { params });
    return response.data;
  },

  async getMonthlyReport(params = {}) {
    const response = await api.get('/reports/monthly/', { params });
    return response.data;
  },

  async downloadReportPdf(params = {}) {
    const response = await api.get('/reports/monthly/pdf/', {
      params: { ...params, format: 'base64' },
    });
    return response.data;
  },
};

export default dashboardService;
