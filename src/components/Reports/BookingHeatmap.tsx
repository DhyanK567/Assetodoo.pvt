import React from 'react';
import { bookingService } from '../../services/bookingService';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

export const BookingHeatmap: React.FC = () => {
  const bookings = bookingService.getBookings();

  if (bookings.length === 0) {
    return <div style={styles.noData}>No bookings found to generate heatmap.</div>;
  }

  // Count reservations per day and hour slot
  // Using a simplified logic: day of the week from the date string, and hour from start time
  const densityMap: Record<string, number> = {};
  
  bookings.forEach(b => {
    // Note: In real app, we'd parse the date object. Here, for mock robustness, 
    // we use a deterministic hash based on date string or simply assign random days if needed, 
    // but JS Date.getDay() works if date string is valid.
    const dateObj = new Date(b.date);
    let dayIndex = dateObj.getDay() - 1; // 0 for Mon
    if (dayIndex < 0 || dayIndex > 4) dayIndex = 0; // fallback to Mon for weekends in this mock
    
    const startHour = parseInt(b.startTime.split(':')[0], 10);
    const endHour = parseInt(b.endTime.split(':')[0], 10);
    
    for (let h = startHour; h < endHour; h++) {
      const key = `${dayIndex}-${h}`;
      densityMap[key] = (densityMap[key] || 0) + 1;
    }
  });

  const maxDensity = Math.max(...Object.values(densityMap), 1);

  // Generate color based on density (lighter to darker purple)
  const getCellColor = (count: number) => {
    if (count === 0) return 'var(--bg-tertiary)';
    const intensity = 0.2 + (count / maxDensity) * 0.8; // 0.2 to 1.0 opacity
    return `rgba(139, 92, 246, ${intensity})`; // Purple base
  };

  return (
    <div style={styles.container} className="glass-panel">
      <h3 style={styles.title}>Resource Booking Heatmap</h3>
      
      <div style={styles.heatmapWrapper}>
        <div style={styles.grid}>
          {/* Header row (Hours) */}
          <div style={styles.cellEmpty} />
          {HOURS.map(hour => (
            <div key={hour} style={styles.headerCell}>{hour.split(':')[0]}h</div>
          ))}

          {/* Weekday rows */}
          {WEEKDAYS.map((day, dIdx) => (
            <React.Fragment key={day}>
              <div style={styles.rowLabel}>{day}</div>
              {HOURS.map((hour) => {
                const hNum = parseInt(hour.split(':')[0], 10);
                const count = densityMap[`${dIdx}-${hNum}`] || 0;
                return (
                  <div
                    key={`${day}-${hour}`}
                    style={{
                      ...styles.cell,
                      backgroundColor: getCellColor(count),
                    }}
                    title={`${day} ${hour} - ${count} bookings`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={styles.legend}>
        <span style={styles.legendText}>Lighter = Low density</span>
        <div style={{...styles.legendBox, backgroundColor: getCellColor(0)}} />
        <div style={{...styles.legendBox, backgroundColor: getCellColor(maxDensity * 0.5)}} />
        <div style={{...styles.legendBox, backgroundColor: getCellColor(maxDensity)}} />
        <span style={styles.legendText}>Darker = High density</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: 'var(--bg-primary)',
  },
  title: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  heatmapWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '40px repeat(12, 1fr)',
    gap: '4px',
    minWidth: '500px',
  },
  cellEmpty: {
    width: '40px',
  },
  headerCell: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    fontWeight: 600,
  },
  rowLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '6px',
  },
  cell: {
    height: '24px',
    borderRadius: '2px',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'transform 0.1s ease',
    cursor: 'pointer',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '8px',
  },
  legendText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  legendBox: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
  },
  noData: {
    padding: '20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
};
