const express = require('express');
const router = express.Router();
const demoAuth = require('../middleware/demoAuth');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', demoAuth, createItem);
router.put('/:id', demoAuth, updateItem);
router.delete('/:id', demoAuth, deleteItem);

module.exports = router;
