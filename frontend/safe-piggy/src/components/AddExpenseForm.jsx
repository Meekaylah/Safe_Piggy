// src/components/AddExpenseForm.jsx
import { useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer'];

function AddExpenseForm({ onAdd }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState(null);

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

    onAdd({
      description: description.trim(),
      amount: numericAmount,
      category,
      date,
      payment_method: paymentMethod,
      recurring,
    });

    setDescription('');
    setAmount('');
    setCategory('Food');
    setDate('');
    setPaymentMethod('Card');
    setRecurring(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', maxWidth: '400px' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>
          Description<br />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Groceries at Tesco"
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

      <button type="submit">Add Expense</button>
    </form>
  );
}

export default AddExpenseForm;
