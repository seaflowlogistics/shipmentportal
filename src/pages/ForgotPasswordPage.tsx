import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Alert, Card, CardHeader, CardBody } from '../components';
import { authApi } from '../lib/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setSuccess('If an account exists with this email, you will receive a password reset link shortly.');
      setEmail('');
    } catch (err: any) {
      // For security reasons, we might want to show the same success message
      // or a generic error. Here we'll show a generic error if it's not a 404.
      console.error('Forgot password error:', err);
      setError('Failed to process your request. Please try again later.');
    } finally {
      setLoading(false);
    }
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
            <p className="text-gray-600 text-sm mt-1">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </CardHeader>
          <CardBody className="space-y-6">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
                dismissible
                className="mb-4"
              />
            )}

            {success && (
              <Alert
                type="success"
                title="Check your email"
                message={success}
                dismissible={false}
                className="mb-4"
              />
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={loading}
                  disabled={loading}
                >
                  Send Reset Link
                </Button>
              </form>
            )}

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
