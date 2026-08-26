const express = require('express');
const router = express.Router();
const { improveDescription } = require('../controllers/aiController');

router.post('/improve-description', improveDescription);

module.exports = router;
