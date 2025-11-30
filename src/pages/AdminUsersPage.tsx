import React, { useState, useEffect } from 'react';
import { usersApi } from '../lib/api';
import {
  Button,
  Input,
  Select,
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
  EmptyState,
  ToastContainer,
} from '../components';
import { useToast } from '../hooks/useToast';
import { TrashIcon, KeyIcon, PlusIcon, DocumentMinusIcon } from '@heroicons/react/24/outline';

export const AdminUsersPage: React.FC = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState<{ username: string; tempPassword: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);
  const [createPasswordData, setCreatePasswordData] = useState<{ username: string; tempPassword: string } | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'clearance_manager',
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({
        role: roleFilter || undefined,
        search: searchTerm || undefined,
        limit: 50,
      });
      setUsers(response.users);
    } catch (err: any) {
      showError('Failed to load users');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await usersApi.create(formData);
      if (response.temporaryPassword) {
        setCreatePasswordData({
          username: formData.username,
          tempPassword: response.temporaryPassword,
        });
        setShowCreatePasswordModal(true);
        setShowCreateModal(false);
      } else {
        success('User created successfully');
        setShowCreateModal(false);
      }
      setFormData({
        username: '',
        email: '',
        full_name: '',
        role: 'clearance_manager',
      });
      fetchUsers();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    setIsDeleting(true);
    try {
      await usersApi.delete(selectedUserId);
      success('User deleted successfully');
      setDeleteConfirmOpen(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserId) return;
    setIsResetting(true);
    try {
      const response = await usersApi.resetPassword(selectedUserId);
      if (response.temporaryPassword) {
        setResetPasswordData({
          username: selectedUsername,
          tempPassword: response.temporaryPassword,
        });
        setShowPasswordModal(true);
        setResetConfirmOpen(false);
      } else {
        showError('Failed to generate password');
      }
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const copyPasswordToClipboard = () => {
    if (resetPasswordData?.tempPassword) {
      navigator.clipboard.writeText(resetPasswordData.tempPassword);
      success('Password copied to clipboard');
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setResetPasswordData(null);
    setSelectedUserId(null);
    setSelectedUsername('');
  };

  const closeCreatePasswordModal = () => {
    setShowCreatePasswordModal(false);
    setCreatePasswordData(null);
  };

  const copyCreatePasswordToClipboard = () => {
    if (createPasswordData?.tempPassword) {
      navigator.clipboard.writeText(createPasswordData.tempPassword);
      success('Password copied to clipboard');
    }
  };

  if (loading && users.length === 0) {
    return <Loading fullScreen message="Loading users..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <Button leftIcon={<PlusIcon className="w-5 h-5" />} onClick={() => setShowCreateModal(true)}>
          Create User
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Input
          type="text"
          placeholder="Search by username, email, or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'All Roles' },
            { value: 'admin', label: 'Admin' },
            { value: 'accounts', label: 'Accounts Manager' },
            { value: 'clearance_manager', label: 'Clearance Manager' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      {users.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Username</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Full Name</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell align="center">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-semibold text-blue-600">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.full_name || '-'}</TableCell>
                <TableCell>
                  <Badge variant="info" size="sm">
                    {user.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.is_active ? 'success' : 'danger'}
                    size="sm"
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<KeyIcon className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setSelectedUsername(user.username);
                        setResetConfirmOpen(true);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<TrashIcon className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<DocumentMinusIcon className="w-12 h-12 text-gray-400 mx-auto" />}
          title="No users found"
          message="Create a new user to get started"
          action={{
            label: 'Create User',
            onClick: () => setShowCreateModal(true),
          }}
        />
      )}

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} title="Create New User" onClose={() => setShowCreateModal(false)} size="md">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <Input
            type="email"
            label="Email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <Select
            label="Role"
            options={[
              { value: 'clearance_manager', label: 'Clearance Manager' },
              { value: 'accounts', label: 'Accounts Manager' },
              { value: 'admin', label: 'Admin' },
            ]}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Confirm Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="Reset Password"
        message={`Generate a temporary password for ${selectedUsername}?`}
        confirmText="Reset Password"
        cancelText="Cancel"
        isLoading={isResetting}
        onConfirm={handleResetPassword}
        onCancel={() => {
          setResetConfirmOpen(false);
          setSelectedUserId(null);
          setSelectedUsername('');
        }}
      />

      {/* Create User Password Modal */}
      <Modal isOpen={showCreatePasswordModal} title="User Created - Temporary Password" onClose={closeCreatePasswordModal} size="md">
        <div className="space-y-4">
          <Alert
            type="success"
            title="User Created Successfully"
            message={`User ${createPasswordData?.username} has been created with a temporary password`}
          />

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Temporary Password:</p>
            <p className="font-mono text-sm text-gray-900 break-all mb-3">{createPasswordData?.tempPassword}</p>
            <Button onClick={copyCreatePasswordToClipboard} size="sm" className="w-full">
              Copy Password
            </Button>
          </div>

          <Alert
            type="warning"
            title="Important"
            message="Share this password securely with the user. They will be required to change it on first login. This password will not be shown again."
          />

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={closeCreatePasswordModal}>Done</Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={showPasswordModal} title="Temporary Password Generated" onClose={closePasswordModal} size="md">
        <div className="space-y-4">
          <Alert
            type="info"
            title="Password Generated"
            message={`A temporary password has been generated for ${resetPasswordData?.username}`}
          />

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Temporary Password:</p>
            <p className="font-mono text-sm text-gray-900 break-all mb-3">{resetPasswordData?.tempPassword}</p>
            <Button onClick={copyPasswordToClipboard} size="sm" className="w-full">
              Copy Password
            </Button>
          </div>

          <Alert
            type="warning"
            title="Important"
            message="Share this password securely. The user must change it on first login. This password will not be shown again."
          />

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={closePasswordModal}>Done</Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};
