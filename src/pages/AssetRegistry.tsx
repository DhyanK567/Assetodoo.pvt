import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orgService, type AssetCategory } from '../services/orgService';
import { assetService, type Asset, type AssetStatus } from '../services/assetService';
import { DataTable, type Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { AssetRegisterForm } from '../components/AssetRegisterForm';
import { AssetDetailModal } from '../components/AssetDetailModal';

export const AssetRegistry: React.FC = () => {
  const { currentRole } = useAuth();
  
  // Data lists
  const [assets, setAssets] = useState<Asset[]>(() => assetService.getAssets());
  const [categories] = useState<AssetCategory[]>(() => orgService.getCategories());

  // Navigation / Toggles
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  // Details Modal
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  const loadAssets = () => {
    setAssets(assetService.getAssets());
  };

  const handleOpenRegister = () => {
    setEditingAsset(null);
    setIsRegistering(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsRegistering(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to decommission/delete this asset registration?')) {
      const updated = assetService.deleteAsset(id);
      setAssets(updated);
    }
  };

  const handleOpenDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailOpen(true);
  };

  // Helper resolvers
  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || catId;
  };

  // Filters logic
  const filteredAssets = assets.filter((ast) => {
    const matchesSearch = 
      ast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ast.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || ast.categoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || ast.status === statusFilter;
    const matchesCondition = conditionFilter === 'all' || ast.condition === conditionFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  // Action Gating Flags
  const canModifyAssets = currentRole === 'admin' || currentRole === 'asset_manager';

  const columns: Column<Asset>[] = [
    { 
      key: 'tag', 
      label: 'Asset Tag', 
      sortable: true,
      render: (val, row) => (
        <span 
          onClick={() => handleOpenDetails(row)}
          style={{ 
            fontWeight: 700, 
            color: 'var(--accent-primary)', 
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {val}
        </span>
      )
    },
    { key: 'name', label: 'Asset Name', sortable: true },
    { 
      key: 'categoryId', 
      label: 'Category', 
      sortable: true,
      render: (val) => getCategoryName(val)
    },
    { key: 'location', label: 'Location', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (val: AssetStatus) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleOpenDetails(row)} 
            style={styles.viewRowBtn}
          >
            Details
          </button>
          
          {canModifyAssets && (
            <>
              <button 
                onClick={() => handleOpenEdit(row)} 
                style={styles.editRowBtn}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(row.id)} 
                style={styles.deleteRowBtn}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in" style={styles.container}>
      {isRegistering ? (
        <div style={styles.formContainer}>
          <AssetRegisterForm
            key={editingAsset?.id || 'new'}
            assetToEdit={editingAsset}
            onSave={() => {
              setIsRegistering(false);
              loadAssets();
            }}
            onCancel={() => setIsRegistering(false)}
          />
        </div>
      ) : (
        <>
          <header style={styles.header}>
            <div style={styles.headerTitleBox}>
              <h1 className="gradient-text" style={styles.title}>Asset Registry</h1>
              <p style={styles.subtitle}>Track physical hardware inventory, operational statuses, and custom descriptors.</p>
            </div>
            
            {canModifyAssets && (
              <button onClick={handleOpenRegister} style={styles.registerBtn}>
                + Register Asset
              </button>
            )}
          </header>

          {/* Search & Filter Toolbar */}
          <div className="glass-panel" style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <label htmlFor="asset-search" style={styles.filterLabel}>Search Directory</label>
              <input
                id="asset-search"
                type="text"
                placeholder="Search by tag, name, or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filtersRow}>
              <div style={styles.filterGroup}>
                <label htmlFor="category-filter-select" style={styles.filterLabel}>Category</label>
                <select
                  id="category-filter-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label htmlFor="status-filter-select" style={styles.filterLabel}>Lifecycle Status</label>
                <select
                  id="status-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="allocated">Allocated</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="disposed">Disposed</option>
                  <option value="booked">Booked</option>
                  <option value="pending_transfer">Pending Transfer</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label htmlFor="condition-filter-select" style={styles.filterLabel}>Condition</label>
                <select
                  id="condition-filter-select"
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">All Conditions</option>
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Catalog DataTable Grid */}
          <div style={styles.tableSection}>
            <DataTable columns={columns} data={filteredAssets} pageSize={5} />
          </div>
        </>
      )}

      {/* Asset Detailed View Modal */}
      <AssetDetailModal
        key={selectedAsset?.id || 'none'}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        asset={selectedAsset}
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
  registerBtn: {
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
  formContainer: {
    marginTop: '4px',
  },
  filterBar: {
    padding: 'var(--spacing-md)',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    backgroundColor: 'var(--bg-primary)',
  },
  filtersRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: '150px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  searchInput: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  filterSelect: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
  },
  tableSection: {
    marginTop: '4px',
  },
  viewRowBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '4px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  editRowBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '4px',
    backgroundColor: 'var(--accent-primary-glow)',
    color: 'var(--accent-primary)',
    border: '1px solid var(--accent-primary)',
    cursor: 'pointer',
  },
  deleteRowBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '4px',
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid var(--danger-border)',
    cursor: 'pointer',
  },
};

// Inject desktop flex grid overrides for search toolbar via custom styles tag
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @media (min-width: 768px) {
      /* Merge search query and filters row horizontally on desktop */
      div[style*="display: grid"][style*="gridTemplateColumns: 1fr"] {
        grid-template-columns: 2fr 3fr !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
