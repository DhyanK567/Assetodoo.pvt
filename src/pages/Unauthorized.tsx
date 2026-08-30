import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { currentRole } = useAuth();
  const location = useLocation();
  
  // Retrieve target path if passed in redirect state
  const fromPath = location.state?.from?.pathname || 'the requested resource';

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.card} className="glass-panel">
        <div style={styles.lockIcon}>🔒</div>
        <h1 style={styles.title} className="gradient-text">Access Unauthorized</h1>
        <p style={styles.description}>
          Your active session role (<strong>{currentRole.replace('_', ' ').toUpperCase()}</strong>) 
          is not permitted to view <strong>{fromPath}</strong>.
        </p>
        <p style={styles.subtext}>
          If you believe this is in error, please contact your systems administrator, or use the role-switcher 
          in the top bar header to swap identities.
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
    maxWidth: '520px',
    width: '100%',
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: '60px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    marginBottom: '12px',
  },
  description: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    lineHeight: 1.5,
  },
  subtext: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '28px',
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
