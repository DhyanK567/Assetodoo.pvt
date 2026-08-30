import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 className="gradient-text" style={styles.title}>About Odoo Shell</h1>
        <p style={styles.subtitle}>Phase 1 Application scaffold blueprint and guidelines.</p>
      </header>

      <div className="glass-panel" style={styles.card}>
        <h3 style={styles.sectionTitle}>Purpose & Scope</h3>
        <p style={styles.paragraph}>
          This shell app establishes the structural and structural scaffold of our application. 
          By standardizing routing boundaries, CSS custom variables, API service toggles, and safety limits, 
          we ensure subsequent development phases proceed efficiently and with minimal technical debt.
        </p>

        <h3 style={styles.sectionTitle}>Guiding Design Aesthetics</h3>
        <p style={styles.paragraph}>
          We follow premium layout tokens designed around HSL-centered color palettes, 
          collapsible sidebars for flexible viewports, clean readable monospaced font maps for system files, 
          and smooth micro-transitions. Dark mode support is automated via standard system media queries.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xl)',
    maxWidth: '800px',
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
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginTop: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-sm)',
    color: 'var(--text-primary)',
  },
  paragraph: {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    fontSize: '14.5px',
    marginBottom: 'var(--spacing-md)',
  },
};
