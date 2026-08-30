import React, { useState } from 'react';
import { maintenanceService, type MaintenanceRequest } from '../services/maintenanceService';
import { RequestForm } from '../components/RequestForm';
import { MaintenanceQueue } from '../components/MaintenanceQueue';

export const Maintenance: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(() => maintenanceService.getRequests());
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadData = () => {
    setRequests(maintenanceService.getRequests());
  };

  // KPI Calculations
  const totalPending = requests.filter(r => r.status === 'pending').length;
  const totalActive = requests.filter(r => ['approved', 'technician_assigned', 'in_progress'].includes(r.status)).length;
  const totalResolved = requests.filter(r => r.status === 'resolved').length;

  // Filtered requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.assetId.toLowerCase().includes(search.toLowerCase()) || 
                          r.description.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTitleBox}>
          <h1 className="gradient-text" style={styles.title}>Asset Maintenance Log</h1>
          <p style={styles.subtitle}>Report equipment damage, track diagnostic runs, and process approvals.</p>
        </div>
        
        <button onClick={() => setIsRequestFormOpen(true)} style={styles.raiseBtn}>
          🔧 File Repair Request
        </button>
      </header>

      {/* KPI Stats Widgets */}
      <div style={styles.kpiGrid}>
        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiIcon}>📥</span>
            <span style={styles.kpiTitle}>Pending Approvals</span>
          </div>
          <div style={styles.kpiValue}>{totalPending}</div>
          <div style={styles.kpiLabel}>Requires Manager Sign-off</div>
        </div>

        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiIcon}>⚙️</span>
            <span style={styles.kpiTitle}>Active Operations</span>
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--warning)' }}>{totalActive}</div>
          <div style={styles.kpiLabel}>In Repair / Diagnostic Status</div>
        </div>

        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiIcon}>✅</span>
            <span style={styles.kpiTitle}>Resolved Tickets</span>
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--success)' }}>{totalResolved}</div>
          <div style={styles.kpiLabel}>Successfully Re-commissioned</div>
        </div>
      </div>

      {/* Toolbar Search/Filter Desk */}
      <div className="glass-panel" style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <label htmlFor="maint-search-input" style={styles.filterLabel}>Search Ticket / Asset</label>
          <input
            id="maint-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset ID or issue..."
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <label htmlFor="maint-prio-select" style={styles.filterLabel}>Severity Level</label>
          <select
            id="maint-prio-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">-- All Severities --</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label htmlFor="maint-status-select" style={styles.filterLabel}>Workflow Status</label>
          <select
            id="maint-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">-- All Statuses --</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="technician_assigned">Tech Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Queue Datatable list */}
      <MaintenanceQueue requests={filteredRequests} onRefresh={loadData} />

      {/* Ticket raise form modal */}
      <RequestForm
        key={isRequestFormOpen ? 'open' : 'closed'}
        isOpen={isRequestFormOpen}
        onClose={() => setIsRequestFormOpen(false)}
        onSave={loadData}
      />
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
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
  raiseBtn: {
    background: 'var(--accent-primary)',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '13.5px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 'var(--spacing-md)',
  },
  kpiCard: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: 'var(--bg-primary)',
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  kpiIcon: {
    fontSize: '18px',
  },
  kpiTitle: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
  },
  kpiValue: {
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  kpiLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
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
    minWidth: '200px',
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
};
