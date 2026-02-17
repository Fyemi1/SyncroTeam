import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Users, Trash, Edit, X } from 'lucide-react';

const SupervisorGroups = () => {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        fetchGroups();
        fetchUsers();
    }, []);

    const fetchGroups = async () => {
        try {
            const data = await api.get('/supervisor-groups');
            setGroups(data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await api.get('/users');
            setUsers(data); // In a real app, filter this to only show employees available to be added?
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleOpenModal = (group = null) => {
        if (group) {
            setEditingGroup(group);
            setName(group.name);
            setSelectedMembers(group.members.map(m => String(m.userId)));
        } else {
            setEditingGroup(null);
            setName('');
            setSelectedMembers([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGroup(null);
    };

    const handleToggleMember = (userId) => {
        const id = String(userId);
        if (selectedMembers.includes(id)) {
            setSelectedMembers(selectedMembers.filter(m => m !== id));
        } else {
            setSelectedMembers([...selectedMembers, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name,
                memberIds: selectedMembers.map(id => parseInt(id))
            };

            if (editingGroup) {
                await api.put(`/supervisor-groups/${editingGroup.id}`, payload);
            } else {
                await api.post('/supervisor-groups', payload);
            }
            fetchGroups();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving group:', error);
            alert('Erro ao salvar grupo');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este grupo?')) return;
        try {
            await api.delete(`/supervisor-groups/${id}`);
            fetchGroups();
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-start md:items-center mb-6 flex-col md:flex-row gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-arteb-deepBlue tracking-wide">Meus Grupos de Supervisão</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-arteb-vibrantYellow text-arteb-deepBlue font-bold px-4 py-2 rounded shadow-md hover:bg-arteb-yellowLight transition-all w-full md:w-auto justify-center"
                >
                    <Plus size={20} />
                    <span>Novo Grupo</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(group => (
                    <div key={group.id} className="bg-white p-4 md:p-6 rounded shadow hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                                <Users size={20} className="text-blue-500" />
                                <span>{group.name}</span>
                            </h3>
                            <div className="flex space-x-2">
                                <button onClick={() => handleOpenModal(group)} className="text-gray-500 hover:text-blue-600">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(group.id)} className="text-gray-500 hover:text-red-600">
                                    <Trash size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Membros ({group.members.length})</p>
                            <ul className="space-y-1">
                                {group.members.slice(0, 5).map(member => (
                                    <li key={member.id} className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 p-1 rounded">
                                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-700">
                                            {member.user.name.charAt(0)}
                                        </div>
                                        <span>{member.user.name}</span>
                                    </li>
                                ))}
                                {group.members.length > 5 && (
                                    <li className="text-xs text-gray-500 pl-2">
                                        + {group.members.length - 5} outros
                                    </li>
                                )}
                            </ul>
                            {group.members.length === 0 && <p className="text-sm text-gray-400 italic">Sem membros.</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingGroup ? 'Editar Grupo' : 'Novo Grupo'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome do Grupo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border p-2 rounded mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Membros</label>
                                <div className="border rounded p-2 max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {users.map(user => (
                                        <label key={user.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(String(user.id))}
                                                onChange={() => handleToggleMember(user.id)}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">{user.name} ({user.role === 'ADMIN' ? 'Sup' : 'Func'})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorGroups;
