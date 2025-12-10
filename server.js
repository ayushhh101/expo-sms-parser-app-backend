const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sms', require('./routes/sms'));
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/lifeevents', require('./routes/lifeevents'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/risks', require('./routes/risks'));
app.use('/api/weekly-budget', require('./routes/weeklyBudget'));
app.use('/api/jars', require('./routes/jars'));
app.use("/api/daily-challenges", require('./routes/dailyChallenges'));
app.use('/api/heatmap', require('./routes/heatmap'));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SMS Parser API is running!',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

