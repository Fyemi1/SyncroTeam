const express = require('express');
const router = express.Router();
const { listProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', listProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
