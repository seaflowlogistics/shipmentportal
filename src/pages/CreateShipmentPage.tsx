import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsApi, documentsApi } from '../lib/api';
import '../styles/forms.css';

export const CreateShipmentPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shipmentId, setShipmentId] = useState('');
    const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
    const [documentError, setDocumentError] = useState('');

    const [formData, setFormData] = useState({
        exporter_name: '',
        exporter_address: '',
        exporter_contact: '',
        exporter_email: '',
        vendor_name: '',
        vendor_address: '',
        vendor_contact: '',
        vendor_email: '',
        receiver_name: '',
        receiver_address: '',
        receiver_contact: '',
        receiver_email: '',
        item_description: '',
        weight: '',
        weight_unit: 'kg',
        dimensions_length: '',
        dimensions_width: '',
        dimensions_height: '',
        dimensions_unit: 'cm',
        value: '',
        currency: 'USD',
        pickup_date: '',
        expected_delivery_date: '',
        mode_of_transport: 'sea'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setDocumentError(`File size exceeds 10MB limit. File: ${file.name}`);
            return;
        }

        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setDocumentError(`Invalid file type. Only PDF and JPEG files are allowed. File: ${file.name}`);
            return;
        }

        if (!shipmentId) {
            setDocumentError('Please create the shipment first before uploading documents');
            return;
        }

        try {
            setDocumentError('');
            const response = await documentsApi.upload(shipmentId, file, documentType);
            setUploadedDocuments(prev => [...prev, response.document]);
        } catch (err: any) {
            setDocumentError(err.response?.data?.error || 'Failed to upload document');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.exporter_name || !formData.vendor_name || !formData.receiver_name ||
                !formData.item_description || !formData.weight || !formData.value ||
                !formData.pickup_date || !formData.expected_delivery_date) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Validate dates
            const pickup = new Date(formData.pickup_date);
            const delivery = new Date(formData.expected_delivery_date);
            if (pickup > delivery) {
                setError('Pickup date must be before expected delivery date');
                setLoading(false);
                return;
            }

            const response = await shipmentsApi.create(formData);
            setShipmentId(response.shipment.id);
            setError('');

            // Show document upload section
            alert('Shipment created successfully! You can now upload documents.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create shipment');
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        navigate('/dashboard');
    };

    return (
        <div className="form-container">
            <h1>Create Shipment</h1>

            {error && <div className="error-message">{error}</div>}
            {documentError && <div className="error-message">{documentError}</div>}

            {!shipmentId ? (
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-section">
                        <h2>Exporter Information</h2>
                        <input
                            type="text"
                            name="exporter_name"
                            placeholder="Exporter Name *"
                            value={formData.exporter_name}
                            onChange={handleInputChange}
                            required
                        />
                        <textarea
                            name="exporter_address"
                            placeholder="Exporter Address *"
                            value={formData.exporter_address}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="exporter_contact"
                            placeholder="Contact Number"
                            value={formData.exporter_contact}
                            onChange={handleInputChange}
                        />
                        <input
                            type="email"
                            name="exporter_email"
                            placeholder="Email"
                            value={formData.exporter_email}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-section">
                        <h2>Vendor Information</h2>
                        <input
                            type="text"
                            name="vendor_name"
                            placeholder="Vendor Name *"
                            value={formData.vendor_name}
                            onChange={handleInputChange}
                            required
                        />
                        <textarea
                            name="vendor_address"
                            placeholder="Vendor Address *"
                            value={formData.vendor_address}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="vendor_contact"
                            placeholder="Contact Number"
                            value={formData.vendor_contact}
                            onChange={handleInputChange}
                        />
                        <input
                            type="email"
                            name="vendor_email"
                            placeholder="Email"
                            value={formData.vendor_email}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-section">
                        <h2>Receiver Information</h2>
                        <input
                            type="text"
                            name="receiver_name"
                            placeholder="Receiver Name *"
                            value={formData.receiver_name}
                            onChange={handleInputChange}
                            required
                        />
                        <textarea
                            name="receiver_address"
                            placeholder="Receiver Address *"
                            value={formData.receiver_address}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="receiver_contact"
                            placeholder="Contact Number"
                            value={formData.receiver_contact}
                            onChange={handleInputChange}
                        />
                        <input
                            type="email"
                            name="receiver_email"
                            placeholder="Email"
                            value={formData.receiver_email}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-section">
                        <h2>Shipment Details</h2>
                        <textarea
                            name="item_description"
                            placeholder="Item Description *"
                            value={formData.item_description}
                            onChange={handleInputChange}
                            required
                        />
                        <div className="form-row">
                            <input
                                type="number"
                                name="weight"
                                placeholder="Weight *"
                                step="0.01"
                                value={formData.weight}
                                onChange={handleInputChange}
                                required
                            />
                            <select
                                name="weight_unit"
                                value={formData.weight_unit}
                                onChange={handleInputChange}
                            >
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <input
                                type="number"
                                name="dimensions_length"
                                placeholder="Length"
                                step="0.01"
                                value={formData.dimensions_length}
                                onChange={handleInputChange}
                            />
                            <input
                                type="number"
                                name="dimensions_width"
                                placeholder="Width"
                                step="0.01"
                                value={formData.dimensions_width}
                                onChange={handleInputChange}
                            />
                            <input
                                type="number"
                                name="dimensions_height"
                                placeholder="Height"
                                step="0.01"
                                value={formData.dimensions_height}
                                onChange={handleInputChange}
                            />
                            <select
                                name="dimensions_unit"
                                value={formData.dimensions_unit}
                                onChange={handleInputChange}
                            >
                                <option value="cm">cm</option>
                                <option value="in">in</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <input
                                type="number"
                                name="value"
                                placeholder="Value *"
                                step="0.01"
                                value={formData.value}
                                onChange={handleInputChange}
                                required
                            />
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleInputChange}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="INR">INR</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <input
                                type="date"
                                name="pickup_date"
                                value={formData.pickup_date}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="date"
                                name="expected_delivery_date"
                                value={formData.expected_delivery_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <select
                            name="mode_of_transport"
                            value={formData.mode_of_transport}
                            onChange={handleInputChange}
                        >
                            <option value="sea">Sea</option>
                            <option value="air">Air</option>
                            <option value="road">Road</option>
                        </select>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creating...' : 'Create Shipment'}
                    </button>
                </form>
            ) : (
                <div className="document-upload-section">
                    <p>Shipment ID: <strong>{shipmentId}</strong></p>
                    <h2>Upload Documents</h2>

                    <div className="document-type">
                        <label>Invoice *</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg"
                            onChange={(e) => handleDocumentUpload(e, 'invoice')}
                        />
                    </div>

                    <div className="document-type">
                        <label>Packing List *</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg"
                            onChange={(e) => handleDocumentUpload(e, 'packing_list')}
                        />
                    </div>

                    {formData.mode_of_transport === 'sea' && (
                        <div className="document-type">
                            <label>Bill of Lading (Sea) *</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg"
                                onChange={(e) => handleDocumentUpload(e, 'bill_of_lading')}
                            />
                        </div>
                    )}

                    {formData.mode_of_transport === 'air' && (
                        <div className="document-type">
                            <label>Air Waybill (Air) *</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg"
                                onChange={(e) => handleDocumentUpload(e, 'air_waybill')}
                            />
                        </div>
                    )}

                    <div className="document-type">
                        <label>Other Documents</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg"
                            onChange={(e) => handleDocumentUpload(e, 'other')}
                        />
                    </div>

                    <h3>Uploaded Documents</h3>
                    {uploadedDocuments.length > 0 ? (
                        <ul>
                            {uploadedDocuments.map((doc) => (
                                <li key={doc.id}>{doc.file_name} ({doc.document_type})</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No documents uploaded yet</p>
                    )}

                    <button onClick={handleFinish} className="btn-primary">
                        Finish & Go to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};
