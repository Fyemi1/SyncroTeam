import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Falha no login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-arteb-deepBlue bg-[url('/grid.svg')] bg-fixed">
            <div className="glass p-8 rounded-xl shadow-2xl w-96 border-t-4 border-arteb-vibrantYellow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-arteb-vibrantYellow opacity-10 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    <img src="/logo.svg" alt="SyncroTeam" className="w-32 h-32 mx-auto mb-4 drop-shadow-md hover:scale-105 transition-transform duration-500" />
                    <h1 className="text-3xl font-bold text-arteb-deepBlue tracking-tight">SyncroTeam</h1>
                    <p className="text-sm text-gray-500 mt-1">Enterprise Task Management</p>
                </div>

                <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Acessar Conta</h2>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm mb-6 shadow-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
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
                    <button type="submit" className="w-full bg-arteb-vibrantYellow text-arteb-deepBlue font-bold p-3 rounded-lg hover:bg-arteb-yellowLight hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                        Entrar na Plataforma
                    </button>
                </form>

                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Não tem acesso?{' '}
                        <Link to="/register" className="text-arteb-deepBlue font-semibold hover:text-arteb-vibrantYellow transition-colors">
                            Solicite seu cadastro
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
