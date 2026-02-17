const prisma = require('../prisma');

const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { team: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const user = req.user;
        const where = {};

        // If Supervisor (ADMIN), they should see ALL users now to manage the team.
        // Previously limited to group members, but that hid new users.
        if (user.role === 'ADMIN') {
            // No filter needed, ADMIN sees all.
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                teamId: true,
                team: {
                    select: { name: true },
                },
            },
        });
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    getAllUsers,
};
