// src/components/Filters.jsx

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other'];

function Filters({ filters, onChange }) {
  const handleCategoryChange = (e) => {
    onChange({ category: e.target.value });
  };

  const handleStartDateChange = (e) => {
    onChange({ startDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    onChange({ endDate: e.target.value });
  };

  const handleSortChange = (e) => {
    onChange({ sortBy: e.target.value });
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
      <div>
        <label>
          Category<br />
          <select value={filters.category} onChange={handleCategoryChange}>
            <option value="">All</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Start date<br />
          <input
            type="date"
            value={filters.startDate}
            onChange={handleStartDateChange}
          />
        </label>
      </div>

      <div>
        <label>
          End date<br />
          <input
            type="date"
            value={filters.endDate}
            onChange={handleEndDateChange}
          />
        </label>
      </div>

      <div>
        <label>
          Sort by<br />
          <select value={filters.sortBy} onChange={handleSortChange}>
            <option value="date">Date (newest first)</option>
            <option value="amount">Amount (highest first)</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default Filters;
