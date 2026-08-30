import React, { useState } from 'react';
import { orgService, type Employee } from '../services/orgService';
import { assetService, type Asset } from '../services/assetService';
import { StatusBadge } from './StatusBadge';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

type TabType = 'info' | 'allocations' | 'maintenance';

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [employees] = useState<Employee[]>(() => orgService.getEmployees());

  if (!isOpen || !asset) return null;

  const categoryName = orgService.getCategories().find(c => c.id === asset.categoryId)?.name || 'Unknown';
  const allocLogs = assetService.getAllocationLogs(asset.id);
  const maintLogs = assetService.getMaintenanceLogs(asset.id);

  const getEmployeeName = (empId: string) => {
    return employees.find(e => e.id === empId)?.name || empId;
  };

  const getEmployeeEmail = (empId: string) => {
    return employees.find(e => e.id === empId)?.email || '';
  };

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.modal} className="glass-panel">
        <header style={styles.header}>
          <div style={styles.headerTitleBox}>
            <span style={styles.tagLabel}>{asset.tag}</span>
            <h3 style={styles.title}>{asset.name}</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        {/* Tab Headers */}
        <div style={styles.tabHeaders}>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'info' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'info' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            📋 Details Info
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'allocations' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'allocations' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            🔗 Allocation Log ({allocLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'maintenance' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'maintenance' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            🛠️ Maintenance ({maintLogs.length})
          </button>
        </div>

        {/* Content viewport */}
        <div style={styles.content}>
          {activeTab === 'info' && (
            <div style={styles.infoGrid} className="animate-fade-in">
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Status</span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={asset.status} />
                </div>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Serial Number</span>
                <span style={styles.infoVal}>{asset.serialNumber || 'N/A'}</span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Asset Category</span>
                <span style={styles.infoVal}>{categoryName}</span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Condition</span>
                <span style={{ ...styles.infoVal, textTransform: 'capitalize' }}>{asset.condition}</span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Acquisition Cost</span>
                <span style={styles.infoVal}>${asset.acquisitionCost.toLocaleString()}</span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Acquisition Date</span>
                <span style={styles.infoVal}>{asset.acquisitionDate || 'N/A'}</span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Operational Location</span>
                <span style={styles.infoVal}>{asset.location || 'N/A'}</span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Reservations / Bookable</span>
                <span style={styles.infoVal}>{asset.isBookable ? '✔️ Yes (Bookable resource)' : '❌ No'}</span>
              </div>

              {/* Dynamic properties display */}
              {asset.customFields && Object.keys(asset.customFields).length > 0 && (
                <div style={{ gridColumn: 'span 2', marginTop: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                  <h4 style={styles.subHeading}>Category Specific Descriptors</h4>
                  <div style={styles.customFieldsGrid}>
                    {Object.entries(asset.customFields).map(([key, val]) => (
                      <div key={key} style={styles.customFieldItem}>
                        <span style={styles.customFieldLabel}>{key}</span>
                        <span style={styles.customFieldVal}>{String(val) || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached docs */}
              {asset.photoName && (
                <div style={{ gridColumn: 'span 2', marginTop: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                  <span style={styles.infoLabel}>Attached File / Photo</span>
                  <div style={styles.fileBox}>
                    📁 <span>{asset.photoName}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'allocations' && (
            <div style={styles.logList} className="animate-fade-in">
              {allocLogs.length === 0 ? (
                <div style={styles.emptyLogs}>No allocation history logged for this asset.</div>
              ) : (
                allocLogs.map((log) => (
                  <div key={log.id} style={styles.logCard}>
                    <div style={styles.logCardHeader}>
                      <div>
                        Action: <strong>{log.action.toUpperCase()}</strong>
                      </div>
                      <span style={styles.logDate}>{log.date}</span>
                    </div>
                    <div style={styles.logCardBody}>
                      <div>Assigned user: <strong>{getEmployeeName(log.employeeId)}</strong> <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({getEmployeeEmail(log.employeeId)})</span></div>
                      {log.notes && <div style={styles.logNotes}>Note: {log.notes}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div style={styles.logList} className="animate-fade-in">
              {maintLogs.length === 0 ? (
                <div style={styles.emptyLogs}>No maintenance activities logged for this asset.</div>
              ) : (
                maintLogs.map((log) => (
                  <div key={log.id} style={styles.logCard}>
                    <div style={styles.logCardHeader}>
                      <div>
                        Type: <strong style={{ textTransform: 'capitalize' }}>{log.type}</strong>
                      </div>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        backgroundColor: log.status === 'completed' ? 'var(--success-bg)' : log.status === 'scheduled' ? 'var(--warning-bg)' : 'var(--danger-bg)',
                        color: log.status === 'completed' ? 'var(--success)' : log.status === 'scheduled' ? 'var(--warning)' : 'var(--danger)'
                      }}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={styles.logCardBody}>
                      <div>Date: <strong>{log.date}</strong></div>
                      <div>Service Cost: <strong>${log.cost}</strong></div>
                      {log.notes && <div style={styles.logNotes}>Notes: {log.notes}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <footer style={styles.footer}>
          <button style={styles.closeBtnFooter} onClick={onClose}>
            Close Window
          </button>
        </footer>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modal: {
    maxWidth: '640px',
    width: '100%',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: '85vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
  },
  headerTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tagLabel: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  closeBtn: {
    fontSize: '24px',
    color: 'var(--text-muted)',
    lineHeight: 1,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  tabHeaders: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    padding: '0 8px',
  },
  tabBtn: {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  infoVal: {
    fontSize: '14.5px',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  subHeading: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '10px',
  },
  customFieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  customFieldItem: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-secondary)',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
  },
  customFieldLabel: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  customFieldVal: {
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    fontWeight: 600,
    marginTop: '2px',
  },
  fileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyLogs: {
    textAlign: 'center',
    padding: '32px 0',
    color: 'var(--text-muted)',
    fontSize: '13.5px',
  },
  logCard: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  logCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '6px',
  },
  logDate: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  logCardBody: {
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  logNotes: {
    fontSize: '12.5px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-primary)',
    padding: '6px 10px',
    borderRadius: '4px',
    marginTop: '4px',
  },
  footer: {
    padding: '12px 20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: 'var(--bg-tertiary)',
  },
  closeBtnFooter: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
};
