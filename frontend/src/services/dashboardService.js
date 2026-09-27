import api from './api';

export const dashboardService = {
  async getDashboard() {
    const response = await api.get('/dashboard/');
    return response.data;
  },

  async getReports(params = {}) {
    const response = await api.get('/dashboard/reports/', { params });
    return response.data;
  },
};

export default dashboardService;
