const express = require('express');
const { getProfile, getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.get('/', getAllUsers);

module.exports = router;
