import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentsApi, documentsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  Modal,
  ConfirmDialog,
  Loading,
  ToastContainer,
} from '../components';
import { useToast } from '../hooks/useToast';
import { ArrowLeftIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateFormat';

export const ShipmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toasts, removeToast, success, error: showError } = useToast();
    const [shipment, setShipment] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showChangesModal, setShowChangesModal] = useState(false);
    const [changesMessage, setChangesMessage] = useState('');
    const [deleteDocConfirm, setDeleteDocConfirm] = useState<string | null>(null);
    const [deleteShipmentConfirm, setDeleteShipmentConfirm] = useState(false);

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
        } catch (err: any) {
            showError(err.response?.data?.error || 'Failed to fetch shipment details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            const response = await shipmentsApi.approve(id!);
            setShipment(response.shipment);
            success('Shipment approved successfully!');
        } catch (err: any) {
            showError(err.response?.data?.error || 'Failed to approve shipment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            showError('Please provide a reason for rejection');
            return;
        }

        setActionLoading(true);
        try {
            const response = await shipmentsApi.reject(id!, { reason: rejectReason });
            setShipment(response.shipment);
            setShowRejectModal(false);
            setRejectReason('');
            success('Shipment rejected successfully!');
        } catch (err: any) {
            showError(err.response?.data?.error || 'Failed to reject shipment');
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
            success('Change request sent successfully!');
        } catch (err: any) {
            showError(err.response?.data?.error || 'Failed to request changes');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteDocument = async () => {
        if (!deleteDocConfirm) return;
        try {
            await documentsApi.delete(deleteDocConfirm);
            setDocuments(prev => prev.filter(doc => doc.id !== deleteDocConfirm));
            setDeleteDocConfirm(null);
            success('Document deleted successfully!');
        } catch (err: any) {
            showError(err.response?.data?.error || 'Failed to delete document');
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
            showError(err.response?.data?.error || 'Failed to download document');
        }
    };

    const canEdit = shipment?.created_by === user?.id && ['new', 'created', 'changes_requested'].includes(shipment?.status);
    const canApprove = user?.role === 'accounts' && ['created', 'changes_requested'].includes(shipment?.status);
    const canDelete = user?.role === 'admin';

    if (loading) {
        return <Loading fullScreen message="Loading shipment details..." />;
    }

    if (!shipment) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-8">
                <Alert
                    type="error"
                    title="Not Found"
                    message="The shipment you're looking for could not be found."
                />
                <Button
                    leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
                    variant="secondary"
                    onClick={() => navigate('/shipments')}
                    className="mt-4"
                >
                    Back to Shipments
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Shipment Details: {shipment.shipment_id}</h1>
                <Button
                    variant="secondary"
                    leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
                    onClick={() => navigate('/shipments')}
                >
                    Back
                </Button>
            </div>

            <div className="mb-6 flex items-center gap-3">
                <Badge variant={shipment.status.includes('approved') || shipment.status === 'delivered' ? 'success' : shipment.status === 'rejected' ? 'danger' : 'info'}>
                    {shipment.status.replace('_', ' ').toUpperCase()}
                </Badge>
            </div>

            <div className="space-y-6">
                {/* Exporter Information */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">Exporter Information</h2>
                    </CardHeader>
                    <CardBody className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="text-gray-900 font-medium">{shipment.exporter_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="text-gray-900">{shipment.exporter_address}</p>
                        </div>
                        {shipment.exporter_contact && (
                            <div>
                                <p className="text-sm text-gray-600">Contact</p>
                                <p className="text-gray-900">{shipment.exporter_contact}</p>
                            </div>
                        )}
                        {shipment.exporter_email && (
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-gray-900">{shipment.exporter_email}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Vendor Information */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">Vendor Information</h2>
                    </CardHeader>
                    <CardBody className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="text-gray-900 font-medium">{shipment.vendor_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="text-gray-900">{shipment.vendor_address}</p>
                        </div>
                        {shipment.vendor_contact && (
                            <div>
                                <p className="text-sm text-gray-600">Contact</p>
                                <p className="text-gray-900">{shipment.vendor_contact}</p>
                            </div>
                        )}
                        {shipment.vendor_email && (
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-gray-900">{shipment.vendor_email}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Receiver Information */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">Receiver Information</h2>
                    </CardHeader>
                    <CardBody className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="text-gray-900 font-medium">{shipment.receiver_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="text-gray-900">{shipment.receiver_address}</p>
                        </div>
                        {shipment.receiver_contact && (
                            <div>
                                <p className="text-sm text-gray-600">Contact</p>
                                <p className="text-gray-900">{shipment.receiver_contact}</p>
                            </div>
                        )}
                        {shipment.receiver_email && (
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-gray-900">{shipment.receiver_email}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
                
                {/* Invoice & Customs Details */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">Invoice & Customs Details</h2>
                    </CardHeader>
                    <CardBody className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Invoice No</p>
                                <p className="text-gray-900">{shipment.invoice_no || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Invoice Items</p>
                                <p className="text-gray-900">{shipment.invoice_item_count || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Customs R Form</p>
                                <p className="text-gray-900">{shipment.customs_r_form || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">BL/AWB No</p>
                                <p className="text-gray-900">{shipment.bl_awb_no || '-'}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Container & Cargo Details */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">Container & Cargo Details</h2>
                    </CardHeader>
                    <CardBody className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Container No</p>
                                <p className="text-gray-900">{shipment.container_no || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Container Type</p>
                                <p className="text-gray-900">{shipment.container_type || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">CBM</p>
                                <p className="text-gray-900">{shipment.cbm || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Gross Weight</p>
                                <p className="text-gray-900">{shipment.gross_weight || '-'} kg</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Package Count</p>
                                <p className="text-gray-900">{shipment.package_count || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Cleared Date</p>
                                <p className="text-gray-900">{shipment.cleared_date ? formatDate(shipment.cleared_date) : '-'}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Expenses */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
                    </CardHeader>
                    <CardBody className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">MACL</p>
                                <p className="text-gray-900">{shipment.currency} {shipment.expense_macl ? Number(shipment.expense_macl).toFixed(2) : '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">MPL</p>
                                <p className="text-gray-900">{shipment.currency} {shipment.expense_mpl ? Number(shipment.expense_mpl).toFixed(2) : '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">MCS</p>
                                <p className="text-gray-900">{shipment.currency} {shipment.expense_mcs ? Number(shipment.expense_mcs).toFixed(2) : '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Transportation</p>
                                <p className="text-gray-900">{shipment.currency} {shipment.expense_transportation ? Number(shipment.expense_transportation).toFixed(2) : '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Liner</p>
                                <p className="text-gray-900">{shipment.currency} {shipment.expense_liner ? Number(shipment.expense_liner).toFixed(2) : '0.00'}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Shipment Details */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">Shipment Details</h2>
                    </CardHeader>
                    <CardBody className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Item Description</p>
                                <p className="text-gray-900">{shipment.item_description}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Weight</p>
                                <p className="text-gray-900">{shipment.weight} {shipment.weight_unit}</p>
                            </div>
                            {(shipment.dimensions_length || shipment.dimensions_width || shipment.dimensions_height) && (
                                <div>
                                    <p className="text-sm text-gray-600">Dimensions</p>
                                    <p className="text-gray-900">{shipment.dimensions_length} × {shipment.dimensions_width} × {shipment.dimensions_height} {shipment.dimensions_unit}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-600">Value</p>
                                <p className="text-gray-900">{shipment.currency} {Number(shipment.value).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Mode of Transport</p>
                                <p className="text-gray-900 capitalize">{shipment.mode_of_transport}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pickup Date</p>
                                <p className="text-gray-900">{formatDate(shipment.pickup_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Expected Delivery Date</p>
                                <p className="text-gray-900">{formatDate(shipment.expected_delivery_date)}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Rejection Reason */}
                {shipment.rejection_reason && (
                    <Alert
                        type="error"
                        title="Rejection Reason"
                        message={shipment.rejection_reason}
                    />
                )}

                {/* Documents */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">Documents ({documents.length})</h2>
                    </CardHeader>
                    <CardBody>
                        {documents.length > 0 ? (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>File Name</TableHeaderCell>
                                        <TableHeaderCell>Type</TableHeaderCell>
                                        <TableHeaderCell>Size</TableHeaderCell>
                                        <TableHeaderCell>Uploaded</TableHeaderCell>
                                        <TableHeaderCell>Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {documents.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell>{doc.file_name}</TableCell>
                                            <TableCell><Badge variant="info" size="sm">{doc.document_type}</Badge></TableCell>
                                            <TableCell>{(doc.file_size / 1024).toFixed(2)} KB</TableCell>
                                            <TableCell>{formatDate(doc.uploaded_at)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                                                        onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                                                    >
                                                        Download
                                                    </Button>
                                                    {(canEdit || canDelete) && (
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            leftIcon={<TrashIcon className="w-4 h-4" />}
                                                            onClick={() => setDeleteDocConfirm(doc.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-gray-600">No documents uploaded</p>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
                {canApprove && (
                    <>
                        <Button
                            onClick={handleApprove}
                            isLoading={actionLoading}
                            disabled={actionLoading}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setShowRejectModal(true)}
                            disabled={actionLoading}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowChangesModal(true)}
                            disabled={actionLoading}
                        >
                            Request Changes
                        </Button>
                    </>
                )}
                {(canEdit || user?.role === 'accounts') && ['new', 'created', 'changes_requested'].includes(shipment.status) && (
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/edit-shipment/${id}`)}
                    >
                        Edit
                    </Button>
                )}
                {canDelete && (
                    <Button
                        variant="danger"
                        onClick={() => setDeleteShipmentConfirm(true)}
                    >
                        Delete Shipment
                    </Button>
                )}
            </div>

            {/* Modals and Dialogs */}
            <Modal
                isOpen={showRejectModal}
                title="Reject Shipment"
                onClose={() => setShowRejectModal(false)}
            >
                <div className="space-y-4">
                    <textarea
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        rows={4}
                    />
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleReject}
                            isLoading={actionLoading}
                            disabled={actionLoading}
                        >
                            Reject
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showChangesModal}
                title="Request Changes"
                onClose={() => setShowChangesModal(false)}
            >
                <div className="space-y-4">
                    <textarea
                        placeholder="Message about required changes..."
                        value={changesMessage}
                        onChange={(e) => setChangesMessage(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        rows={4}
                    />
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => setShowChangesModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequestChanges}
                            isLoading={actionLoading}
                            disabled={actionLoading}
                        >
                            Send Request
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteDocConfirm !== null}
                title="Delete Document"
                message="Are you sure you want to delete this document? This action cannot be undone."
                isDangerous
                onConfirm={handleDeleteDocument}
                onCancel={() => setDeleteDocConfirm(null)}
            />

            <ConfirmDialog
                isOpen={deleteShipmentConfirm}
                title="Delete Shipment"
                message="Are you sure you want to delete this shipment? This action cannot be undone."
                isDangerous
                onConfirm={() => {
                    shipmentsApi.delete(id!).then(() => navigate('/shipments'));
                    setDeleteShipmentConfirm(false);
                }}
                onCancel={() => setDeleteShipmentConfirm(false)}
            />

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};
