const Database = require('better-sqlite3');

const db = new Database('./safe-piggy.db', { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    payment_method TEXT NOT NULL
  );
`);

module.exports = db;
