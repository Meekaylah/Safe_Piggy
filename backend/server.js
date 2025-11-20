require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

const routes = require('./routes');

app.use(cors());
app.use(express.json());

// Attach all routes with /api prefix
app.use('/api', routes);

app.get('/', (_, res) => {
  res.json({ message: 'Expense Tracker API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
