import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { OverdueList } from '../components/OverdueList';
import { QuickActions } from '../components/QuickActions';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface KpiData {
  available: number;
  allocated: number;
  maintenanceToday: number;
  activeBookings: number;
  pendingTransfers: number;
  upcomingReturns: number;
}

interface OverdueItem {
  id: string;
  code: string;
  name: string;
  custodian: string;
  daysOverdue: number;
  category: string;
}

export const Dashboard: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [overdueItems, setOverdueItems] = useState<OverdueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [kpiRes, overdueRes] = await Promise.all([
          api.getDashboardKpis(),
          api.getDashboardOverdue(),
        ]);
        setKpis(kpiRes.data);
        setOverdueItems(overdueRes.data);
      } catch (err) {
        console.error('[Dashboard] Error fetching analytics data:', err);
        setError('Failed to fetch dashboard metrics from API client.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Assembling operational metrics..." />;
  }

  if (error) {
    return (
      <div style={styles.errorContainer} className="glass-panel animate-fade-in">
        <span style={{ fontSize: '32px' }}>⚠️</span>
        <h3 style={{ color: 'var(--danger)', fontWeight: 700, marginTop: '12px' }}>Data Fetch Error</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 20px' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={styles.retryBtn}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Session greeting header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 className="gradient-text" style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, <strong>{currentUser?.name || 'User'}</strong> (Role: {currentRole.replace('_', ' ').toUpperCase()})
          </p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.datasourceTag}>
            <span style={styles.datasourceDot} />
            <span>MOCK DATASOURCE ACTIVE</span>
          </div>
        </div>
      </header>

      {/* KPI Cards Grid */}
      {kpis && (
        <section style={styles.kpiGrid}>
          <KpiCard title="Assets Available" value={kpis.available} icon="🖥️" color="var(--accent-primary)" />
          <KpiCard title="Assets Allocated" value={kpis.allocated} icon="👤" color="var(--accent-secondary)" />
          <KpiCard title="Maintenance Today" value={kpis.maintenanceToday} icon="🛠️" color="var(--danger)" />
          <KpiCard title="Active Bookings" value={kpis.activeBookings} icon="📅" color="#8b5cf6" />
          <KpiCard title="Pending Transfers" value={kpis.pendingTransfers} icon="🔄" color="var(--warning)" />
          <KpiCard title="Upcoming Returns" value={kpis.upcomingReturns} icon="📥" color="var(--success)" />
        </section>
      )}

      {/* Two column split layout */}
      <div style={styles.splitLayout}>
        <div style={styles.leftColumn}>
          {/* Overdue items warnings */}
          <OverdueList items={overdueItems} />
        </div>
        <div style={styles.rightColumn}>
          {/* Actions shortcut panel */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xl)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 'var(--spacing-md)',
  },
  headerLeft: {
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
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
  },
  datasourceTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '10px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  datasourceDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--warning)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'var(--spacing-lg)',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
  },
  errorContainer: {
    padding: '40px',
    textAlign: 'center',
    maxWidth: '480px',
    margin: '40px auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  retryBtn: {
    background: 'var(--accent-primary)',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '14px',
  },
};

// Add responsive media query styles injection
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @media (min-width: 1024px) {
      .animate-fade-in {
        display: flex;
        flex-direction: column;
      }
      /* 2 Column Grid for Dashboard Split Layout */
      div[style*="display: grid"][style*="gridTemplateColumns: 1fr"] {
        grid-template-columns: 2fr 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
