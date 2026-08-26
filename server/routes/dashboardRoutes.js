const express = require('express');
const router = express.Router();
const demoAuth = require('../middleware/demoAuth');
const { getDashboardStats } = require('../controllers/dashboardController');

router.get('/', demoAuth, getDashboardStats);

module.exports = router;
