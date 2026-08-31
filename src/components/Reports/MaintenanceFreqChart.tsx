import React from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { assetService } from '../../services/assetService';
import { orgService } from '../../services/orgService';

export const MaintenanceFreqChart: React.FC = () => {
  const requests = maintenanceService.getRequests();
  const assets = assetService.getAssets();
  const categories = orgService.getCategories();

  if (requests.length === 0) {
    return <div style={styles.noData}>No maintenance requests logged yet.</div>;
  }

  // Count requests by categoryId
  const categoryCounts: Record<string, number> = {};
  requests.forEach(req => {
    const asset = assets.find(a => a.id === req.assetId);
    if (asset) {
      categoryCounts[asset.categoryId] = (categoryCounts[asset.categoryId] || 0) + 1;
    }
  });

  const data = Object.entries(categoryCounts).map(([catId, count]) => {
    const cat = categories.find(c => c.id === catId);
    return {
      label: cat ? cat.name : 'Unknown',
      count
    };
  });

  const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid div by 0

  return (
    <div style={styles.container} className="glass-panel">
      <h3 style={styles.title}>Maintenance Frequency by Category</h3>
      
      <div style={styles.chartArea}>
        {data.map((item, index) => {
          const heightPercent = (item.count / maxCount) * 100;
          return (
            <div key={index} style={styles.barCol}>
              <div style={styles.barWrapper}>
                <div style={{ ...styles.bar, height: `${heightPercent}%` }} title={`${item.label}: ${item.count} repairs`} />
              </div>
              <div style={styles.barLabel}>{item.label}</div>
              <div style={styles.barValue}>{item.count}</div>
            </div>
          );
        })}
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
    height: '100%',
  },
  title: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  chartArea: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '160px',
    paddingTop: '20px',
    borderBottom: '1px solid var(--border-color)',
    gap: '12px',
  },
  barCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    width: '60px',
    height: '100%',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width: '32px',
    backgroundColor: 'var(--warning)',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.4s ease',
  },
  barLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
  },
  barValue: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  noData: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
};
