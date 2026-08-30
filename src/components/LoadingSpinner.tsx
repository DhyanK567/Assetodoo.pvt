import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading resources...', 
  fullScreen = false 
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    ...(fullScreen ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--bg-glass)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 9999,
    } : {
      width: '100%',
      minHeight: '200px',
    })
  };

  return (
    <div style={containerStyle} className="animate-fade-in">
      <div style={styles.spinnerOuter}>
        <div style={styles.spinnerInner} className="animate-spin" />
        <div style={styles.spinnerCenter} />
      </div>
      {message && (
        <p style={styles.message} className="animate-pulse-glow">
          {message}
        </p>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  spinnerOuter: {
    position: 'relative',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '3px solid var(--border-color)',
    borderTopColor: 'var(--accent-primary)',
    borderRightColor: 'var(--accent-secondary)',
  },
  spinnerCenter: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary)',
    boxShadow: 'var(--shadow-glow)',
  },
  message: {
    marginTop: '16px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    letterSpacing: '0.025em',
  },
};
