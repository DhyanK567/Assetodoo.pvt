import React from 'react';
import { useAuth, type UserRole } from '../context/AuthContext';
import { RoleGate } from '../components/RoleGate';

export const Dashboard: React.FC = () => {
  const { currentUser, currentRole } = useAuth();

  const getRoleBadgeStyle = (role: UserRole): React.CSSProperties => {
    switch (role) {
      case 'admin': return { backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' };
      case 'asset_manager': return { backgroundColor: 'var(--accent-primary-glow)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' };
      case 'dept_head': return { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' };
      case 'employee': return { backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' };
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 className="gradient-text" style={styles.title}>Asset Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, <strong>{currentUser?.name || 'User'}</strong>. Here is your role-specific overview.</p>
      </header>

      {/* Security warning notification */}
      <div style={styles.warningAlert}>
        <span style={{ marginRight: '8px' }}>⚠️</span>
        <strong>Security Notice:</strong> Client-side role-gating is for user experience only. All access constraints are verified independently on the backend API layer.
      </div>

      <div style={styles.grid}>
        {/* Profile Details Panel */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>Identity & Session</h3>
          <div style={styles.profileBox}>
            <div style={styles.avatar}>{currentUser?.name.charAt(0) || 'U'}</div>
            <div>
              <h4 style={{ fontWeight: 600 }}>{currentUser?.name}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>{currentUser?.email}</p>
              <span style={{ ...styles.badge, ...getRoleBadgeStyle(currentRole) }}>
                {currentRole.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Activity Summaries (Role-Gate verification) */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>Assigned Metrics</h3>
          <ul style={styles.list}>
            {/* Show for all roles */}
            <li style={styles.listItem}>
              <span style={styles.listLabel}>My Asset Requests</span>
              <span style={styles.listValue}>3 Active</span>
            </li>
            
            {/* Show only for Dept Head & Managers & Admin */}
            <RoleGate allowedRoles={['admin', 'asset_manager', 'dept_head']}>
              <li style={styles.listItem}>
                <span style={styles.listLabel}>Pending Department Approvals</span>
                <span style={{ ...styles.listValue, color: 'var(--warning)', fontWeight: 600 }}>5 Pending</span>
              </li>
            </RoleGate>

            {/* Show only for Managers & Admin */}
            <RoleGate allowedRoles={['admin', 'asset_manager']}>
              <li style={styles.listItem}>
                <span style={styles.listLabel}>Total Assets under Management</span>
                <span style={styles.listValue}>1,248 Active</span>
              </li>
              <li style={styles.listItem}>
                <span style={styles.listLabel}>Active Maintenance Orders</span>
                <span style={{ ...styles.listValue, color: 'var(--danger)', fontWeight: 600 }}>12 Overdue</span>
              </li>
            </RoleGate>
          </ul>
        </div>

        {/* Developer Info Card */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>Role Gate Simulator</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
            To check the screen layout, sidebar options, and route blocks for other roles, use the dropdown selector in the top-right header.
          </p>
          <div style={styles.rolesGrid}>
            <span style={{ ...styles.miniBadge, opacity: currentRole === 'admin' ? 1 : 0.4 }}>Admin</span>
            <span style={{ ...styles.miniBadge, opacity: currentRole === 'asset_manager' ? 1 : 0.4 }}>Asset Manager</span>
            <span style={{ ...styles.miniBadge, opacity: currentRole === 'dept_head' ? 1 : 0.4 }}>Dept Head</span>
            <span style={{ ...styles.miniBadge, opacity: currentRole === 'employee' ? 1 : 0.4 }}>Employee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xl)',
  },
  header: {
    marginBottom: 'var(--spacing-sm)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.05rem',
  },
  warningAlert: {
    padding: '12px 16px',
    backgroundColor: 'var(--warning-bg)',
    border: '1px solid var(--warning-border)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1.4,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 'var(--spacing-lg)',
  },
  card: {
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: 'var(--spacing-md)',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    padding: '10px 0',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-tertiary)',
    border: '2px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--accent-primary)',
  },
  badge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    display: 'inline-block',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  listLabel: {
    color: 'var(--text-secondary)',
  },
  listValue: {
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  rolesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: 'auto',
  },
  miniBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
  },
};
