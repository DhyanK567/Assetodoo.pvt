import React from 'react';
import type { ResourceBooking } from '../services/bookingService';

interface BookingStatusBadgeProps {
  status: ResourceBooking['status'];
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (state: ResourceBooking['status']): React.CSSProperties => {
    switch (state) {
      case 'upcoming':
        return {
          backgroundColor: 'rgba(66, 153, 225, 0.15)',
          color: '#63b3ed',
          border: '1px solid rgba(66, 153, 225, 0.4)',
        };
      case 'ongoing':
        return {
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success)',
          border: '1px solid var(--success-border)',
          position: 'relative',
        };
      case 'completed':
        return {
          backgroundColor: 'rgba(74, 85, 104, 0.1)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)',
        };
      case 'cancelled':
        return {
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger)',
          border: '1px solid var(--danger-border)',
        };
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '9999px',
          display: 'inline-block',
          letterSpacing: '0.04em',
          textAlign: 'center',
          ...getBadgeStyle(status),
        }}
      >
        {status.toUpperCase()}
      </span>
      {status === 'ongoing' && (
        <span style={styles.pulseDot} title="Currently Active Slot" />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--success)',
    boxShadow: '0 0 0 0 rgba(72, 187, 120, 0.7)',
    animation: 'pulse 1.5s infinite',
  }
};

// Inject pulsed styling animation
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(72, 187, 120, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
