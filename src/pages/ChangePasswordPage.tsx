import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';
import { Button, Input, Alert, Card, CardHeader, CardBody } from '../components';
import { CheckIcon } from '@heroicons/react/24/outline';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Both password fields are required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password strength check
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword({
        newPassword: password,
      });

      // Clear form
      setPassword('');
      setConfirmPassword('');

      // Logout and redirect to login
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // If user is not authenticated or mustChangePassword is not set, redirect to login
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SeaFlow Logistics</h1>
          <p className="text-gray-600 mt-2">Shipment Portal</p>
        </div>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Change Your Password</h2>
              <p className="text-gray-600 text-sm mt-1">Your password must be changed before you can continue</p>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Required Alert */}
            <Alert
              type="warning"
              title="Action Required"
              message="You are logging in for the first time. You must set a new password to continue."
              dismissible={false}
            />

            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
                dismissible
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="password"
                type="password"
                label="New Password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />

              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />

              {/* Password Requirements */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-3">Password must contain:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    One uppercase letter (A-Z)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    One lowercase letter (a-z)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    One number (0-9)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    One special character (!@#$%^&*)
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                disabled={loading}
                className="w-full"
              >
                Change Password
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          © 2024 SeaFlow Logistics. All rights reserved.
        </p>
      </div>
    </div>
  );
};
