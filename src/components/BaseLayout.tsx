import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import './BaseLayout.css';

export const BaseLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="app-container">
      {/* Top Header Bar */}
      <Topbar 
        onToggleSidebar={handleToggleSidebar} 
        isSidebarCollapsed={isSidebarCollapsed} 
      />

      {/* Sidebar & Core Viewport container */}
      <div className="main-wrapper">
        <Sidebar collapsed={isSidebarCollapsed} />

        <div className={`content-area ${isSidebarCollapsed ? 'expanded' : ''}`}>
          <main className="main-content">
            <Outlet />
          </main>

          <footer className="footer">
            <span>© {new Date().getFullYear()} Odoo Private. All rights reserved.</span>
            <span>v1.0.0-alpha (Phase 2 Scaffold)</span>
          </footer>
        </div>
      </div>
    </div>
  );
};
