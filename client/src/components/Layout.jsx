import { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, LogOut, Calendar, Shield, Menu, X } from 'lucide-react';
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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="flex h-screen bg-arteb-bgBlue overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-arteb-deepBlue text-white p-4 flex items-center justify-between z-50 shadow-md">
                <div className="flex items-center space-x-2">
                    <img src="/logo.svg" alt="SyncroTeam Logo" className="w-8 h-8" />
                    <span className="font-bold text-lg">SyncroTeam</span>
                </div>
                <button onClick={toggleMobileMenu} className="p-2 focus:outline-none">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={closeMobileMenu}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-arteb-deepBlue text-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-blue-800 flex flex-col items-center text-center space-y-3 pt-20 md:pt-6">
                    <img src="/logo.svg" alt="SyncroTeam Logo" className="w-24 h-24 filter drop-shadow-md transition-transform hover:scale-105 hidden md:block" />
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-wide hidden md:block">SyncroTeam</h1>
                        <p className="text-xs text-blue-200 mt-1">Olá, {user.name}</p>
                        <p className="text-[10px] text-blue-400 mt-1">v1.3 (Sincronizado)</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-3 mt-6 overflow-y-auto">
                    <Link
                        to="/dashboard"
                        onClick={closeMobileMenu}
                        className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/dashboard') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/tasks"
                        onClick={closeMobileMenu}
                        className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/tasks') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}
                    >
                        <CheckSquare size={20} />
                        <span>Tarefas</span>
                    </Link>
                    <Link
                        to="/calendar"
                        onClick={closeMobileMenu}
                        className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/calendar') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}
                    >
                        <Calendar size={20} />
                        <span>Calendário</span>
                    </Link>
                    <Link
                        to="/team"
                        onClick={closeMobileMenu}
                        className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/team') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}
                    >
                        <Users size={20} />
                        <span>Equipe</span>
                    </Link>
                    {user.role === 'ADMIN' && (
                        <Link
                            to="/groups"
                            onClick={closeMobileMenu}
                            className={cn("flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-arteb-vibrantYellow", isActive('/groups') && "bg-white/10 text-arteb-vibrantYellow font-medium shadow-inner")}
                        >
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
            <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
