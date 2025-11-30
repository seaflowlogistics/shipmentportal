import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsApi } from '../lib/api';
import '../styles/dashboard.css';

export const AccountsDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [pendingShipments, setPendingShipments] = useState<any[]>([]);
    const [approvedShipments, setApprovedShipments] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsResponse = await shipmentsApi.getStatistics();
            setStats(statsResponse.statistics);

            const pendingResponse = await shipmentsApi.list({ status: 'created', limit: 10 });
            setPendingShipments(pendingResponse.shipments);

            const approvedResponse = await shipmentsApi.list({ status: 'approved', limit: 5 });
            setApprovedShipments(approvedResponse.shipments);

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
                    <h1>Accounts Manager Dashboard</h1>
                    <p className="dashboard-subtitle">Review and approve shipments</p>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Pending Review</h3>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value pending">{formatNumber(stats?.pending_approval)}</div>
                        <div className="stat-trend">Awaiting action</div>
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
                        <div className="stat-trend">Sent back</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <h3>Changes Requested</h3>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value pending">{formatNumber(stats?.changes_requested)}</div>
                        <div className="stat-trend">Awaiting updates</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Pending Approval</h2>
                    {pendingShipments.length > 0 && (
                        <span className="badge-count">{pendingShipments.length}</span>
                    )}
                </div>

                {pendingShipments.length > 0 ? (
                    <div className="shipments-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Shipment ID</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Value</th>
                                    <th>Mode</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingShipments.map((shipment) => (
                                    <tr key={shipment.id}>
                                        <td className="shipment-id">{shipment.shipment_id}</td>
                                        <td>{shipment.exporter_name}</td>
                                        <td>{shipment.receiver_name}</td>
                                        <td>{shipment.currency} {shipment.value.toFixed(2)}</td>
                                        <td>{shipment.mode_of_transport.toUpperCase()}</td>
                                        <td>{formatDate(shipment.pickup_date)}</td>
                                        <td>
                                            <button
                                                onClick={() => navigate(`/shipment/${shipment.id}`)}
                                                className="btn-view-link"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>All shipments have been reviewed. No pending approvals.</p>
                    </div>
                )}
            </div>

            {approvedShipments.length > 0 && (
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recently Approved</h2>
                    </div>
                    <div className="shipments-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Shipment ID</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Value</th>
                                    <th>Mode</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedShipments.map((shipment) => (
                                    <tr key={shipment.id}>
                                        <td className="shipment-id">{shipment.shipment_id}</td>
                                        <td>{shipment.exporter_name}</td>
                                        <td>{shipment.receiver_name}</td>
                                        <td>{shipment.currency} {shipment.value.toFixed(2)}</td>
                                        <td>{shipment.mode_of_transport.toUpperCase()}</td>
                                        <td>{formatDate(shipment.pickup_date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
