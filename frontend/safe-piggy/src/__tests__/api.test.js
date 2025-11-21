import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set up the mock with the object defined INSIDE the factory
vi.mock('axios', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  
  return {
    default: {
      create: vi.fn(() => mockApi),
      __mockApi: mockApi, // expose it for tests
    },
  };
});

import axios from 'axios';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchStats,
  exportExpensesCsv,
} from '../api';

// Get reference to the mock instance
const mockApi = axios.__mockApi;

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchExpenses', () => {
    it('should fetch expenses with no params', async () => {
      const mockData = {
        expenses: [{ id: 1, description: 'Test' }],
        total: 100,
      };
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await fetchExpenses();

      expect(mockApi.get).toHaveBeenCalledWith('/expenses', { params: undefined });
      expect(result.data).toEqual(mockData);
    });

    it('should fetch expenses with filters', async () => {
      const mockData = { expenses: [], total: 0 };
      mockApi.get.mockResolvedValue({ data: mockData });

      const params = { category: 'Food', startDate: '2024-01-01' };
      await fetchExpenses(params);

      expect(mockApi.get).toHaveBeenCalledWith('/expenses', { params });
    });
  });

  describe('createExpense', () => {
    it('should create an expense', async () => {
      const expenseData = {
        description: 'Test',
        amount: 25.50,
        category: 'Food',
        date: '2024-01-15',
        payment_method: 'Card',
        recurring: false,
      };
      const mockResponse = { data: { id: 1, ...expenseData } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await createExpense(expenseData);

      expect(mockApi.post).toHaveBeenCalledWith('/expenses', expenseData);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('updateExpense', () => {
    it('should update an expense', async () => {
      const expenseData = {
        description: 'Updated',
        amount: 30.00,
        category: 'Food',
        date: '2024-01-20',
        payment_method: 'Card',
        recurring: false,
      };
      const mockResponse = { data: { id: 1, ...expenseData } };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await updateExpense(1, expenseData);

      expect(mockApi.put).toHaveBeenCalledWith('/expenses/1', expenseData);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense', async () => {
      mockApi.delete.mockResolvedValue({ status: 204 });

      await deleteExpense(1);

      expect(mockApi.delete).toHaveBeenCalledWith('/expenses/1');
    });
  });

  describe('fetchStats', () => {
    it('should fetch monthly statistics', async () => {
      const mockStats = {
        totalThisMonth: 500,
        totalLastMonth: 400,
        categoryBreakdown: [],
        lastFiveTransactions: [],
      };
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await fetchStats();

      expect(mockApi.get).toHaveBeenCalledWith('/stats/month');
      expect(result.data).toEqual(mockStats);
    });
  });

  describe('exportExpensesCsv', () => {
    it('should export expenses as CSV', async () => {
      const mockBlob = new Blob(['id,description\n1,Test'], { type: 'text/csv' });
      mockApi.get.mockResolvedValue({ data: mockBlob });

      const params = { category: 'Food' };
      const result = await exportExpensesCsv(params);

      expect(mockApi.get).toHaveBeenCalledWith('/expenses/export/csv', {
        params,
        responseType: 'blob',
      });
      expect(result.data).toBeInstanceOf(Blob);
    });
  });
});