const express = require('express');
const { createGroup, getMyGroups, updateGroup, deleteGroup } = require('../controllers/supervisorGroupController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createGroup);
router.get('/', getMyGroups);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

module.exports = router;
