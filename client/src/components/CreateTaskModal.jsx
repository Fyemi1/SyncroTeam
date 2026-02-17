/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { X, Plus, Trash } from 'lucide-react';

const CreateTaskModal = ({ onClose, onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [assigneeIds, setAssigneeIds] = useState([]);
    const [topics, setTopics] = useState([]);
    const [newTopic, setNewTopic] = useState('');
    const [users, setUsers] = useState([]);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Erro ao buscar usuários', error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddTopic = () => {
        if (newTopic.trim()) {
            setTopics([...topics, newTopic.trim()]);
            setNewTopic('');
        }
    };

    const handleRemoveTopic = (index) => {
        setTopics(topics.filter((_, i) => i !== index));
    };

    const handleToggleAssignee = (userId) => {
        const id = String(userId);
        if (assigneeIds.includes(id)) {
            setAssigneeIds(assigneeIds.filter(aid => aid !== id));
        } else {
            setAssigneeIds([...assigneeIds, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', {
                title,
                description,
                priority,
                dueDate,
                assigneeIds, // Array of user IDs
                topics // Array of topic titles
            });
            onTaskCreated();
            onClose();
        } catch (error) {
            console.error('Falha ao criar tarefa', error);
            alert('Falha ao criar tarefa');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Nova Tarefa</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-2">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500"
                            rows="3"
                        />
                    </div>

                    {/* Priority & Due Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full border p-2 rounded mt-1 bg-white"
                            >
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Entrega</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full border p-2 rounded mt-1"
                            />
                        </div>
                    </div>

                    {/* Assignees (Multi-select) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsáveis</label>
                        <div className="border rounded p-2 max-h-32 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {users.map(user => (
                                <label key={user.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={assigneeIds.includes(String(user.id))}
                                        onChange={() => handleToggleAssignee(user.id)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm">{user.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Topics (Checklist) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tópicos / Checklist</label>
                        <div className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                value={newTopic}
                                onChange={(e) => setNewTopic(e.target.value)}
                                placeholder="Adicionar tópico..."
                                className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                            />
                            <button type="button" onClick={handleAddTopic} className="bg-gray-200 p-2 rounded hover:bg-gray-300">
                                <Plus size={20} />
                            </button>
                        </div>

                        {topics.length > 0 && (
                            <ul className="space-y-1 bg-gray-50 p-2 rounded border">
                                {topics.map((topic, index) => (
                                    <li key={index} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                        <span className="text-sm truncate">{topic}</span>
                                        <button type="button" onClick={() => handleRemoveTopic(index)} className="text-red-500 hover:text-red-700">
                                            <Trash size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </form>

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Criar Tarefa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal;
