const express = require('express');
const { createTeam, getAllTeams, addMemberToTeam } = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTeam);
router.get('/', getAllTeams);
router.post('/:teamId/members', addMemberToTeam);

module.exports = router;
