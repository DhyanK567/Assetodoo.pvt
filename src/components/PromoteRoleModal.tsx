import React, { useState } from 'react';
import type { UserRole } from '../context/AuthContext';
import type { Employee } from '../services/orgService';

interface PromoteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (id: string, role: UserRole) => void;
}

export const PromoteRoleModal: React.FC<PromoteRoleModalProps> = ({ 
  isOpen, 
  onClose, 
  employee, 
  onSave 
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => employee?.role || 'employee');

  if (!isOpen || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(employee.id, selectedRole);
    onClose();
  };

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.modal} className="glass-panel">
        <header style={styles.header}>
          <h3 style={styles.title}>Promote/Change Employee Role</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.warningBanner}>
            🛡️ <strong>Admin Authorization Required:</strong> Changing system roles alters page routing gates. Backend API security constraints must double-verify this privilege update.
          </div>

          <div style={styles.detailsBox}>
            <div>Name: <strong>{employee.name}</strong></div>
            <div>Email: <span style={{ color: 'var(--text-muted)' }}>{employee.email}</span></div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="role-promote-select" style={styles.label}>Select Privilege Role:</label>
            <select
              id="role-promote-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              style={styles.select}
            >
              <option value="admin">Administrator (Full Access)</option>
              <option value="asset_manager">Asset Manager (Operational Catalog & Assets)</option>
              <option value="dept_head">Department Head (Approvals & Requests)</option>
              <option value="employee">Employee (Requests & Tickets Only)</option>
            </select>
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              Apply Role Changes
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
    maxWidth: '480px',
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
  warningBanner: {
    fontSize: '11px',
    color: 'var(--warning)',
    backgroundColor: 'var(--warning-bg)',
    border: '1px solid var(--warning-border)',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    lineHeight: 1.4,
  },
  detailsBox: {
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    padding: '12px',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
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
};
