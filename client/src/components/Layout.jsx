import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom'; // Fixed imports
import { LayoutDashboard, CheckSquare, Users, LogOut, Calendar, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-arteb-bgBlue">
            {/* Sidebar */}
            <aside className="w-64 bg-arteb-deepBlue text-white shadow-xl flex flex-col">
                <div className="p-6 border-b border-blue-800 flex flex-col items-center text-center space-y-3">
                    <img src="/logo.svg" alt="SyncroTeam Logo" className="w-24 h-24 filter drop-shadow-md transition-transform hover:scale-105" />
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">SyncroTeam</h1>
                        <p className="text-xs text-blue-200 mt-1">Olá, {user.name}</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-3 mt-6">
                    <Link to="/dashboard" className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/dashboard') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/tasks" className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/tasks') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}>
                        <CheckSquare size={20} />
                        <span>Tarefas</span>
                    </Link>
                    <Link to="/calendar" className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/calendar') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}>
                        <Calendar size={20} />
                        <span>Calendário</span>
                    </Link>
                    <Link to="/team" className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/team') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}>
                        <Users size={20} />
                        <span>Equipe</span>
                    </Link>
                    {user.role === 'ADMIN' && (
                        <Link to="/groups" className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/groups') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}>
                            <Shield size={20} />
                            <span>Grupos</span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-blue-800">
                    <button onClick={handleLogout} className="flex items-center space-x-2 text-blue-200 hover:text-red-400 w-full p-2 transition-colors">
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
