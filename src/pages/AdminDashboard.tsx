import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsApi } from '../lib/api';
import '../styles/dashboard.css';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [recentShipments, setRecentShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await shipmentsApi.getStatistics();
            setStats(response.statistics);
            setRecentShipments(response.recentShipments);
            setError('');
        } catch (err: any) {
            setError('Failed to load dashboard data');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatNumber = (num: number) => {
        return num || 0;
    };

    if (loading) {
        return <div className="dashboard-loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Central management view for all shipments</p>
                </div>
                <button
                    onClick={() => navigate('/create-shipment')}
                    className="btn-primary-action"
                >
                    Create Shipment
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Total Shipments</h3>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value">{formatNumber(stats?.total)}</div>
                        <div className="stat-trend">All time records</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Pending Approval</h3>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value pending">{formatNumber(stats?.pending_approval)}</div>
                        <div className="stat-trend">Awaiting review</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Approved</h3>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value approved">{formatNumber(stats?.approved)}</div>
                        <div className="stat-trend">Ready to ship</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Rejected</h3>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value rejected">{formatNumber(stats?.rejected)}</div>
                        <div className="stat-trend">Needs attention</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <h3>In Transit</h3>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value transit">{formatNumber(stats?.in_transit)}</div>
                        <div className="stat-trend">Active shipments</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Delivered</h3>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value delivered">{formatNumber(stats?.delivered)}</div>
                        <div className="stat-trend">Completed</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Recent Shipments</h2>
                    <button
                        onClick={() => navigate('/shipments')}
                        className="btn-link"
                    >
                        View All
                    </button>
                </div>

                {recentShipments.length > 0 ? (
                    <div className="shipments-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Shipment ID</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Value</th>
                                    <th>Mode</th>
                                    <th>Pickup Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentShipments.map((shipment) => (
                                    <tr key={shipment.id}>
                                        <td className="shipment-id">{shipment.shipment_id}</td>
                                        <td>{shipment.exporter_name}</td>
                                        <td>{shipment.receiver_name}</td>
                                        <td>{shipment.currency} {shipment.value.toFixed(2)}</td>
                                        <td>{shipment.mode_of_transport.toUpperCase()}</td>
                                        <td>{formatDate(shipment.pickup_date)}</td>
                                        <td>
                                            <span className={`status-badge status-${shipment.status}`}>
                                                {shipment.status.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => navigate(`/shipment/${shipment.id}`)}
                                                className="btn-view-link"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No shipments found. Create your first shipment to get started.</p>
                        <button
                            onClick={() => navigate('/create-shipment')}
                            className="btn-primary"
                        >
                            Create Shipment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
