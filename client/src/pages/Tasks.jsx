/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';

import { api } from '../lib/api';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import ProjectBoard from '../components/ProjectBoard';
import CreateProjectModal from '../components/CreateProjectModal';
import { Plus, Filter, X, LayoutGrid, Kanban } from 'lucide-react'; // Added icons
import { statusMap, priorityMap } from '../lib/translations';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]); // Projects state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false); // Project Modal
    const [selectedTask, setSelectedTask] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'board'

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('');

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const fetchTasks = useCallback(async () => {
        try {
            let query = '/tasks?';
            if (statusFilter) query += `status=${statusFilter}&`;
            if (priorityFilter) query += `priority=${priorityFilter}&`;
            if (assigneeFilter) query += `assigneeId=${assigneeFilter}&`;

            const data = await api.get(query);
            setTasks(data);
        } catch (error) {
            console.error('Falha ao buscar tarefas', error);
        }
    }, [statusFilter, priorityFilter, assigneeFilter]);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Falha ao buscar usuários', error);
        }
    }, []);

    const fetchProjects = useCallback(async () => {
        try {
            const data = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            console.error('Falha ao buscar projetos', error);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        fetchUsers();
        fetchProjects();
    }, [fetchTasks, fetchUsers, fetchProjects]);

    const handleTaskCreated = () => {
        fetchTasks();
    };

    const handleProjectCreated = () => {
        fetchProjects();
    };

    const handleTaskMove = async (taskId, projectId, position) => {
        try {
            // Update local state first (optional for smoothness, handled by Board mostly)
            // Call API
            await api.patch(`/tasks/${taskId}/move`, { projectId, position });
            fetchTasks(); // Refresh to sync
        } catch (error) {
            console.error("Failed to move task", error);
            alert("Falha ao mover tarefa");
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("Tem certeza que deseja excluir este projeto? As tarefas serão desatribuídas.")) return;
        try {
            await api.delete(`/projects/${projectId}`);
            fetchProjects();
            fetchTasks(); // To update unassigned tasks
        } catch (error) {
            console.error("Failed to delete project", error);
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

    return (
        <div className="flex flex-col h-full"> {/* Ensure full height for board */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex justify-between w-full md:w-auto items-center gap-4">
                    <h2 className="text-2xl font-bold text-arteb-deepBlue tracking-wide">Tarefas</h2>

                    {/* View Toggles */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setView('list')}
                            className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-white shadow text-arteb-deepBlue' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Lista"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setView('board')}
                            className={`p-1.5 rounded transition-colors ${view === 'board' ? 'bg-white shadow text-arteb-deepBlue' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Projetos (Board)"
                        >
                            <Kanban size={20} />
                        </button>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded ml-auto"
                    >
                        <Filter size={24} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-stretch md:items-center">

                    {/* Filters Container */}
                    <div className={`${isFiltersOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-2 w-full md:w-auto`}>
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
                            <button onClick={clearFilters} className="text-gray-500 hover:text-red-500 p-2 flex items-center justify-center" title="Limpar Filtros">
                                <X size={20} />
                                <span className="md:hidden ml-2">Limpar Filtros</span>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center space-x-2 bg-arteb-vibrantYellow text-arteb-deepBlue font-bold px-4 py-2 rounded shadow-md hover:bg-arteb-yellowLight transition-all whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span className="hidden md:inline">Nova Tarefa</span>
                        <span className="md:hidden">Nova Tarefa</span>
                    </button>
                </div>
            </div>

            {view === 'board' ? (
                <div className="flex-1 overflow-hidden">
                    <ProjectBoard
                        tasks={tasks}
                        projects={projects}
                        onTaskMove={handleTaskMove}
                        onProjectCreate={() => setIsProjectModalOpen(true)}
                        onProjectDelete={handleDeleteProject}
                        fetchTrigger={fetchTasks}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                    {tasks.map(task => (
                        <div key={task.id} onClick={() => handleTaskClick(task)}>
                            <TaskCard task={task} />
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-10">Nenhuma tarefa encontrada.</p>
                    )}
                </div>
            )}

            {isModalOpen && (
                <CreateTaskModal
                    onClose={() => setIsModalOpen(false)}
                    onTaskCreated={handleTaskCreated}
                />
            )}

            {isProjectModalOpen && (
                <CreateProjectModal
                    onClose={() => setIsProjectModalOpen(false)}
                    onProjectCreated={handleProjectCreated}
                />
            )}

            {selectedTask && (
                <TaskDetailsModal
                    taskId={selectedTask.id}
                    onClose={() => setSelectedTask(null)}
                    onTaskUpdated={fetchTasks}
                />
            )}
        </div>
    );
};

export default Tasks;
