import React, { useState } from 'react';
import { assetService, type Asset, type AssetCondition } from '../services/assetService';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSave: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSave,
}) => {
  const [returnCondition, setReturnCondition] = useState<AssetCondition>(() => asset?.condition || 'good');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen || !asset) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!notes || notes.trim().length < 3) {
      errs.notes = 'Please provide return details (min 3 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    assetService.returnAsset(asset.id, returnCondition, notes);
    alert(`Asset successfully returned and catalog status set to Available.`);
    onSave();
    onClose();
  };

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.modal} className="glass-panel">
        <header style={styles.header}>
          <h3 style={styles.title}>De-allocate / Return Resource</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.detailsBox}>
            <div>Asset Tag: <strong>{asset.tag}</strong></div>
            <div>Name: <strong>{asset.name}</strong></div>
          </div>

          {/* Condition selector */}
          <div style={styles.formGroup}>
            <label htmlFor="return-condition-select" style={styles.label}>Verify Check-in Condition</label>
            <select
              id="return-condition-select"
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value as AssetCondition)}
              style={styles.select}
            >
              <option value="new">New / Mint</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor / Needs Inspection</option>
            </select>
          </div>

          {/* Notes */}
          <div style={styles.formGroup}>
            <label htmlFor="return-notes" style={styles.label}>Check-in Notes / Condition remarks *</label>
            <textarea
              id="return-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={styles.textarea}
              placeholder="e.g. Returned power brick and HDMI converter cords. Screen has minor dust."
            />
            {errors.notes && <span style={styles.errorMsg}>{errors.notes}</span>}
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              Confirm Check-in
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
    maxWidth: '440px',
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
  detailsBox: {
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    padding: '10px',
    background: 'var(--bg-tertiary)',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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
    minHeight: '85px',
    resize: 'vertical',
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
