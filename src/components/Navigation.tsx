import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const getDashboardPath = () => {
        if (user?.role === 'admin') return '/admin/dashboard';
        if (user?.role === 'accounts') return '/accounts/dashboard';
        return '/clearance/dashboard';
    };

    const navLinkClasses = (path: string) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive(path)
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`;

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h2 className="text-xl font-bold text-slate-900">Shipment Portal</h2>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
                            <button
                                onClick={() => navigate(getDashboardPath())}
                                className={navLinkClasses(getDashboardPath())}
                            >
                                Dashboard
                            </button>

                            <button
                                onClick={() => navigate('/shipments')}
                                className={navLinkClasses('/shipments')}
                            >
                                Shipments
                            </button>

                            {user?.role === 'clearance_manager' && (
                                <button
                                    onClick={() => navigate('/create-shipment')}
                                    className={navLinkClasses('/create-shipment')}
                                >
                                    Create Shipment
                                </button>
                            )}

                            {user?.role === 'admin' && (
                                <>
                                    <button
                                        onClick={() => navigate('/admin/users')}
                                        className={navLinkClasses('/admin/users')}
                                    >
                                        Users
                                    </button>

                                    <button
                                        onClick={() => navigate('/admin/audit-logs')}
                                        className={navLinkClasses('/admin/audit-logs')}
                                    >
                                        Audit Logs
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <div className="ml-3 relative flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-medium text-slate-900">
                                    <span className="user-name">{user?.fullName || user?.username}</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    {user?.role.replace('_', ' ').toUpperCase()}
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-slate-500 hover:text-slate-700 text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {showMenu ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`sm:hidden ${showMenu ? 'block' : 'hidden'}`}>
                <div className="pt-2 pb-3 space-y-1">
                    <button
                        onClick={() => {
                            navigate(getDashboardPath());
                            setShowMenu(false);
                        }}
                        className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                            isActive(getDashboardPath())
                                ? 'bg-primary-50 border-primary-500 text-primary-700'
                                : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800'
                        }`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => {
                            navigate('/shipments');
                            setShowMenu(false);
                        }}
                        className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                            isActive('/shipments')
                                ? 'bg-primary-50 border-primary-500 text-primary-700'
                                : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800'
                        }`}
                    >
                        Shipments
                    </button>
                    {/* Add other mobile links here similarly if needed */}
                </div>
                <div className="pt-4 pb-4 border-t border-slate-200">
                    <div className="flex items-center px-4">
                        <div className="ml-3">
                            <div className="text-base font-medium text-slate-800">
                                {user?.fullName || user?.username}
                            </div>
                            <div className="text-sm font-medium text-slate-500">
                                {user?.role.replace('_', ' ').toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 space-y-1">
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-base font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
