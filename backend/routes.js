const express = require('express');
const router = express.Router();
const db = require('./db');
const { validateExpensePayload } = require('./validation');

// CREATE
router.post('/expenses', (req, res) => {
  try {
    const { isValid, errors, parsed } = validateExpensePayload(req.body);
    if (!isValid) return res.status(400).json({ errors });

    const stmt = db.prepare(`
      INSERT INTO expenses (description, amount, category, date, payment_method)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      parsed.description,
      parsed.amount,
      parsed.category,
      parsed.date,
      parsed.payment_method
    );

    const created = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ
router.get('/expenses', (req, res) => {
  try {
    const { category, startDate, endDate, sortBy } = req.query;

    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

    if (category) { query += ' AND category = ?'; params.push(category); }
    if (startDate) { query += ' AND date >= ?'; params.push(startDate); }
    if (endDate) { query += ' AND date <= ?'; params.push(endDate); }

    query += sortBy === 'amount' ? ' ORDER BY amount DESC' : ' ORDER BY date DESC';

    const expenses = db.prepare(query).all(...params);

    const totalRow = db
      .prepare('SELECT SUM(amount) as total FROM expenses WHERE 1=1')
      .get();

    res.json({ expenses, total: totalRow.total || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE
router.put('/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { isValid, errors, parsed } = validateExpensePayload(req.body);
    if (!isValid) return res.status(400).json({ errors });

    const exists = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!exists) return res.status(404).json({ error: 'Expense not found' });

    const stmt = db.prepare(`
      UPDATE expenses
      SET description=?, amount=?, category=?, date=?, payment_method=?
      WHERE id=?
    `);

    stmt.run(
      parsed.description,
      parsed.amount,
      parsed.category,
      parsed.date,
      parsed.payment_method,
      id
    );

    const updated = db.prepare('SELECT * FROM expenses WHERE id=?').get(id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE
router.delete('/expenses/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM expenses WHERE id=?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0)
      return res.status(404).json({ error: 'Expense not found' });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;