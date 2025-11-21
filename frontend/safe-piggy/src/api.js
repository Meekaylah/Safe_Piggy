import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

export const fetchExpenses = (params) => api.get('/expenses', { params });
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const fetchStats = () => api.get('/stats/month');
export const exportExpensesCsv = (params) =>
    api.get('/expenses/export/csv', {
      params,
      responseType: 'blob',
    });
  
