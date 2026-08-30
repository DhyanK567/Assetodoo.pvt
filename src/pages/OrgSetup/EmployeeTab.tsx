import React, { useState } from 'react';
import { orgService, type Employee, type Department } from '../../services/orgService';
import type { UserRole } from '../../context/AuthContext';
import { DataTable, type Column } from '../../components/DataTable';
import { PromoteRoleModal } from '../../components/PromoteRoleModal';

export const EmployeeTab: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => orgService.getEmployees());
  const [departments, setDepartments] = useState<Department[]>(() => orgService.getDepartments());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal control state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const loadData = () => {
    setEmployees(orgService.getEmployees());
    setDepartments(orgService.getDepartments());
  };

  const handlePromoteClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSaveRole = (id: string, newRole: UserRole) => {
    orgService.updateEmployeeRole(id, newRole);
    loadData();
    alert(`Successfully updated role for employee.`);
  };

  // Helper selectors
  const getDeptName = (id: string) => {
    if (id === 'none') return 'Unassigned';
    return departments.find(d => d.id === id)?.name || id;
  };

  const getRoleBadgeStyle = (role: UserRole): React.CSSProperties => {
    switch (role) {
      case 'admin': return { backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' };
      case 'asset_manager': return { backgroundColor: 'var(--accent-primary-glow)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' };
      case 'dept_head': return { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' };
      case 'employee': return { backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' };
    }
  };

  // Filter & Search Logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDept = deptFilter === 'all' || emp.departmentId === deptFilter;
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  const columns: Column<Employee>[] = [
    { key: 'name', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email Address', sortable: true },
    { 
      key: 'departmentId', 
      label: 'Department', 
      sortable: true,
      render: (val) => getDeptName(val)
    },
    { 
      key: 'role', 
      label: 'System Role', 
      sortable: true,
      render: (val: UserRole) => (
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 700, 
          padding: '2px 8px', 
          borderRadius: '9999px',
          display: 'inline-block',
          ...getRoleBadgeStyle(val)
        }}>
          {val.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button 
          onClick={() => handlePromoteClick(row)} 
          style={styles.promoteBtn}
        >
          Change Role
        </button>
      )
    }
  ];

  return (
    <div style={styles.container}>
      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label htmlFor="emp-search" style={styles.filterLabel}>Search directory</label>
          <input
            id="emp-search"
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label htmlFor="dept-filter-select" style={styles.filterLabel}>Department</label>
            <select
              id="dept-filter-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Departments</option>
              <option value="none">Unassigned</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label htmlFor="role-filter-select" style={styles.filterLabel}>Role Type</label>
            <select
              id="role-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="asset_manager">Asset Manager</option>
              <option value="dept_head">Dept Head</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div style={styles.tableSection}>
        <DataTable columns={columns} data={filteredEmployees} pageSize={5} />
      </div>

      {/* Gated Promotion Modal */}
      <PromoteRoleModal
        key={selectedEmployee?.id || 'none'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
        onSave={handleSaveRole}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  filterBar: {
    padding: 'var(--spacing-md)',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    backgroundColor: 'var(--bg-primary)',
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '180px',
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
  promoteBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '4px',
    backgroundColor: 'var(--accent-primary-glow)',
    color: 'var(--accent-primary)',
    border: '1px solid var(--accent-primary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
};

// Inject desktop flex grid overrides for search toolbar via custom styles tag
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @media (min-width: 768px) {
      /* Merge search query and dropdown selectors horizontally on desktop */
      div[style*="display: grid"][style*="gridTemplateColumns: 1fr"] {
        grid-template-columns: 2fr 3fr !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
