import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ErrorBoundary } from './ErrorBoundary';
import { ProtectedRoute } from './ProtectedRoute';
import { BaseLayout } from './BaseLayout';
import { LoadingSpinner } from './LoadingSpinner';

// Authentication Pages
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { ForgotPassword } from '../pages/ForgotPassword';

// Dashboard Pages
import { Dashboard } from '../pages/Dashboard';
import { AssetRegistry } from '../pages/AssetRegistry';
import { ResourceBookingPage } from '../pages/ResourceBooking';
import { AssetRequests } from '../pages/AssetRequests';
import { Allocations } from '../pages/Allocations';
import { Maintenance } from '../pages/Maintenance';
import { Audits } from '../pages/Audits';
import { Disposal } from '../pages/Disposal';
import { OrgSetupPage } from '../pages/OrgSetup/OrgSetupPage';
import { Reports } from '../pages/Reports';
import { ActivityLogPage } from '../pages/ActivityLogPage';
import { BrokenRouteTest } from '../pages/BrokenRouteTest';
import { Unauthorized } from '../pages/Unauthorized';
import { NotFound } from '../pages/NotFound';

/**
 * AppShell bootstrapping with AuthContext:
 * Coordinates all layout outlines, route guards, loaders, and boundaries.
 */
export const AppShell: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner message="Loading application viewport..." fullScreen />}>
          <BrowserRouter>
            <Routes>
              {/* Standalone Authentication Pages (No header/sidebar) */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Core Layout containing Sidebar & Topbar */}
              <Route path="/" element={<BaseLayout />}>
                
                {/* 1. Dashboard (All authenticated users) */}
                <Route 
                  index 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* 2. Asset Registry */}
                <Route 
                  path="assets" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'dept_head']}>
                      <AssetRegistry />
                    </ProtectedRoute>
                  } 
                />

                {/* 3. Resource Booking */}
                <Route 
                  path="booking" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'dept_head', 'employee']}>
                      <ResourceBookingPage />
                    </ProtectedRoute>
                  } 
                />

                {/* 4. Asset Requests */}
                <Route 
                  path="requests" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'dept_head', 'employee']}>
                      <AssetRequests />
                    </ProtectedRoute>
                  } 
                />

                {/* 5. Allocations */}
                <Route 
                  path="allocations" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'dept_head']}>
                      <Allocations />
                    </ProtectedRoute>
                  } 
                />

                {/* 6. Maintenance */}
                <Route 
                  path="maintenance" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'dept_head', 'employee']}>
                      <Maintenance />
                    </ProtectedRoute>
                  } 
                />

                {/* 7. Audits */}
                <Route 
                  path="audits" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager']}>
                      <Audits />
                    </ProtectedRoute>
                  } 
                />

                {/* 8. Decommissioning / Disposal */}
                <Route 
                  path="disposal" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager']}>
                      <Disposal />
                    </ProtectedRoute>
                  } 
                />

                {/* 9. Organization Setup (Admin only) */}
                <Route 
                  path="organization" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <OrgSetupPage />
                    </ProtectedRoute>
                  } 
                />

                {/* 10. Reports & Analytics */}
                <Route 
                  path="reports" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'dept_head']}>
                      <Reports />
                    </ProtectedRoute>
                  } 
                />

                {/* 11. Activity Logs */}
                <Route 
                  path="logs" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'dept_head', 'employee']}>
                      <ActivityLogPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Developer Error Trigger Simulation */}
                <Route 
                  path="broken-route-test" 
                  element={
                    <ProtectedRoute>
                      <BrokenRouteTest />
                    </ProtectedRoute>
                  } 
                />

                {/* Unauthorized Warning page */}
                <Route path="unauthorized" element={<Unauthorized />} />

                {/* Fallback 404 handler */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
};
