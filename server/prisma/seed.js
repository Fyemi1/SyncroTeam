const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Clean up existing data (optional, but good for re-seeding)
    // await prisma.task.deleteMany({});
    // await prisma.supervisorGroup.deleteMany({});
    // await prisma.team.deleteMany({});
    // await prisma.user.deleteMany({});

    const password = await bcrypt.hash('123456', 10);

    // Create Users
    // Manager/Supervisor 1
    const manager = await prisma.user.upsert({
        where: { email: 'manager@example.com' },
        update: {},
        create: {
            email: 'manager@example.com',
            name: 'Alice Manager',
            password,
            role: 'ADMIN',
        },
    });

    // Supervisor 2
    const supervisor2 = await prisma.user.upsert({
        where: { email: 'supervisor2@example.com' },
        update: {},
        create: {
            email: 'supervisor2@example.com',
            name: 'Bob Supervisor',
            password,
            role: 'ADMIN',
        },
    });

    // Employees
    const emp1 = await prisma.user.upsert({
        where: { email: 'emp1@example.com' },
        update: {},
        create: {
            email: 'emp1@example.com',
            name: 'Charlie Dev',
            password,
            role: 'EMPLOYEE',
        },
    });

    const emp2 = await prisma.user.upsert({
        where: { email: 'emp2@example.com' },
        update: {},
        create: {
            email: 'emp2@example.com',
            name: 'David Designer',
            password,
            role: 'EMPLOYEE',
        },
    });

    const emp3 = await prisma.user.upsert({
        where: { email: 'emp3@example.com' },
        update: {},
        create: {
            email: 'emp3@example.com',
            name: 'Eve Tester',
            password,
            role: 'EMPLOYEE',
        },
    });

    // Create Teams (Departments)
    const devTeam = await prisma.team.create({
        data: {
            name: 'Engineering',
            description: 'Core development functionality',
            members: {
                connect: [{ id: manager.id }, { id: emp1.id }, { id: emp3.id }],
            },
        },
    });

    const designTeam = await prisma.team.create({
        data: {
            name: 'Design',
            description: 'UI/UX Design',
            members: {
                connect: [{ id: supervisor2.id }, { id: emp2.id }],
            },
        },
    });

    // Create Supervisor Groups
    const groupAlpha = await prisma.supervisorGroup.create({
        data: {
            name: 'Alpha Squad',
            supervisorId: manager.id,
            members: {
                create: [
                    { userId: emp1.id },
                    { userId: emp3.id }
                ]
            }
        }
    });

    const groupBeta = await prisma.supervisorGroup.create({
        data: {
            name: 'Design Crew',
            supervisorId: supervisor2.id,
            members: {
                create: [
                    { userId: emp2.id }
                ]
            }
        }
    });

    // Create Tasks
    // Task 1: Single Assignee, Topics
    await prisma.task.create({
        data: {
            title: 'Implement Authentication',
            description: 'Setup JWT and login screens',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            creatorId: manager.id,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
            assignees: {
                create: [{ userId: emp1.id }]
            },
            topics: {
                create: [
                    { title: 'Setup Backend Route', status: 'DONE' },
                    { title: 'Frontend Login Page', status: 'IN_PROGRESS' },
                    { title: 'Token Storage', status: 'PENDING' }
                ]
            }
        }
    });

    // Task 2: Multiple Assignees
    await prisma.task.create({
        data: {
            title: 'System Integration Test',
            description: 'Test interaction between modules',
            priority: 'MEDIUM',
            status: 'OPEN',
            creatorId: manager.id,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
            assignees: {
                create: [{ userId: emp1.id }, { userId: emp3.id }]
            },
            topics: {
                create: [
                    { title: 'Unit Tests', status: 'PENDING' },
                    { title: 'E2E Tests', status: 'PENDING' }
                ]
            }
        }
    });

    // Task 3: Waiting Approval
    await prisma.task.create({
        data: {
            title: 'Logo Redesign',
            description: 'New vector logo',
            priority: 'LOW',
            status: 'WAITING_APPROVAL',
            creatorId: supervisor2.id,
            dueDate: new Date(),
            assignees: {
                create: [{ userId: emp2.id }]
            },
            topics: {
                create: [
                    { title: 'Drafts', status: 'DONE' },
                    { title: 'Finalize', status: 'DONE' }
                ]
            }
        }
    });

    console.log('Seed completed successfully');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
