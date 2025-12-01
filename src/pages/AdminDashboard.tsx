import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsApi } from '../lib/api';
import {
  Button,
  Card,
  CardBody,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  Loading,
  EmptyState,
  ToastContainer,
  ProgressModal,
} from '../components';
import { useToast } from '../hooks/useToast';
import {
  DocumentPlusIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateFormat';
import { exportToExcel, exportToPDF, prepareShipmentsForExport } from '../utils/export';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, error: showError } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await shipmentsApi.getStatistics();
      setStats(response.statistics);
      setRecentShipments(response.recentShipments || []);
    } catch (err: any) {
      showError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num || 0;
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'approved' || status === 'delivered') return 'success';
    if (status === 'rejected') return 'danger';
    if (status === 'in_transit') return 'warning';
    if (status === 'changes_requested') return 'warning';
    return 'info';
  };

  const handleExportDashboard = async (format: 'excel' | 'pdf') => {
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

      const currentStats = { ...stats };
      const exportData = [
        {
          'Metric': 'Total Shipments',
          'Count': currentStats?.total || 0
        },
        {
          'Metric': 'Pending Approval',
          'Count': currentStats?.pending_approval || 0
        },
        {
          'Metric': 'Approved',
          'Count': currentStats?.approved || 0
        },
        {
          'Metric': 'Rejected',
          'Count': currentStats?.rejected || 0
        },
        {
          'Metric': 'In Transit',
          'Count': currentStats?.in_transit || 0
        },
        {
          'Metric': 'Delivered',
          'Count': currentStats?.delivered || 0
        }
      ];

      const filename = `admin-dashboard-${new Date().toISOString().split('T')[0]}`;
      if (format === 'excel') {
        exportToExcel(exportData, filename, 'Dashboard');
      } else {
        exportToPDF(exportData, filename, 'Admin Dashboard Report');
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
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Central management view for all shipments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            onClick={() => handleExportDashboard('excel')}
            isLoading={isExporting}
            disabled={isExporting}
          >
            Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            onClick={() => handleExportDashboard('pdf')}
            isLoading={isExporting}
            disabled={isExporting}
          >
            PDF
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
          title="Exporting Dashboard"
          message="Preparing your dashboard report..."
          progress={exportProgress}
          showProgress={true}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {/* Total Shipments */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-50">
                <DocumentPlusIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(stats?.total)}</p>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </div>
          </CardBody>
        </Card>

        {/* Pending Approval */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-yellow-50">
                <ClipboardDocumentListIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(stats?.pending_approval)}</p>
              <p className="text-xs text-slate-400 mt-1">Awaiting review</p>
            </div>
          </CardBody>
        </Card>

        {/* Approved */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-50">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Approved</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(stats?.approved)}</p>
              <p className="text-xs text-slate-400 mt-1">Ready to ship</p>
            </div>
          </CardBody>
        </Card>

        {/* Rejected */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-50">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Rejected</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(stats?.rejected)}</p>
              <p className="text-xs text-slate-400 mt-1">Needs attention</p>
            </div>
          </CardBody>
        </Card>

        {/* In Transit */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-50">
                <ArrowPathIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">In Transit</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(stats?.in_transit)}</p>
              <p className="text-xs text-slate-400 mt-1">Active shipments</p>
            </div>
          </CardBody>
        </Card>

        {/* Delivered */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-teal-50">
                <DocumentArrowDownIcon className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Delivered</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(stats?.delivered)}</p>
              <p className="text-xs text-slate-400 mt-1">Completed</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Shipments Section */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
            <Button size="sm" variant="secondary" onClick={() => navigate('/shipments')}>
              View All
            </Button>
          </div>

          {recentShipments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Shipment ID</TableHeaderCell>
                    <TableHeaderCell>From</TableHeaderCell>
                    <TableHeaderCell>To</TableHeaderCell>
                    <TableHeaderCell>Value</TableHeaderCell>
                    <TableHeaderCell>Mode</TableHeaderCell>
                    <TableHeaderCell>Pickup Date</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-semibold text-blue-600">{shipment.shipment_id}</TableCell>
                      <TableCell>{shipment.exporter_name}</TableCell>
                      <TableCell>{shipment.receiver_name}</TableCell>
                      <TableCell>
                        {shipment.currency} {Number(shipment.value).toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">{shipment.mode_of_transport}</TableCell>
                      <TableCell>{formatDate(shipment.pickup_date)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(shipment.status)} size="sm">
                          {shipment.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => navigate(`/shipment/${shipment.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={<DocumentPlusIcon className="w-12 h-12 text-gray-400 mx-auto" />}
              title="No shipments yet"
              message="Create your first shipment to get started"
              action={{
                label: 'Create Shipment',
                onClick: () => navigate('/create-shipment'),
              }}
            />
          )}
        </CardBody>
      </Card>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
