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
} from '../components';
import { useToast } from '../hooks/useToast';
import { ClipboardDocumentListIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateFormat';

export const AccountsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, error: showError } = useToast();
  const [pendingShipments, setPendingShipments] = useState<any[]>([]);
  const [approvedShipments, setApprovedShipments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Accounts Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Review and approve shipments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pending Review */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-yellow-100">
                <ClipboardDocumentListIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.pending_approval)}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
            </div>
          </CardBody>
        </Card>

        {/* Approved */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.approved)}</p>
              <p className="text-xs text-gray-500 mt-1">Ready to ship</p>
            </div>
          </CardBody>
        </Card>

        {/* Rejected */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-100">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.rejected)}</p>
              <p className="text-xs text-gray-500 mt-1">Sent back</p>
            </div>
          </CardBody>
        </Card>

        {/* Changes Requested */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Changes Requested</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.changes_requested)}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting updates</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Pending Approval Section */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approval</h2>
            {pendingShipments.length > 0 && <Badge variant="warning">{pendingShipments.length} awaiting</Badge>}
          </div>

          {pendingShipments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Shipment ID</TableHeaderCell>
                    <TableHeaderCell>From</TableHeaderCell>
                    <TableHeaderCell>To</TableHeaderCell>
                    <TableHeaderCell>Value</TableHeaderCell>
                    <TableHeaderCell>Mode</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingShipments.map((shipment) => (
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
                        <Button
                          size="sm"
                          onClick={() => navigate(`/shipment/${shipment.id}`)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto" />}
              title="All caught up"
              message="All shipments have been reviewed. No pending approvals."
            />
          )}
        </CardBody>
      </Card>

      {/* Recently Approved Section */}
      {approvedShipments.length > 0 && (
        <Card className="mt-8">
          <CardBody>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recently Approved</h2>
              <Badge variant="success">{approvedShipments.length} approved</Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Shipment ID</TableHeaderCell>
                    <TableHeaderCell>From</TableHeaderCell>
                    <TableHeaderCell>To</TableHeaderCell>
                    <TableHeaderCell>Value</TableHeaderCell>
                    <TableHeaderCell>Mode</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approvedShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-semibold text-blue-600">{shipment.shipment_id}</TableCell>
                      <TableCell>{shipment.exporter_name}</TableCell>
                      <TableCell>{shipment.receiver_name}</TableCell>
                      <TableCell>
                        {shipment.currency} {Number(shipment.value).toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">{shipment.mode_of_transport}</TableCell>
                      <TableCell>{formatDate(shipment.pickup_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
