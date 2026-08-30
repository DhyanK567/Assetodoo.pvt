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
  loginUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock profiles for dev role-switching convenience
const MOCK_PROFILES: Record<UserRole, Omit<User, 'role'>> = {
  admin: { id: 'usr_admin', name: 'Alex Administrator', email: 'alex.admin@odoo.pvt' },
  asset_manager: { id: 'usr_manager', name: 'Sam Manager', email: 'sam.manager@odoo.pvt' },
  dept_head: { id: 'usr_dept_head', name: 'Jordan Director', email: 'jordan.head@odoo.pvt' },
  employee: { id: 'usr_employee', name: 'Taylor Worker', email: 'taylor.emp@odoo.pvt' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Session is default-logged out unless mock session exists
    const session = localStorage.getItem('MOCK_USER_SESSION');
    try {
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  });

  const changeRole = (role: UserRole) => {
    if (!currentUser) return;
    
    const profile = MOCK_PROFILES[role];
    const updatedUser: User = {
      ...currentUser,
      ...profile,
      role,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('MOCK_USER_SESSION', JSON.stringify(updatedUser));
    console.log(`[AuthContext] Developer swapped role dynamically to: ${role.toUpperCase()}`);
  };

  const loginUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('MOCK_USER_SESSION', JSON.stringify(user));
    console.log(`[AuthContext] User logged in: ${user.email} as ${user.role.toUpperCase()}`);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('MOCK_USER_SESSION');
    console.log('[AuthContext] User logged out, cleared session.');
  };

  const currentRole = currentUser?.role || 'employee';
  const isAuthenticated = currentUser !== null;

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, isAuthenticated, changeRole, loginUser, logout }}>
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
