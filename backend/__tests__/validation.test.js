const { validateExpensePayload, VALID_CATEGORIES, VALID_PAYMENT_METHODS } = require('../validation');

describe('validateExpensePayload', () => {
  const validPayload = {
    description: 'Test expense',
    amount: 25.50,
    category: 'Food',
    date: '2024-01-15',
    payment_method: 'Card',
    recurring: false,
  };

  test('should validate a correct payload', () => {
    const result = validateExpensePayload(validPayload);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.parsed.description).toBe('Test expense');
    expect(result.parsed.amount).toBe(25.50);
  });

  test('should reject missing description', () => {
    const payload = { ...validPayload, description: '' };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Description is required.');
  });

  test('should reject description with only whitespace', () => {
    const payload = { ...validPayload, description: '   ' };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Description is required.');
  });

  test('should reject invalid amount (negative)', () => {
    const payload = { ...validPayload, amount: -10 };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be a positive number.');
  });

  test('should reject invalid amount (zero)', () => {
    const payload = { ...validPayload, amount: 0 };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be a positive number.');
  });

  test('should reject invalid amount (NaN)', () => {
    const payload = { ...validPayload, amount: 'not a number' };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be a positive number.');
  });

  test('should reject invalid category', () => {
    const payload = { ...validPayload, category: 'InvalidCategory' };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid category.');
  });

  test('should accept all valid categories', () => {
    VALID_CATEGORIES.forEach((category) => {
      const payload = { ...validPayload, category };
      const result = validateExpensePayload(payload);
      expect(result.isValid).toBe(true);
    });
  });

  test('should reject invalid payment method', () => {
    const payload = { ...validPayload, payment_method: 'InvalidMethod' };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid payment method.');
  });

  test('should accept all valid payment methods', () => {
    VALID_PAYMENT_METHODS.forEach((method) => {
      const payload = { ...validPayload, payment_method: method };
      const result = validateExpensePayload(payload);
      expect(result.isValid).toBe(true);
    });
  });

  test('should reject invalid date', () => {
    const payload = { ...validPayload, date: 'invalid-date' };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid date format. Use ISO date string.');
  });

  test('should reject missing date', () => {
    const payload = { ...validPayload, date: null };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid date format. Use ISO date string.');
  });

  test('should convert recurring boolean to integer', () => {
    const payloadTrue = { ...validPayload, recurring: true };
    const resultTrue = validateExpensePayload(payloadTrue);
    expect(resultTrue.parsed.recurring).toBe(1);

    const payloadFalse = { ...validPayload, recurring: false };
    const resultFalse = validateExpensePayload(payloadFalse);
    expect(resultFalse.parsed.recurring).toBe(0);
  });

  test('should return multiple errors for multiple invalid fields', () => {
    const payload = {
      description: '',
      amount: -5,
      category: 'Invalid',
      date: 'invalid',
      payment_method: 'Invalid',
    };
    const result = validateExpensePayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

