const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const messageRoutes = require('./messageRoutes');
const fileRoutes = require('./fileRoutes');
const activityRoutes = require('./activityRoutes');

// API Routes
router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/files', fileRoutes);
router.use('/activity', activityRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling for invalid routes
router.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = router; 