const prisma = require('../prisma');

const createTeam = async (req, res) => {
    try {
        const { name, description } = req.body;

        const team = await prisma.team.create({
            data: {
                name,
                description,
            },
        });

        res.status(201).json(team);
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllTeams = async (req, res) => {
    try {
        const teams = await prisma.team.findMany({
            include: {
                members: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        res.json(teams);
    } catch (error) {
        console.error('Get all teams error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addMemberToTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body;

        const user = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { teamId: parseInt(teamId) },
        });

        res.json({ message: 'User added to team', user });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createTeam,
    getAllTeams,
    addMemberToTeam,
};
