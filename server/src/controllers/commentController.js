const prisma = require('../prisma');

const addComment = async (req, res) => {
    try {
        const { taskId, content } = req.body;

        const comment = await prisma.comment.create({
            data: {
                content,
                taskId: parseInt(taskId),
                userId: req.user.id,
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getComments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const comments = await prisma.comment.findMany({
            where: { taskId: parseInt(taskId) },
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(comments);
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addComment,
    getComments,
};
