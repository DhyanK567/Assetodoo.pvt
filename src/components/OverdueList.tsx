import React, { useState } from 'react';

interface OverdueItem {
  id: string;
  code: string;
  name: string;
  custodian: string;
  daysOverdue: number;
  category: string;
}

interface OverdueListProps {
  items: OverdueItem[];
}

export const OverdueList: React.FC<OverdueListProps> = ({ items }) => {
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

  const handleNotifyCustodian = (id: string, name: string) => {
    setNotifiedIds((prev) => [...prev, id]);
    console.log(`[OverdueList] Mock Notification dispatched to custodian for asset ID: ${id}`);
    alert(`Custodian notification sent for asset: ${name}`);
  };

  if (items.length === 0) {
    return (
      <div className="glass-panel" style={styles.emptyContainer}>
        <span style={{ fontSize: '24px' }}>🎉</span>
        <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>No Overdue Returns</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>All check-outs are current.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitleBox}>
          <span style={styles.headerIcon}>🚨</span>
          <h3 style={styles.headerTitle}>Overdue Returns</h3>
        </div>
        <span style={styles.countBadge}>{items.length} Critical</span>
      </div>

      <div style={styles.listContainer}>
        {items.map((item) => {
          const isNotified = notifiedIds.includes(item.id);
          return (
            <div key={item.id} style={styles.itemRow}>
              <div style={styles.itemLeft}>
                <span style={styles.assetCode}>{item.code}</span>
                <span style={styles.assetName}>{item.name}</span>
                <span style={styles.custodianName}>
                  👤 Custodian: <strong>{item.custodian}</strong>
                </span>
              </div>
              <div style={styles.itemRight}>
                <div style={styles.delayBox}>
                  <span style={styles.daysOverdue}>{item.daysOverdue} days</span>
                  <span style={styles.delayLabel}>overdue</span>
                </div>
                <button
                  onClick={() => handleNotifyCustodian(item.id, item.name)}
                  disabled={isNotified}
                  style={{
                    ...styles.notifyBtn,
                    backgroundColor: isNotified ? 'var(--bg-tertiary)' : 'var(--danger)',
                    color: isNotified ? 'var(--text-muted)' : '#ffffff',
                    border: isNotified ? '1px solid var(--border-color)' : 'none',
                    cursor: isNotified ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isNotified ? 'Notified' : 'Ping'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-lg)',
    borderLeft: '4px solid var(--danger)',
    backgroundColor: 'rgba(239, 68, 68, 0.02)', // Soft red glow tint
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-md)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  headerTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerIcon: {
    fontSize: '18px',
  },
  headerTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  countBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid var(--danger-border)',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    gap: '12px',
  },
  itemLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  assetCode: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--accent-primary)',
    fontWeight: 600,
  },
  assetName: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  custodianName: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  },
  delayBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    lineHeight: 1.2,
  },
  daysOverdue: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--danger)',
  },
  delayLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  notifyBtn: {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: 700,
    borderRadius: '4px',
    transition: 'all var(--transition-fast)',
  },
  emptyContainer: {
    padding: 'var(--spacing-xl)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
