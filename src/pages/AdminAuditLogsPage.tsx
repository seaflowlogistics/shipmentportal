import React, { useState, useEffect } from 'react';
import { auditLogsApi } from '../lib/api';
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
  Alert,
  ToastContainer,
} from '../components';
import { useToast } from '../hooks/useToast';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export const AdminAuditLogsPage: React.FC = () => {
  const { toasts, removeToast, error: showError } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditLogsApi.list({
        action: filters.action || undefined,
        entity_type: filters.entityType || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });
      setLogs(data.logs || []);
    } catch (err: any) {
      showError('Failed to load audit logs');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.entityType && log.entity_type !== filters.entityType) return false;
    if (filters.dateFrom && new Date(log.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(log.created_at) > new Date(filters.dateTo)) return false;
    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('create') || action.includes('INSERT')) return 'success';
    if (action.includes('delete') || action.includes('DELETE')) return 'danger';
    if (action.includes('update') || action.includes('UPDATE')) return 'warning';
    return 'info';
  };

  if (loading) {
    return <Loading fullScreen message="Loading audit logs..." />;
  }

  const actions = [...new Set(logs.map((l) => l.action))];
  const entityTypes = [...new Set(logs.map((l) => l.entity_type))];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-2">System activity and user actions</p>
      </div>

      {/* Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            label="Action"
            options={[
              { value: '', label: 'All Actions' },
              ...actions.map((action) => ({ value: action, label: action })),
            ]}
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          />

          <Select
            label="Entity Type"
            options={[
              { value: '', label: 'All Entity Types' },
              ...entityTypes.map((type) => ({ value: type, label: type })),
            ]}
            value={filters.entityType}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
          />

          <Input
            type="date"
            label="From Date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          />

          <Input
            type="date"
            label="To Date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          />

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => setFilters({ action: '', entityType: '', dateFrom: '', dateTo: '' })}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 flex items-center gap-4">
        <Badge variant="info">Total logs: {logs.length}</Badge>
        <Badge variant="primary">Filtered: {filteredLogs.length}</Badge>
      </div>

      {/* Table */}
      {filteredLogs.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Timestamp</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>Entity Type</TableHeaderCell>
                <TableHeaderCell>Entity ID</TableHeaderCell>
                <TableHeaderCell>Details</TableHeaderCell>
                <TableHeaderCell>IP Address</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">{formatDate(log.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.entity_type}</TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {log.entity_id?.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                  </TableCell>
                  <TableCell className="text-sm">{log.ip_address || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={<FunnelIcon className="w-12 h-12 text-gray-400 mx-auto" />}
          title="No logs found"
          message="No audit logs match the current filters"
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
