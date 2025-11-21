// validation.js
const VALID_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other'];
const VALID_PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer'];

function validateExpensePayload(payload) {
  const errors = [];

  const { description, amount, category, date, payment_method, recurring } = payload;

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required.');
  }

  const numAmount = Number(amount);
  if (Number.isNaN(numAmount) || numAmount <= 0) {
    errors.push('Amount must be a positive number.');
  }

  if (!VALID_CATEGORIES.includes(category)) {
    errors.push('Invalid category.');
  }

  if (!VALID_PAYMENT_METHODS.includes(payment_method)) {
    errors.push('Invalid payment method.');
  }

  if (!date || Number.isNaN(Date.parse(date))) {
    errors.push('Invalid date format. Use ISO date string.');
  }

  const recurringFlag = recurring ? 1 : 0;

    return {
        isValid: errors.length === 0,
        errors,
        parsed: {
            description,
            amount: numAmount,
            category,
            date,
            payment_method,
            recurring: recurringFlag,
        },
    };
}

module.exports = {
  validateExpensePayload,
  VALID_CATEGORIES,
  VALID_PAYMENT_METHODS,
};
