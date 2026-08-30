import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';

interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: string;
  allowedRoles: UserRole[];
  color: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'register',
    label: 'Register New Asset',
    description: 'Add a new device to catalog registry',
    path: '/assets',
    icon: '➕',
    allowedRoles: ['admin', 'asset_manager'],
    color: 'var(--accent-primary)',
  },
  {
    id: 'request',
    label: 'Request Asset',
    description: 'Submit an allocation requisition',
    path: '/requests',
    icon: '📥',
    allowedRoles: ['admin', 'asset_manager', 'dept_head', 'employee'],
    color: 'var(--success)',
  },
  {
    id: 'maintenance',
    label: 'Report Defect',
    description: 'Raise a hardware maintenance request',
    path: '/maintenance',
    icon: '🛠️',
    allowedRoles: ['admin', 'asset_manager', 'dept_head', 'employee'],
    color: 'var(--warning)',
  },
];

export const QuickActions: React.FC = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();

  // Filter actions allowed for current user role
  const visibleActions = QUICK_ACTIONS.filter((action) =>
    action.allowedRoles.includes(currentRole)
  );

  return (
    <div className="glass-panel" style={styles.container}>
      <h3 style={styles.title}>Quick Actions</h3>
      <p style={styles.subtitle}>Direct shortcuts based on your access privileges.</p>

      <div style={styles.btnGrid}>
        {visibleActions.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            style={{ ...styles.actionBtn, borderLeft: `4px solid ${action.color}` }}
            className="action-btn-hover"
          >
            <span style={styles.actionIcon}>{action.icon}</span>
            <div style={styles.actionText}>
              <span style={styles.actionLabel}>{action.label}</span>
              <span style={styles.actionDesc}>{action.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '2px',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: 'var(--spacing-md)',
  },
  btnGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    textAlign: 'left',
    gap: '14px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  actionIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  actionText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  actionLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  actionDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
};

// Add standard hover animations for quick action items
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    .action-btn-hover:hover {
      background: var(--bg-tertiary) !important;
      border-color: var(--border-hover) !important;
      transform: translateX(2px);
    }
  `;
  document.head.appendChild(styleSheet);
}
