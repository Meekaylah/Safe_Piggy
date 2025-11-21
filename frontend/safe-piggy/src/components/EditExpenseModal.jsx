// src/components/EditExpenseModal.jsx
import { useEffect, useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer'];

function EditExpenseModal({ expense, onCancel, onSave }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description || '');
      setAmount(expense.amount != null ? String(expense.amount) : '');
      setCategory(expense.category || 'Food');
      setDate(expense.date || '');
      setPaymentMethod(expense.payment_method || 'Card');
      setRecurring(Boolean(expense.recurring));
      setError(null);
    }
  }, [expense]);

  if (!expense) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    onSave({
      description: description.trim(),
      amount: numericAmount,
      category,
      date,
      payment_method: paymentMethod,
      recurring,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div style={{ background: 'white', padding: '1rem', maxWidth: '400px', width: '100%' }}>
        <h3>Edit Expense</h3>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem' }}>
          <div>
            <label>
              Description<br />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </div>

          <div>
            <label>
              Amount (£)<br />
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
          </div>

          <div>
            <label>
              Category<br />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Date<br />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <div>
            <label>
              Payment method<br />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
              />
              {' '}Recurring expense
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditExpenseModal;
