import React, { useState } from 'react';
import { bookingService, type ResourceBooking } from '../services/bookingService';

interface CancelRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ResourceBooking;
  onRefresh: () => void;
}

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const CancelRescheduleModal: React.FC<CancelRescheduleModalProps> = ({
  isOpen,
  onClose,
  booking,
  onRefresh,
}) => {
  const [date, setDate] = useState(() => booking.date);
  const [start, setStart] = useState(() => booking.startTime);
  const [end, setEnd] = useState(() => booking.endTime);

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (start >= end) {
      setError('Invalid Interval: Start time must occur before end time.');
      return;
    }

    const res = bookingService.rescheduleBooking(booking.id, date, start, end);
    if (res.success) {
      alert('Rescheduled booking successfully.');
      onRefresh();
    } else {
      setError(res.error || 'Overlap collision.');
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this booking reservation?')) {
      bookingService.cancelBooking(booking.id);
      alert('Booking cancelled successfully.');
      onRefresh();
    }
  };

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.modal} className="glass-panel">
        <header style={styles.header}>
          <h3 style={styles.title}>Reschedule / Cancel Booking</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleReschedule} style={styles.form}>
          <div style={styles.detailsBox}>
            <div>Purpose: <strong>{booking.purpose}</strong></div>
            <div>Current: <span style={{ color: 'var(--text-muted)' }}>{booking.date} from {booking.startTime} to {booking.endTime}</span></div>
          </div>

          {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

          {/* Date Selector */}
          <div style={styles.formGroup}>
            <label htmlFor="resched-date" style={styles.label}>Reschedule Date *</label>
            <input
              id="resched-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.timeRow}>
            {/* Start Time */}
            <div style={styles.formGroup}>
              <label htmlFor="resched-start" style={styles.label}>Start Time *</label>
              <select
                id="resched-start"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                style={styles.select}
              >
                {TIME_OPTIONS.slice(0, -1).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* End Time */}
            <div style={styles.formGroup}>
              <label htmlFor="resched-end" style={styles.label}>End Time *</label>
              <select
                id="resched-end"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                style={styles.select}
              >
                {TIME_OPTIONS.slice(1).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.actions}>
            {/* Cancel Booking Trigger */}
            <button type="button" onClick={handleCancel} style={styles.cancelBookingBtn}>
              Cancel Booking
            </button>
            
            <div style={styles.rightActions}>
              <button type="button" onClick={onClose} style={styles.cancelBtn}>
                Close
              </button>
              <button type="submit" style={styles.saveBtn}>
                Apply Reschedule
              </button>
            </div>
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
    gap: '14px',
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
  errorBanner: {
    fontSize: '11px',
    color: 'var(--danger)',
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    padding: '8px 10px',
    borderRadius: '4px',
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
  timeRow: {
    display: 'flex',
    gap: '12px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  cancelBookingBtn: {
    padding: '8px 14px',
    fontSize: '12.5px',
    fontWeight: 700,
    background: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid var(--danger-border)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  },
  rightActions: {
    display: 'flex',
    gap: '8px',
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
};
