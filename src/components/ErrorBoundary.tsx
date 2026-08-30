import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught rendering error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallbackUI) {
        return this.fallbackUI;
      }

      return (
        <div style={styles.container}>
          <div style={styles.card} className="glass-panel animate-fade-in">
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.description}>
              An unexpected error occurred in the application rendering engine.
            </p>
            {this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details</summary>
                <pre style={styles.code}>{this.state.error.stack || this.state.error.message}</pre>
              </details>
            )}
            <button 
              style={styles.button}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private get fallbackUI(): ReactNode {
    return this.props.fallback || null;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '24px',
    boxSizing: 'border-box' as const,
    backgroundColor: 'var(--bg-secondary)',
  },
  card: {
    maxWidth: '520px',
    width: '100%',
    padding: '32px',
    borderRadius: '12px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--danger)',
    marginBottom: '12px',
  },
  description: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
  },
  details: {
    textAlign: 'left' as const,
    marginBottom: '24px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
    overflow: 'hidden',
  },
  summary: {
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    userSelect: 'none' as const,
    borderBottom: '1px solid var(--border-color)',
  },
  code: {
    padding: '12px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--danger)',
    overflowX: 'auto' as const,
    maxHeight: '180px',
    whiteSpace: 'pre-wrap' as const,
  },
  button: {
    background: 'var(--accent-primary)',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'background var(--transition-fast)',
  },
};
