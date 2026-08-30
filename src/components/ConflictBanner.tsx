import React from 'react';

interface ConflictBannerProps {
  currentHolderName: string;
  currentHolderEmail: string;
  onTransferRequest: () => void;
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({
  currentHolderName,
  currentHolderEmail,
  onTransferRequest,
}) => {
  return (
    <div style={styles.banner}>
      <div style={styles.header}>
        ⚠️ <strong>Allocation Conflict Detected</strong>
      </div>
      <p style={styles.message}>
        This asset is currently assigned to <strong>{currentHolderName}</strong> ({currentHolderEmail || 'Department Assigned'}). 
        Duplicate allocations are prevented in the directory catalog.
      </p>
      <div style={styles.actions}>
        <span style={styles.hint}>Do you want to request a checkout transfer?</span>
        <button type="button" onClick={onTransferRequest} style={styles.transferBtn}>
          Request Transfer Flow
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  banner: {
    backgroundColor: 'var(--warning-bg)',
    border: '1px solid var(--warning-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '14px 16px',
    color: 'var(--warning)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '13.5px',
    lineHeight: 1.4,
  },
  header: {
    fontSize: '14px',
    fontWeight: 700,
  },
  message: {
    color: 'var(--text-primary)',
    margin: 0,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '4px',
    borderTop: '1px solid rgba(214, 158, 46, 0.2)',
    paddingTop: '8px',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  transferBtn: {
    backgroundColor: 'var(--warning)',
    color: '#090d16',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontWeight: 700,
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'opacity var(--transition-fast)',
  },
};
