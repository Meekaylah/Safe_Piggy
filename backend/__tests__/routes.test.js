const request = require('supertest');
const express = require('express');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const TEST_DB_PATH = path.join(__dirname, '../test-expenses.db');

// Prefix with "mock" - Jest allows this exception
const mockSetupTestDatabase = () => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  const db = new Database(TEST_DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      recurring INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
};

// Now Jest allows the reference because it starts with "mock"
jest.mock('../db', () => {
  return mockSetupTestDatabase();
});

const routes = require('../routes');
const db = require('../db');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  return app;
}

function clearTestDb() {
  db.exec('DELETE FROM expenses');
}

describe('Expense API Routes', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  afterEach(() => {
    clearTestDb();
  });

  afterAll(() => {
    if (db) {
      db.close();
    }
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('POST /api/expenses', () => {
    const validExpense = {
      description: 'Test Groceries',
      amount: 45.50,
      category: 'Food',
      date: '2024-01-15',
      payment_method: 'Card',
      recurring: false,
    };

    test('should create a new expense', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send(validExpense)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe(validExpense.description);
      expect(response.body.amount).toBe(validExpense.amount);
      expect(response.body.category).toBe(validExpense.category);
    });

    test('should reject invalid expense data', async () => {
      const invalidExpense = {
        description: '',
        amount: -10,
        category: 'Invalid',
        date: 'invalid-date',
        payment_method: 'Invalid',
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(invalidExpense)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should handle recurring expenses', async () => {
      const recurringExpense = { ...validExpense, recurring: true };
      const response = await request(app)
        .post('/api/expenses')
        .send(recurringExpense)
        .expect(201);

      expect(response.body.recurring).toBe(1);
    });
  });

  describe('GET /api/expenses', () => {
    beforeEach(async () => {
      const expenses = [
        { description: 'Food expense', amount: 25.00, category: 'Food', date: '2024-01-15', payment_method: 'Card', recurring: 0 },
        { description: 'Transport expense', amount: 15.50, category: 'Transport', date: '2024-01-20', payment_method: 'Cash', recurring: 0 },
        { description: 'Another food expense', amount: 30.00, category: 'Food', date: '2024-02-10', payment_method: 'Card', recurring: 0 },
      ];

      const stmt = db.prepare(`
        INSERT INTO expenses (description, amount, category, date, payment_method, recurring)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      expenses.forEach((exp) => {
        stmt.run(exp.description, exp.amount, exp.category, exp.date, exp.payment_method, exp.recurring);
      });
    });

    test('should get all expenses', async () => {
      const response = await request(app).get('/api/expenses').expect(200);

      expect(response.body).toHaveProperty('expenses');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.expenses)).toBe(true);
      expect(response.body.expenses.length).toBeGreaterThan(0);
    });

    test('should filter expenses by category', async () => {
      const response = await request(app).get('/api/expenses?category=Food').expect(200);
      response.body.expenses.forEach((expense) => {
        expect(expense.category).toBe('Food');
      });
    });

    test('should filter expenses by date range', async () => {
      const response = await request(app)
        .get('/api/expenses?startDate=2024-01-01&endDate=2024-01-31')
        .expect(200);

      response.body.expenses.forEach((expense) => {
        const expenseDate = new Date(expense.date);
        expect(expenseDate >= new Date('2024-01-01')).toBe(true);
        expect(expenseDate <= new Date('2024-01-31')).toBe(true);
      });
    });

    test('should sort expenses by amount', async () => {
      const response = await request(app).get('/api/expenses?sortBy=amount').expect(200);
      const amounts = response.body.expenses.map((e) => e.amount);
      const sortedAmounts = [...amounts].sort((a, b) => b - a);
      expect(amounts).toEqual(sortedAmounts);
    });

    test('should calculate total correctly', async () => {
      const response = await request(app).get('/api/expenses').expect(200);
      const calculatedTotal = response.body.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      expect(response.body.total).toBeCloseTo(calculatedTotal, 2);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    let expenseId;

    beforeEach(async () => {
      const stmt = db.prepare(`
        INSERT INTO expenses (description, amount, category, date, payment_method, recurring)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run('Original', 10.00, 'Food', '2024-01-15', 'Card', 0);
      expenseId = result.lastInsertRowid;
    });

    test('should update an existing expense', async () => {
      const updatedData = {
        description: 'Updated expense',
        amount: 20.00,
        category: 'Transport',
        date: '2024-01-20',
        payment_method: 'Cash',
        recurring: false,
      };

      const response = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.amount).toBe(updatedData.amount);
      expect(response.body.category).toBe(updatedData.category);
    });

    test('should return 404 for non-existent expense', async () => {
      const updatedData = {
        description: 'Updated',
        amount: 20.00,
        category: 'Food',
        date: '2024-01-20',
        payment_method: 'Card',
        recurring: false,
      };

      await request(app).put('/api/expenses/99999').send(updatedData).expect(404);
    });

    test('should reject invalid update data', async () => {
      const invalidData = {
        description: '',
        amount: -10,
        category: 'Invalid',
        date: 'invalid',
        payment_method: 'Invalid',
      };

      await request(app).put(`/api/expenses/${expenseId}`).send(invalidData).expect(400);
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    let expenseId;

    beforeEach(async () => {
      const stmt = db.prepare(`
        INSERT INTO expenses (description, amount, category, date, payment_method, recurring)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run('To Delete', 15.00, 'Food', '2024-01-15', 'Card', 0);
      expenseId = result.lastInsertRowid;
    });

    test('should delete an existing expense', async () => {
      await request(app).delete(`/api/expenses/${expenseId}`).expect(204);
      const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(expenseId);
      expect(expense).toBeUndefined();
    });

    test('should return 404 for non-existent expense', async () => {
      await request(app).delete('/api/expenses/99999').expect(404);
    });
  });

  describe('GET /api/stats/month', () => {
    beforeEach(async () => {
      const stmt = db.prepare(`
        INSERT INTO expenses (description, amount, category, date, payment_method, recurring)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7);
      stmt.run('Current month expense', 50.00, 'Food', `${currentMonth}-15`, 'Card', 0);
      stmt.run('Current month expense 2', 30.00, 'Transport', `${currentMonth}-20`, 'Cash', 0);

      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
      const lastMonthStr = lastMonth.toISOString().slice(0, 10);
      stmt.run('Last month expense', 40.00, 'Food', lastMonthStr, 'Card', 0);
    });

    test('should return monthly statistics', async () => {
      const response = await request(app).get('/api/stats/month').expect(200);

      expect(response.body).toHaveProperty('totalThisMonth');
      expect(response.body).toHaveProperty('totalLastMonth');
      expect(response.body).toHaveProperty('categoryBreakdown');
      expect(response.body).toHaveProperty('lastFiveTransactions');
      expect(Array.isArray(response.body.categoryBreakdown)).toBe(true);
      expect(Array.isArray(response.body.lastFiveTransactions)).toBe(true);
    });

    test('should calculate totals correctly', async () => {
      const response = await request(app).get('/api/stats/month').expect(200);

      expect(typeof response.body.totalThisMonth).toBe('number');
      expect(typeof response.body.totalLastMonth).toBe('number');
    });
  });

  describe('GET /api/expenses/export/csv', () => {
    beforeEach(async () => {
      const stmt = db.prepare(`
        INSERT INTO expenses (description, amount, category, date, payment_method, recurring)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run('Test expense', 25.50, 'Food', '2024-01-15', 'Card', 0);
    });

    test('should export expenses as CSV', async () => {
      const response = await request(app)
        .get('/api/expenses/export/csv')
        .expect(200)
        .expect('Content-Type', /text\/csv/);

      expect(response.text).toContain('id,description,amount,category,date,payment_method');
      expect(response.text).toContain('Test expense');
    });

    test('should respect filters in CSV export', async () => {
      const response = await request(app).get('/api/expenses/export/csv?category=Food').expect(200);
      expect(response.text).toContain('Food');
    });
  });
});