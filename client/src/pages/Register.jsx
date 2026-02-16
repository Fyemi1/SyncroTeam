import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('EMPLOYEE'); // Default to Employee
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await api.post('/auth/register', { name, email, password, role });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Falha no registro');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-arteb-deepBlue bg-[url('/grid.svg')] bg-fixed">
            <div className="glass p-8 rounded-xl shadow-2xl w-96 border-t-4 border-arteb-vibrantYellow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-arteb-vibrantYellow opacity-10 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    <img src="/logo.svg" alt="SyncroTeam" className="w-24 h-24 mx-auto mb-4 drop-shadow-md hover:scale-105 transition-transform duration-500" />
                    <h1 className="text-2xl font-bold text-arteb-deepBlue tracking-tight">SyncroTeam</h1>
                    <p className="text-xs text-gray-500 mt-1">Enterprise Task Management</p>
                </div>

                <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Criar Nova Conta</h2>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm mb-6 shadow-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-arteb-vibrantYellow focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
                            placeholder="João Silva"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Corporativo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-arteb-vibrantYellow focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
                            placeholder="seu.nome@empresa.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-arteb-vibrantYellow focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cargo</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-arteb-vibrantYellow focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
                        >
                            <option value="EMPLOYEE">Funcionário</option>
                            <option value="ADMIN">Gerente/Supervisor</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-arteb-vibrantYellow text-arteb-deepBlue font-bold p-3 rounded-lg hover:bg-arteb-yellowLight hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 mt-2">
                        Registrar
                    </button>
                </form>

                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Já possui acesso?{' '}
                        <Link to="/login" className="text-arteb-deepBlue font-semibold hover:text-arteb-vibrantYellow transition-colors">
                            Entrar na conta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
