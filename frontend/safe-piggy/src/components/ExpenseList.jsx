// src/components/ExpenseList.jsx

function ExpenseList({ expenses, onDelete, onEdit }) {
    if (!expenses || expenses.length === 0) {
      return <p>No expenses found. Try adding one above.</p>;
    }
  
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Description</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Amount (£)</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Category</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Date</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Payment</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Recurring</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td style={{ padding: '0.25rem 0.5rem' }}>{exp.description}</td>
              <td style={{ padding: '0.25rem 0.5rem' }}>£{Number(exp.amount).toFixed(2)}</td>
              <td style={{ padding: '0.25rem 0.5rem' }}>{exp.category}</td>
              <td style={{ padding: '0.25rem 0.5rem' }}>{exp.date}</td>
              <td style={{ padding: '0.25rem 0.5rem' }}>{exp.payment_method}</td>
              <td style={{ padding: '0.25rem 0.5rem' }}>
                {exp.recurring ? '✓' : ''}
              </td>
              <td style={{ padding: '0.25rem 0.5rem' }}>
                <button onClick={() => onEdit(exp)} style={{ marginRight: '0.5rem' }}>
                  Edit
                </button>
                <button onClick={() => onDelete(exp.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  
  export default ExpenseList;
  