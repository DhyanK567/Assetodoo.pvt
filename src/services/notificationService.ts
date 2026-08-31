export type NotificationType = 'info' | 'warning' | 'success' | 'danger';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  timestamp: string;
  targetRoles: string[]; // e.g. ['admin', 'asset_manager'] or ['all']
}

export type ActionType = 'Allocation' | 'Maintenance' | 'Booking' | 'System' | 'Audit';

export interface ActivityLog {
  id: string;
  action: ActionType;
  actorId: string; // "System" or User Name
  details: string;
  timestamp: string;
  targetRoles: string[]; // visibility scoping
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'danger',
    message: 'Overdue Return: AST-00002 was due yesterday.',
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    targetRoles: ['admin', 'asset_manager', 'dept_head']
  },
  {
    id: 'notif_2',
    type: 'success',
    message: 'Maintenance Approved for AST-00003.',
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    targetRoles: ['all']
  },
  {
    id: 'notif_3',
    type: 'warning',
    message: 'Audit Cycle "Q2 IT Equipment Stocktake" flagged discrepancies.',
    isRead: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    targetRoles: ['admin', 'asset_manager']
  },
  {
    id: 'notif_4',
    type: 'info',
    message: 'Booking Reminder: Room 302 reservation starts in 1 hour.',
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    targetRoles: ['all']
  }
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    action: 'Allocation',
    actorId: 'Sam Manager',
    details: 'Allocated AST-00001 to Employee Taylor Worker',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    targetRoles: ['all']
  },
  {
    id: 'log_2',
    action: 'Maintenance',
    actorId: 'System',
    details: 'Status of AST-00003 changed to Under Maintenance',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    targetRoles: ['all']
  },
  {
    id: 'log_3',
    action: 'Audit',
    actorId: 'Alex Admin',
    details: 'Closed Audit Cycle "Q2 IT Equipment Stocktake"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    targetRoles: ['admin', 'asset_manager']
  },
  {
    id: 'log_4',
    action: 'Booking',
    actorId: 'Taylor Worker',
    details: 'Created resource booking for Conference Room A',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    targetRoles: ['all']
  },
  {
    id: 'log_5',
    action: 'System',
    actorId: 'Alex Admin',
    details: 'Updated Organization Category Settings',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    targetRoles: ['admin']
  }
];

class NotificationService {
  private getStorageItem<T>(key: string, defaults: T[]): T[] {
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : this.setStorageItem(key, defaults);
    } catch {
      return this.setStorageItem(key, defaults);
    }
  }

  private setStorageItem<T>(key: string, value: T[]): T[] {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  public getNotificationsForRole(role: string): AppNotification[] {
    const all = this.getStorageItem<AppNotification>('MOCK_DB_NOTIFICATIONS', DEFAULT_NOTIFICATIONS);
    // Filter scoped
    return all.filter(n => n.targetRoles.includes('all') || n.targetRoles.includes(role))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public markAllAsReadForRole(role: string): void {
    const all = this.getStorageItem<AppNotification>('MOCK_DB_NOTIFICATIONS', DEFAULT_NOTIFICATIONS);
    const updated = all.map(n => {
      if (n.targetRoles.includes('all') || n.targetRoles.includes(role)) {
        return { ...n, isRead: true };
      }
      return n;
    });
    this.setStorageItem('MOCK_DB_NOTIFICATIONS', updated);
  }

  public getLogsForRole(role: string): ActivityLog[] {
    const all = this.getStorageItem<ActivityLog>('MOCK_DB_ACTIVITY_LOGS', DEFAULT_LOGS);
    if (role === 'admin') {
      return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return all.filter(l => l.targetRoles.includes('all') || l.targetRoles.includes(role))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addLog(action: ActionType, actorId: string, details: string, targetRoles: string[] = ['all']): void {
    const logs = this.getStorageItem<ActivityLog>('MOCK_DB_ACTIVITY_LOGS', DEFAULT_LOGS);
    logs.unshift({
      id: `log_${Math.random().toString(36).substring(2, 9)}`,
      action,
      actorId,
      details,
      timestamp: new Date().toISOString(),
      targetRoles
    });
    this.setStorageItem('MOCK_DB_ACTIVITY_LOGS', logs);
  }
}

export const notificationService = new NotificationService();
