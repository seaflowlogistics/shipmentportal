import React, { useState, useEffect } from 'react';
import { usersApi } from '../lib/api';
import '../styles/admin.css';

export const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        role: 'clearance_manager'
    });

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await usersApi.getAll({
                role: roleFilter || undefined,
                search: searchTerm || undefined,
                limit: 50
            });
            setUsers(response.users);
            setError('');
        } catch (err: any) {
            setError('Failed to load users');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await usersApi.create(formData);
            setShowCreateModal(false);
            setFormData({
                username: '',
                email: '',
                full_name: '',
                role: 'clearance_manager'
            });
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersApi.delete(userId);
                fetchUsers();
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to delete user');
            }
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (window.confirm('Send password reset email to this user?')) {
            try {
                await usersApi.resetPassword(userId);
                alert('Password reset email sent');
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to reset password');
            }
        }
    };

    if (loading && users.length === 0) {
        return <div className="admin-page"><div className="loading">Loading users...</div></div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>User Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary-action"
                >
                    Create User
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="admin-filters">
                <input
                    type="text"
                    placeholder="Search by username, email, or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="accounts">Accounts Manager</option>
                    <option value="clearance_manager">Clearance Manager</option>
                </select>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Full Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td className="username">{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.full_name || '-'}</td>
                                    <td>
                                        <span className="role-badge">
                                            {user.role.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="actions">
                                        <button
                                            onClick={() => handleResetPassword(user.id)}
                                            className="btn-sm btn-secondary"
                                        >
                                            Reset Password
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="btn-sm btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New User</h2>
                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="form-input"
                                >
                                    <option value="clearance_manager">Clearance Manager</option>
                                    <option value="accounts">Accounts Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    Create User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
