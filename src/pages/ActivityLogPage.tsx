import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService, type ActionType } from '../services/notificationService';

export const ActivityLogPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [filterAction, setFilterAction] = useState<ActionType | 'All'>('All');
  
  const logs = notificationService.getLogsForRole(currentRole);

  const filteredLogs = filterAction === 'All' 
    ? logs 
    : logs.filter(l => l.action === filterAction);

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case 'Allocation': return 'var(--success)';
      case 'Maintenance': return 'var(--warning)';
      case 'Booking': return 'var(--accent-primary)';
      case 'Audit': return 'var(--danger)';
      case 'System': return 'var(--text-secondary)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBox}>
          <h1 className="gradient-text" style={styles.title}>System Activity Logs</h1>
          <p style={styles.subtitle}>Comprehensive audit trail of cross-cutting module events scoped to your role permissions.</p>
        </div>
      </header>

      <div style={styles.filterBar} className="glass-panel">
        <label style={styles.filterLabel}>
          Filter Event Domain:
          <select 
            value={filterAction} 
            onChange={e => setFilterAction(e.target.value as any)} 
            style={styles.select}
          >
            <option value="All">-- All Actions --</option>
            <option value="Allocation">Allocation & Transfers</option>
            <option value="Maintenance">Maintenance & Repairs</option>
            <option value="Booking">Resource Bookings</option>
            <option value="Audit">Audit Stocktakes</option>
            <option value="System">System Preferences</option>
          </select>
        </label>
        <span style={styles.metaText}>Showing {filteredLogs.length} events</span>
      </div>

      <div style={styles.card} className="glass-panel">
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Action Domain</th>
                <th style={styles.th}>Initiated By</th>
                <th style={styles.th}>Event Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.timeText}>{new Date(log.timestamp).toLocaleString()}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        color: getActionColor(log.action),
                        borderColor: getActionColor(log.action),
                        backgroundColor: 'var(--bg-tertiary)'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={styles.td}><strong>{log.actorId}</strong></td>
                    <td style={styles.td}>{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={styles.noData}>
                    No activity logs match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  titleBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    marginBottom: '4px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
  },
  filterBar: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 'var(--radius-sm)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  select: {
    padding: '6px 12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
  },
  metaText: {
    fontSize: '12.5px',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  card: {
    backgroundColor: 'var(--bg-primary)',
    padding: '0',
    overflow: 'hidden',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13.5px',
  },
  th: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '14px 16px',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  timeText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
    border: '1px solid',
  },
  noData: {
    padding: '30px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13.5px',
  },
};
