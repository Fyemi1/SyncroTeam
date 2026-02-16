import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { statusMap, priorityMap, statusColors, priorityColors } from '../lib/translations';

const TaskCard = ({ task, onClick }) => {
    const assignees = task.assignees || [];

    return (
        <div
            onClick={() => onClick(task)}
            className={cn(
                "bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-arteb-deepBlue/30 transition-all duration-300 cursor-pointer relative overflow-hidden group",
                // Status indicator colored left border
                task.status === 'COMPLETED' ? 'border-l-4 border-l-green-500' :
                    task.status === 'WAITING_APPROVAL' ? 'border-l-4 border-l-purple-500' :
                        task.status === 'IN_PROGRESS' ? 'border-l-4 border-l-arteb-vibrantYellow' :
                            'border-l-4 border-l-gray-300'
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 line-clamp-1 flex-1">{task.title}</h3>
                <span className={cn("text-xs px-2 py-1 rounded-full font-medium ml-2", priorityColors[task.priority])}>
                    {priorityMap[task.priority]}
                </span>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[40px]">{task.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <div className="flex items-center -space-x-2 overflow-hidden py-1">
                    {assignees.length > 0 ? (
                        assignees.slice(0, 3).map((assignee, index) => (
                            <div key={index} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-700" title={assignee.user.name}>
                                {assignee.user.name.charAt(0)}
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-400 italic">Sem resp.</span>
                    )}
                    {assignees.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                            +{assignees.length - 3}
                        </div>
                    )}
                </div>

                {task.dueDate && (
                    <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded">
                        <Calendar size={14} />
                        <span>{format(new Date(task.dueDate), 'd MMM', { locale: ptBR })}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
