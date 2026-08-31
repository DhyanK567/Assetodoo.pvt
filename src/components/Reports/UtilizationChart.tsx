import React from 'react';
import { assetService } from '../../services/assetService';

export const UtilizationChart: React.FC = () => {
  const assets = assetService.getAssets();
  const total = assets.length;

  if (total === 0) {
    return <div style={styles.noData}>No asset data available for utilization metrics.</div>;
  }

  // Count by status groups
  let available = 0;
  let allocated = 0;
  let maintenance = 0;
  let disposed = 0;

  assets.forEach(a => {
    if (a.status === 'available') available++;
    else if (a.status === 'allocated' || a.status === 'reserved' || a.status === 'booked' || a.status === 'pending_transfer') allocated++;
    else if (a.status === 'maintenance') maintenance++;
    else if (a.status === 'disposed') disposed++;
  });

  const getPercent = (count: number) => ((count / total) * 100).toFixed(1);

  return (
    <div style={styles.container} className="glass-panel">
      <h3 style={styles.title}>Asset Status Distribution</h3>
      
      {/* Horizontal Stacked Bar */}
      <div style={styles.barContainer}>
        {available > 0 && (
          <div style={{ ...styles.barSegment, width: `${(available/total)*100}%`, backgroundColor: 'var(--success)' }} title={`Available: ${available}`} />
        )}
        {allocated > 0 && (
          <div style={{ ...styles.barSegment, width: `${(allocated/total)*100}%`, backgroundColor: 'var(--accent-primary)' }} title={`In Use: ${allocated}`} />
        )}
        {maintenance > 0 && (
          <div style={{ ...styles.barSegment, width: `${(maintenance/total)*100}%`, backgroundColor: 'var(--warning)' }} title={`Maintenance: ${maintenance}`} />
        )}
        {disposed > 0 && (
          <div style={{ ...styles.barSegment, width: `${(disposed/total)*100}%`, backgroundColor: 'var(--danger)' }} title={`Disposed: ${disposed}`} />
        )}
      </div>

      {/* Legend */}
      <div style={styles.legendContainer}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.dot, backgroundColor: 'var(--success)' }} />
          <span>Available ({getPercent(available)}%)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.dot, backgroundColor: 'var(--accent-primary)' }} />
          <span>In Use ({getPercent(allocated)}%)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.dot, backgroundColor: 'var(--warning)' }} />
          <span>Maintenance ({getPercent(maintenance)}%)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.dot, backgroundColor: 'var(--danger)' }} />
          <span>Disposed ({getPercent(disposed)}%)</span>
        </div>
      </div>
      
      <div style={styles.summary}>
        Total Tracked Inventory: <strong>{total}</strong> units
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: 'var(--bg-primary)',
  },
  title: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  barContainer: {
    height: '24px',
    width: '100%',
    display: 'flex',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-tertiary)',
  },
  barSegment: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  legendContainer: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  summary: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)',
  },
  noData: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
};
