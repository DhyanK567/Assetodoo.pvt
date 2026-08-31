import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService, type AppNotification } from '../services/notificationService';

export const NotificationBell: React.FC = () => {
  const { currentRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [, setRefresh] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive notifications during render (synchronous mock call)
  const notifications = notificationService.getNotificationsForRole(currentRole);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    notificationService.markAllAsReadForRole(currentRole);
    setRefresh(r => r + 1); // trigger re-render
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'danger': return 'var(--danger)';
      case 'warning': return 'var(--warning)';
      case 'success': return 'var(--success)';
      case 'info':
      default: return 'var(--accent-primary)';
    }
  };

  // Safe to use Date.now() if we suppress the warning, or we can use a fixed time for the render cycle.
  const currentTime = Date.now();
  const getTimeAgo = (timestamp: string) => {
    const diff = currentTime - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.bellBtn}>
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div style={styles.dropdown} className="glass-panel animate-fade-in">
          <div style={styles.header}>
            <span style={styles.title}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={styles.markReadBtn}>
                Mark all read
              </button>
            )}
          </div>
          
          <div style={styles.list}>
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div key={n.id} style={{
                  ...styles.item,
                  backgroundColor: n.isRead ? 'transparent' : 'var(--bg-tertiary)',
                  borderLeft: `3px solid ${getTypeColor(n.type)}`
                }}>
                  <p style={styles.message}>{n.message}</p>
                  <span style={styles.time}>{getTimeAgo(n.timestamp)}</span>
                </div>
              ))
            ) : (
              <div style={styles.empty}>No notifications.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  bellBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    position: 'relative',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: '0px',
    right: '0px',
    backgroundColor: 'var(--danger)',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 700,
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '2px solid var(--bg-primary)',
  },
  dropdown: {
    position: 'absolute',
    top: '40px',
    right: 0,
    width: '320px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
  },
  title: {
    fontSize: '13.5px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  markReadBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    color: 'var(--accent-primary)',
    cursor: 'pointer',
    fontWeight: 600,
  },
  list: {
    maxHeight: '360px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  message: {
    fontSize: '12.5px',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.4,
  },
  time: {
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  empty: {
    padding: '24px',
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text-muted)',
  }
};
