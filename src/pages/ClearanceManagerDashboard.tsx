import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsApi } from '../lib/api';
import { Button, Loading, EmptyState, Badge, Card, CardBody } from '../components';
import {
  DocumentPlusIcon,
  ListBulletIcon,
  PencilSquareIcon,
  BuildingLibraryIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import '../styles/dashboard.css';

export const ClearanceManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await shipmentsApi.getStatistics();
      setStats(response.statistics);
      setShipments(response.recentShipments);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    return num || 0;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral' } = {
      created: 'warning',
      approved: 'success',
      rejected: 'danger',
      changes_requested: 'info',
      in_transit: 'primary',
      delivered: 'success',
    };
    return colors[status] || 'neutral';
  };

  if (loading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clearance Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and track your shipments</p>
        </div>
        <Button
          leftIcon={<DocumentPlusIcon className="w-5 h-5" />}
          onClick={() => navigate('/create-shipment')}
        >
          Create Shipment
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Shipments */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">My Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.total)}</p>
            </div>
          </CardBody>
        </Card>

        {/* Pending Review */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-yellow-100">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.pending_approval)}</p>
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
            </div>
          </CardBody>
        </Card>

        {/* Needs Changes */}
        <Card hoverable>
          <CardBody className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Needs Changes</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.changes_requested)}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Shipments */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Shipments</h2>
          <Button variant="ghost" rightIcon={<ArrowRightIcon className="w-4 h-4" />} onClick={() => navigate('/shipments')}>
            View All
          </Button>
        </div>

        {shipments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shipments.map((shipment) => (
              <Card
                key={shipment.id}
                hoverable
                className="cursor-pointer"
                onClick={() => navigate(`/shipment/${shipment.id}`)}
              >
                <CardBody className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{shipment.shipment_id}</h3>
                      <p className="text-sm text-gray-600">{shipment.receiver_name}</p>
                    </div>
                    <Badge variant={getStatusColor(shipment.status)} size="sm">
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium text-gray-900">
                        {shipment.currency} {Number(shipment.value).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transport:</span>
                      <span className="font-medium text-gray-900">{shipment.mode_of_transport.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup:</span>
                      <span className="font-medium text-gray-900">{formatDate(shipment.pickup_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium text-gray-900">{formatDate(shipment.expected_delivery_date)}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                  >
                    View Details
                  </Button>
                </CardBody>
              </Card>
            ))}
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
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hoverable className="cursor-pointer" onClick={() => navigate('/create-shipment')}>
            <CardBody className="flex items-center gap-4 py-6">
              <DocumentPlusIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Create Shipment</h3>
                <p className="text-sm text-gray-600">Add a new shipment</p>
              </div>
            </CardBody>
          </Card>

          <Card hoverable className="cursor-pointer" onClick={() => navigate('/shipments')}>
            <CardBody className="flex items-center gap-4 py-6">
              <ListBulletIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">All Shipments</h3>
                <p className="text-sm text-gray-600">View shipment list</p>
              </div>
            </CardBody>
          </Card>

          <Card hoverable className="cursor-pointer" onClick={() => navigate('/shipments?status=changes_requested')}>
            <CardBody className="flex items-center gap-4 py-6">
              <PencilSquareIcon className="h-8 w-8 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Updates Needed</h3>
                <p className="text-sm text-gray-600">Review requested changes</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
