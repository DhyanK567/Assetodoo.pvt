import React, { useState } from 'react';
import { useAuth, type UserRole } from '../context/AuthContext';
import { api } from '../services/api';

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  onToggleSidebar, 
  isSidebarCollapsed 
}) => {
  const { currentUser, currentRole, changeRole } = useAuth();
  const [isMockApi, setIsMockApi] = useState(api.isMockEnabled());

  const handleToggleApiMode = () => {
    const nextMode = !isMockApi;
    api.toggleMockMode(nextMode);
    setIsMockApi(nextMode);
    window.location.reload();
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetRole = e.target.value as UserRole;
    changeRole(targetRole);
  };

  return (
    <header className="header" style={styles.topbar}>
      <div className="header-left">
        <button 
          className="toggle-sidebar-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          style={styles.toggleBtn}
        >
          {isSidebarCollapsed ? '→' : '←'}
        </button>
        <div className="logo" style={styles.logoBox}>
          <span className="gradient-text">Odoo</span>
          <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Asset</span>
        </div>
      </div>

      <div className="header-right" style={styles.rightArea}>
        {/* Mock Role Switcher Dropdown (Dev Mode) */}
        <div style={styles.devControls} className="glass-panel">
          <label htmlFor="role-select" style={styles.devLabel}>🧪 Mock Role:</label>
          <select 
            id="role-select" 
            value={currentRole} 
            onChange={handleRoleChange}
            style={styles.devSelect}
          >
            <option value="admin">Administrator</option>
            <option value="asset_manager">Asset Manager</option>
            <option value="dept_head">Dept Head</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {/* Mock/Real API Badge */}
        <div 
          className={`api-badge ${isMockApi ? 'mock' : 'real'}`} 
          onClick={handleToggleApiMode}
          title="Click to toggle between Mock and Real API modes"
          style={styles.apiBadge}
        >
          <span className="badge-dot" />
          <span>API: {isMockApi ? 'MOCK' : 'REAL'}</span>
        </div>

        {/* User Profile Info */}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {currentUser?.name.charAt(0) || 'U'}
          </div>
          <span style={styles.userName}>{currentUser?.name.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    height: 'var(--header-height)',
  },
  toggleBtn: {
    marginRight: '8px',
  },
  logoBox: {
    fontSize: '1.25rem',
  },
  rightArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  devControls: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    gap: '6px',
    background: 'rgba(79, 70, 229, 0.05)',
  },
  devLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    whiteSpace: 'nowrap',
  },
  devSelect: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '12px',
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
  },
  apiBadge: {
    cursor: 'pointer',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '16px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
    border: '1px solid var(--border-color)',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    display: 'none', // Mobile responsive override
  },
};

// Add media queries helper behavior
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @media (min-width: 640px) {
      .header-right span { display: inline !important; }
    }
  `;
  document.head.appendChild(styleSheet);
}
