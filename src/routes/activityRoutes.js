const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Activity Log Routes
router.get('/user', authenticate, activityController.getUserActivity);
router.get('/system', authenticate, isAdmin, activityController.getSystemActivity);
router.get('/stats', authenticate, isAdmin, activityController.getActivityStats);

module.exports = router; 