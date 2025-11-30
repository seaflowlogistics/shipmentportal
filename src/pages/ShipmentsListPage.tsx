import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsApi } from '../lib/api';
import '../styles/tables.css';

export const ShipmentsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        mode: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 10,
        offset: 0,
        pages: 0
    });

    useEffect(() => {
        fetchShipments();
    }, [filters, pagination.offset]);

    const fetchShipments = async () => {
        try {
            setLoading(true);
            const response = await shipmentsApi.list({
                status: filters.status || undefined,
                mode: filters.mode || undefined,
                search: filters.search || undefined,
                limit: pagination.limit,
                offset: pagination.offset
            });
            setShipments(response.shipments);
            setPagination(response.pagination);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch shipments');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, offset: 0 }));
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            new: 'badge-new',
            created: 'badge-created',
            approved: 'badge-approved',
            rejected: 'badge-rejected',
            changes_requested: 'badge-pending',
            in_transit: 'badge-transit',
            delivered: 'badge-delivered',
            cancelled: 'badge-cancelled'
        };
        return statusMap[status] || 'badge-default';
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const handleExport = (format: 'csv' | 'json') => {
        const { exportToCSV, exportToJSON, prepareShipmentsForExport } = require('../utils/export');
        const exportData = prepareShipmentsForExport(shipments);

        if (format === 'csv') {
            exportToCSV(exportData, 'shipments');
        } else {
            exportToJSON(shipments, 'shipments');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Shipments</h1>
                <div className="header-actions">
                    <button
                        onClick={() => handleExport('csv')}
                        className="btn-secondary"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => handleExport('json')}
                        className="btn-secondary"
                    >
                        Export JSON
                    </button>
                    <button
                        onClick={() => navigate('/create-shipment')}
                        className="btn-primary"
                    >
                        Create Shipment
                    </button>
                </div>
            </div>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by shipment ID, exporter, or receiver..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="filter-input"
                />
                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Status</option>
                    <option value="created">Created</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="changes_requested">Changes Requested</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                </select>
                <select
                    value={filters.mode}
                    onChange={(e) => handleFilterChange('mode', e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Modes</option>
                    <option value="air">Air</option>
                    <option value="sea">Sea</option>
                    <option value="road">Road</option>
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Loading shipments...</div>
            ) : (
                <>
                    <table className="shipments-table">
                        <thead>
                            <tr>
                                <th>Shipment ID</th>
                                <th>Exporter</th>
                                <th>Receiver</th>
                                <th>Mode</th>
                                <th>Value</th>
                                <th>Pickup Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipments.length > 0 ? (
                                shipments.map((shipment) => (
                                    <tr key={shipment.id}>
                                        <td>{shipment.shipment_id}</td>
                                        <td>{shipment.exporter_name}</td>
                                        <td>{shipment.receiver_name}</td>
                                        <td>{shipment.mode_of_transport.toUpperCase()}</td>
                                        <td>
                                            {shipment.currency} {shipment.value.toFixed(2)}
                                        </td>
                                        <td>{formatDate(shipment.pickup_date)}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(shipment.status)}`}>
                                                {shipment.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => navigate(`/shipment/${shipment.id}`)}
                                                className="btn-sm"
                                            >
                                                View
                                            </button>
                                            {['new', 'created', 'changes_requested'].includes(shipment.status) && (
                                                <button
                                                    onClick={() => navigate(`/edit-shipment/${shipment.id}`)}
                                                    className="btn-sm"
                                                    style={{ marginLeft: '4px' }}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center">
                                        No shipments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {shipments.length > 0 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPagination(prev => ({
                                    ...prev,
                                    offset: Math.max(0, prev.offset - prev.limit)
                                }))}
                                disabled={pagination.offset === 0}
                                className="btn-sm"
                            >
                                Previous
                            </button>
                            <span>
                                Page {Math.floor(pagination.offset / pagination.limit) + 1} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({
                                    ...prev,
                                    offset: Math.min(pagination.total - pagination.limit, prev.offset + prev.limit)
                                }))}
                                disabled={pagination.offset + pagination.limit >= pagination.total}
                                className="btn-sm"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
