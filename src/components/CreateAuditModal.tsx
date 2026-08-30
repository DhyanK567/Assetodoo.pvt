import React, { useState } from 'react';
import { orgService } from '../services/orgService';
import { auditService } from '../services/auditService';

interface CreateAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CreateAuditModal: React.FC<CreateAuditModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [scopeDepartmentId, setScopeDepartmentId] = useState('all');
  const [scopeLocation, setScopeLocation] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAuditors, setSelectedAuditors] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const departments = orgService.getDepartments();
  const employees = orgService.getEmployees();

  const handleAuditorCheckboxChange = (empId: string) => {
    setSelectedAuditors(prev => {
      if (prev.includes(empId)) {
        return prev.filter(id => id !== empId);
      } else {
        return [...prev, empId];
      }
    });
    setErrors(prev => ({ ...prev, auditors: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title || title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }
    if (!startDate) {
      errs.startDate = 'Please select a start date.';
    }
    if (!endDate) {
      errs.endDate = 'Please select an end date.';
    }
    if (startDate && endDate && startDate > endDate) {
      errs.endDate = 'End date must occur after start date.';
    }
    if (selectedAuditors.length === 0) {
      errs.auditors = 'Please assign at least one auditor.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    auditService.createCycle(
      title,
      scopeDepartmentId,
      scopeLocation || 'all',
      startDate,
      endDate,
      selectedAuditors
    );

    alert('Audit Cycle created successfully and active checklist initialized.');
    onSave();
    onClose();
  };

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.modal} className="glass-panel">
        <header style={styles.header}>
          <h3 style={styles.title}>Initialize Audit Cycle</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title */}
          <div style={styles.formGroup}>
            <label htmlFor="audit-title" style={styles.label}>Audit Title / Cycle Name *</label>
            <input
              id="audit-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors(prev => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Q3 Laboratory Stocktake Verification"
              style={styles.input}
            />
            {errors.title && <span style={styles.errorMsg}>{errors.title}</span>}
          </div>

          <div style={styles.row}>
            {/* Dept Scope */}
            <div style={styles.formGroup}>
              <label htmlFor="audit-dept-scope" style={styles.label}>Department Scope</label>
              <select
                id="audit-dept-scope"
                value={scopeDepartmentId}
                onChange={(e) => setScopeDepartmentId(e.target.value)}
                style={styles.select}
              >
                <option value="all">-- All Departments --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Location Scope */}
            <div style={styles.formGroup}>
              <label htmlFor="audit-loc-scope" style={styles.label}>Location Scope</label>
              <input
                id="audit-loc-scope"
                type="text"
                value={scopeLocation}
                onChange={(e) => setScopeLocation(e.target.value)}
                placeholder="e.g. HQ Level 3 (or 'all')"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
            {/* Start Date */}
            <div style={styles.formGroup}>
              <label htmlFor="audit-start" style={styles.label}>Start Date *</label>
              <input
                id="audit-start"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setErrors(prev => ({ ...prev, startDate: '' }));
                }}
                style={styles.input}
              />
              {errors.startDate && <span style={styles.errorMsg}>{errors.startDate}</span>}
            </div>

            {/* End Date */}
            <div style={styles.formGroup}>
              <label htmlFor="audit-end" style={styles.label}>End Date *</label>
              <input
                id="audit-end"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setErrors(prev => ({ ...prev, endDate: '' }));
                }}
                style={styles.input}
              />
              {errors.endDate && <span style={styles.errorMsg}>{errors.endDate}</span>}
            </div>
          </div>

          {/* Assigned Auditors */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Assign Auditors *</label>
            <div style={styles.auditorsList}>
              {employees.map(emp => (
                <label key={emp.id} style={styles.auditorLabel}>
                  <input
                    type="checkbox"
                    checked={selectedAuditors.includes(emp.id)}
                    onChange={() => handleAuditorCheckboxChange(emp.id)}
                    style={styles.checkbox}
                  />
                  {emp.name} ({emp.email})
                </label>
              ))}
            </div>
            {errors.auditors && <span style={styles.errorMsg}>{errors.auditors}</span>}
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              Start Cycle
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
    zIndex: 1000,
    padding: '16px',
  },
  modal: {
    maxWidth: '520px',
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
    gap: '14px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  label: {
    fontSize: '11.5px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  input: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    outline: 'none',
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
  row: {
    display: 'flex',
    gap: '12px',
  },
  auditorsList: {
    maxHeight: '120px',
    overflowY: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: 'var(--bg-primary)',
  },
  auditorLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '6px',
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
