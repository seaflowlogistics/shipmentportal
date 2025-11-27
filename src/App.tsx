import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute';
import { ROUTES } from './utils/constants';
import { LoginPage } from './pages/LoginPage';

const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
    <p className="mt-4">Welcome, Administrator!</p>
  </div>
);

const AccountsDashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold">Accounts Dashboard</h1>
    <p className="mt-4">Welcome, Accounts Manager!</p>
  </div>
);

const ClearanceDashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold">Clearance Dashboard</h1>
    <p className="mt-4">Welcome, Clearance Manager!</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        
        {/* Protected routes - Admin */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        
        {/* Protected routes - Accounts */}
        <Route
          path={ROUTES.ACCOUNTS_DASHBOARD}
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin', 'accounts']}>
                <AccountsDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        
        {/* Protected routes - Clearance Manager */}
        <Route
          path={ROUTES.CLEARANCE_DASHBOARD}
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin', 'clearance_manager']}>
                <ClearanceDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
