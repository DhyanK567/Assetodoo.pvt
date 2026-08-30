import React from 'react';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string; // Optional CSS color variable (e.g., 'var(--accent-primary)')
}

export const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'var(--accent-primary)' 
}) => {
  return (
    <div className="glass-panel" style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={styles.cardHeader}>
        <span style={styles.title}>{title}</span>
        <span style={{ ...styles.iconWrapper, backgroundColor: `${color}15`, color: color }}>
          {icon}
        </span>
      </div>
      <div style={styles.valueContainer}>
        <span style={styles.value}>{value}</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '120px',
    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
    cursor: 'default',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 'var(--spacing-sm)',
  },
  title: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  iconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  valueContainer: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'baseline',
  },
  value: {
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1.1,
  },
};

// Add standard hover card lift animations via custom style tag
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    .glass-panel:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  `;
  document.head.appendChild(styleSheet);
}
