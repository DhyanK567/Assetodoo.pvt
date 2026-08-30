import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import './BaseLayout.css';

export const BaseLayout: React.FC = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMockApi, setIsMockApi] = useState(api.isMockEnabled());
  const [systemStatus, setSystemStatus] = useState<string>('Connecting...');

  // Fetch status dynamically on load
  useEffect(() => {
    api.getSystemStatus()
      .then((res) => {
        setSystemStatus(`Active (${res.data.version || 'v1.0.0'})`);
      })
      .catch(() => {
        setSystemStatus('Error checking status');
      });
  }, [isMockApi]);

  const handleToggleApiMode = () => {
    const nextMode = !isMockApi;
    api.toggleMockMode(nextMode);
    setIsMockApi(nextMode);
    // Reload to ensure all services adapt to the new state
    window.location.reload();
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button 
            className="toggle-sidebar-btn" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label="Toggle Sidebar"
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
          <div className="logo">
            <span className="gradient-text">Odoo</span>
            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Shell</span>
          </div>
        </div>

        <div className="header-right">
          {/* Mock/Real API Toggle Button */}
          <div 
            className={`api-badge ${isMockApi ? 'mock' : 'real'}`} 
            onClick={handleToggleApiMode}
            title="Click to toggle between Mock and Real API modes"
          >
            <span className="badge-dot" />
            <span>API: {isMockApi ? 'MOCK' : 'REAL'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="main-wrapper">
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav">
            <Link to="/" className={`nav-item ${isActive('/')}`}>
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Dashboard</span>
            </Link>
            
            <Link to="/about" className={`nav-item ${isActive('/about')}`}>
              <span className="nav-icon">ℹ️</span>
              <span className="nav-label">About Shell</span>
            </Link>

            <Link to="/broken-route-test" className={`nav-item ${isActive('/broken-route-test')}`}>
              <span className="nav-icon">⚠️</span>
              <span className="nav-label">Trigger Error</span>
            </Link>
          </nav>

          <div style={{ padding: 'var(--spacing-sm) 0', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted)',
              display: isSidebarCollapsed ? 'none' : 'block'
            }}>
              <div>Status: {systemStatus}</div>
            </div>
          </div>
        </aside>

        {/* Outer Content Area */}
        <div className={`content-area ${isSidebarCollapsed ? 'expanded' : ''}`}>
          <main className="main-content">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="footer">
            <span>© {new Date().getFullYear()} Odoo Private. All rights reserved.</span>
            <span>v1.0.0-alpha</span>
          </footer>
        </div>
      </div>
    </div>
  );
};
