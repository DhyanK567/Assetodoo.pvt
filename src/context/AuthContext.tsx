/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'admin' | 'asset_manager' | 'dept_head' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  changeRole: (role: UserRole) => void;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock profiles for each role
const MOCK_PROFILES: Record<UserRole, Omit<User, 'role'>> = {
  admin: { id: 'usr_admin', name: 'Alex Administrator', email: 'alex.admin@odoo.pvt' },
  asset_manager: { id: 'usr_manager', name: 'Sam Manager', email: 'sam.manager@odoo.pvt' },
  dept_head: { id: 'usr_dept_head', name: 'Jordan Director', email: 'jordan.head@odoo.pvt' },
  employee: { id: 'usr_employee', name: 'Taylor Worker', email: 'taylor.emp@odoo.pvt' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Check local storage for persistent mock role selection, default to admin
    const storedRole = (localStorage.getItem('MOCK_AUTH_ROLE') as UserRole) || 'admin';
    const profile = MOCK_PROFILES[storedRole];
    return {
      ...profile,
      role: storedRole,
    };
  });

  const changeRole = (role: UserRole) => {
    localStorage.setItem('MOCK_AUTH_ROLE', role);
    const profile = MOCK_PROFILES[role];
    setCurrentUser({
      ...profile,
      role,
    });
    console.log(`[AuthContext] Mock role changed dynamically to: ${role.toUpperCase()}`);
  };

  const login = (email: string, role: UserRole) => {
    const customUser: User = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role,
    };
    localStorage.setItem('MOCK_AUTH_ROLE', role);
    setCurrentUser(customUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const currentRole = currentUser?.role || 'employee';
  const isAuthenticated = currentUser !== null;

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, isAuthenticated, changeRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
