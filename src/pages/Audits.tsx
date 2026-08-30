import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auditService, type AuditCycle } from '../services/auditService';
import { CreateAuditModal } from '../components/CreateAuditModal';
import { AssetVerificationList } from '../components/AssetVerificationList';
import { DiscrepancyReport } from '../components/DiscrepancyReport';

export const Audits: React.FC = () => {
  const { currentRole } = useAuth();

  // Data states
  const [cycles, setCycles] = useState<AuditCycle[]>(() => auditService.getCycles());
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Selected cycle inside the sub-panel
  const [selectedCycleId, setSelectedCycleId] = useState(() => {
    const activeCycles = auditService.getCycles().filter(c => c.status === 'active');
    return activeCycles.length > 0 ? activeCycles[0].id : '';
  });

  const [selectedHistoryCycleId, setSelectedHistoryCycleId] = useState(() => {
    const historyCycles = auditService.getCycles().filter(c => c.status === 'closed');
    return historyCycles.length > 0 ? historyCycles[0].id : '';
  });

  // Modal toggle
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadData = () => {
    const list = auditService.getCycles();
    setCycles(list);
    
    // Auto-update selected targets if currently empty
    const activeList = list.filter(c => c.status === 'active');
    if (activeList.length > 0 && !selectedCycleId) {
      setSelectedCycleId(activeList[0].id);
    }
    const historyList = list.filter(c => c.status === 'closed');
    if (historyList.length > 0 && !selectedHistoryCycleId) {
      setSelectedHistoryCycleId(historyList[0].id);
    }
  };

  const handleCloseCycle = (id: string) => {
    if (confirm('Are you sure you want to CLOSE this audit cycle? This will lock verifications and re-align inventory catalog statuses.')) {
      auditService.closeCycle(id);
      alert('Audit cycle successfully closed and catalog records updated.');
      setSelectedCycleId('');
      loadData();
    }
  };

  const activeCycles = cycles.filter(c => c.status === 'active');
  const historyCycles = cycles.filter(c => c.status === 'closed');

  const selectedActiveCycle = activeCycles.find(c => c.id === selectedCycleId);
  const selectedHistoryCycle = historyCycles.find(c => c.id === selectedHistoryCycleId);

  const isManager = ['admin', 'asset_manager'].includes(currentRole);

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTitleBox}>
          <h1 className="gradient-text" style={styles.title}>Audit Reconciliation Desk</h1>
          <p style={styles.subtitle}>Perform physical stocktakes, verify compliance states, and log historical audits.</p>
        </div>
        
        {isManager && activeTab === 'active' && (
          <button onClick={() => setIsCreateOpen(true)} style={styles.createBtn}>
            + Initialize Audit Cycle
          </button>
        )}
      </header>

      {/* Tabs navigation */}
      <div style={styles.tabsContainer} className="glass-panel">
        <button
          onClick={() => setActiveTab('active')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'active' ? 'var(--accent-primary-glow)' : 'transparent',
            color: activeTab === 'active' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottomColor: activeTab === 'active' ? 'var(--accent-primary)' : 'transparent',
          }}
        >
          🔄 Active Stocktakes ({activeCycles.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'history' ? 'var(--accent-primary-glow)' : 'transparent',
            color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottomColor: activeTab === 'history' ? 'var(--accent-primary)' : 'transparent',
          }}
        >
          📁 Audit History Log ({historyCycles.length})
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'active' ? (
        <div style={styles.tabViewport}>
          {activeCycles.length > 0 ? (
            <div style={styles.splitLayout}>
              {/* Left Selector Sidebar */}
              <div style={styles.sidebarCol} className="glass-panel">
                <h4 style={styles.sectionTitle}>Active Cycles</h4>
                <div style={styles.sidebarList}>
                  {activeCycles.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCycleId(c.id)}
                      style={{
                        ...styles.sidebarBtn,
                        backgroundColor: selectedCycleId === c.id ? 'var(--bg-tertiary)' : 'transparent',
                        borderColor: selectedCycleId === c.id ? 'var(--accent-primary)' : 'var(--border-color)',
                      }}
                    >
                      <div style={styles.cycleTitle}>{c.title}</div>
                      <div style={styles.cycleMeta}>Dept: {c.scopeDepartmentId.toUpperCase()} | Loc: {c.scopeLocation}</div>
                      <div style={styles.cycleMeta}>Ends: {c.endDate}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Detail workspace */}
              {selectedActiveCycle ? (
                <div style={styles.detailCol}>
                  <div style={styles.cycleDetailHeader} className="glass-panel">
                    <div>
                      <h3 style={styles.titleText}>{selectedActiveCycle.title}</h3>
                      <p style={styles.subtitleText}>Scope Dept: <strong>{selectedActiveCycle.scopeDepartmentId}</strong> | Scope Loc: <strong>{selectedActiveCycle.scopeLocation}</strong></p>
                    </div>
                    {isManager && (
                      <button 
                        onClick={() => handleCloseCycle(selectedActiveCycle.id)} 
                        style={styles.closeCycleBtn}
                      >
                        🔒 Lock & Close Cycle
                      </button>
                    )}
                  </div>

                  {/* Split checklist & report */}
                  <div style={styles.subSplit}>
                    <div style={{ flex: 1 }}>
                      <AssetVerificationList 
                        key={selectedActiveCycle.id}
                        cycle={selectedActiveCycle} 
                        onUpdate={loadData} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <DiscrepancyReport cycle={selectedActiveCycle} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.noSelection} className="glass-panel">
                  Please select an active audit cycle from the list.
                </div>
              )}
            </div>
          ) : (
            <div style={styles.placeholder} className="glass-panel">
              🟢 No active audit cycles are currently running. Click "+ Initialize Audit Cycle" to start a new stocktake.
            </div>
          )}
        </div>
      ) : (
        /* History Tab View */
        <div style={styles.tabViewport}>
          {historyCycles.length > 0 ? (
            <div style={styles.splitLayout}>
              {/* Left Selector Sidebar */}
              <div style={styles.sidebarCol} className="glass-panel">
                <h4 style={styles.sectionTitle}>Closed Audits History</h4>
                <div style={styles.sidebarList}>
                  {historyCycles.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedHistoryCycleId(c.id)}
                      style={{
                        ...styles.sidebarBtn,
                        backgroundColor: selectedHistoryCycleId === c.id ? 'var(--bg-tertiary)' : 'transparent',
                        borderColor: selectedHistoryCycleId === c.id ? 'var(--accent-primary)' : 'var(--border-color)',
                      }}
                    >
                      <div style={styles.cycleTitle}>🔒 {c.title}</div>
                      <div style={styles.cycleMeta}>Closed: {c.closedDate}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Detail workspace */}
              {selectedHistoryCycle ? (
                <div style={styles.detailCol}>
                  <div style={styles.cycleDetailHeader} className="glass-panel">
                    <div>
                      <h3 style={styles.titleText}>🔒 {selectedHistoryCycle.title} (LOCKED)</h3>
                      <p style={styles.subtitleText}>Completed on: <strong>{selectedHistoryCycle.closedDate}</strong> | Range: <strong>{selectedHistoryCycle.startDate} to {selectedHistoryCycle.endDate}</strong></p>
                    </div>
                    <span style={styles.lockedBadge}>Immutability Active</span>
                  </div>

                  {/* Split checklist & report read-only */}
                  <div style={styles.subSplit}>
                    <div style={{ flex: 1 }}>
                      <AssetVerificationList 
                        key={selectedHistoryCycle.id}
                        cycle={selectedHistoryCycle} 
                        onUpdate={loadData} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <DiscrepancyReport cycle={selectedHistoryCycle} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.noSelection} className="glass-panel">
                  Please select a historical audit cycle from the list.
                </div>
              )}
            </div>
          ) : (
            <div style={styles.placeholder} className="glass-panel">
              No historical closed audit cycles logged.
            </div>
          )}
        </div>
      )}

      {/* Create Audit cycle Modal */}
      <CreateAuditModal
        key={isCreateOpen ? 'open' : 'closed'}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={loadData}
      />
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
  headerTitleBox: {
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
  createBtn: {
    background: 'var(--accent-primary)',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '13.5px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    padding: '4px 4px 0 4px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    gap: '4px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '10px 16px',
    fontSize: '13.5px',
    fontWeight: 600,
    borderRadius: '4px 4px 0 0',
    transition: 'all var(--transition-fast)',
    borderBottom: '2px solid transparent',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  tabViewport: {
    marginTop: '4px',
  },
  splitLayout: {
    display: 'flex',
    gap: 'var(--spacing-lg)',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sidebarCol: {
    width: '260px',
    backgroundColor: 'var(--bg-primary)',
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignSelf: 'flex-start',
  },
  sidebarList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarBtn: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  cycleTitle: {
    fontSize: '13.5px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  cycleMeta: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  detailCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: '320px',
  },
  cycleDetailHeader: {
    padding: '16px 20px',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  titleText: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitleText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  closeCycleBtn: {
    padding: '8px 14px',
    fontSize: '12.5px',
    fontWeight: 700,
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid var(--danger-border)',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  lockedBadge: {
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(74, 85, 104, 0.1)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
    borderRadius: '9999px',
  },
  subSplit: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '6px',
  },
  placeholder: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14.5px',
  },
  noSelection: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
};
