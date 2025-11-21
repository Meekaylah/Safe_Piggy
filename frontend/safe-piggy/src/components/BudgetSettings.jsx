// src/components/BudgetSettings.jsx
import { useState, useEffect } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other'];

function BudgetSettings({ budgets, onChange }) {
  const [overall, setOverall] = useState(budgets.overallMonthly || 0);
  const [perCategory, setPerCategory] = useState(budgets.perCategory || {});

  useEffect(() => {
    setOverall(budgets.overallMonthly || 0);
    setPerCategory(budgets.perCategory || {});
  }, [budgets]);

  const handleOverallChange = (e) => {
    const value = Number(e.target.value) || 0;
    setOverall(value);
    onChange({
      ...budgets,
      overallMonthly: value,
    });
  };

  const handleCategoryBudgetChange = (category, value) => {
    const num = Number(value) || 0;
    const nextPerCategory = {
      ...perCategory,
      [category]: num,
    };
    setPerCategory(nextPerCategory);
    onChange({
      ...budgets,
      perCategory: nextPerCategory,
    });
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1.5rem' }}>
      <h2>Budget Settings</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Overall monthly budget (£)<br />
          <input
            type="number"
            step="0.01"
            value={overall}
            onChange={handleOverallChange}
          />
        </label>
      </div>

      <div>
        <h3>Per-category monthly budgets</h3>
        {CATEGORIES.map((cat) => (
          <div key={cat} style={{ marginBottom: '0.5rem' }}>
            <label>
              {cat}: £
              <input
                type="number"
                step="0.01"
                value={perCategory[cat] || ''}
                onChange={(e) => handleCategoryBudgetChange(cat, e.target.value)}
                style={{ marginLeft: '0.25rem' }}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BudgetSettings;