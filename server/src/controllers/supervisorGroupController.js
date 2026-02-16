const prisma = require('../prisma');

const createGroup = async (req, res) => {
    try {
        const { name, memberIds } = req.body;
        const supervisorId = req.user.id; // From auth middleware

        const group = await prisma.supervisorGroup.create({
            data: {
                name,
                supervisorId,
                members: {
                    create: memberIds.map(userId => ({ userId }))
                }
            },
            include: {
                members: {
                    include: { user: true }
                }
            }
        });

        res.status(201).json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const groups = await prisma.supervisorGroup.findMany({
            where: { supervisorId: userId },
            include: {
                members: {
                    include: { user: true }
                }
            }
        });

        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, memberIds } = req.body; // memberIds: [1, 2, 3] (full list of members)

        // First, clear existing members (simplest approach for now)
        await prisma.supervisorGroupMember.deleteMany({
            where: { supervisorGroupId: parseInt(id) }
        });

        const group = await prisma.supervisorGroup.update({
            where: { id: parseInt(id) },
            data: {
                name,
                members: {
                    create: memberIds.map(userId => ({ userId }))
                }
            },
            include: {
                members: {
                    include: { user: true }
                }
            }
        });

        res.json(group);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.supervisorGroup.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Group deleted' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createGroup,
    getMyGroups,
    updateGroup,
    deleteGroup
};
