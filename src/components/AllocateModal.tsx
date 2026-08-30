import React, { useState } from 'react';
import { orgService } from '../services/orgService';
import { assetService, type AssetAllocation } from '../services/assetService';
import { ConflictBanner } from './ConflictBanner';
import { TransferRequestModal } from './TransferRequestModal';

interface AllocateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const AllocateModal: React.FC<AllocateModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  // Form selections
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [assigneeType, setAssigneeType] = useState<'employee' | 'department'>('employee');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  // Sub-modal toggle
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const assets = assetService.getAssets();
  const employees = orgService.getEmployees();
  const departments = orgService.getDepartments();

  // Resolve current active allocation conflict info
  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const isConflicting = selectedAsset 
    ? ['allocated', 'booked', 'reserved', 'pending_transfer'].includes(selectedAsset.status)
    : false;

  let activeAllocation: AssetAllocation | undefined;
  let currentHolderName = 'Unknown Assignee';
  let currentHolderEmail = '';

  if (isConflicting && selectedAsset) {
    activeAllocation = assetService.getActiveAllocationForAsset(selectedAsset.id);
    if (activeAllocation) {
      if (activeAllocation.employeeId !== 'none') {
        const emp = employees.find(e => e.id === activeAllocation!.employeeId);
        currentHolderName = emp ? emp.name : activeAllocation.employeeId;
        currentHolderEmail = emp ? emp.email : '';
      } else if (activeAllocation.departmentId !== 'none') {
        const dept = departments.find(d => d.id === activeAllocation!.departmentId);
        currentHolderName = dept ? `${dept.name} Department` : activeAllocation.departmentId;
      }
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!selectedAssetId) {
      errs.assetId = 'Please select an asset to allocate.';
    }
    if (assigneeType === 'employee' && !selectedEmployeeId) {
      errs.employeeId = 'Please select a target employee.';
    }
    if (assigneeType === 'department' && !selectedDepartmentId) {
      errs.departmentId = 'Please select a target department.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isConflicting) return; // Block allocation on conflict

    assetService.createAllocation(
      selectedAssetId,
      assigneeType === 'employee' ? selectedEmployeeId : 'none',
      assigneeType === 'department' ? selectedDepartmentId : 'none',
      expectedReturnDate || null,
      notes
    );

    onSave();
    onClose();
  };

  return (
    <>
      <div style={styles.overlay} className="animate-fade-in">
        <div style={styles.modal} className="glass-panel">
          <header style={styles.header}>
            <h3 style={styles.title}>Allocate Corporate Resource</h3>
            <button style={styles.closeBtn} onClick={onClose}>×</button>
          </header>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Asset Selector */}
            <div style={styles.formGroup}>
              <label htmlFor="allocate-asset-select" style={styles.label}>Select Asset *</label>
              <select
                id="allocate-asset-select"
                value={selectedAssetId}
                onChange={(e) => {
                  setSelectedAssetId(e.target.value);
                  setErrors(prev => ({ ...prev, assetId: '' }));
                }}
                style={styles.select}
              >
                <option value="">-- Choose Asset --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.tag} - {a.name} ({a.status.toUpperCase()})
                  </option>
                ))}
              </select>
              {errors.assetId && <span style={styles.errorMsg}>{errors.assetId}</span>}
            </div>

            {/* Conflict Banner Display */}
            {isConflicting && (
              <ConflictBanner
                currentHolderName={currentHolderName}
                currentHolderEmail={currentHolderEmail}
                onTransferRequest={() => setIsTransferModalOpen(true)}
              />
            )}

            {/* Assignee Type Selector */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Assign To Type</label>
              <div style={styles.toggleRow}>
                <label style={{ ...styles.toggleLabel, borderBottomColor: assigneeType === 'employee' ? 'var(--accent-primary)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="assignee-type"
                    checked={assigneeType === 'employee'}
                    onChange={() => setAssigneeType('employee')}
                    style={styles.radio}
                  />
                  Employee Assignment
                </label>
                <label style={{ ...styles.toggleLabel, borderBottomColor: assigneeType === 'department' ? 'var(--accent-primary)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="assignee-type"
                    checked={assigneeType === 'department'}
                    onChange={() => setAssigneeType('department')}
                    style={styles.radio}
                  />
                  Department Level
                </label>
              </div>
            </div>

            {/* Assignee Entity Selector */}
            {assigneeType === 'employee' ? (
              <div style={styles.formGroup}>
                <label htmlFor="assign-employee-select" style={styles.label}>Target Employee *</label>
                <select
                  id="assign-employee-select"
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setErrors(prev => ({ ...prev, employeeId: '' }));
                  }}
                  style={styles.select}
                  disabled={isConflicting}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                  ))}
                </select>
                {errors.employeeId && <span style={styles.errorMsg}>{errors.employeeId}</span>}
              </div>
            ) : (
              <div style={styles.formGroup}>
                <label htmlFor="assign-dept-select" style={styles.label}>Target Department *</label>
                <select
                  id="assign-dept-select"
                  value={selectedDepartmentId}
                  onChange={(e) => {
                    setSelectedDepartmentId(e.target.value);
                    setErrors(prev => ({ ...prev, departmentId: '' }));
                  }}
                  style={styles.select}
                  disabled={isConflicting}
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.departmentId && <span style={styles.errorMsg}>{errors.departmentId}</span>}
              </div>
            )}

            {/* Expected Return Date */}
            <div style={styles.formGroup}>
              <label htmlFor="allocate-return-date" style={styles.label}>Expected Return Date (Optional)</label>
              <input
                id="allocate-return-date"
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                style={styles.input}
                disabled={isConflicting}
              />
            </div>

            {/* Allocation Notes */}
            <div style={styles.formGroup}>
              <label htmlFor="allocate-notes" style={styles.label}>Allocation Remarks / Notes</label>
              <textarea
                id="allocate-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={styles.textarea}
                placeholder="e.g. Assigned for remote workspace setup."
                disabled={isConflicting}
              />
            </div>

            {/* Form actions */}
            <div style={styles.actions}>
              <button type="button" onClick={onClose} style={styles.cancelBtn}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isConflicting}
                style={{
                  ...styles.saveBtn,
                  opacity: isConflicting ? 0.5 : 1,
                  cursor: isConflicting ? 'not-allowed' : 'pointer'
                }}
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Transfer Request Drawer Modal */}
      {selectedAsset && (
        <TransferRequestModal
          key={isTransferModalOpen ? 'open' : 'closed'}
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          asset={selectedAsset}
          onSubmitted={() => {
            setIsTransferModalOpen(false);
            onSave();
            onClose();
          }}
        />
      )}
    </>
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
    maxWidth: '520px',
    width: '100%',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
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
  form: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
  },
  input: {
    padding: '10px 14px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  textarea: {
    padding: '10px 14px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical',
  },
  toggleRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '4px',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    paddingBottom: '4px',
    borderBottom: '2px solid transparent',
    transition: 'all var(--transition-fast)',
  },
  radio: {
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
  },
  cancelBtn: {
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: 600,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: 600,
    background: 'var(--accent-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
  },
  errorMsg: {
    fontSize: '11px',
    color: 'var(--danger)',
    marginTop: '2px',
  },
};
