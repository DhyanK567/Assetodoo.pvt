import React, { useState } from 'react';
import { assetService, type Asset } from '../services/assetService';
import { bookingService, type ResourceBooking, MOCK_TODAY } from '../services/bookingService';
import { BookingCalendar } from '../components/BookingCalendar';
import { BookingForm } from '../components/BookingForm';

export const ResourceBookingPage: React.FC = () => {
  // Option lists
  const [bookableResources] = useState<Asset[]>(() => assetService.getAssets().filter(a => a.isBookable));
  const [bookings, setBookings] = useState<ResourceBooking[]>(() => bookingService.getBookings());

  // Selected filters
  const [selectedResourceId, setSelectedResourceId] = useState(() => {
    const res = assetService.getAssets().filter(a => a.isBookable);
    return res.length > 0 ? res[0].id : '';
  });
  const [selectedDate, setSelectedDate] = useState(MOCK_TODAY);
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

  // Prefilled slot state
  const [selectedSlot, setSelectedSlot] = useState({ start: '09:00', end: '10:00' });

  const loadBookings = () => {
    setBookings(bookingService.getBookings());
  };

  const handleSelectSlot = (start: string, end: string) => {
    setSelectedSlot({ start, end });
  };

  // Find selected resource details
  const selectedResource = bookableResources.find(r => r.id === selectedResourceId);

  // Pre-filter bookings for the active grid view
  const activeBookings = bookings.filter(b => 
    b.assetId === selectedResourceId && 
    b.date === selectedDate
  );

  // Mock reminder notifications check (bookings for active user within next 24h)
  const userUpcomingBookings = bookings.filter(b => 
    activeUser &&
    b.userId === activeUser.id &&
    b.status === 'upcoming' &&
    (b.date === MOCK_TODAY || b.date === '2026-08-31')
  );

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTitleBox}>
          <h1 className="gradient-text" style={styles.title}>Resource Reservations</h1>
          <p style={styles.subtitle}>Book shared department assets, lab equipment, and schedule time-slot grids.</p>
        </div>
      </header>

      {/* Reminder Notification Banner */}
      {userUpcomingBookings.length > 0 && (
        <div style={styles.notificationBanner} className="glass-panel">
          <div style={styles.notifIcon}>🔔</div>
          <div style={styles.notifContent}>
            <strong>Upcoming Reservation Reminder:</strong>
            {userUpcomingBookings.map((b) => {
              const res = assetService.getAssetById(b.assetId);
              return (
                <div key={b.id} style={styles.notifItem}>
                  - You have booked the <strong>{res ? res.name : b.assetId}</strong> on <strong>{b.date}</strong> at <strong>{b.startTime} - {b.endTime}</strong>.
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar Controls */}
      <div className="glass-panel" style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <label htmlFor="resource-select" style={styles.filterLabel}>Select Resource</label>
          <select
            id="resource-select"
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            style={styles.select}
          >
            {bookableResources.map(r => (
              <option key={r.id} value={r.id}>{r.tag} - {r.name}</option>
            ))}
            {bookableResources.length === 0 && (
              <option value="">No Bookable Resources Configured</option>
            )}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label htmlFor="calendar-date-select" style={styles.filterLabel}>View Date</label>
          <input
            id="calendar-date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      {/* Main Grid split */}
      {selectedResourceId ? (
        <div style={styles.mainGrid}>
          {/* Left agenda list */}
          <div style={styles.leftCol}>
            {selectedResource && (
              <div style={styles.resourceDetails} className="glass-panel">
                <span style={styles.badge}>SHARED BOOKABLE</span>
                <h4 style={styles.resourceTitle}>{selectedResource.name}</h4>
                <div style={styles.metaRow}>
                  <span>Tag: <strong>{selectedResource.tag}</strong></span>
                  <span>S/N: <strong>{selectedResource.serialNumber}</strong></span>
                  <span>Location: <strong>{selectedResource.location}</strong></span>
                </div>
              </div>
            )}

            <BookingCalendar
              assetId={selectedResourceId}
              selectedDate={selectedDate}
              bookings={activeBookings}
              onRefresh={loadBookings}
              onSelectSlot={handleSelectSlot}
            />
          </div>

          {/* Right form input */}
          <div style={styles.rightCol}>
            <BookingForm
              key={`${selectedResourceId}-${selectedDate}-${selectedSlot.start}-${selectedSlot.end}`}
              assetId={selectedResourceId}
              initialDate={selectedDate}
              initialStart={selectedSlot.start}
              initialEnd={selectedSlot.end}
              onSave={loadBookings}
            />
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={styles.noResourcePlaceholder}>
          No bookable resources are currently registered in the catalog registry.
          Mark an asset as "Shared Resource" during registration to make it bookable here!
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
  },
  header: {
    marginBottom: '4px',
  },
  headerTitleBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    marginBottom: '4px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
  },
  notificationBanner: {
    display: 'flex',
    gap: '14px',
    backgroundColor: 'var(--accent-primary-glow)',
    border: '1px solid var(--accent-primary)',
    color: 'var(--text-primary)',
    padding: '14px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    lineHeight: 1.5,
  },
  notifIcon: {
    fontSize: '20px',
  },
  notifContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  notifItem: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  toolbar: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    backgroundColor: 'var(--bg-primary)',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: '220px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
  },
  input: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 'var(--spacing-lg)',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  resourceDetails: {
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  badge: {
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: 'var(--accent-primary-glow)',
    color: 'var(--accent-primary)',
    border: '1px solid var(--accent-primary)',
    padding: '2px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  resourceTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    flexWrap: 'wrap',
  },
  noResourcePlaceholder: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px',
    lineHeight: 1.6,
  },
};

// Inject desktop flex grid overrides for responsive main split layouts
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @media (min-width: 992px) {
      /* Split main panels horizontally on larger monitors */
      div[style*="display: grid"][style*="gridTemplateColumns: repeat(auto-fit, minmax(320px, 1fr))"] {
        grid-template-columns: 3fr 2fr !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
