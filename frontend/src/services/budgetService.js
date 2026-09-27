import api from './api';

export const budgetService = {
  async getBudgets(params = {}) {
    const response = await api.get('/budgets/', { params });
    return response.data;
  },

  async getBudget(id) {
    const response = await api.get(`/budgets/${id}/`);
    return response.data;
  },

  async createBudget(budgetData) {
    const response = await api.post('/budgets/', budgetData);
    return response.data;
  },

  async updateBudget(id, budgetData) {
    const response = await api.put(`/budgets/${id}/`, budgetData);
    return response.data;
  },

  async deleteBudget(id) {
    const response = await api.delete(`/budgets/${id}/`);
    return response.data;
  },

  async getBudgetSummary(params = {}) {
    const response = await api.get('/budgets/summary/', { params });
    return response.data;
  },
};

export default budgetService;
