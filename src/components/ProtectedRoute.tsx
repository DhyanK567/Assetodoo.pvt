import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser, currentRole, isAuthenticated } = useAuth();
  const location = useLocation();

  // If user state is still loading, show a loading spinner
  if (currentUser === null && localStorage.getItem('MOCK_AUTH_ROLE')) {
    return <LoadingSpinner message="Authenticating session..." fullScreen />;
  }

  // If the user is not authenticated, redirect to login page (we'll allow auto-auth for dev purposes)
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] User not authenticated. Redirecting...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and the user does not have permission, redirect to unauthorized page
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    console.warn(
      `[ProtectedRoute Guard] Access denied. Path "${location.pathname}" requires roles: [${allowedRoles.join(
        ', '
      )}]. User role: "${currentRole}".`
    );
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
