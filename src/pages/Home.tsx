import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

export const Home: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCurrentUser()
      .then((res) => {
        setCurrentUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch user details.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 className="gradient-text" style={styles.title}>Scaffold Dashboard</h1>
        <p style={styles.subtitle}>Welcome to Phase 1 setup. Explore structure and baseline tooling.</p>
      </header>

      {/* Grid of status cards */}
      <div style={styles.grid}>
        {/* User profile card */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>User Session</h3>
          {loading ? (
            <div style={styles.loaderPlaceholder}>Loading profile data...</div>
          ) : error ? (
            <div style={styles.errorText}>{error}</div>
          ) : currentUser ? (
            <div style={styles.userInfo}>
              <div style={styles.avatar}>{currentUser.name.charAt(0)}</div>
              <div>
                <h4 style={styles.userName}>{currentUser.name}</h4>
                <p style={styles.userDetail}>{currentUser.email}</p>
                <span style={styles.roleBadge}>{currentUser.role.toUpperCase()}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Scaffold Statistics card */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>Scaffold Statistics</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.listLabel}>Framework:</span>
              <span style={styles.listValue}>React + Vite (TypeScript)</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.listLabel}>Router:</span>
              <span style={styles.listValue}>React Router DOM v6</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.listLabel}>Style Engine:</span>
              <span style={styles.listValue}>CSS Variables (Vanilla)</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.listLabel}>API Mock Mode:</span>
              <span style={{ 
                ...styles.listValue, 
                color: api.isMockEnabled() ? 'var(--warning)' : 'var(--success)',
                fontWeight: 600
              }}>
                {api.isMockEnabled() ? 'Mock Active' : 'Real API Direct'}
              </span>
            </li>
          </ul>
        </div>

        {/* Directory Structure card */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>Source Blueprint</h3>
          <div style={styles.blueprintContainer}>
            <pre style={styles.blueprintText}>{`src/
├── components/   # Shell, Boundaries, Nav
├── hooks/        # State and logical helpers
├── pages/        # View screens (Home, About)
├── services/     # API stub & mock controllers
├── styles/       # CSS tokens & palettes
└── types/        # TypeScript signatures`}</pre>
          </div>
        </div>
      </div>

      {/* Call to action panel */}
      <section className="glass-panel" style={styles.callout}>
        <div style={styles.calloutContent}>
          <h3 style={{ marginBottom: '8px', fontWeight: 700 }}>Toggle API States Dynamically</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Use the badge in the top header bar to toggle the global API server mock toggle. 
            When set to Mock, the service intercepts fetches with local stubs. When set to Real, it attempts connections to your endpoints.
          </p>
        </div>
      </section>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
  loaderPlaceholder: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    padding: '20px 0',
  },
  errorText: {
    color: 'var(--danger)',
    fontSize: '14px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    padding: '10px 0',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary-glow)',
    color: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 700,
    border: '2px solid var(--border-color)',
  },
  userName: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  userDetail: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  roleBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--accent-primary)',
    color: '#ffffff',
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
  blueprintContainer: {
    background: 'var(--bg-tertiary)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  blueprintText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  callout: {
    padding: 'var(--spacing-lg)',
    borderLeft: '4px solid var(--accent-primary)',
  },
  calloutContent: {
    display: 'flex',
    flexDirection: 'column',
  },
};
