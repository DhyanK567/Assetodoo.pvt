import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.card} className="glass-panel">
        <h1 style={styles.errorCode} className="gradient-text">404</h1>
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.description}>
          The link you followed may be broken, or the page may have been removed.
        </p>
        <Link to="/" style={styles.button}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    width: '100%',
    padding: '24px',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorCode: {
    fontSize: '72px',
    fontWeight: 900,
    lineHeight: 1,
    marginBottom: '12px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    lineHeight: 1.5,
  },
  button: {
    background: 'var(--accent-primary)',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'background var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)',
  },
};
