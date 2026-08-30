import React, { useState } from 'react';
import { orgService, type Employee, type Department } from '../services/orgService';
import { assetService, type Asset } from '../services/assetService';

interface TransferRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onSubmitted: () => void;
}

export const TransferRequestModal: React.FC<TransferRequestModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSubmitted,
}) => {
  const [employees] = useState<Employee[]>(() => orgService.getEmployees());
  const [departments] = useState<Department[]>(() => orgService.getDepartments());

  // Form states
  const [assigneeType, setAssigneeType] = useState<'employee' | 'department'>('employee');
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [targetDepartmentId, setTargetDepartmentId] = useState('');
  const [reason, setReason] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (assigneeType === 'employee' && !targetEmployeeId) {
      errs.targetEmployeeId = 'Please select the target recipient.';
    }
    if (assigneeType === 'department' && !targetDepartmentId) {
      errs.targetDepartmentId = 'Please select the target department.';
    }
    if (!reason || reason.trim().length < 5) {
      errs.reason = 'Please provide a transfer reason (min 5 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Resolve requestor user ID from local session
    let requestorId = 'usr_admin';
    const session = localStorage.getItem('MOCK_USER_SESSION');
    if (session) {
      try {
        const userObj = JSON.parse(session);
        if (userObj.id) requestorId = userObj.id;
      } catch {
        // Ignore JSON parse issues
      }
    }

    assetService.createTransferRequest(
      asset.id,
      assigneeType === 'employee' ? targetEmployeeId : 'none',
      assigneeType === 'department' ? targetDepartmentId : 'none',
      reason,
      requestorId
    );

    alert(`Transfer request submitted successfully. Approval queue updated.`);
    onSubmitted();
  };

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.modal} className="glass-panel">
        <header style={styles.header}>
          <h3 style={styles.title}>File Transfer Request</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.warningBanner}>
            ℹ️ <strong>Transfer Request Workflow:</strong> This asset is currently occupied. Submitting this form routes an authorization request to the approvals queue.
          </div>

          <div style={styles.detailsBox}>
            <div>Asset: <strong>{asset.tag} - {asset.name}</strong></div>
            <div>Serial: <span style={{ color: 'var(--text-muted)' }}>{asset.serialNumber}</span></div>
          </div>

          {/* Assignee Type Selector */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Transfer Recipient Type</label>
            <div style={styles.toggleRow}>
              <label style={{ ...styles.toggleLabel, borderBottomColor: assigneeType === 'employee' ? 'var(--accent-primary)' : 'transparent' }}>
                <input
                  type="radio"
                  name="transfer-assignee-type"
                  checked={assigneeType === 'employee'}
                  onChange={() => setAssigneeType('employee')}
                  style={styles.radio}
                />
                Target Employee
              </label>
              <label style={{ ...styles.toggleLabel, borderBottomColor: assigneeType === 'department' ? 'var(--accent-primary)' : 'transparent' }}>
                <input
                  type="radio"
                  name="transfer-assignee-type"
                  checked={assigneeType === 'department'}
                  onChange={() => setAssigneeType('department')}
                  style={styles.radio}
                />
                Target Department
              </label>
            </div>
          </div>

          {/* Target Selectors */}
          {assigneeType === 'employee' ? (
            <div style={styles.formGroup}>
              <label htmlFor="transfer-employee-select" style={styles.label}>Select Target Recipient *</label>
              <select
                id="transfer-employee-select"
                value={targetEmployeeId}
                onChange={(e) => {
                  setTargetEmployeeId(e.target.value);
                  setErrors(prev => ({ ...prev, targetEmployeeId: '' }));
                }}
                style={styles.select}
              >
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                ))}
              </select>
              {errors.targetEmployeeId && <span style={styles.errorMsg}>{errors.targetEmployeeId}</span>}
            </div>
          ) : (
            <div style={styles.formGroup}>
              <label htmlFor="transfer-dept-select" style={styles.label}>Select Target Department *</label>
              <select
                id="transfer-dept-select"
                value={targetDepartmentId}
                onChange={(e) => {
                  setTargetDepartmentId(e.target.value);
                  setErrors(prev => ({ ...prev, targetDepartmentId: '' }));
                }}
                style={styles.select}
              >
                <option value="">-- Select Department --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.targetDepartmentId && <span style={styles.errorMsg}>{errors.targetDepartmentId}</span>}
            </div>
          )}

          {/* Transfer Reason */}
          <div style={styles.formGroup}>
            <label htmlFor="transfer-reason" style={styles.label}>Reason for Transfer *</label>
            <textarea
              id="transfer-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors(prev => ({ ...prev, reason: '' }));
              }}
              style={styles.textarea}
              placeholder="e.g. Employee reassigned to project team B requiring calibration hardware workstation."
            />
            {errors.reason && <span style={styles.errorMsg}>{errors.reason}</span>}
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              Submit Request
            </button>
          </div>
        </form>
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
    zIndex: 1100, // Make sure it sits above AllocateModal
    padding: '16px',
  },
  modal: {
    maxWidth: '460px',
    width: '100%',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
  },
  title: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  closeBtn: {
    fontSize: '22px',
    color: 'var(--text-muted)',
    lineHeight: 1,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  form: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  warningBanner: {
    fontSize: '11px',
    color: 'var(--warning)',
    backgroundColor: 'var(--warning-bg)',
    border: '1px solid var(--warning-border)',
    padding: '8px 10px',
    borderRadius: '4px',
    lineHeight: 1.4,
  },
  detailsBox: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    padding: '10px',
    background: 'var(--bg-tertiary)',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '11.5px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    outline: 'none',
    minHeight: '70px',
    resize: 'vertical',
  },
  toggleRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '2px',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    paddingBottom: '2px',
    borderBottom: '2px solid transparent',
    transition: 'all var(--transition-fast)',
  },
  radio: {
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '4px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
  },
  cancelBtn: {
    padding: '8px 14px',
    fontSize: '12.5px',
    fontWeight: 600,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '8px 14px',
    fontSize: '12.5px',
    fontWeight: 600,
    background: 'var(--accent-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  },
  errorMsg: {
    fontSize: '10.5px',
    color: 'var(--danger)',
    marginTop: '1px',
  },
};
