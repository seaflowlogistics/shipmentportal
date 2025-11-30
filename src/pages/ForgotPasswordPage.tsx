import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Alert, Card, CardHeader, CardBody } from '../components';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export const ForgotPasswordPage: React.FC = () => {
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      setError('Please paste your reset token');
      return;
    }
    setError('');
    // Token will be used by clicking "Continue to Reset Password"
  };

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

        {/* Forgot Password Card */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Reset Password</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Info Alert */}
            <Alert
              type="info"
              title="Contact Your Administrator"
              message="Since we don't have email functionality, contact your administrator to request a password reset token."
              dismissible={false}
            />

            {/* Token Input Form */}
            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div>
                <p className="text-gray-600 text-sm mb-4">
                  Once you receive your reset token from the administrator, paste it below:
                </p>

                {error && (
                  <Alert
                    type="error"
                    message={error}
                    onClose={() => setError('')}
                    dismissible
                    className="mb-4"
                  />
                )}

                <Input
                  type="text"
                  label="Reset Token"
                  placeholder="Paste your reset token here"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </div>

              {resetToken.trim() && (
                <Link
                  to={`/reset-password/${resetToken}`}
                  className="block"
                >
                  <Button className="w-full">
                    Continue to Reset Password
                  </Button>
                </Link>
              )}
            </form>

            {/* Back to Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Back to Login
                </Link>
              </p>
            </div>
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
