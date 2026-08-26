const express = require('express');
const router = express.Router();
const demoAuth = require('../middleware/demoAuth');
const {
  getRequests,
  createRequest,
  updateRequestStatus,
  deleteRequest,
} = require('../controllers/requestController');

router.use(demoAuth);

router.get('/', getRequests);
router.post('/', createRequest);
router.put('/:id', updateRequestStatus);
router.delete('/:id', deleteRequest);

module.exports = router;
