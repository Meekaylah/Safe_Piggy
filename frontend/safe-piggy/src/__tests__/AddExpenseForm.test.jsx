import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddExpenseForm from '../components/AddExpenseForm';

describe('AddExpenseForm', () => {
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<AddExpenseForm onAdd={mockOnAdd} />);

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/recurring expense/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add expense/i})).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm onAdd={mockOnAdd} />);

    await user.type(screen.getByLabelText(/description/i), 'Test Groceries');
    await user.type(screen.getByLabelText(/amount/i), '45.50');
    await user.type(screen.getByLabelText(/date/i), '2024-01-15');
    await user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith({
        description: 'Test Groceries',
        amount: 45.50,
        category: 'Food',
        date: '2024-01-15',
        payment_method: 'Card',
        recurring: false,
      });
    });
  });

  it('shows error when description is empty', async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm onAdd={mockOnAdd} />);

    await user.type(screen.getByLabelText(/amount/i), '25.00');
    await user.type(screen.getByLabelText(/date/i), '2024-01-15');
    await user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('shows error when amount is invalid', async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm onAdd={mockOnAdd} />);

    await user.type(screen.getByLabelText(/description/i), 'Test');
    await user.type(screen.getByLabelText(/amount/i), '-10');
    await user.type(screen.getByLabelText(/date/i), '2024-01-15');
    await user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(screen.getByText(/amount must be a positive number/i)).toBeInTheDocument();
    });

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('shows error when date is missing', async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm onAdd={mockOnAdd} />);

    await user.type(screen.getByLabelText(/description/i), 'Test');
    await user.type(screen.getByLabelText(/amount/i), '25.00');
    await user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
    });

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm onAdd={mockOnAdd} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    const amountInput = screen.getByLabelText(/amount/i);
    const dateInput = screen.getByLabelText(/date/i);

    await user.type(descriptionInput, 'Test Groceries');
    await user.type(amountInput, '45.50');
    await user.type(dateInput, '2024-01-15');
    await user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(descriptionInput.value).toBe('');
      expect(amountInput.value).toBe('');
      expect(dateInput.value).toBe('');
    });
  });

  it('handles recurring expense checkbox', async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm onAdd={mockOnAdd} />);

    await user.type(screen.getByLabelText(/description/i), 'Test');
    await user.type(screen.getByLabelText(/amount/i), '25.00');
    await user.type(screen.getByLabelText(/date/i), '2024-01-15');
    
    const recurringCheckbox = screen.getByLabelText(/recurring expense/i);
    await user.click(recurringCheckbox);
    
    await user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          recurring: true,
        })
      );
    });
  });

  it('allows category selection', async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm onAdd={mockOnAdd} />);

    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, 'Transport');

    await user.type(screen.getByLabelText(/description/i), 'Test');
    await user.type(screen.getByLabelText(/amount/i), '25.00');
    await user.type(screen.getByLabelText(/date/i), '2024-01-15');
    await user.click(screen.getByRole('button', { name: /add expense/i }));

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Transport',
        })
      );
    });
  });
});

