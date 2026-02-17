/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { priorityColors } from '../lib/translations';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            const data = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error('Erro ao buscar tarefas', error);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getTasksForDay = (day) => {
        return tasks.filter(task =>
            task.dueDate && isSameDay(new Date(task.dueDate), day)
        );
    };

    const [view, setView] = useState('month'); // 'month' or 'list'

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Calendário</h2>

                <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setView('month')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'month' ? 'bg-white text-arteb-deepBlue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Mês
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'list' ? 'bg-white text-arteb-deepBlue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Lista
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-semibold w-40 text-center capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {view === 'month' ? (
                <div className="flex-1 bg-white rounded shadow overflow-hidden flex flex-col">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b bg-gray-50">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
                                {day.slice(0, 3)}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
                        {days.map(day => {
                            const dayTasks = getTasksForDay(day);
                            return (
                                <div
                                    key={day.toString()}
                                    className={`border-b border-r p-1 md:p-2 min-h-[80px] md:min-h-[100px] ${!isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-xs md:text-sm ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center' : ''}`}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    <div className="mt-1 space-y-1">
                                        {dayTasks.map(task => (
                                            <div
                                                key={task.id}
                                                onClick={() => setSelectedTask(task)}
                                                className={`text-[10px] md:text-xs p-1 rounded cursor-pointer truncate ${priorityColors[task.priority] || 'bg-blue-100 text-blue-800'}`}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-white rounded shadow overflow-y-auto p-4">
                    <div className="space-y-4">
                        {days.filter(day => isSameMonth(day, monthStart)).map(day => {
                            const dayTasks = getTasksForDay(day);
                            if (dayTasks.length === 0) return null; // Hide empty days in list view

                            return (
                                <div key={day.toString()} className="border-b last:border-0 pb-4">
                                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {format(day, 'd')}
                                        </span>
                                        <span className="capitalize">{format(day, 'EEEE', { locale: ptBR })}</span>
                                    </h3>
                                    <div className="space-y-2 pl-10">
                                        {dayTasks.map(task => (
                                            <div
                                                key={task.id}
                                                onClick={() => setSelectedTask(task)}
                                                className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${priorityColors[task.priority] || 'bg-white border-gray-200'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium text-sm text-gray-800">{task.title}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-white/50 border border-black/5">
                                                        {format(new Date(task.dueDate), 'HH:mm')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {days.every(day => !isSameMonth(day, monthStart) || getTasksForDay(day).length === 0) && (
                            <div className="text-center text-gray-500 py-10">
                                Nenhuma tarefa para este mês.
                            </div>
                        )}
                    </div>
                </div>
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

export default CalendarView;
