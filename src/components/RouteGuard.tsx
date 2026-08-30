import React from 'react';
import { Navigate } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'user' | 'guest'>;
}

/**
 * RouteGuard placeholder component.
 * Currently allows all traffic but serves as a scaffold for authentication checks.
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  // Placeholder user state. In a real application, retrieve this from auth context.
  const isAuthenticated = true; 
  const currentUserRole = 'admin';

  if (!isAuthenticated) {
    // Redirect to login page or custom view
    console.log('[RouteGuard] User not authenticated. Redirecting...');
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUserRole)) {
    console.warn(`[RouteGuard] Role "${currentUserRole}" is not permitted to access this resource.`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
