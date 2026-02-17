const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const prisma = require('./src/prisma');
const authRoutes = require('./src/routes/authRoutes');
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://syncroteamm.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/teams', require('./src/routes/teamRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));
app.use('/api/comments', require('./src/routes/commentRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/supervisor-groups', require('./src/routes/supervisorGroupRoutes'));
app.use('/api/projects', require('./src/routes/projectRoutes'));

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

async function main() {
    try {
        await prisma.$connect();
        console.log('Connected to database');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
}

main();
