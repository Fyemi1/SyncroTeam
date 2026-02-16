import { useState, useEffect } from 'react';
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

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const data = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error('Erro ao buscar tarefas', error);
        }
    };

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

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Calendário</h2>
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

            <div className="flex-1 bg-white rounded shadow overflow-hidden flex flex-col">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b bg-gray-50">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                        <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {days.map(day => {
                        const dayTasks = getTasksForDay(day);
                        return (
                            <div
                                key={day.toString()}
                                className={`border-b border-r p-2 min-h-[100px] ${!isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="mt-1 space-y-1">
                                    {dayTasks.map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            className={`text-xs p-1 rounded cursor-pointer truncate ${priorityColors[task.priority]}`}
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
