import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { Plus, Filter, X } from 'lucide-react';
import { statusMap, priorityMap } from '../lib/translations';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('');

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [statusFilter, priorityFilter, assigneeFilter]); // Re-fetch when filters change (server-side filtering)

    const fetchTasks = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (priorityFilter) params.append('priority', priorityFilter);
            if (assigneeFilter) params.append('assigneeId', assigneeFilter);

            const data = await api.get(`/tasks?${params.toString()}`);
            setTasks(data);
        } catch (error) {
            console.error('Erro ao buscar tarefas', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Erro ao buscar usuários', error);
        }
    };

    const clearFilters = () => {
        setStatusFilter('');
        setPriorityFilter('');
        setAssigneeFilter('');
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseDetails = () => {
        setSelectedTask(null);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-arteb-deepBlue tracking-wide">Tarefas</h2>

                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded p-2 bg-white text-sm focus:ring-2 focus:ring-arteb-deepBlue focus:border-transparent outline-none"
                    >
                        <option value="">Status: Todos</option>
                        <option value="OPEN">{statusMap.OPEN}</option>
                        <option value="IN_PROGRESS">{statusMap.IN_PROGRESS}</option>
                        <option value="WAITING_APPROVAL">{statusMap.WAITING_APPROVAL}</option>
                        <option value="COMPLETED">{statusMap.COMPLETED}</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="border rounded p-2 bg-white text-sm focus:ring-2 focus:ring-arteb-deepBlue focus:border-transparent outline-none"
                    >
                        <option value="">Prioridade: Todas</option>
                        <option value="LOW">{priorityMap.LOW}</option>
                        <option value="MEDIUM">{priorityMap.MEDIUM}</option>
                        <option value="HIGH">{priorityMap.HIGH}</option>
                        <option value="CRITICAL">{priorityMap.CRITICAL}</option>
                    </select>

                    {/* Assignee Filter */}
                    <select
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className="border rounded p-2 bg-white text-sm focus:ring-2 focus:ring-arteb-deepBlue focus:border-transparent outline-none"
                    >
                        <option value="">Responsável: Todos</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>

                    {(statusFilter || priorityFilter || assigneeFilter) && (
                        <button onClick={clearFilters} className="text-gray-500 hover:text-red-500 p-2" title="Limpar Filtros">
                            <X size={20} />
                        </button>
                    )}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-arteb-vibrantYellow text-arteb-deepBlue font-bold px-4 py-2 rounded shadow-md hover:bg-arteb-yellowLight transition-all whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span className="hidden md:inline">Nova Tarefa</span>
                        <span className="md:hidden">Nova</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={handleTaskClick}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-12 bg-gray-50 rounded border border-dashed">
                        <p className="mb-2">Nenhuma tarefa encontrada com os filtros atuais.</p>
                        {(statusFilter || priorityFilter || assigneeFilter) && (
                            <button onClick={clearFilters} className="text-blue-600 hover:underline text-sm">
                                Limpar filtros
                            </button>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <CreateTaskModal
                    onClose={() => setIsModalOpen(false)}
                    onTaskCreated={fetchTasks}
                />
            )}

            {selectedTask && (
                <TaskDetailsModal
                    taskId={selectedTask.id}
                    onClose={handleCloseDetails}
                    onTaskUpdated={fetchTasks}
                />
            )}
        </div>
    );
};

export default Tasks;
