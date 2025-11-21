// src/components/Dashboard.jsx
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Legend,
  } from 'recharts';
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
  
  function Dashboard({ stats, total, budgets }) {
    if (!stats) {
      return <p>Loading dashboard...</p>;
    }
  
    const {
      totalThisMonth = 0,
      totalLastMonth = 0,
      categoryBreakdown = [],
      lastFiveTransactions = [],
    } = stats;
  
    const diff = totalThisMonth - totalLastMonth;
    const diffLabel =
      diff > 0
        ? `↑ Up £${diff.toFixed(2)} vs last month`
        : diff < 0
        ? `↓ Down £${Math.abs(diff).toFixed(2)} vs last month`
        : 'No change vs last month';
  
    const categoryData = categoryBreakdown.map((row) => ({
      name: row.category,
      value: Number(row.total),
    }));
  
    const monthlyData = [
      { name: 'Last month', total: totalLastMonth },
      { name: 'This month', total: totalThisMonth },
    ];
  
    // Budget warnings
    let overallWarning = null;
    if (budgets?.overallMonthly && totalThisMonth > budgets.overallMonthly) {
      overallWarning = `Warning: You have exceeded your monthly budget of £${budgets.overallMonthly.toFixed(
        2
      )}.`;
    }
  
    const categoryWarnings = [];
    if (budgets?.perCategory && categoryBreakdown.length > 0) {
      categoryBreakdown.forEach((row) => {
        const limit = budgets.perCategory[row.category];
        if (limit && row.total > limit) {
          categoryWarnings.push(
            `${row.category}: spent £${row.total.toFixed(
              2
            )}, over budget of £${limit.toFixed(2)}`
          );
        }
      });
    }
  
    return (
      <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
        <h2>Dashboard</h2>
        {overallWarning && (
          <div style={{ background: '#ffe5e5', padding: '0.5rem', marginBottom: '0.5rem' }}>
            {overallWarning}
          </div>
        )}
  
        {categoryWarnings.length > 0 && (
          <div style={{ background: '#fff4e5', padding: '0.5rem', marginBottom: '0.5rem' }}>
            <strong>Category budget warnings:</strong>
            <ul>
              {categoryWarnings.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
  
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div>
            <h3>Total spent this month</h3>
            <p>£{totalThisMonth.toFixed(2)}</p>
          </div>
  
          <div>
            <h3>Total spent last month</h3>
            <p>£{totalLastMonth.toFixed(2)}</p>
          </div>
  
          <div>
            <h3>Difference</h3>
            <p>{diffLabel}</p>
          </div>
        </div>
  
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ width: '300px', height: '300px' }}>
            <h3>Spending by category (this month)</h3>
            {categoryData.length === 0 ? (
              <p>No data for this month.</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
  
          <div style={{ width: '300px', height: '300px' }}>
            <h3>This month vs last month</h3>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        <div>
          <h3>Last 5 transactions</h3>
          {lastFiveTransactions.length === 0 ? (
            <p>No recent transactions.</p>
          ) : (
            <ul>
              {lastFiveTransactions.map((tx) => (
                <li key={tx.id}>
                  {tx.date} – {tx.description} – £{Number(tx.amount).toFixed(2)}
                  {tx.recurring ? ' (recurring)' : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
  
  export default Dashboard;
  