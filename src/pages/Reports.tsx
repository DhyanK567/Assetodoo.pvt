import React, { useState } from 'react';
import { ExportButton } from '../components/ExportButton';
import { UtilizationChart } from '../components/Reports/UtilizationChart';
import { MaintenanceFreqChart } from '../components/Reports/MaintenanceFreqChart';
import { BookingHeatmap } from '../components/Reports/BookingHeatmap';
import { assetService } from '../services/assetService';
import { orgService } from '../services/orgService';
export const Reports: React.FC = () => {
  
  // States for filter (optional, just to show UI)
  const [dateRange, setDateRange] = useState('30days');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = orgService.getDepartments();
  const assets = assetService.getAssets();

  // Compute Retirement / Maintenance Due
  const currentYear = new Date().getFullYear();
  const retirementWarningAssets = assets.filter(asset => {
    // Flag if under maintenance
    if (asset.status === 'maintenance') return true;
    
    // Flag if acquired > 4 years ago
    const acqYear = new Date(asset.acquisitionDate).getFullYear();
    if (currentYear - acqYear >= 4) return true;
    
    return false;
  });

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBox}>
          <h1 className="gradient-text" style={styles.title}>Reports & Analytics</h1>
          <p style={styles.subtitle}>Review asset utilization, maintenance frequencies, booking heatmaps, and lifecycle insights.</p>
        </div>
        <div style={styles.actionsBox}>
          <ExportButton />
        </div>
      </header>

      {/* Global Filters */}
      <div style={styles.filtersBar} className="glass-panel">
        <label style={styles.filterLabel}>
          Timeframe:
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={styles.select}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last 1 Year</option>
          </select>
        </label>
        
        <label style={styles.filterLabel}>
          Department Focus:
          <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={styles.select}>
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={styles.grid}>
        {/* Top Row: Utilization & Frequency */}
        <div style={styles.topRow}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <UtilizationChart />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <MaintenanceFreqChart />
          </div>
        </div>

        {/* Middle Row: Heatmap */}
        <div style={styles.fullWidth}>
          <BookingHeatmap />
        </div>

        {/* Bottom Row: Nearing Retirement List */}
        <div style={styles.fullWidth}>
          <div style={styles.retirementCard} className="glass-panel">
            <h3 style={styles.cardTitle}>⚠️ Equipment Nearing Retirement or Due for Maintenance</h3>
            <p style={styles.cardSubtitle}>Items flagged based on &gt;4 years age or currently in active maintenance state.</p>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Asset Tag</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Acquisition Date</th>
                    <th style={styles.th}>Current Status</th>
                    <th style={styles.th}>Reason Flagged</th>
                  </tr>
                </thead>
                <tbody>
                  {retirementWarningAssets.length > 0 ? (
                    retirementWarningAssets.map(asset => {
                      const age = currentYear - new Date(asset.acquisitionDate).getFullYear();
                      const reason = asset.status === 'maintenance' 
                        ? 'Under Active Maintenance' 
                        : `Age: ${age} Years (Lifecycle Exceeded)`;
                      
                      return (
                        <tr key={asset.id} style={styles.tr}>
                          <td style={styles.td}><strong>{asset.tag}</strong></td>
                          <td style={styles.td}>{asset.name}</td>
                          <td style={styles.td}>{asset.acquisitionDate}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: asset.status === 'maintenance' ? 'var(--warning-bg)' : 'var(--danger-bg)',
                              color: asset.status === 'maintenance' ? 'var(--warning)' : 'var(--danger)',
                              borderColor: asset.status === 'maintenance' ? 'var(--warning-border)' : 'var(--danger-border)',
                            }}>
                              {asset.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}><span style={{color: 'var(--text-secondary)', fontSize: '12px'}}>{reason}</span></td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} style={styles.noData}>No assets currently flagged for retirement or maintenance.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
  actionsBox: {
    display: 'flex',
    alignItems: 'center',
  },
  filtersBar: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    borderRadius: 'var(--radius-sm)',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
  },
  topRow: {
    display: 'flex',
    gap: 'var(--spacing-lg)',
    flexWrap: 'wrap',
  },
  fullWidth: {
    width: '100%',
  },
  retirementCard: {
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    padding: '10px 14px',
    backgroundColor: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '12px 14px',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '10px',
    fontWeight: 700,
    border: '1px solid',
  },
  noData: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
};
