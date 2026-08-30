import React, { useState } from 'react';
import { assetService } from '../services/assetService';
import { maintenanceService, type MaintenanceRequest } from '../services/maintenanceService';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenanceRequest['priority']>('medium');
  const [photoName, setPhotoName] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const assets = assetService.getAssets();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(prev => ({ ...prev, photo: '' }));
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'File size must be less than 5MB.' }));
      e.target.value = '';
      return;
    }

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, photo: 'Only JPEG or PNG images are allowed.' }));
      e.target.value = '';
      return;
    }

    setPhotoName(file.name);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!selectedAssetId) {
      errs.assetId = 'Please select the asset requiring repair.';
    }
    if (!description || description.trim().length < 8) {
      errs.description = 'Please describe the issue (minimum 8 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Resolve requestor user ID from local session
    let requestorId = 'usr_employee';
    const session = localStorage.getItem('MOCK_USER_SESSION');
    if (session) {
      try {
        const userObj = JSON.parse(session);
        if (userObj.id) requestorId = userObj.id;
      } catch {
        // Ignore
      }
    }

    // Pass mock photoName or placeholder if uploaded
    const photoUrl = photoName ? `/uploads/mock_${photoName}` : undefined;

    maintenanceService.createRequest(
      selectedAssetId,
      description,
      priority,
      photoUrl,
      requestorId
    );

    alert('Maintenance ticket raised successfully and routed to queue!');
    onSave();
    onClose();
  };

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.modal} className="glass-panel">
        <header style={styles.header}>
          <h3 style={styles.title}>Raise Maintenance Request</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Asset select */}
          <div style={styles.formGroup}>
            <label htmlFor="maint-asset-select" style={styles.label}>Select Affected Asset *</label>
            <select
              id="maint-asset-select"
              value={selectedAssetId}
              onChange={(e) => {
                setSelectedAssetId(e.target.value);
                setErrors(prev => ({ ...prev, assetId: '' }));
              }}
              style={styles.select}
            >
              <option value="">-- Choose Asset --</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.tag} - {a.name} ({a.status.toUpperCase()})</option>
              ))}
            </select>
            {errors.assetId && <span style={styles.errorMsg}>{errors.assetId}</span>}
          </div>

          {/* Priority */}
          <div style={styles.formGroup}>
            <label htmlFor="maint-priority-select" style={styles.label}>Severity / Priority</label>
            <select
              id="maint-priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              style={styles.select}
            >
              <option value="low">Low - Minor issue, asset operational</option>
              <option value="medium">Medium - Operational but degraded</option>
              <option value="high">High - Safety hazard or unusable</option>
              <option value="critical">Critical - Line stoppage / major failure</option>
            </select>
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label htmlFor="maint-description" style={styles.label}>Issue Description *</label>
            <textarea
              id="maint-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors(prev => ({ ...prev, description: '' }));
              }}
              style={styles.textarea}
              placeholder="Provide exact details of the failure, warning messages, or diagnostic codes."
            />
            {errors.description && <span style={styles.errorMsg}>{errors.description}</span>}
          </div>

          {/* Photo attach UI */}
          <div style={styles.formGroup}>
            <label htmlFor="maint-photo-upload" style={styles.label}>Attach Proof Photo / Diagnostic Report</label>
            <input
              id="maint-photo-upload"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            <div style={styles.hintText}>Only JPEG/PNG supported, maximum file size 5MB.</div>
            {errors.photo && <span style={styles.errorMsg}>{errors.photo}</span>}
            {photoName && (
              <div style={styles.photoAttached}>
                📎 Attached: <strong>{photoName}</strong>
              </div>
            )}
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              File Ticket
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
    minHeight: '80px',
    resize: 'vertical',
  },
  fileInput: {
    fontSize: '12.5px',
    color: 'var(--text-primary)',
  },
  hintText: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
  },
  photoAttached: {
    fontSize: '12px',
    color: 'var(--success)',
    marginTop: '4px',
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
