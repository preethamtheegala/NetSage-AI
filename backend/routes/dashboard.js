const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalytics, getResponsibleAI } = require('../controllers/analyticsController');

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/responsible-ai', getResponsibleAI);

module.exports = router;
