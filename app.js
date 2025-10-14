// 
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process'); // For calling Python script
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const governmentAuthRoutes = require('./routes/governmentAuthRoutes');
const issueRoutes = require('./routes/issueRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/error.middleware');
const { handleValidationErrors } = require('./middleware/validation.middleware');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Civic Engagement Platform API!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/government', governmentAuthRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);

// Weather Forecast Route
app.post('/api/weather/forecast', (req, res) => {
  const inputData = req.body;

  // Validate input data
  if (!inputData || typeof inputData !== 'object') {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  // Sanitize input data to prevent command injection
  const sanitizedInput = JSON.stringify(inputData).replace(/[^a-zA-Z0-9\s.,-]/g, '');

  // Call the Python script
  const command = `python3 ${__dirname}/weather_forecast.py '${sanitizedInput}'`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to execute Python script' });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: 'Python script error' });
    }

    try {
      // Parse the output from the Python script
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing Python script output:', parseError);
      res.status(500).json({ error: 'Failed to parse Python script output' });
    }
  });
});

// Error handling middleware
app.use(handleValidationErrors);
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});