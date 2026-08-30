import React, { useState } from 'react';
import { DepartmentTab } from './DepartmentTab';
import { CategoryTab } from './CategoryTab';
import { EmployeeTab } from './EmployeeTab';
import { useAuth } from '../../context/AuthContext';
import './OrgSetup.css';

type TabType = 'departments' | 'categories' | 'employees';

export const OrgSetupPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('departments');

  // Safety fallback check just in case the RouteGuard was somehow bypassed
  if (currentRole !== 'admin') {
    return (
      <div style={styles.unauthorized}>
        <h3>Access Gated</h3>
        <p>You must have Admin privileges to access the Organization Setup dashboard.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTitleBox}>
          <h1 className="gradient-text" style={styles.title}>Organization Setup</h1>
          <p style={styles.subtitle}>
            Manage corporate hierarchies, custom categorization properties, and modify directories.
          </p>
        </div>
        <div style={styles.securityBadge}>
          <span style={styles.badgeDot} />
          <span>ADMIN PRIVILEGES SECURED</span>
        </div>
      </header>

      {/* Warning banner */}
      <div style={styles.warningAlert}>
        🛡️ <strong>Master Data Operations:</strong> Modifying categories, hierarchy trees, or user roles alters authorization behaviors. Server-side validation is required for database changes.
      </div>

      {/* Tabs navigation headers */}
      <div style={styles.tabsContainer} className="glass-panel">
        <button
          onClick={() => setActiveTab('departments')}
          className={`tab-trigger ${activeTab === 'departments' ? 'active' : ''}`}
          style={styles.tabBtn}
        >
          🏢 Departments
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`tab-trigger ${activeTab === 'categories' ? 'active' : ''}`}
          style={styles.tabBtn}
        >
          🏷️ Asset Categories
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`tab-trigger ${activeTab === 'employees' ? 'active' : ''}`}
          style={styles.tabBtn}
        >
          👥 Employee Directory
        </button>
      </div>

      {/* Selected Tab content viewport */}
      <div style={styles.tabContentViewport} className="animate-fade-in">
        {activeTab === 'departments' && <DepartmentTab />}
        {activeTab === 'categories' && <CategoryTab />}
        {activeTab === 'employees' && <EmployeeTab />}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 'var(--spacing-md)',
  },
  headerTitleBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    marginBottom: '4px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--danger)',
    alignSelf: 'center',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--danger)',
  },
  warningAlert: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    lineHeight: 1.4,
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    padding: '4px 4px 0 4px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    gap: '4px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '10px 16px',
    fontSize: '13.5px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    borderRadius: '4px 4px 0 0',
    transition: 'all var(--transition-fast)',
    borderBottom: '2px solid transparent',
  },
  tabContentViewport: {
    marginTop: '4px',
  },
  unauthorized: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--danger)',
  },
};
