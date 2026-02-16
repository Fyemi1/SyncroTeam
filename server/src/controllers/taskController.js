const prisma = require('../prisma');

const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assigneeIds, topics } = req.body;

        const taskData = {
            title,
            description,
            priority: priority || 'MEDIUM',
            dueDate: dueDate ? new Date(dueDate) : null,
            creatorId: req.user.id,
            status: 'OPEN',
        };

        // Handle Assignees
        if (assigneeIds && assigneeIds.length > 0) {
            taskData.assignees = {
                create: assigneeIds.map(userId => ({ userId: parseInt(userId) }))
            };
        }

        // Handle Topics
        if (topics && topics.length > 0) {
            taskData.topics = {
                create: topics.map((t, index) => ({
                    title: typeof t === 'string' ? t : t.title,
                    orderIndex: index
                })),
            };
        }

        const task = await prisma.task.create({
            data: taskData,
            include: {
                assignees: true,
                topics: true
            },
        });

        // Log History
        await prisma.taskHistory.create({
            data: {
                taskId: task.id,
                userId: req.user.id,
                action: 'CREATED',
                details: 'Task created'
            }
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTasks = async (req, res) => {
    try {
        const { status, priority, assigneeId } = req.query;
        const user = req.user;

        // Build filter
        const where = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;

        // Permission Logic: Supervisor Group Isolation
        if (user.role === 'ADMIN') {
            // Find groups owned by supervisor
            const supervisorGroups = await prisma.supervisorGroup.findMany({
                where: { supervisorId: user.id },
                include: { members: true }
            });

            const memberIds = supervisorGroups.flatMap(g => g.members.map(m => m.userId));
            // Include supervisor himself in the allowable list? Usually yes.
            memberIds.push(user.id);

            // Filter: Tasks created by supervisor OR assigned to members of his group
            where.OR = [
                { creatorId: user.id },
                { assignees: { some: { userId: { in: memberIds } } } }
            ];
        }
        // Logic for regular employees (can see tasks assigned to them or created by them)
        // If system is open, maybe they see everything? Assuming open for now, but good to restrict later.
        // For now, retaining existing behavior for non-admins (view all or filter) plus the explicit filters.

        // Explicit Filter by assignee (via relation) - effectively sub-filtering
        if (assigneeId) {
            // If admin, ensure assigneeId is in his group (optional strictness, but let's trust the UI filter first)
            where.assignees = {
                some: { userId: parseInt(assigneeId) }
            };
        }

        const tasks = await prisma.task.findMany({
            where,
            include: {
                creator: { select: { id: true, name: true } },
                assignees: {
                    include: { user: { select: { id: true, name: true } } }
                },
                topics: { orderBy: { orderIndex: 'asc' } }, // Include topics for progress calc
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({
            where: { id: parseInt(id) },
            include: {
                creator: { select: { id: true, name: true } },
                assignees: {
                    include: { user: { select: { id: true, name: true } } }
                },
                topics: {
                    orderBy: { orderIndex: 'asc' },
                    include: { completer: { select: { id: true, name: true } } } // Include completer info
                },
                comments: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                history: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            },
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, dueDate, assigneeIds } = req.body;

        const updateData = {
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate) : undefined,
        };

        // If assigning new people
        if (assigneeIds) {
            // Delete existing assignments (simple way)
            await prisma.taskAssignee.deleteMany({ where: { taskId: parseInt(id) } });
            updateData.assignees = {
                create: assigneeIds.map(userId => ({ userId: parseInt(userId) }))
            };
        }

        const task = await prisma.task.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { assignees: true }
        });

        // Log History
        await prisma.taskHistory.create({
            data: {
                taskId: task.id,
                userId: req.user.id,
                action: 'UPDATED',
                details: `Updated fields: ${Object.keys(req.body).join(', ')}`
            }
        });

        res.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleTopic = async (req, res) => {
    try {
        const { taskId, topicId } = req.params;
        const userId = req.user.id;
        console.log(`[DEBUG] Toggle Topic: Task ${taskId}, Topic ${topicId}, User ${userId}, Body:`, req.body);

        // 1. Get current topic status
        const topic = await prisma.taskTopic.findUnique({
            where: { id: parseInt(topicId) }
        });

        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        // 2. Determine new status
        // If DONE -> PENDING. If PENDING/IN_PROGRESS -> DONE.
        const newStatus = topic.status === 'DONE' ? 'PENDING' : 'DONE';

        const updateData = {
            status: newStatus,
            completedBy: newStatus === 'DONE' ? userId : null,
            completedAt: newStatus === 'DONE' ? new Date() : null
        };

        // 3. Update Topic
        const updatedTopic = await prisma.taskTopic.update({
            where: { id: parseInt(topicId) },
            data: updateData,
            include: { completer: { select: { id: true, name: true } } }
        });

        // 4. Log History
        await prisma.taskHistory.create({
            data: {
                taskId: parseInt(taskId),
                userId: userId,
                action: 'TOPIC_UPDATE',
                details: `Topic "${topic.title}" changed to ${newStatus}`
            }
        });

        // 5. Check Task Progress & Auto-Update Task Status
        const allTopics = await prisma.taskTopic.findMany({
            where: { taskId: parseInt(taskId) }
        });

        const total = allTopics.length;
        const completed = allTopics.filter(t => t.status === 'DONE').length;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

        // Auto-status logic
        let newTaskStatus = null;
        const task = await prisma.task.findUnique({ where: { id: parseInt(taskId) } });

        if (completed === total && task.status !== 'WAITING_APPROVAL' && task.status !== 'COMPLETED') {
            newTaskStatus = 'WAITING_APPROVAL';
        } else if (newStatus === 'PENDING' && task.status === 'WAITING_APPROVAL') {
            // Revert to IN_PROGRESS if unchecked
            newTaskStatus = 'IN_PROGRESS';
        } else if (newStatus === 'DONE' && task.status === 'OPEN') {
            newTaskStatus = 'IN_PROGRESS';
        }

        if (newTaskStatus) {
            await prisma.task.update({
                where: { id: parseInt(taskId) },
                data: { status: newTaskStatus }
            });
            // Log Status Change
            await prisma.taskHistory.create({
                data: {
                    taskId: parseInt(taskId),
                    userId: userId,
                    action: 'STATUS_AUTO_UPDATE',
                    details: `Status changed to ${newTaskStatus} (Topic Progress)`
                }
            });
        }

        res.json({
            topic: updatedTopic,
            taskProgress: progress,
            newTaskStatus
        });

    } catch (error) {
        console.error('Toggle topic error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    toggleTopic,
};
