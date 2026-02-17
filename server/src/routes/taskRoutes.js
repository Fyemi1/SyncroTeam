const express = require('express');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    toggleTopic,
    moveTask
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.patch('/:id/move', moveTask);
router.patch('/:taskId/topics/:topicId/toggle', toggleTopic);

module.exports = router;
