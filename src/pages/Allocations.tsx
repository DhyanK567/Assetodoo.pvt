import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orgService, type Employee, type Department } from '../services/orgService';
import { assetService, type AssetAllocation, type TransferRequest, type Asset } from '../services/assetService';
import { DataTable, type Column } from '../components/DataTable';
import { AllocateModal } from '../components/AllocateModal';
import { ReturnModal } from '../components/ReturnModal';
import { TransferApprovalQueue } from '../components/TransferApprovalQueue';

export const Allocations: React.FC = () => {
  const { currentRole } = useAuth();

  // Data lists
  const [allocations, setAllocations] = useState<AssetAllocation[]>(() => assetService.getAllocations());
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>(() => assetService.getTransferRequests());
  
  const [assets] = useState<Asset[]>(() => assetService.getAssets());
  const [employees] = useState<Employee[]>(() => orgService.getEmployees());
  const [departments] = useState<Department[]>(() => orgService.getDepartments());

  // Tab control
  const [activeTab, setActiveTab] = useState<'assignments' | 'transfers'>('assignments');

  // Modals state
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState<Asset | null>(null);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

  const loadData = () => {
    setAllocations(assetService.getAllocations());
    setTransferRequests(assetService.getTransferRequests());
  };

  const handleReturnClick = (alloc: AssetAllocation) => {
    const ast = assets.find(a => a.id === alloc.assetId);
    if (ast) {
      setSelectedAssetForReturn(ast);
      setIsReturnOpen(true);
    }
  };

  // Helper resolvers
  const getAssetDetails = (assetId: string) => {
    const ast = assets.find(a => a.id === assetId);
    return ast ? `${ast.tag} - ${ast.name}` : assetId;
  };

  const getAssigneeName = (row: AssetAllocation) => {
    if (row.employeeId !== 'none') {
      const emp = employees.find(e => e.id === row.employeeId);
      return `👥 ${emp ? emp.name : row.employeeId}`;
    }
    if (row.departmentId !== 'none') {
      const dept = departments.find(d => d.id === row.departmentId);
      return `🏢 ${dept ? dept.name : row.departmentId}`;
    }
    return 'Unassigned';
  };

  // Check Overdue Status
  const getOverdueStatus = (expectedReturnDate: string | null) => {
    if (!expectedReturnDate) return 'active';
    const today = '2026-08-30'; // Static mock today reference
    return expectedReturnDate < today ? 'overdue' : 'active';
  };

  // Gating Flags
  const canModifyAllocations = ['admin', 'asset_manager'].includes(currentRole);

  // Active Assignments columns
  const activeColumns: Column<AssetAllocation>[] = [
    { 
      key: 'assetId', 
      label: 'Asset', 
      sortable: true,
      render: (val) => getAssetDetails(val)
    },
    { 
      key: 'assignee', 
      label: 'Assignee Custodian', 
      sortable: true,
      render: (_, row) => getAssigneeName(row)
    },
    { key: 'allocatedDate', label: 'Allocated Date', sortable: true },
    { 
      key: 'expectedReturnDate', 
      label: 'Expected Return', 
      sortable: true,
      render: (val) => val || 'Indefinite'
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (_, row) => {
        if (row.status !== 'active') return <span style={{ color: 'var(--text-muted)' }}>Returned</span>;
        
        const isOverdue = getOverdueStatus(row.expectedReturnDate) === 'overdue';
        return (
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            padding: '2px 8px', 
            borderRadius: '9999px',
            backgroundColor: isOverdue ? 'var(--danger-bg)' : 'var(--success-bg)',
            color: isOverdue ? 'var(--danger)' : 'var(--success)',
            border: `1px solid ${isOverdue ? 'var(--danger-border)' : 'var(--success-border)'}`
          }}>
            {isOverdue ? '⚠️ OVERDUE' : 'ACTIVE'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => {
        if (row.status !== 'active') return null;
        if (!canModifyAllocations) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Read-only</span>;

        return (
          <button 
            onClick={() => handleReturnClick(row)} 
            style={styles.returnRowBtn}
          >
            Check-in / Return
          </button>
        );
      }
    }
  ];

  // Filter Active Allocations only
  const activeAllocations = allocations.filter(a => a.status === 'active');

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTitleBox}>
          <h1 className="gradient-text" style={styles.title}>Asset Allocations Map</h1>
          <p style={styles.subtitle}>Track check-out dates, expected return deadlines, and pending asset transfers.</p>
        </div>
        
        {canModifyAllocations && activeTab === 'assignments' && (
          <button onClick={() => setIsAllocateOpen(true)} style={styles.allocateBtn}>
            + Allocate Resource
          </button>
        )}
      </header>

      {/* Tabs navigation headers */}
      <div style={styles.tabsContainer} className="glass-panel">
        <button
          onClick={() => setActiveTab('assignments')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'assignments' ? 'var(--accent-primary-glow)' : 'transparent',
            color: activeTab === 'assignments' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottomColor: activeTab === 'assignments' ? 'var(--accent-primary)' : 'transparent',
          }}
        >
          🔗 Active Assignments ({activeAllocations.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'transfers' ? 'var(--accent-primary-glow)' : 'transparent',
            color: activeTab === 'transfers' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottomColor: activeTab === 'transfers' ? 'var(--accent-primary)' : 'transparent',
          }}
        >
          🔄 Transfer Approvals Queue ({transferRequests.filter(r => r.status === 'pending').length})
        </button>
      </div>

      {/* Viewport content */}
      <div style={styles.tabContentViewport}>
        {activeTab === 'assignments' ? (
          <div style={styles.tableSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Current Asset Custody List</h3>
              <p style={styles.sectionSubtitle}>View corporate equipment links mapped to employees or departments.</p>
            </div>
            <DataTable columns={activeColumns} data={activeAllocations} pageSize={5} />
          </div>
        ) : (
          <TransferApprovalQueue requests={transferRequests} onRefresh={loadData} />
        )}
      </div>

      {/* Allocate Modal Dialogue */}
      <AllocateModal
        key={isAllocateOpen ? 'open' : 'closed'}
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        onSave={loadData}
      />

      {/* Check-in Return Modal Dialogue */}
      <ReturnModal
        key={selectedAssetForReturn?.id || 'none'}
        isOpen={isReturnOpen}
        onClose={() => {
          setIsReturnOpen(false);
          setSelectedAssetForReturn(null);
        }}
        asset={selectedAssetForReturn}
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
  allocateBtn: {
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
  tabsContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    padding: '4px 4px 0 4px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    gap: '4px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '10px 16px',
    fontSize: '13.5px',
    fontWeight: 600,
    borderRadius: '4px 4px 0 0',
    transition: 'all var(--transition-fast)',
    borderBottom: '2px solid transparent',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  tabContentViewport: {
    marginTop: '4px',
  },
  tableSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  sectionSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  returnRowBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '4px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
};
