const prisma = require('../prisma');

const listProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { creatorId: req.user.id },
                    { tasks: { some: { assignees: { some: { userId: req.user.id } } } } } // Visible if tasked
                ],
                isArchived: false
            },
            include: {
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        console.error('Error listing projects:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createProject = async (req, res) => {
    try {
        const { name, description, color, icon } = req.body;

        const project = await prisma.project.create({
            data: {
                name,
                description,
                color,
                icon,
                creatorId: req.user.id,
                teamId: req.body.teamId ? parseInt(req.body.teamId) : null,
                supervisorGroupId: req.body.supervisorGroupId ? parseInt(req.body.supervisorGroupId) : null
            }
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', JSON.stringify(error, null, 2));
        res.status(500).json({ message: error.message || 'Server error', details: error });
    }
};

const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, icon } = req.body;

        // Verify ownership
        const existing = await prisma.project.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ message: 'Project not found' });

        // Only creator or admin can update
        // For simplicity, assuming caller is authorized if they can see it (refine later)

        const project = await prisma.project.update({
            where: { id: parseInt(id) },
            data: { name, description, color, icon }
        });

        res.json(project);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete (archive) or hard delete?
        // Let's hard delete for now, or check for tasks

        await prisma.project.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    listProjects,
    createProject,
    updateProject,
    deleteProject
};
