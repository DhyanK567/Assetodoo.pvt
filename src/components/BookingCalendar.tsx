import React, { useState } from 'react';
import { orgService, type Employee } from '../services/orgService';
import { type ResourceBooking } from '../services/bookingService';
import { BookingStatusBadge } from './BookingStatusBadge';
import { CancelRescheduleModal } from './CancelRescheduleModal';

interface BookingCalendarProps {
  assetId: string;
  selectedDate: string;
  bookings: ResourceBooking[];
  onRefresh: () => void;
  onSelectSlot: (start: string, end: string) => void;
}

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  bookings,
  onRefresh,
  onSelectSlot,
}) => {
  const [employees] = useState<Employee[]>(() => orgService.getEmployees());
  const [activeUser] = useState<any>(() => {
    const session = localStorage.getItem('MOCK_USER_SESSION');
    if (session) {
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Reschedule state
  const [selectedBooking, setSelectedBooking] = useState<ResourceBooking | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const getEmployeeName = (userId: string) => {
    return employees.find(e => e.id === userId)?.name || userId;
  };

  const handleOpenReschedule = (booking: ResourceBooking) => {
    setSelectedBooking(booking);
    setIsRescheduleOpen(true);
  };

  // Check if current user is owner, admin or manager
  const canModify = (booking: ResourceBooking) => {
    if (!activeUser) return false;
    return (
      activeUser.role === 'admin' ||
      activeUser.role === 'asset_manager' ||
      activeUser.id === booking.userId
    );
  };

  // Find bookings that fall inside this hour interval slot
  const getBookingForHour = (hour: string): ResourceBooking | undefined => {
    return bookings.find(b => {
      if (b.status === 'cancelled') return false;
      const s = b.startTime;
      const e = b.endTime;
      // If hour is e.g. "09:00", does it fall inside [s, e)?
      return hour >= s && hour < e;
    });
  };

  return (
    <div style={styles.calendarCard} className="glass-panel">
      <div style={styles.calendarHeader}>
        <div>
          <h3 style={styles.titleText}>📅 Operational Timeline Agenda</h3>
          <p style={styles.subtitleText}>Viewing reservations for date: <strong>{selectedDate}</strong></p>
        </div>
      </div>

      <div style={styles.timelineContainer}>
        {HOURS.map((hour) => {
          const booking = getBookingForHour(hour);
          const nextHour = HOURS[HOURS.indexOf(hour) + 1] || '20:00';

          return (
            <div key={hour} style={styles.hourRow}>
              {/* Hour indicator label */}
              <div style={styles.hourLabel}>{hour}</div>
              
              {/* Hour slot content box */}
              <div style={styles.slotContent}>
                {booking ? (
                  // Only display booking card once on its start hour to prevent duplicates
                  hour === booking.startTime || HOURS[HOURS.indexOf(hour) - 1] < booking.startTime ? (
                    <div style={styles.bookingCard} className="glass-panel animate-fade-in">
                      <div style={styles.bookingCardHeader}>
                        <div>
                          👤 Host: <strong>{getEmployeeName(booking.userId)}</strong>
                        </div>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      
                      <div style={styles.bookingPurpose}>
                        📝 {booking.purpose}
                      </div>

                      <div style={styles.bookingTimeRange}>
                        ⏱️ Time Slot: <strong>{booking.startTime} - {booking.endTime}</strong>
                      </div>

                      {canModify(booking) && booking.status !== 'completed' && (
                        <div style={styles.bookingActions}>
                          <button 
                            type="button" 
                            onClick={() => handleOpenReschedule(booking)}
                            style={styles.reschedBtn}
                          >
                            Reschedule / Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null
                ) : (
                  // Empty slot button trigger
                  <button
                    type="button"
                    onClick={() => onSelectSlot(hour, nextHour)}
                    style={styles.reserveBtn}
                  >
                    + Book Slot ({hour} - {nextHour})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedBooking && (
        <CancelRescheduleModal
          key={selectedBooking.id}
          isOpen={isRescheduleOpen}
          onClose={() => {
            setIsRescheduleOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onRefresh={() => {
            setIsRescheduleOpen(false);
            setSelectedBooking(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  calendarCard: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: 'var(--bg-primary)',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  titleText: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitleText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  timelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    borderLeft: '2px solid var(--border-color)',
    paddingLeft: '12px',
    marginLeft: '6px',
  },
  hourRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '8px 0',
  },
  hourLabel: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    width: '45px',
    textAlign: 'right',
    paddingTop: '6px',
  },
  slotContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  bookingCard: {
    padding: '12px 14px',
    backgroundColor: 'var(--bg-secondary)',
    borderLeft: '4px solid var(--accent-primary)',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxShadow: 'var(--shadow-sm)',
  },
  bookingCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12.5px',
    color: 'var(--text-primary)',
  },
  bookingPurpose: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  bookingTimeRange: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
  },
  bookingActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '4px',
  },
  reschedBtn: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    backgroundColor: 'var(--accent-primary-glow)',
    border: '1px solid var(--accent-primary)',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  reserveBtn: {
    padding: '8px 12px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    border: '1px dashed var(--border-color)',
    borderRadius: '4px',
    textAlign: 'left',
    background: 'transparent',
    cursor: 'pointer',
    width: 'fit-content',
    transition: 'all var(--transition-fast)',
  },
};

// Inject hover overrides for empty reserve slot triggers
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    button[style*="dashed var(--border-color)"]:hover {
      background-color: var(--bg-tertiary) !important;
      color: var(--text-primary) !important;
      border-style: solid !important;
    }
  `;
  document.head.appendChild(styleSheet);
}
