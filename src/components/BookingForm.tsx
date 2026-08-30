import React, { useState } from 'react';
import { bookingService } from '../services/bookingService';

interface BookingFormProps {
  assetId: string;
  onSave: () => void;
  initialStart?: string;
  initialEnd?: string;
  initialDate?: string;
}

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const BookingForm: React.FC<BookingFormProps> = ({
  assetId,
  onSave,
  initialStart = '09:00',
  initialEnd = '10:00',
  initialDate = '2026-08-30'
}) => {
  const [date, setDate] = useState(() => initialDate);
  const [start, setStart] = useState(() => initialStart);
  const [end, setEnd] = useState(() => initialEnd);
  const [purpose, setPurpose] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!purpose || purpose.trim().length < 5) {
      errs.purpose = 'Purpose must be at least 5 characters.';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    if (start >= end) {
      setError('Invalid Interval: Start time must occur before end time.');
      return;
    }

    // Resolve user ID from local session
    let userId = 'usr_employee';
    const session = localStorage.getItem('MOCK_USER_SESSION');
    if (session) {
      try {
        const userObj = JSON.parse(session);
        if (userObj.id) userId = userObj.id;
      } catch {
        // Ignore
      }
    }

    const res = bookingService.createBooking(assetId, userId, purpose, date, start, end);
    if (res.success) {
      alert('Time slot booked successfully!');
      setPurpose('');
      onSave();
    } else {
      setError(res.error || 'Overlap collision.');
    }
  };

  return (
    <div className="glass-panel" style={styles.card}>
      <h3 style={styles.cardTitle}>✍️ Book Resource Slot</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

        {/* Date Selector */}
        <div style={styles.formGroup}>
          <label htmlFor="booking-date" style={styles.label}>Reservation Date *</label>
          <input
            id="booking-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.timeRow}>
          {/* Start Time */}
          <div style={styles.formGroup}>
            <label htmlFor="booking-start" style={styles.label}>Start Time *</label>
            <select
              id="booking-start"
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
            <label htmlFor="booking-end" style={styles.label}>End Time *</label>
            <select
              id="booking-end"
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

        {/* Purpose */}
        <div style={styles.formGroup}>
          <label htmlFor="booking-purpose" style={styles.label}>Purpose of Booking *</label>
          <textarea
            id="booking-purpose"
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
              setValidationErrors(prev => ({ ...prev, purpose: '' }));
            }}
            style={{ ...styles.textarea, borderColor: validationErrors.purpose ? 'var(--danger)' : 'var(--border-color)' }}
            placeholder="e.g. Firmware compilation and hardware diagnostic checks."
          />
          {validationErrors.purpose && <span style={styles.errorMsg}>{validationErrors.purpose}</span>}
        </div>

        {/* Submit button */}
        <button type="submit" style={styles.submitBtn}>
          Confirm Reservation
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--bg-primary)',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
    marginBottom: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  errorBanner: {
    fontSize: '11px',
    color: 'var(--danger)',
    backgroundColor: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    padding: '8px 10px',
    borderRadius: '4px',
    lineHeight: 1.4,
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
  textarea: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    outline: 'none',
    minHeight: '75px',
    resize: 'vertical',
  },
  timeRow: {
    display: 'flex',
    gap: '12px',
  },
  submitBtn: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: 700,
    backgroundColor: 'var(--accent-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: 'var(--shadow-sm)',
  },
  errorMsg: {
    fontSize: '10.5px',
    color: 'var(--danger)',
    marginTop: '1px',
  },
};
