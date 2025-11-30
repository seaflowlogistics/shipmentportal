import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsApi } from '../lib/api';
import '../styles/dashboard.css';

export const ClearanceManagerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await shipmentsApi.getStatistics();
            setStats(response.statistics);
            setShipments(response.recentShipments);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const formatNumber = (num: number) => {
        return num || 0;
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            created: 'warning',
            approved: 'success',
            rejected: 'danger',
            changes_requested: 'info',
            in_transit: 'primary',
            delivered: 'success'
        };
        return colors[status] || 'secondary';
    };

    if (loading) {
        return <div className="dashboard-loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Clearance Manager Dashboard</h1>
                <button
                    onClick={() => navigate('/create-shipment')}
                    className="btn-create"
                >
                    + Create New Shipment
                </button>
            </div>

            {/* Personal Stats */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <p className="stat-label">My Shipments</p>
                        <p className="stat-value">{formatNumber(stats?.total)}</p>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <p className="stat-label">Pending Review</p>
                        <p className="stat-value">{formatNumber(stats?.pending_approval)}</p>
                    </div>
                </div>

                <div className="stat-card approved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <p className="stat-label">Approved</p>
                        <p className="stat-value">{formatNumber(stats?.approved)}</p>
                    </div>
                </div>

                <div className="stat-card rejected">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <p className="stat-label">Needs Changes</p>
                        <p className="stat-value">{formatNumber(stats?.changes_requested)}</p>
                    </div>
                </div>
            </div>

            {/* My Shipments */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2>My Shipments</h2>
                    <button
                        onClick={() => navigate('/shipments')}
                        className="btn-view-all"
                    >
                        View All →
                    </button>
                </div>

                {shipments.length > 0 ? (
                    <div className="shipments-grid">
                        {shipments.map((shipment) => (
                            <div
                                key={shipment.id}
                                className={`shipment-card status-${getStatusColor(shipment.status)}`}
                                onClick={() => navigate(`/shipment/${shipment.id}`)}
                            >
                                <div className="card-header">
                                    <h3>{shipment.shipment_id}</h3>
                                    <span className={`badge badge-${shipment.status}`}>
                                        {shipment.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">Receiver:</span>
                                        <span className="value">{shipment.receiver_name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Value:</span>
                                        <span className="value">
                                            {shipment.currency} {shipment.value.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Transport:</span>
                                        <span className="value">
                                            {shipment.mode_of_transport.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Pickup:</span>
                                        <span className="value">
                                            {formatDate(shipment.pickup_date)}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Delivery:</span>
                                        <span className="value">
                                            {formatDate(shipment.expected_delivery_date)}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button className="btn-view">View Details →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No shipments created yet</p>
                        <button
                            onClick={() => navigate('/create-shipment')}
                            className="btn-primary"
                        >
                            Create Your First Shipment
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <button
                        onClick={() => navigate('/create-shipment')}
                        className="action-card"
                    >
                        <span className="action-icon">➕</span>
                        <span className="action-text">Create Shipment</span>
                    </button>
                    <button
                        onClick={() => navigate('/shipments')}
                        className="action-card"
                    >
                        <span className="action-icon">📋</span>
                        <span className="action-text">View All Shipments</span>
                    </button>
                    <button
                        onClick={() => navigate('/shipments?status=changes_requested')}
                        className="action-card"
                    >
                        <span className="action-icon">📝</span>
                        <span className="action-text">Updates Needed</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
