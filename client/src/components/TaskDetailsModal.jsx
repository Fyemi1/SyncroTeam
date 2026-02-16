import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { X, CheckCircle, Circle, MessageSquare, Send, Clock, User, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { statusMap, priorityMap, priorityColors, statusColors } from '../lib/translations';

const TaskDetailsModal = ({ taskId, onClose, onTaskUpdated }) => {
    const [task, setTask] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            const data = await api.get(`/tasks/${taskId}`);
            setTask(data);
        } catch (error) {
            console.error('Erro ao buscar detalhes da tarefa', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            fetchTaskDetails(); // Refresh
            onTaskUpdated();
        } catch (error) {
            console.error('Erro ao atualizar status', error);
        }
    };

    const handleToggleTopic = async (topicId, currentStatus) => {
        const newStatus = currentStatus === 'DONE' ? 'PENDING' : 'DONE';

        // 1. Optimistic Update (UI)
        setTask(prev => ({
            ...prev,
            topics: prev.topics.map(t =>
                t.id === topicId ? { ...t, status: newStatus } : t
            )
        }));

        try {
            // 2. API Call
            const response = await api.patch(`/tasks/${taskId}/topics/${topicId}/toggle`, { status: newStatus });

            // 3. Update with real data (including who completed it)
            setTask(prev => ({
                ...prev,
                topics: prev.topics.map(t =>
                    t.id === topicId ? response.topic : t
                ),
                status: response.newTaskStatus || prev.status // Auto-update task status if changed
            }));

            if (response.newTaskStatus) {
                onTaskUpdated(); // Refresh parent list if status changed
            }

        } catch (error) {
            console.error('Erro ao alterar tópico', error);
            fetchTaskDetails(); // Revert on error
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            await api.post('/comments', { taskId, content: comment });
            setComment('');
            fetchTaskDetails(); // Refresh
        } catch (error) {
            console.error('Erro ao adicionar comentário', error);
        }
    };

    if (!task && !loading) return null;
    if (loading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-4 rounded">Carregando...</div></div>;

    const isCreator = currentUser.id === task.creatorId;
    const isAssignee = task.assignees?.some(a => a.userId === currentUser.id);
    const assignees = task.assignees || [];

    // Progress Calculation
    const totalTopics = task.topics?.length || 0;
    const completedTopics = task.topics?.filter(t => t.status === 'DONE').length || 0;
    const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col md:flex-row overflow-hidden">

                {/* Left Column: Main Task Info */}
                <div className="flex-1 flex flex-col h-full border-r overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start p-6 border-b">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className={cn("text-xs px-2 py-1 rounded-full font-medium", priorityColors[task.priority])}>
                                    {priorityMap[task.priority]}
                                </span>
                                <span className={cn("text-xs px-2 py-1 rounded-full font-medium",
                                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                        task.status === 'WAITING_APPROVAL' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800')}>
                                    {statusMap[task.status]}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 md:hidden">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Action Bar */}
                    <div className="px-6 py-2 bg-gray-50 border-b flex space-x-2">
                        {task.status === 'OPEN' && (isAssignee || isCreator) && (
                            <button onClick={() => handleStatusChange('IN_PROGRESS')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                Iniciar Tarefa
                            </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (isAssignee || isCreator) && (
                            <button onClick={() => handleStatusChange('WAITING_APPROVAL')} className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
                                Solicitar Aprovação
                            </button>
                        )}
                        {task.status === 'WAITING_APPROVAL' && (isCreator || currentUser.role === 'ADMIN') && (
                            <>
                                <button onClick={() => handleStatusChange('COMPLETED')} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                    Aprovar
                                </button>
                                <button onClick={() => handleStatusChange('IN_PROGRESS')} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                                    Rejeitar
                                </button>
                            </>
                        )}
                        {task.status === 'COMPLETED' && (isCreator || currentUser.role === 'ADMIN') && (
                            <button onClick={() => handleStatusChange('IN_PROGRESS')} className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                                Reabrir
                            </button>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="p-6 space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Descrição</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{task.description || 'Sem descrição.'}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">

                            <div>
                                <p className="text-xs text-gray-500">Data de Entrega</p>
                                <p className="font-medium">{task.dueDate ? format(new Date(task.dueDate), 'PPP', { locale: ptBR }) : 'Sem data'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Criador</p>
                                <p className="font-medium">{task.creator?.name}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Responsáveis</p>
                                <div className="flex flex-wrap gap-2">
                                    {assignees.length > 0 ? assignees.map((assignee, idx) => (
                                        <div key={idx} className="flex items-center space-x-1 bg-white px-2 py-1 rounded border shadow-sm">
                                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] text-blue-700 font-bold">
                                                {assignee.user.name.charAt(0)}
                                            </div>
                                            <span className="text-sm">{assignee.user.name}</span>
                                        </div>
                                    )) : <span className="text-gray-500">Não atribuído</span>}
                                </div>
                            </div>
                        </div>

                        {/* Topics / Checklist */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-gray-700 flex items-center space-x-2">
                                    <CheckSquare size={18} className="text-arteb-deepBlue" />
                                    <span>Checklist de Tópicos</span>
                                </h3>
                                <span className="text-xs font-bold text-arteb-deepBlue">{progress}% completo</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-arteb-vibrantYellow to-arteb-yellowLight h-3 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            {task.topics && task.topics.length > 0 ? (
                                <div className="space-y-3">
                                    {task.topics.map(topic => (
                                        <div key={topic.id}
                                            className={cn(
                                                "topic-item group flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200",
                                                topic.status === 'DONE' ? "bg-blue-50/50 border-blue-100" : "bg-white border-gray-200 hover:border-arteb-deepBlue/30 hover:shadow-sm"
                                            )}
                                            onClick={() => handleToggleTopic(topic.id, topic.status)}
                                        >
                                            <div className="mt-0.5">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all duration-300",
                                                    topic.status === 'DONE'
                                                        ? "bg-arteb-vibrantYellow border-arteb-vibrantYellow shadow-[0_0_5px_#FFD700]"
                                                        : "border-arteb-deepBlue bg-transparent group-hover:scale-110"
                                                )}>
                                                    {topic.status === 'DONE' && <CheckSquare size={14} className="text-arteb-deepBlue" strokeWidth={3} />}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn(
                                                    "text-sm font-medium transition-colors",
                                                    topic.status === 'DONE' ? "line-through text-gray-400" : "text-gray-700 group-hover:text-arteb-deepBlue"
                                                )}>
                                                    {topic.title}
                                                </p>
                                                {topic.status === 'DONE' && topic.completer && (
                                                    <p className="text-[10px] text-gray-400 mt-1 flex items-center">
                                                        <User size={10} className="mr-1" />
                                                        Concluído por {topic.completer.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-sm">Sem tópicos.</p>
                            )}
                        </div>

                        {/* Comments */}
                        <div>
                            <h3 className="flex items-center space-x-2 font-semibold text-gray-700 mb-4">
                                <MessageSquare size={18} />
                                <span>Comentários</span>
                            </h3>

                            <div className="space-y-4 mb-4">
                                {task.comments && task.comments.map(comment => (
                                    <div key={comment.id} className="flex space-x-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                            {comment.user.name.charAt(0)}
                                        </div>
                                        <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none flex-1">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="font-semibold text-sm">{comment.user.name}</span>
                                                <span className="text-xs text-gray-500">{format(new Date(comment.createdAt), 'd MMM, HH:mm', { locale: ptBR })}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!task.comments || task.comments.length === 0) && (
                                    <p className="text-gray-500 italic text-sm text-center py-4">Nenhum comentário por enquanto.</p>
                                )}
                            </div>

                            <form onSubmit={handleAddComment} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Adicione um comentário..."
                                    className="flex-1 border p-2 rounded focus:outline-none focus:border-blue-500"
                                />
                                <button type="submit" disabled={!comment.trim()} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50">
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column: History & Meta (Visible on Desktop) */}
                <div className="hidden md:flex w-80 bg-gray-50 flex-col h-full border-l">
                    <div className="p-4 border-b flex justify-between items-center bg-white">
                        <span className="font-bold text-gray-700 flex items-center space-x-2">
                            <Clock size={16} />
                            <span>Histórico</span>
                        </span>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {task.history && task.history.length > 0 ? (
                            task.history.map(entry => (
                                <div key={entry.id} className="text-sm">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                                            {entry.user.name.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-gray-800">{entry.user.name}</span>
                                        <span className="text-xs text-gray-500">{format(new Date(entry.createdAt), 'HH:mm')}</span>
                                    </div>
                                    <p className="text-gray-600 ml-6 bg-white p-2 rounded shadow-sm border border-gray-100">
                                        <span className="font-medium text-xs text-blue-600 block mb-1">{entry.action}</span>
                                        {entry.details}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center italic text-sm">Sem histórico.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TaskDetailsModal;
