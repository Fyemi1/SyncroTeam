import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, Clock, AlertTriangle, List } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0,
        byPriority: [],
        byStatus: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const tasks = await api.get('/tasks');

            const total = tasks.length;
            const completed = tasks.filter(t => t.status === 'COMPLETED').length;
            const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'WAITING_APPROVAL').length;
            const overdue = tasks.filter(t => t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED')).length;

            const priorityCount = { HIGH: 0, MEDIUM: 0, LOW: 0 };
            tasks.forEach(t => priorityCount[t.priority]++);
            const byPriority = [
                { name: 'Alta', value: priorityCount.HIGH },
                { name: 'Média', value: priorityCount.MEDIUM },
                { name: 'Baixa', value: priorityCount.LOW },
            ];

            const statusCount = { OPEN: 0, IN_PROGRESS: 0, WAITING_APPROVAL: 0, COMPLETED: 0 };
            tasks.forEach(t => statusCount[t.status] = (statusCount[t.status] || 0) + 1);
            const byStatus = [
                { name: 'Aberto', value: statusCount.OPEN },
                { name: 'Em Progresso', value: statusCount.IN_PROGRESS },
                { name: 'Aguardando', value: statusCount.WAITING_APPROVAL },
                { name: 'Concluído', value: statusCount.COMPLETED },
            ];

            setStats({ total, completed, inProgress, overdue, byPriority, byStatus });
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard', error);
        }
    };

    const COLORS = ['#003366', '#FFD700', '#FFBB28', '#8884d8']; // DeepBlue, VibrantYellow, etc
    const PRIORITY_COLORS = { HIGH: '#FF0000', MEDIUM: '#FFD700', LOW: '#00C49F' }; // Custom mapped

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-arteb-deepBlue tracking-wide">Dashboard</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-arteb-deepBlue flex items-center justify-between hover:shadow-lg transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total de Tarefas</p>
                        <p className="text-3xl font-bold text-arteb-deepBlue">{stats.total}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full text-arteb-deepBlue">
                        <List size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 flex items-center justify-between hover:shadow-lg transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Concluídas</p>
                        <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full text-green-600">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-arteb-vibrantYellow flex items-center justify-between hover:shadow-lg transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Em Progresso</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-full text-yellow-600">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 flex items-center justify-between hover:shadow-lg transition-shadow">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Atrasadas</p>
                        <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-full text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-arteb-deepBlue">Tarefas por Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.byStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.byStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-arteb-deepBlue">Tarefas por Prioridade</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.byPriority}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: '#f0f0f0' }} />
                                <Bar dataKey="value" fill="#003366" radius={[4, 4, 0, 0]}>
                                    {stats.byPriority.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ff4d4f' : index === 1 ? '#FFD700' : '#003366'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
