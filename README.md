# Safe Piggy: A Personal Expense Tracker

A full-stack expense tracking application built with Node.js, Express, SQLite, and React.

## Tech Stack

**Backend:** Node.js, Express, SQLite (better-sqlite3)  
**Frontend:** React, Vite, Axios, Recharts

## Setup

### Prerequisites

- Node.js (v14+)
- npm (v6+)

### Backend

```bash
cd backend
npm install
node server.js
```

The server runs on `http://localhost:{PORT}`. The SQLite database is created automatically on first run.

### Frontend

```bash
cd frontend/safe-piggy
npm install
npm run dev
```

## Features

- Add, view, update, and delete expenses
- Filter by category and date range
- Sort by date or amount
- Dashboard with monthly totals, category breakdown, and recent transactions
- CSV export
- Recurring expense tracking
- Budget limits with warnings

## API Endpoints

| Method | Endpoint                   | Description                                                                           |
| ------ | -------------------------- | ------------------------------------------------------------------------------------- |
| GET    | `/api/expenses`            | Get all expenses (supports `category`, `startDate`, `endDate`, `sortBy` query params) |
| POST   | `/api/expenses`            | Create an expense                                                                     |
| PUT    | `/api/expenses/:id`        | Update an expense                                                                     |
| DELETE | `/api/expenses/:id`        | Delete an expense                                                                     |
| GET    | `/api/stats/month`         | Get monthly statistics                                                                |
| GET    | `/api/expenses/export/csv` | Export expenses as CSV                                                                |

## Project Structure

```
├── backend/
│   ├── db.js           # Database connection
│   ├── server.js       # Express server
│   ├── routes.js       # API routes
│   └── validation.js   # Input validation
├── frontend/safe-piggy/
│   ├── src/
│   │   ├── api.js      # API client
│   │   ├── App.jsx     # Main component
│   │   └── components/ # UI components
└── docs/
    └── process.md      # Development documentation
```

## Running Tests

**Backend:**

```bash
cd backend
npm test
```

**Frontend:**

```bash
cd frontend/safe-piggy
npm test
```

## Security

- SQL injection prevention via prepared statements
- Server-side input validation
- Proper error handling with appropriate HTTP status codes
