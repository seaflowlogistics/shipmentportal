import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentsApi } from '../lib/api';
import '../styles/forms.css';

export const EditShipmentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [shipment, setShipment] = useState<any>(null);
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

    useEffect(() => {
        if (id) {
            fetchShipment();
        }
    }, [id]);

    const fetchShipment = async () => {
        try {
            setLoading(true);
            const response = await shipmentsApi.get(id!);
            setShipment(response.shipment);
            setFormData({
                exporter_name: response.shipment.exporter_name,
                exporter_address: response.shipment.exporter_address,
                exporter_contact: response.shipment.exporter_contact || '',
                exporter_email: response.shipment.exporter_email || '',
                vendor_name: response.shipment.vendor_name,
                vendor_address: response.shipment.vendor_address,
                vendor_contact: response.shipment.vendor_contact || '',
                vendor_email: response.shipment.vendor_email || '',
                receiver_name: response.shipment.receiver_name,
                receiver_address: response.shipment.receiver_address,
                receiver_contact: response.shipment.receiver_contact || '',
                receiver_email: response.shipment.receiver_email || '',
                item_description: response.shipment.item_description,
                weight: response.shipment.weight.toString(),
                weight_unit: response.shipment.weight_unit,
                dimensions_length: response.shipment.dimensions_length?.toString() || '',
                dimensions_width: response.shipment.dimensions_width?.toString() || '',
                dimensions_height: response.shipment.dimensions_height?.toString() || '',
                dimensions_unit: response.shipment.dimensions_unit,
                value: response.shipment.value.toString(),
                currency: response.shipment.currency,
                pickup_date: response.shipment.pickup_date,
                expected_delivery_date: response.shipment.expected_delivery_date,
                mode_of_transport: response.shipment.mode_of_transport
            });
            setError('');
        } catch (err: any) {
            setError('Failed to load shipment');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // Validation
            if (!formData.exporter_name || !formData.vendor_name || !formData.receiver_name ||
                !formData.item_description || !formData.weight || !formData.value ||
                !formData.pickup_date || !formData.expected_delivery_date) {
                setError('Please fill in all required fields');
                setSaving(false);
                return;
            }

            const pickup = new Date(formData.pickup_date);
            const delivery = new Date(formData.expected_delivery_date);
            if (pickup > delivery) {
                setError('Pickup date must be before expected delivery date');
                setSaving(false);
                return;
            }

            const updateData = { ...formData };
            await shipmentsApi.update(id!, updateData);
            navigate(`/shipment/${id}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update shipment');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="form-container"><div className="loading">Loading shipment...</div></div>;
    }

    if (!shipment) {
        return <div className="form-container"><div className="error-message">Shipment not found</div></div>;
    }

    return (
        <div className="form-container">
            <div className="form-header">
                <h1>Edit Shipment: {shipment.shipment_id}</h1>
                <button onClick={() => navigate(`/shipment/${id}`)} className="btn-secondary">
                    Back
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

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

                <div className="form-actions">
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/shipment/${id}`)}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
