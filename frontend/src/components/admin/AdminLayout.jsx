import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home, Calendar, Users, BarChart2, Settings, Bell, Search,
    LogOut, User, Activity, PieChart, TrendingUp
} from 'lucide-react';
import useGetMe from '../../hooks/useGetMe';

const NEON = '#00B4FF';
const LIME = '#A8FF4A';

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useGetMe();
    const isDark = false; // Admin side is always light theme

    const navigationItems = [
        {
            name: 'Overview',
            icon: TrendingUp,
            path: '/admin/overview',
            description: 'System overview & key metrics'
        },
        {
            name: 'Dashboard',
            icon: BarChart2,
            path: '/admin/dashboard',
            description: 'Main monitoring dashboard'
        },
        {
            name: 'Schedules',
            icon: Calendar,
            path: '/admin/schedules',
            description: 'Schedule management'
        },
        {
            name: 'Users',
            icon: Users,
            path: '/admin/users',
            description: 'User management'
        },
        {
            name: 'Reports',
            icon: PieChart,
            path: '/admin/reports',
            description: 'Analytics & reports'
        },
        {
            name: 'Settings',
            icon: Settings,
            path: '/admin/settings',
            description: 'System settings'
        },
    ];

    const isActivePath = (path) => {
        return location.pathname === path ||
            (path === '/admin/overview' && location.pathname === '/admin') ||
            (path === '/admin/users' && location.pathname === '/admin/user-management');
    };

    const handleNavigation = (path) => {
        // Handle special route mappings
        if (path === '/admin/users') {
            navigate('/admin/user-management');
        } else if (path === '/admin/schedules') {
            navigate('/admin/schedules');
        } else if (path === '/admin/settings') {
            // Settings page would need to be created
            alert('Settings page coming soon!');
        } else {
            navigate(path);
        }
    };

    const handleLogout = () => {
        navigate('/logout');
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-[#07070A] text-slate-200' : 'bg-white text-slate-800'
            }`}>
            <div className="max-w-[1400px] mx-auto p-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* SIDEBAR */}
                    <aside className="col-span-12 md:col-span-2">
                        <div className="sticky top-6 space-y-6">
                            {/* Brand */}
                            <div className="p-3 rounded-2xl glass flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-neon/20 to-lime/10">
                                    <Home className="text-neon" size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">ACRIMS</div>
                                    <div className="text-xs text-slate-400">Admin Panel</div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="space-y-2">
                                {navigationItems.map(item => {
                                    const isActive = isActivePath(item.path);
                                    return (
                                        <button
                                            key={item.name}
                                            onClick={() => handleNavigation(item.path)}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                                                ? 'bg-gradient-to-r from-neon/10 to-lime/5 border border-neon/20 shadow-lg shadow-neon/10'
                                                : 'hover:bg-white/4 hover:border-white/10 border border-transparent'
                                                }`}
                                            title={item.description}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isActive
                                                ? 'bg-gradient-to-br from-neon/30 to-lime/20 shadow-lg'
                                                : 'glass group-hover:bg-white/10'
                                                }`}>
                                                <item.icon
                                                    size={18}
                                                    className={isActive ? 'text-black' : 'text-black group-hover:text-black'}
                                                />
                                            </div>
                                            <div className="text-left">
                                                <div className={`text-sm font-medium ${isActive ? 'text-black' : 'text-black group-hover:text-slate-500'}`}>
                                                    {item.name}
                                                </div>
                                                <div className="text-xs text-black group-hover:text-slate-400">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* User Profile */}
                            <div className="p-4 rounded-2xl glass">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon/30 to-lime/20 flex items-center justify-center text-black font-bold">
                                        {user?.first_name?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold truncate">
                                            {user?.first_name} {user?.last_name}
                                        </div>
                                        <div className="text-xs text-slate-400">Administrator</div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className={`flex-1 py-2 px-3 rounded-lg border transition-colors text-sm flex items-center justify-center gap-2 ${isDark
                                            ? 'border-white/10 hover:bg-white/5'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => navigate('/users/me')}
                                    >
                                        <User size={14} />
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="py-2 px-3 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                                        title="Logout"
                                    >
                                        <LogOut size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="p-3 rounded-2xl glass">
                                <div className="text-xs text-slate-400 mb-3 font-medium">Quick Actions</div>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => navigate('/admin/reports')}
                                        className="w-full py-2 px-3 rounded-lg border border-white/6 hover:bg-white/5 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <Activity size={14} />
                                        Generate Report
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full py-2 px-3 rounded-lg border border-white/6 hover:bg-white/5 transition-colors text-sm"
                                    >
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="col-span-12 md:col-span-10">
                        {/* Top Bar */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4 w-full md:w-1/2">
                                <div className="relative w-full">
                                    <label htmlFor="global-search" className="sr-only">Global Search</label>
                                    <input
                                        id="global-search"
                                        placeholder="Search across all data..."
                                        className="w-full py-3 pl-10 pr-4 rounded-2xl bg-transparent border border-slate-400 focus:border-neon/50 focus:outline-none transition-colors"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Search size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Notifications */}
                                <button
                                    className="relative p-3 rounded-xl glass hover:bg-white/5 transition-colors"
                                    title="Notifications"
                                >
                                    <Bell size={20} />
                                </button>

                                {/* Current Time */}
                                <div className="hidden md:block text-sm text-slate-400">
                                    Last sync: {new Date().toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Page Content */}
                        <div className="min-h-[calc(100vh-200px)]">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Accent glow effect */}
            <div
                aria-hidden
                className="fixed -left-40 -bottom-40 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${NEON}20 0%, ${LIME}10 50%, transparent 70%)`
                }}
            />
        </div>
    );
}

