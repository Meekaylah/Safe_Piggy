import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseList from '../components/ExpenseList';

describe('ExpenseList', () => {
  const mockExpenses = [
    {
      id: 1,
      description: 'Groceries',
      amount: 45.50,
      category: 'Food',
      date: '2024-01-15',
      payment_method: 'Card',
      recurring: 0,
    },
    {
      id: 2,
      description: 'Bus ticket',
      amount: 5.00,
      category: 'Transport',
      date: '2024-01-20',
      payment_method: 'Cash',
      recurring: 1,
    },
  ];

  it('renders empty state when no expenses', () => {
    render(<ExpenseList expenses={[]} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText(/no expenses found/i)).toBeInTheDocument();
  });

  it('renders expenses table with correct data', () => {
    render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Bus ticket')).toBeInTheDocument();
    expect(screen.getByText('£45.50')).toBeInTheDocument();
    expect(screen.getByText('£5.00')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('displays recurring indicator for recurring expenses', () => {
    render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onEdit={vi.fn()} />);

    // Check for recurring indicator (✓ symbol)
    const rows = screen.getAllByRole('row');
    const recurringRow = rows.find((row) => row.textContent.includes('Bus ticket'));
    expect(recurringRow).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const mockOnEdit = vi.fn();
    const user = userEvent.setup();
    render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onEdit={mockOnEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockExpenses[0]);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const mockOnDelete = vi.fn();
    const user = userEvent.setup();
    render(<ExpenseList expenses={mockExpenses} onDelete={mockOnDelete} onEdit={vi.fn()} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('renders all table headers', () => {
    render(<ExpenseList expenses={mockExpenses} onDelete={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Amount (£)')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Recurring')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles null expenses gracefully', () => {
    render(<ExpenseList expenses={null} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText(/no expenses found/i)).toBeInTheDocument();
  });
});

