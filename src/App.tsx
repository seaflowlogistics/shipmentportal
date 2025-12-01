import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute';
import { Navigation } from './components/Navigation';
import { ROUTES } from './utils/constants';
import { LoginPage } from './pages/LoginPage';
import { CreateShipmentPage } from './pages/CreateShipmentPage';
import { ShipmentsListPage } from './pages/ShipmentsListPage';
import { ShipmentDetailPage } from './pages/ShipmentDetailPage';
import { EditShipmentPage } from './pages/EditShipmentPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AccountsDashboard } from './pages/AccountsDashboard';
import { ClearanceManagerDashboard } from './pages/ClearanceManagerDashboard';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';

function AppContent() {
  return (
    <>
      <Navigation />
      <Routes>
        {/* Dashboard routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/accounts/dashboard"
          element={
            <RoleBasedRoute allowedRoles={['accounts']}>
              <AccountsDashboard />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/clearance/dashboard"
          element={
            <RoleBasedRoute allowedRoles={['clearance_agent']}>
              <ClearanceManagerDashboard />
            </RoleBasedRoute>
          }
        />

        {/* Password management routes */}
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Shipment routes */}
        <Route path="/shipments" element={<ShipmentsListPage />} />

        <Route
          path="/create-shipment"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'clearance_agent']}>
              <CreateShipmentPage />
            </RoleBasedRoute>
          }
        />

        <Route path="/shipment/:id" element={<ShipmentDetailPage />} />

        <Route
          path="/edit-shipment/:id"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'clearance_agent', 'accounts']}>
              <EditShipmentPage />
            </RoleBasedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminAuditLogsPage />
            </RoleBasedRoute>
          }
        />

        {/* Dashboard redirect */}
        <Route path="/dashboard" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />

        {/* Default redirect for root */}
        <Route path="/" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Routes>
      {/* Public authentication routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* All protected routes wrapped with AppContent - must come before specific dashboard routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

export default App;
