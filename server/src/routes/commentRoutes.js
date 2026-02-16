const express = require('express');
const { addComment, getComments } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', addComment);
router.get('/:taskId', getComments); // OR GET /tasks/:taskId/comments

module.exports = router;
