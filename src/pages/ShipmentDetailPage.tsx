import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentsApi, documentsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import '../styles/detail.css';

export const ShipmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shipment, setShipment] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showChangesModal, setShowChangesModal] = useState(false);
    const [changesMessage, setChangesMessage] = useState('');

    useEffect(() => {
        if (id) {
            fetchShipmentDetails();
        }
    }, [id]);

    const fetchShipmentDetails = async () => {
        try {
            setLoading(true);
            const shipmentResponse = await shipmentsApi.get(id!);
            setShipment(shipmentResponse.shipment);
            setDocuments(shipmentResponse.documents || []);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch shipment details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            const response = await shipmentsApi.approve(id!);
            setShipment(response.shipment);
            setError('');
            alert('Shipment approved successfully');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to approve shipment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        setActionLoading(true);
        try {
            const response = await shipmentsApi.reject(id!, { reason: rejectReason });
            setShipment(response.shipment);
            setShowRejectModal(false);
            setRejectReason('');
            setError('');
            alert('Shipment rejected successfully');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reject shipment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestChanges = async () => {
        setActionLoading(true);
        try {
            const response = await shipmentsApi.requestChanges(id!, { message: changesMessage });
            setShipment(response.shipment);
            setShowChangesModal(false);
            setChangesMessage('');
            setError('');
            alert('Change request sent successfully');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to request changes');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await documentsApi.delete(docId);
                setDocuments(prev => prev.filter(doc => doc.id !== docId));
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to delete document');
            }
        }
    };

    const handleDownloadDocument = async (docId: string, fileName: string) => {
        try {
            const blob = await documentsApi.download(docId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to download document');
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const canEdit = shipment?.created_by === user?.id && ['new', 'created', 'changes_requested'].includes(shipment?.status);
    const canApprove = user?.role === 'accounts' && ['created', 'changes_requested'].includes(shipment?.status);
    const canDelete = user?.role === 'admin';

    if (loading) {
        return <div className="page-container"><div className="loading">Loading shipment details...</div></div>;
    }

    if (!shipment) {
        return (
            <div className="page-container">
                <div className="error-message">Shipment not found</div>
                <button onClick={() => navigate('/shipments')} className="btn-primary">Back to Shipments</button>
            </div>
        );
    }

    return (
        <div className="detail-container">
            <div className="detail-header">
                <h1>Shipment Details: {shipment.shipment_id}</h1>
                <button onClick={() => navigate('/shipments')} className="btn-secondary">Back</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="detail-status">
                <span className={`badge badge-${shipment.status}`}>
                    {shipment.status.replace('_', ' ').toUpperCase()}
                </span>
            </div>

            <div className="detail-sections">
                <section className="detail-section">
                    <h2>Exporter Information</h2>
                    <p><strong>Name:</strong> {shipment.exporter_name}</p>
                    <p><strong>Address:</strong> {shipment.exporter_address}</p>
                    {shipment.exporter_contact && <p><strong>Contact:</strong> {shipment.exporter_contact}</p>}
                    {shipment.exporter_email && <p><strong>Email:</strong> {shipment.exporter_email}</p>}
                </section>

                <section className="detail-section">
                    <h2>Vendor Information</h2>
                    <p><strong>Name:</strong> {shipment.vendor_name}</p>
                    <p><strong>Address:</strong> {shipment.vendor_address}</p>
                    {shipment.vendor_contact && <p><strong>Contact:</strong> {shipment.vendor_contact}</p>}
                    {shipment.vendor_email && <p><strong>Email:</strong> {shipment.vendor_email}</p>}
                </section>

                <section className="detail-section">
                    <h2>Receiver Information</h2>
                    <p><strong>Name:</strong> {shipment.receiver_name}</p>
                    <p><strong>Address:</strong> {shipment.receiver_address}</p>
                    {shipment.receiver_contact && <p><strong>Contact:</strong> {shipment.receiver_contact}</p>}
                    {shipment.receiver_email && <p><strong>Email:</strong> {shipment.receiver_email}</p>}
                </section>

                <section className="detail-section">
                    <h2>Shipment Details</h2>
                    <p><strong>Item Description:</strong> {shipment.item_description}</p>
                    <p><strong>Weight:</strong> {shipment.weight} {shipment.weight_unit}</p>
                    {(shipment.dimensions_length || shipment.dimensions_width || shipment.dimensions_height) && (
                        <p>
                            <strong>Dimensions:</strong> {shipment.dimensions_length} × {shipment.dimensions_width} × {shipment.dimensions_height} {shipment.dimensions_unit}
                        </p>
                    )}
                    <p><strong>Value:</strong> {shipment.currency} {shipment.value.toFixed(2)}</p>
                    <p><strong>Mode of Transport:</strong> {shipment.mode_of_transport.toUpperCase()}</p>
                    <p><strong>Pickup Date:</strong> {formatDate(shipment.pickup_date)}</p>
                    <p><strong>Expected Delivery Date:</strong> {formatDate(shipment.expected_delivery_date)}</p>
                </section>

                {shipment.rejection_reason && (
                    <section className="detail-section error-section">
                        <h2>Reason</h2>
                        <p>{shipment.rejection_reason}</p>
                    </section>
                )}

                <section className="detail-section">
                    <h2>Documents ({documents.length})</h2>
                    {documents.length > 0 ? (
                        <table className="documents-table">
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Uploaded</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>{doc.file_name}</td>
                                        <td>{doc.document_type}</td>
                                        <td>{(doc.file_size / 1024).toFixed(2)} KB</td>
                                        <td>{formatDate(doc.uploaded_at)}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                                                className="btn-sm btn-info"
                                            >
                                                Download
                                            </button>
                                            {(canEdit || canDelete) && (
                                                <button
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                    className="btn-sm btn-danger"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No documents uploaded</p>
                    )}
                </section>
            </div>

            <div className="detail-actions">
                {canApprove && (
                    <>
                        <button
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="btn-primary"
                        >
                            {actionLoading ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={actionLoading}
                            className="btn-danger"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => setShowChangesModal(true)}
                            disabled={actionLoading}
                            className="btn-warning"
                        >
                            Request Changes
                        </button>
                    </>
                )}
                {(canEdit || user?.role === 'accounts') && ['new', 'created', 'changes_requested'].includes(shipment.status) && (
                    <button
                        onClick={() => navigate(`/edit-shipment/${id}`)}
                        className="btn-secondary"
                    >
                        Edit
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this shipment?')) {
                                shipmentsApi.delete(id!).then(() => navigate('/shipments'));
                            }
                        }}
                        className="btn-danger"
                    >
                        Delete
                    </button>
                )}
            </div>

            {showRejectModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Reject Shipment</h2>
                        <textarea
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="modal-textarea"
                        />
                        <div className="modal-actions">
                            <button
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="btn-danger"
                            >
                                {actionLoading ? 'Processing...' : 'Reject'}
                            </button>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showChangesModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Request Changes</h2>
                        <textarea
                            placeholder="Message about required changes..."
                            value={changesMessage}
                            onChange={(e) => setChangesMessage(e.target.value)}
                            className="modal-textarea"
                        />
                        <div className="modal-actions">
                            <button
                                onClick={handleRequestChanges}
                                disabled={actionLoading}
                                className="btn-primary"
                            >
                                {actionLoading ? 'Processing...' : 'Send Request'}
                            </button>
                            <button
                                onClick={() => setShowChangesModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
