const express = require('express');
const cors = require('cors');
require('dotenv').config();

const codeReviewRoutes = require('./routes/codeReview');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/review', codeReviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Micro AI Code Reviewer is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Micro AI Code Reviewer listening on port ${PORT}`);
});

module.exports = app;