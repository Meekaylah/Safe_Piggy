import { useEffect, useState } from 'react';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchStats,
  exportExpensesCsv,
} from './api';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import Filters from './components/Filters';
import EditExpenseModal from './components/EditExpenseModal';
import BudgetSettings from './components/BudgetSettings';
import Dashboard from './components/Dashboard';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
  });
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('budgets');
    return saved
      ? JSON.parse(saved)
      : {
          overallMonthly: 0,
          perCategory: {},
        };
  });
  const [loading, setLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // ---- Data loading helpers ----
  const updateBudgets = (next) => {
    setBudgets(next);
    localStorage.setItem('budgets', JSON.stringify(next));
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await fetchExpenses(filters);
      setExpenses(data.expenses || []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error('Error loading expenses', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats', err);
      // we won't block the UI for stats errors
    }
  };

  // Load expenses whenever filters change
  useEffect(() => {
    loadExpenses();
  }, [filters]);

  // Load stats once on mount
  useEffect(() => {
    loadStats();
  }, []);

  // ---- Handlers passed to child components ----
  const handleAddExpense = async (formData) => {
    try {
      setError(null);
      await createExpense(formData);
      await loadExpenses();
      await loadStats();
    } catch (err) {
      console.error('Error creating expense', err);
      setError('Failed to create expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      setError(null);
      await deleteExpense(id);
      await loadExpenses();
      await loadStats();
    } catch (err) {
      console.error('Error deleting expense', err);
      setError('Failed to delete expense');
    }
  };

  const handleStartEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleUpdateExpense = async (updatedData) => {
    if (!editingExpense) return;

    try {
      setError(null);
      await updateExpense(editingExpense.id, updatedData);
      setEditingExpense(null);
      await loadExpenses();
      await loadStats();
    } catch (err) {
      console.error('Error updating expense', err);
      setError('Failed to update expense');
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleFiltersChange = (nextFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...nextFilters,
    }));
  };

  const handleExportCsv = async () => {
    try {
      const res = await exportExpensesCsv(filters);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'safe-piggy_expenses.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV', err);
      setError('Failed to export CSV');
    }
  };

  // ---- Render ----
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1rem' }}>
      <h1>Personal Expense Tracker</h1>

      {error && (
        <div style={{ marginBottom: '1rem', color: 'red' }}>
          {error}
        </div>
      )}

      {/* Budget settings */}
      <BudgetSettings budgets={budgets} onChange={updateBudgets} />

      {/* Dashboard */}
      <section style={{ marginBottom: '2rem' }}>
        <Dashboard stats={stats} total={total} budgets={budgets} />
      </section>

      {/* Add expense form */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Add Expense</h2>
        <AddExpenseForm onAdd={handleAddExpense} />
      </section>

      {/* Expense list */}
      <section>
        <h2>Expenses</h2>

        {/* Filters + Export */}
        <section style={{ marginBottom: '1.5rem' }}>
          <Filters filters={filters} onChange={handleFiltersChange} />
          <p><strong>Total spent:</strong> £{total.toFixed(2)}</p>
          <button onClick={handleExportCsv}>Export CSV</button>
        </section>
        
        {loading ? (
          <p>Loading expenses...</p>
        ) : (
          <ExpenseList
            expenses={expenses}
            onDelete={handleDeleteExpense}
            onEdit={handleStartEdit}
          />
        )}
      </section>

      {/* Edit modal (only shows when editingExpense !== null) */}
      <EditExpenseModal
        expense={editingExpense}
        onCancel={handleCancelEdit}
        onSave={handleUpdateExpense}
      />
    </div>
  );
}

export default App;
