import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, Shield, Briefcase } from 'lucide-react';

const Team = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Erro ao buscar usuários', error);
        } finally {
            setLoading(false);
        }
    };

    const managers = users.filter(u => u.role === 'ADMIN');
    const employees = users.filter(u => u.role === 'EMPLOYEE');

    if (loading) return <div className="p-6">Carregando equipe...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Equipe</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Managers Section */}
                <div className="bg-white p-6 rounded shadow">
                    <div className="flex items-center space-x-2 mb-4 text-purple-700">
                        <Shield size={24} />
                        <h3 className="text-xl font-semibold">Supervisores / Chefes</h3>
                    </div>
                    {managers.length > 0 ? (
                        <ul className="space-y-3">
                            {managers.map(user => (
                                <li key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                                    <div className="w-10 h-10 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">Nenhum supervisor encontrado.</p>
                    )}
                </div>

                {/* Employees Section */}
                <div className="bg-white p-6 rounded shadow">
                    <div className="flex items-center space-x-2 mb-4 text-blue-700">
                        <Briefcase size={24} />
                        <h3 className="text-xl font-semibold">Funcionários</h3>
                    </div>
                    {employees.length > 0 ? (
                        <ul className="space-y-3">
                            {employees.map(user => (
                                <li key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                                    <div className="w-10 h-10 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">Nenhum funcionário encontrado.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Team;
