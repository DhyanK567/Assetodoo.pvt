import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { RouteGuard } from './RouteGuard';
import { BaseLayout } from './BaseLayout';
import { LoadingSpinner } from './LoadingSpinner';

// Pages
import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { BrokenRouteTest } from '../pages/BrokenRouteTest';
import { NotFound } from '../pages/NotFound';

/**
 * AppShell bootstrapping:
 * - ErrorBoundary for top-level component failures.
 * - Suspense for dynamic import resolution.
 * - BrowserRouter for managing history states.
 * - RouteGuard checks on dashboard entries.
 */
export const AppShell: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner message="Bootstrapping Shell Application..." fullScreen />}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BaseLayout />}>
              {/* Guarded default path */}
              <Route 
                index 
                element={
                  <RouteGuard allowedRoles={['admin', 'user']}>
                    <Home />
                  </RouteGuard>
                } 
              />
              
              {/* Static about route */}
              <Route path="about" element={<About />} />
              
              {/* Test routing path */}
              <Route path="broken-route-test" element={<BrokenRouteTest />} />
              
              {/* Fallback 404 handler */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  );
};
