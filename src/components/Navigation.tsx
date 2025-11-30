import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navigation.css';

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

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <h2>Shipment Portal</h2>
                </div>

                <button
                    className="menu-toggle"
                    onClick={() => setShowMenu(!showMenu)}
                >
                    Menu
                </button>

                <div className={`navbar-menu ${showMenu ? 'active' : ''}`}>
                    <div className="navbar-links">
                        <button
                            onClick={() => navigate(getDashboardPath())}
                            className={`nav-link ${isActive(getDashboardPath()) ? 'active' : ''}`}
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => navigate('/shipments')}
                            className={`nav-link ${isActive('/shipments') ? 'active' : ''}`}
                        >
                            Shipments
                        </button>

                        {(user?.role === 'clearance_manager' || user?.role === 'admin') && (
                            <button
                                onClick={() => navigate('/create-shipment')}
                                className={`nav-link ${isActive('/create-shipment') ? 'active' : ''}`}
                            >
                                Create Shipment
                            </button>
                        )}

                        {user?.role === 'admin' && (
                            <>
                                <button
                                    onClick={() => navigate('/admin/users')}
                                    className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}
                                >
                                    Users
                                </button>

                                <button
                                    onClick={() => navigate('/admin/audit-logs')}
                                    className={`nav-link ${isActive('/admin/audit-logs') ? 'active' : ''}`}
                                >
                                    Audit Logs
                                </button>
                            </>
                        )}
                    </div>

                    <div className="navbar-user">
                        <div className="user-info">
                            <span className="user-name">{user?.full_name || user?.username}</span>
                            <span className="user-role">{user?.role.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
