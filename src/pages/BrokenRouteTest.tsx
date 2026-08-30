import React, { useState } from 'react';

export const BrokenRouteTest: React.FC = () => {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error('This is an intentional runtime simulation error triggered from within BrokenRouteTest.tsx.');
  }

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 className="gradient-text" style={styles.title}>Error Boundary Validation</h1>
        <p style={styles.subtitle}>Test application stability by triggering runtime errors.</p>
      </header>

      <div className="glass-panel" style={styles.card}>
        <p style={styles.paragraph}>
          An Error Boundary captures exceptions thrown anywhere inside its child components tree, 
          preventing the entire React application from crashing to a blank screen.
        </p>
        
        <p style={styles.paragraph}>
          Clicking the button below will cause this component to throw an error during its next render lifecycle, 
          triggering our ErrorBoundary and displaying the custom error panel.
        </p>

        <button 
          style={styles.button}
          onClick={() => setShouldCrash(true)}
        >
          Simulate App Crash
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xl)',
    maxWidth: '600px',
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
  card: {
    padding: 'var(--spacing-xl)',
  },
  paragraph: {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    fontSize: '14.5px',
    marginBottom: 'var(--spacing-md)',
  },
  button: {
    background: 'var(--danger)',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'background var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)',
    marginTop: 'var(--spacing-sm)',
  },
};
