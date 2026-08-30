import React from 'react';
import { useAuth, type UserRole } from '../context/AuthContext';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * RoleGate component for fine-grained, component-level access controls.
 * Hides actions, buttons, panels, or entire columns if the active role doesn't match.
 * 
 * NOTE: This is client-side gating only. Real validation must be handled by the API.
 */
export const RoleGate: React.FC<RoleGateProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { currentRole } = useAuth();

  if (!allowedRoles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
