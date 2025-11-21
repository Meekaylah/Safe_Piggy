const express = require('express');
const router = express.Router();
const db = require('./db');
const { validateExpensePayload } = require('./validation');

// CREATE
router.post('/expenses', (req, res) => {
  try {
    const { isValid, errors, parsed } = validateExpensePayload(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const stmt = db.prepare(`
      INSERT INTO expenses (description, amount, category, date, payment_method, recurring)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        parsed.description,
        parsed.amount,
        parsed.category,
        parsed.date,
        parsed.payment_method,
        parsed.recurring
    );

    const created = db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ (with filters + correct total)
router.get('/expenses', (req, res) => {
  try {
    const { category, startDate, endDate, sortBy } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (category) {
      where += ' AND category = ?';
      params.push(category);
    }

    if (startDate) {
      where += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      where += ' AND date <= ?';
      params.push(endDate);
    }

    const orderBy =
      sortBy === 'amount'
        ? 'ORDER BY amount DESC'
        : 'ORDER BY date DESC, id DESC';

    const expenses = db
      .prepare(`SELECT * FROM expenses ${where} ${orderBy}`)
      .all(...params);

    const totalRow = db
      .prepare(`SELECT SUM(amount) as total FROM expenses ${where}`)
      .get(...params);

    res.json({
      expenses,
      total: totalRow.total || 0,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/expenses/export/csv', (req, res) => {
    try {
      const { category, startDate, endDate, sortBy } = req.query;
  
      let where = 'WHERE 1=1';
      const params = [];
  
      if (category) {
        where += ' AND category = ?';
        params.push(category);
      }
      if (startDate) {
        where += ' AND date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        where += ' AND date <= ?';
        params.push(endDate);
      }
  
      const orderBy =
        sortBy === 'amount'
          ? 'ORDER BY amount DESC'
          : 'ORDER BY date DESC, id DESC';
  
      const rows = db
        .prepare(`SELECT * FROM expenses ${where} ${orderBy}`)
        .all(...params);
  
      // Build CSV string manually
      const header = 'id,description,amount,category,date,payment_method\n';
      const body = rows
        .map((r) =>
          [
            r.id,
            JSON.stringify(r.description), // wrap in quotes safely
            r.amount,
            r.category,
            r.date,
            r.payment_method,
          ].join(',')
        )
        .join('\n');
  
      const csv = header + body;
  
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
      res.send(csv);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// UPDATE
router.put('/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { isValid, errors, parsed } = validateExpensePayload(req.body);

    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const exists = db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(id);

    if (!exists) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const stmt = db.prepare(`
      UPDATE expenses
      SET description = ?, amount = ?, category = ?, date = ?, payment_method = ?, recurring = ?
      WHERE id = ?
    `);

    stmt.run(
      parsed.description,
      parsed.amount,
      parsed.category,
      parsed.date,
      parsed.payment_method,
      parsed.recurring,
      id
    );

    const updated = db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(id);

    res.json(updated);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE
router.delete('/expenses/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
  

// Helper for stats
function getMonthRange(offset = 0) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset; // 0 = this month, -1 = last month

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const start = firstDay.toISOString().slice(0, 10); // YYYY-MM-DD
  const end = lastDay.toISOString().slice(0, 10);

  return { start, end };
}

// STATS (note: NO /api prefix here)
router.get('/stats/month', (req, res) => {
  try {
    const { start: thisStart, end: thisEnd } = getMonthRange(0);
    const { start: lastStart, end: lastEnd } = getMonthRange(-1);

    const totalThisRow = db
      .prepare(
        'SELECT SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ?'
      )
      .get(thisStart, thisEnd);
    const totalThis = totalThisRow.total || 0;

    const totalLastRow = db
      .prepare(
        'SELECT SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ?'
      )
      .get(lastStart, lastEnd);
    const totalLast = totalLastRow.total || 0;

    const breakdown = db
      .prepare(
        `
        SELECT category, SUM(amount) as total
        FROM expenses
        WHERE date >= ? AND date <= ?
        GROUP BY category
      `
      )
      .all(thisStart, thisEnd);

    const lastFive = db
      .prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC LIMIT 5')
      .all();

    res.json({
      totalThisMonth: totalThis,
      totalLastMonth: totalLast,
      categoryBreakdown: breakdown,
      lastFiveTransactions: lastFive,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
