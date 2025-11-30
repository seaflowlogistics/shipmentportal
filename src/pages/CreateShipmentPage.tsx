import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsApi, documentsApi } from '../lib/api';
import {
  Button,
  Input,
  Select,
  Alert,
  Card,
  CardHeader,
  CardBody,
  ToastContainer,
} from '../components';
import { useToast } from '../hooks/useToast';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import '../styles/forms.css';

export const CreateShipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [shipmentId, setShipmentId] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError(`File size exceeds 10MB limit. File: ${file.name}`);
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showError(`Invalid file type. Only PDF and JPEG files are allowed. File: ${file.name}`);
      return;
    }

    if (!shipmentId) {
      showError('Please create the shipment first before uploading documents');
      return;
    }

    try {
      setUploadingDocument(true);
      const response = await documentsApi.upload(shipmentId, file, documentType);
      setUploadedDocuments((prev) => [...prev, response.document]);
      success(`${documentType} uploaded successfully`);
      // Reset file input
      e.target.value = '';
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
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
        setLoading(false);
        return;
      }

      // Validate dates
      const pickup = new Date(formData.pickup_date);
      const delivery = new Date(formData.expected_delivery_date);
      if (pickup > delivery) {
        showError('Pickup date must be before expected delivery date');
        setLoading(false);
        return;
      }

      const response = await shipmentsApi.create(formData);
      setShipmentId(response.shipment.id);
      success('Shipment created successfully! You can now upload documents.');
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Shipment</h1>

      {!shipmentId ? (
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
            <Button type="submit" isLoading={loading} disabled={loading}>
              Create Shipment
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          <Alert
            type="success"
            title="Shipment Created"
            message={`Your shipment has been created successfully. Shipment ID: ${shipmentId}`}
          />

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Upload Documents</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Invoice</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={(e) => handleDocumentUpload(e, 'invoice')}
                      disabled={uploadingDocument}
                      className="block w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">PDF or JPEG, max 10MB</p>
                  </label>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">
                      Packing List
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={(e) => handleDocumentUpload(e, 'packing_list')}
                      disabled={uploadingDocument}
                      className="block w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">PDF or JPEG, max 10MB</p>
                  </label>
                </div>

                {formData.mode_of_transport === 'sea' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">
                        Bill of Lading (Sea)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg"
                        onChange={(e) => handleDocumentUpload(e, 'bill_of_lading')}
                        disabled={uploadingDocument}
                        className="block w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">PDF or JPEG, max 10MB</p>
                    </label>
                  </div>
                )}

                {formData.mode_of_transport === 'air' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">
                        Air Waybill (Air)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg"
                        onChange={(e) => handleDocumentUpload(e, 'air_waybill')}
                        disabled={uploadingDocument}
                        className="block w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">PDF or JPEG, max 10MB</p>
                    </label>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">
                      Other Documents
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={(e) => handleDocumentUpload(e, 'other')}
                      disabled={uploadingDocument}
                      className="block w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">PDF or JPEG, max 10MB</p>
                  </label>
                </div>
              </div>

              {uploadedDocuments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
                  <ul className="space-y-2">
                    {uploadedDocuments.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-md"
                      >
                        <DocumentArrowUpIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-700">
                          {doc.file_name} ({doc.document_type})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={handleFinish}
                leftIcon={<DocumentArrowUpIcon className="w-5 h-5" />}
              >
                Finish & Go to Dashboard
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
