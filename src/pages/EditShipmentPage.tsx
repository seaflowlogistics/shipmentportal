import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentsApi } from '../lib/api';
import {
  Button,
  Input,
  Select,
  Alert,
  Card,
  CardHeader,
  CardBody,
  Loading,
  ToastContainer,
} from '../components';
import { useToast } from '../hooks/useToast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import '../styles/forms.css';

export const EditShipmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
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
    mode_of_transport: 'sea',
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
        mode_of_transport: response.shipment.mode_of_transport,
      });
    } catch (err: any) {
      showError('Failed to load shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validation
      if (
        !formData.exporter_name ||
        !formData.vendor_name ||
        !formData.receiver_name ||
        !formData.item_description ||
        !formData.weight ||
        !formData.value ||
        !formData.pickup_date ||
        !formData.expected_delivery_date
      ) {
        showError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      const pickup = new Date(formData.pickup_date);
      const delivery = new Date(formData.expected_delivery_date);
      if (pickup > delivery) {
        showError('Pickup date must be before expected delivery date');
        setSaving(false);
        return;
      }

      await shipmentsApi.update(id!, formData);
      success('Shipment updated successfully!');
      setTimeout(() => navigate(`/shipment/${id}`), 1500);
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to update shipment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading shipment..." />;
  }

  if (!shipment) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Alert
          type="error"
          title="Not Found"
          message="The shipment you're looking for could not be found."
        />
        <Button
          leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Shipment: {shipment.shipment_id}</h1>
        <Button
          variant="secondary"
          leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
          onClick={() => navigate(`/shipment/${id}`)}
        >
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Exporter Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Exporter Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              type="text"
              label="Exporter Name"
              placeholder="Enter exporter name"
              name="exporter_name"
              value={formData.exporter_name}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              label="Address"
              placeholder="Enter exporter address"
              name="exporter_address"
              value={formData.exporter_address}
              onChange={handleInputChange}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Contact Number"
                placeholder="Enter contact number"
                name="exporter_contact"
                value={formData.exporter_contact}
                onChange={handleInputChange}
              />
              <Input
                type="email"
                label="Email"
                placeholder="Enter email"
                name="exporter_email"
                value={formData.exporter_email}
                onChange={handleInputChange}
              />
            </div>
          </CardBody>
        </Card>

        {/* Vendor Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Vendor Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              type="text"
              label="Vendor Name"
              placeholder="Enter vendor name"
              name="vendor_name"
              value={formData.vendor_name}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              label="Address"
              placeholder="Enter vendor address"
              name="vendor_address"
              value={formData.vendor_address}
              onChange={handleInputChange}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Contact Number"
                placeholder="Enter contact number"
                name="vendor_contact"
                value={formData.vendor_contact}
                onChange={handleInputChange}
              />
              <Input
                type="email"
                label="Email"
                placeholder="Enter email"
                name="vendor_email"
                value={formData.vendor_email}
                onChange={handleInputChange}
              />
            </div>
          </CardBody>
        </Card>

        {/* Receiver Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Receiver Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              type="text"
              label="Receiver Name"
              placeholder="Enter receiver name"
              name="receiver_name"
              value={formData.receiver_name}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              label="Address"
              placeholder="Enter receiver address"
              name="receiver_address"
              value={formData.receiver_address}
              onChange={handleInputChange}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Contact Number"
                placeholder="Enter contact number"
                name="receiver_contact"
                value={formData.receiver_contact}
                onChange={handleInputChange}
              />
              <Input
                type="email"
                label="Email"
                placeholder="Enter email"
                name="receiver_email"
                value={formData.receiver_email}
                onChange={handleInputChange}
              />
            </div>
          </CardBody>
        </Card>

        {/* Shipment Details Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Shipment Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              type="text"
              label="Item Description"
              placeholder="Enter item description"
              name="item_description"
              value={formData.item_description}
              onChange={handleInputChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Weight"
                placeholder="Enter weight"
                name="weight"
                step="0.01"
                value={formData.weight}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Unit"
                options={[
                  { value: 'kg', label: 'Kilograms (kg)' },
                  { value: 'lbs', label: 'Pounds (lbs)' },
                ]}
                name="weight_unit"
                value={formData.weight_unit}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                type="number"
                label="Length"
                placeholder="cm"
                name="dimensions_length"
                step="0.01"
                value={formData.dimensions_length}
                onChange={handleInputChange}
              />
              <Input
                type="number"
                label="Width"
                placeholder="cm"
                name="dimensions_width"
                step="0.01"
                value={formData.dimensions_width}
                onChange={handleInputChange}
              />
              <Input
                type="number"
                label="Height"
                placeholder="cm"
                name="dimensions_height"
                step="0.01"
                value={formData.dimensions_height}
                onChange={handleInputChange}
              />
              <Select
                label="Unit"
                options={[
                  { value: 'cm', label: 'Centimeters' },
                  { value: 'in', label: 'Inches' },
                ]}
                name="dimensions_unit"
                value={formData.dimensions_unit}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Value"
                placeholder="Enter value"
                name="value"
                step="0.01"
                value={formData.value}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Currency"
                options={[
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
                  { value: 'INR', label: 'INR' },
                ]}
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Pickup Date"
                name="pickup_date"
                value={formData.pickup_date}
                onChange={handleInputChange}
                required
              />
              <Input
                type="date"
                label="Expected Delivery Date"
                name="expected_delivery_date"
                value={formData.expected_delivery_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <Select
              label="Mode of Transport"
              options={[
                { value: 'sea', label: 'Sea' },
                { value: 'air', label: 'Air' },
                { value: 'road', label: 'Road' },
              ]}
              name="mode_of_transport"
              value={formData.mode_of_transport}
              onChange={handleInputChange}
            />
          </CardBody>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" isLoading={saving} disabled={saving}>
            Save Changes
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/shipment/${id}`)}>
            Cancel
          </Button>
        </div>
      </form>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
