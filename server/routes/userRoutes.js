const express = require('express');
const router = express.Router();
const { getUsers, registerUser, loginUser, getMe } = require('../controllers/userController');
const demoAuth = require('../middleware/demoAuth');

router.get('/', getUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', demoAuth, getMe);

module.exports = router;
