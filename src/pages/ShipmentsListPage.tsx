import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsApi } from '../lib/api';
import {
  Input,
  Select,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  Badge,
  Loading,
  EmptyState,
  ToastContainer,
  SkeletonTable,
  ProgressModal,
} from '../components';
import { useToast } from '../hooks/useToast';
import { DocumentArrowDownIcon, DocumentPlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { exportToCSV, exportToJSON, exportToExcel, exportToPDF, prepareShipmentsForExport } from '../utils/export';
import { formatDate } from '../utils/dateFormat';

export const ShipmentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, error: showError } = useToast();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    mode: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    pages: 0,
  });
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

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
        offset: pagination.offset,
      });
      setShipments(response.shipments);
      setPagination(response.pagination);
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'approved' || status === 'delivered') return 'success';
    if (status === 'rejected') return 'danger';
    if (status === 'in_transit') return 'warning';
    if (status === 'changes_requested') return 'warning';
    return 'info';
  };

  const handleExport = async (format: 'csv' | 'json' | 'excel' | 'pdf') => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress for UX feedback
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 30;
        });
      }, 300);

      const exportData = prepareShipmentsForExport(shipments);
      const filename = `shipments-${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'csv':
          exportToCSV(exportData, filename);
          break;
        case 'json':
          exportToJSON(shipments, filename);
          break;
        case 'excel':
          exportToExcel(exportData, filename, 'Shipments');
          break;
        case 'pdf':
          exportToPDF(exportData, filename, 'Shipments Report');
          break;
      }

      clearInterval(progressInterval);
      setExportProgress(100);

      // Close modal after brief delay
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading shipments..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
          <p className="text-gray-600 mt-2">Manage and track all shipments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            onClick={() => handleExport('excel')}
            title="Export to Excel"
            isLoading={isExporting}
            disabled={isExporting}
          >
            Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            onClick={() => handleExport('pdf')}
            title="Export to PDF"
            isLoading={isExporting}
            disabled={isExporting}
          >
            PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            onClick={() => handleExport('csv')}
            title="Export to CSV"
            isLoading={isExporting}
            disabled={isExporting}
          >
            CSV
          </Button>
          <Button
            leftIcon={<DocumentPlusIcon className="w-4 h-4" />}
            onClick={() => navigate('/create-shipment')}
            disabled={isExporting}
          >
            Create Shipment
          </Button>
        </div>

        <ProgressModal
          isOpen={isExporting}
          title="Exporting Shipments"
          message="Preparing your export file..."
          progress={exportProgress}
          showProgress={true}
        />
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <Input
            type="text"
            placeholder="Search by shipment ID, exporter, or receiver..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Status' },
            { value: 'new', label: 'New' },
            { value: 'created', label: 'Created' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'changes_requested', label: 'Changes Requested' },
            { value: 'in_transit', label: 'In Transit' },
            { value: 'delivered', label: 'Delivered' },
          ]}
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'All Modes' },
            { value: 'air', label: 'Air' },
            { value: 'sea', label: 'Sea' },
            { value: 'road', label: 'Road' },
          ]}
          value={filters.mode}
          onChange={(e) => handleFilterChange('mode', e.target.value)}
        />
      </div>

      {/* Table */}
      {shipments.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Shipment ID</TableHeaderCell>
                <TableHeaderCell>Exporter</TableHeaderCell>
                <TableHeaderCell>Receiver</TableHeaderCell>
                <TableHeaderCell>Mode</TableHeaderCell>
                <TableHeaderCell>Value</TableHeaderCell>
                <TableHeaderCell>Pickup Date</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-semibold text-blue-600">{shipment.shipment_id}</TableCell>
                  <TableCell>{shipment.exporter_name}</TableCell>
                  <TableCell>{shipment.receiver_name}</TableCell>
                  <TableCell className="capitalize">{shipment.mode_of_transport}</TableCell>
                  <TableCell>
                    {shipment.currency} {Number(shipment.value).toFixed(2)}
                  </TableCell>
                  <TableCell>{formatDate(shipment.pickup_date)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(shipment.status)} size="sm">
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        leftIcon={<EyeIcon className="w-4 h-4" />}
                        onClick={() => navigate(`/shipment/${shipment.id}`)}
                      >
                        View
                      </Button>
                      {['new', 'created', 'changes_requested'].includes(shipment.status) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<PencilIcon className="w-4 h-4" />}
                          onClick={() => navigate(`/edit-shipment/${shipment.id}`)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={<DocumentPlusIcon className="w-12 h-12 text-gray-400 mx-auto" />}
          title="No shipments found"
          message="Create your first shipment to get started"
          action={{
            label: 'Create Shipment',
            onClick: () => navigate('/create-shipment'),
          }}
        />
      )}

      {/* Pagination */}
      {shipments.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
            {pagination.total} shipments
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit),
                }))
              }
              disabled={pagination.offset === 0}
            >
              Previous
            </Button>
            <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
              Page {Math.floor(pagination.offset / pagination.limit) + 1} of {pagination.pages}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: Math.min(pagination.total - pagination.limit, prev.offset + prev.limit),
                }))
              }
              disabled={pagination.offset + pagination.limit >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
