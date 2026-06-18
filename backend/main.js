require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./Models');

// Route Imports
const authRoutes = require('./Routes/authRoutes');
const projectRoutes = require('./Routes/projectRoutes');
const bugRoutes = require('./Routes/bugRoutes');
const commentRoutes = require('./Routes/commentRoutes');
const dashboardRoutes = require('./Routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Bug Tracking System API is online' });
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Database Synchronization and Server Startup
const startServer = async () => {
  try {
    // Authenticate connection
    await sequelize.authenticate();
    console.log('Successfully connected to the database.');

    // Sync database models (alter tables to match schema without dropping data)
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection or synchronization failed:', error);
    console.log(`Fallback: Starting Express server on port ${PORT} without active DB connection.`);
    
    // Start server anyway so that health checks or configuration debugging is possible
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (Disconnected Mode)`);
    });
  }
};

startServer();