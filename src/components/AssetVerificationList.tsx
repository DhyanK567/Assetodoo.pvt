import React, { useState } from 'react';
import { orgService } from '../services/orgService';
import { assetService } from '../services/assetService';
import { auditService, type AuditCycle, type AuditVerification } from '../services/auditService';

interface AssetVerificationListProps {
  cycle: AuditCycle;
  onUpdate: () => void;
}

export const AssetVerificationList: React.FC<AssetVerificationListProps> = ({
  cycle,
  onUpdate,
}) => {
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});

  const assets = assetService.getAssets();

  // Smart scope filtering
  const scopedAssets = assets.filter(asset => {
    // Filter location
    if (cycle.scopeLocation !== 'all' && !asset.location.toLowerCase().includes(cycle.scopeLocation.toLowerCase())) {
      return false;
    }

    // Filter department
    if (cycle.scopeDepartmentId !== 'all') {
      const activeAlloc = assetService.getActiveAllocationForAsset(asset.id);
      if (!activeAlloc) return false;
      if (activeAlloc.departmentId === cycle.scopeDepartmentId) return true;
      if (activeAlloc.employeeId !== 'none') {
        const emp = orgService.getEmployees().find(e => e.id === activeAlloc.employeeId);
        if (emp && emp.departmentId === cycle.scopeDepartmentId) return true;
      }
      return false;
    }

    return true;
  });

  const handleVerify = (assetId: string, result: AuditVerification['result']) => {
    if (cycle.status === 'closed') return;
    const currentNotes = notesInputs[assetId] || cycle.verifications[assetId]?.notes || '';
    auditService.verifyAsset(cycle.id, assetId, result, currentNotes);
    onUpdate();
  };

  const handleNotesChange = (assetId: string, notes: string) => {
    if (cycle.status === 'closed') return;
    setNotesInputs(prev => ({ ...prev, [assetId]: notes }));
    
    // Auto-update verification notes in the service if a result is already selected
    const currentResult = cycle.verifications[assetId]?.result;
    if (currentResult) {
      auditService.verifyAsset(cycle.id, assetId, currentResult, notes);
      onUpdate();
    }
  };

  const isLocked = cycle.status === 'closed';

  return (
    <div style={styles.card} className="glass-panel">
      <div style={styles.header}>
        <h4 style={styles.titleText}>📋 Verification Check-List</h4>
        <p style={styles.subtitleText}>
          {isLocked 
            ? '⚠️ Audit Cycle Closed: Verification fields are locked (read-only).' 
            : 'Auditors: Set physical findings for scoped equipment below.'
          }
        </p>
      </div>

      <div style={styles.grid}>
        {scopedAssets.map(asset => {
          const veri = cycle.verifications[asset.id];
          const result = veri?.result || '';
          const notesVal = notesInputs[asset.id] !== undefined 
            ? notesInputs[asset.id] 
            : (veri?.notes || '');

          return (
            <div key={asset.id} style={styles.rowItem} className="glass-panel">
              <div style={styles.metaBox}>
                <span style={styles.tag}>{asset.tag}</span>
                <strong>{asset.name}</strong>
                <div style={styles.metaRow}>
                  <span>Loc: {asset.location}</span>
                  <span>Status: <strong style={{ color: 'var(--accent-primary)' }}>{asset.status.toUpperCase()}</strong></span>
                </div>
              </div>

              {/* Radio buttons group */}
              <div style={styles.radiosGroup}>
                <label style={{ 
                  ...styles.radioLabel, 
                  backgroundColor: result === 'verified' ? 'var(--success-bg)' : 'transparent',
                  borderColor: result === 'verified' ? 'var(--success)' : 'var(--border-color)',
                  color: result === 'verified' ? 'var(--success)' : 'var(--text-secondary)'
                }}>
                  <input
                    type="radio"
                    name={`veri-${asset.id}`}
                    checked={result === 'verified'}
                    disabled={isLocked}
                    onChange={() => handleVerify(asset.id, 'verified')}
                    style={styles.radioInput}
                  />
                  Verified
                </label>

                <label style={{ 
                  ...styles.radioLabel, 
                  backgroundColor: result === 'missing' ? 'var(--danger-bg)' : 'transparent',
                  borderColor: result === 'missing' ? 'var(--danger)' : 'var(--border-color)',
                  color: result === 'missing' ? 'var(--danger)' : 'var(--text-secondary)'
                }}>
                  <input
                    type="radio"
                    name={`veri-${asset.id}`}
                    checked={result === 'missing'}
                    disabled={isLocked}
                    onChange={() => handleVerify(asset.id, 'missing')}
                    style={styles.radioInput}
                  />
                  Missing
                </label>

                <label style={{ 
                  ...styles.radioLabel, 
                  backgroundColor: result === 'damaged' ? 'var(--warning-bg)' : 'transparent',
                  borderColor: result === 'damaged' ? 'var(--warning)' : 'var(--border-color)',
                  color: result === 'damaged' ? 'var(--warning)' : 'var(--text-secondary)'
                }}>
                  <input
                    type="radio"
                    name={`veri-${asset.id}`}
                    checked={result === 'damaged'}
                    disabled={isLocked}
                    onChange={() => handleVerify(asset.id, 'damaged')}
                    style={styles.radioInput}
                  />
                  Damaged
                </label>
              </div>

              {/* Notes Input */}
              <div style={styles.notesBox}>
                <input
                  type="text"
                  placeholder="Discrepancy remarks / serial matches..."
                  value={notesVal}
                  disabled={isLocked}
                  onChange={(e) => handleNotesChange(asset.id, e.target.value)}
                  style={styles.notesInput}
                />
              </div>
            </div>
          );
        })}

        {scopedAssets.length === 0 && (
          <div style={styles.noAssets}>
            No corporate assets found matching this audit's scope.
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  header: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  titleText: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitleText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  rowItem: {
    padding: '12px 14px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  metaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
  },
  tag: {
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content',
    color: 'var(--text-muted)',
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '11.5px',
    color: 'var(--text-secondary)',
  },
  radiosGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  radioInput: {
    cursor: 'pointer',
    margin: 0,
  },
  notesBox: {
    width: '100%',
  },
  notesInput: {
    width: '100%',
    padding: '6px 12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '12.5px',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  noAssets: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
};
