import React, { useState, useEffect } from 'react';
import '../styles/admin.css';

interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

export const AdminAuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        dateFrom: '',
        dateTo: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/audit-logs', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();
            setLogs(data.logs || []);
            setError('');
        } catch (err: any) {
            setError('Failed to load audit logs');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (filters.action && log.action !== filters.action) return false;
        if (filters.entityType && log.entity_type !== filters.entityType) return false;
        if (filters.dateFrom && new Date(log.created_at) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && new Date(log.created_at) > new Date(filters.dateTo)) return false;
        return true;
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) {
        return <div className="admin-page"><div className="loading">Loading audit logs...</div></div>;
    }

    const actions = [...new Set(logs.map(l => l.action))];
    const entityTypes = [...new Set(logs.map(l => l.entity_type))];

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Audit Logs</h1>
                <p>System activity and user actions</p>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="admin-filters">
                <select
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    className="filter-select"
                >
                    <option value="">All Actions</option>
                    {actions.map(action => (
                        <option key={action} value={action}>{action}</option>
                    ))}
                </select>

                <select
                    value={filters.entityType}
                    onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                    className="filter-select"
                >
                    <option value="">All Entity Types</option>
                    {entityTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="filter-input"
                    placeholder="From Date"
                />

                <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="filter-input"
                    placeholder="To Date"
                />

                <button
                    onClick={() => setFilters({ action: '', entityType: '', dateFrom: '', dateTo: '' })}
                    className="btn-secondary"
                >
                    Clear Filters
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Action</th>
                            <th>Entity Type</th>
                            <th>Entity ID</th>
                            <th>Details</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{formatDate(log.created_at)}</td>
                                    <td>
                                        <span className="action-badge">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.entity_type}</td>
                                    <td className="entity-id">{log.entity_id?.substring(0, 8)}...</td>
                                    <td className="details">
                                        {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                                    </td>
                                    <td>{log.ip_address || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center">
                                    No logs found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="log-summary">
                <p>Total logs: {logs.length} | Filtered: {filteredLogs.length}</p>
            </div>
        </div>
    );
};
