import React from 'react';
import type { MaintenanceRequest } from '../services/maintenanceService';

interface MaintenanceStatusTrackerProps {
  status: MaintenanceRequest['status'];
}

const STEPS = ['pending', 'approved', 'technician_assigned', 'in_progress', 'resolved'];
const LABELS = ['Pending', 'Approved', 'Tech Assigned', 'In Progress', 'Resolved'];

export const MaintenanceStatusTracker: React.FC<MaintenanceStatusTrackerProps> = ({ status }) => {
  if (status === 'rejected') {
    return (
      <div style={styles.rejectedContainer}>
        <div style={styles.rejectedStep}>⚪ Pending</div>
        <div style={styles.arrow}>➔</div>
        <div style={styles.rejectedActive}>❌ Rejected</div>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(status);

  return (
    <div style={styles.container}>
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        
        let circleStyle = styles.futureCircle;
        let labelStyle = styles.futureLabel;

        if (isCompleted) {
          circleStyle = styles.completedCircle;
          labelStyle = styles.completedLabel;
        } else if (isActive) {
          circleStyle = styles.activeCircle;
          labelStyle = styles.activeLabel;
        }

        return (
          <React.Fragment key={step}>
            <div style={styles.stepBox}>
              <div style={circleStyle}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <div style={labelStyle}>{LABELS[idx]}</div>
            </div>
            {idx < STEPS.length - 1 && (
              <div 
                style={{
                  ...styles.line,
                  backgroundColor: idx < currentIdx ? 'var(--success)' : 'var(--border-color)'
                }} 
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px 12px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    gap: '8px',
  },
  stepBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    minWidth: '70px',
  },
  completedCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--success-bg)',
    border: '2px solid var(--success)',
    color: 'var(--success)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
  },
  activeCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-primary-glow)',
    border: '2px solid var(--accent-primary)',
    color: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 800,
    boxShadow: '0 0 8px var(--accent-primary)',
  },
  futureCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-primary)',
    border: '2px solid var(--border-color)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
  },
  completedLabel: {
    fontSize: '10.5px',
    fontWeight: 600,
    color: 'var(--success)',
  },
  activeLabel: {
    fontSize: '10.5px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  futureLabel: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
  },
  line: {
    flex: 1,
    height: '2px',
    minWidth: '20px',
    alignSelf: 'center',
    marginTop: '-16px',
    transition: 'background-color var(--transition-fast)',
  },
  rejectedContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'var(--danger-bg)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger)',
    width: '100%',
    fontSize: '13px',
    fontWeight: 600,
  },
  rejectedStep: {
    color: 'var(--text-muted)',
  },
  arrow: {
    color: 'var(--text-muted)',
  },
  rejectedActive: {
    color: 'var(--danger)',
    fontWeight: 700,
  },
};
