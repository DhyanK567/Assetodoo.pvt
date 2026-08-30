import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  allowedRoles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '🏠', allowedRoles: ['admin', 'asset_manager', 'dept_head', 'employee'] },
  { path: '/assets', label: 'Asset Registry', icon: '📦', allowedRoles: ['admin', 'asset_manager', 'dept_head'] },
  { path: '/booking', label: 'Resource Booking', icon: '📅', allowedRoles: ['admin', 'asset_manager', 'dept_head', 'employee'] },
  { path: '/requests', label: 'Asset Requests', icon: '📥', allowedRoles: ['admin', 'asset_manager', 'dept_head', 'employee'] },
  { path: '/allocations', label: 'Allocations Map', icon: '🔗', allowedRoles: ['admin', 'asset_manager', 'dept_head'] },
  { path: '/maintenance', label: 'Maintenance Log', icon: '🛠️', allowedRoles: ['admin', 'asset_manager', 'employee'] },
  { path: '/audits', label: 'Audit Stocktakes', icon: '📋', allowedRoles: ['admin', 'asset_manager'] },
  { path: '/disposal', label: 'Decommissioning', icon: '♻️', allowedRoles: ['admin', 'asset_manager'] },
  { path: '/organization', label: 'Organization Setup', icon: '🏢', allowedRoles: ['admin'] },
  { path: '/reports', label: 'Reports & Costs', icon: '📊', allowedRoles: ['admin', 'asset_manager', 'dept_head'] },
  { path: '/broken-route-test', label: 'Trigger Error', icon: '⚠️', allowedRoles: ['admin', 'asset_manager', 'dept_head', 'employee'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const { currentRole } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  // Filter items matching the user's role
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(currentRole)
  );

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
        {visibleNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path)}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon" style={{ fontSize: '18px' }}>{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={styles.footerContainer}>
        <div style={{ 
          fontSize: '11px', 
          color: 'var(--text-muted)',
          display: collapsed ? 'none' : 'block',
          textAlign: 'center'
        }}>
          <div>Odoo Scaffold Engine</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>Role Gating Active</div>
        </div>
      </div>
    </aside>
  );
};

const styles = {
  footerContainer: {
    padding: 'var(--spacing-sm) 0', 
    borderTop: '1px solid var(--border-color)',
    marginTop: 'var(--spacing-sm)'
  }
};
