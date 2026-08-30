import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Audits: React.FC = () => {
  const { currentRole } = useAuth();

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 className="gradient-text" style={styles.title}>Asset Auditing</h1>
        <p style={styles.subtitle}>Execute physical stocktakes, reconcile inventory discrepancies, and log audits.</p>
      </header>

      <div style={styles.grid}>
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>Functional Description</h3>
          <p style={styles.paragraph}>
            This module schedules audits, generates stocktake sheets, and records compliance states. 
            Auditors can verify physical asset existences (by barcode/RFID) and flag discrepancies.
          </p>
          <div style={styles.roleBox}>
            <strong>Authorized Roles:</strong> Admin, Asset Manager.
          </div>
        </div>

        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>Current Session Status</h3>
          <p style={styles.paragraph}>
            You are currently accessing this module as an <strong>{currentRole.replace('_', ' ').toUpperCase()}</strong>.
          </p>
          <div style={{ marginTop: 'auto', padding: '10px 14px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600 }}>
            ✓ Gating Allowed: Access Authorized.
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
  paragraph: {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    fontSize: '14.5px',
    marginBottom: 'var(--spacing-md)',
  },
  roleBox: {
    marginTop: '12px',
    padding: '10px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};
