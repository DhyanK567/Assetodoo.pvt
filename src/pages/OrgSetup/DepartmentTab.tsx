import React, { useState } from 'react';
import { orgService, type Department, type Employee } from '../../services/orgService';
import { DataTable, type Column } from '../../components/DataTable';

export const DepartmentTab: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(() => orgService.getDepartments());
  const [employees] = useState<Employee[]>(() => orgService.getEmployees());

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Department>({
    id: '',
    name: '',
    headId: 'none',
    parentDeptId: 'none',
    status: 'active',
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  const loadDepartments = () => {
    setDepartments(orgService.getDepartments());
  };

  const handleOpenAddForm = () => {
    setFormData({
      id: `dept_${Math.random().toString(36).substring(2, 9)}`,
      name: '',
      headId: 'none',
      parentDeptId: 'none',
      status: 'active',
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleOpenEditForm = (dept: Department) => {
    setFormData({ ...dept });
    setErrors({});
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      const updated = orgService.deleteDepartment(id);
      setDepartments(updated);
    }
  };

  const validateForm = (): boolean => {
    const errs: typeof errors = {};
    if (!formData.name || formData.name.trim().length < 3) {
      errs.name = 'Department Name must be at least 3 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    orgService.saveDepartment(formData);
    loadDepartments();
    setIsEditing(false);
  };

  // Helper resolvers for displaying IDs cleanly in table cells
  const getEmployeeName = (id: string) => {
    if (id === 'none') return 'Unassigned';
    return employees.find(e => e.id === id)?.name || id;
  };

  const getParentDeptName = (id: string) => {
    if (id === 'none') return 'Root (None)';
    return departments.find(d => d.id === id)?.name || id;
  };

  // Prevent circular hierarchy references in dropdown selections
  const parentDeptOptions = departments.filter(d => d.id !== formData.id);

  const columns: Column<Department>[] = [
    { key: 'name', label: 'Department Name', sortable: true },
    { 
      key: 'headId', 
      label: 'Department Head', 
      sortable: true,
      render: (val) => getEmployeeName(val)
    },
    { 
      key: 'parentDeptId', 
      label: 'Parent Hierarchy', 
      sortable: true,
      render: (val) => getParentDeptName(val)
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (val) => (
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 700, 
          padding: '2px 8px', 
          borderRadius: '9999px',
          backgroundColor: val === 'active' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
          color: val === 'active' ? 'var(--success)' : 'var(--text-muted)',
          border: `1px solid ${val === 'active' ? 'var(--success-border)' : 'var(--border-color)'}`
        }}>
          {val.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleOpenEditForm(row)} 
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
        </div>
      )
    }
  ];

  return (
    <div style={styles.container}>
      {isEditing ? (
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>
            {formData.id && departments.some(d => d.id === formData.id) ? 'Edit Department' : 'Create Department'}
          </h3>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="dept-name" style={styles.label}>Department Name *</label>
              <input
                id="dept-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ ...styles.input, borderColor: errors.name ? 'var(--danger)' : 'var(--border-color)' }}
                placeholder="e.g. Research & Development"
              />
              {errors.name && <span style={styles.errorMsg}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="dept-head-select" style={styles.label}>Department Head</label>
              <select
                id="dept-head-select"
                value={formData.headId}
                onChange={(e) => setFormData({ ...formData, headId: e.target.value })}
                style={styles.select}
              >
                <option value="none">Unassigned (None)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="dept-parent-select" style={styles.label}>Parent Department</label>
              <select
                id="dept-parent-select"
                value={formData.parentDeptId}
                onChange={(e) => setFormData({ ...formData, parentDeptId: e.target.value })}
                style={styles.select}
              >
                <option value="none">Root (No Parent)</option>
                {parentDeptOptions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="dept-status-select" style={styles.label}>Status</label>
              <select
                id="dept-status-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                style={styles.select}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={styles.actions}>
              <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" style={styles.saveBtn}>
                Save Department
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={styles.tableSection}>
          <div style={styles.tableHeader}>
            <div>
              <h3 style={styles.sectionTitle}>Departments Hierarchy</h3>
              <p style={styles.sectionSubtitle}>Manage department trees and assign heads of department.</p>
            </div>
            <button onClick={handleOpenAddForm} style={styles.addBtn}>
              + Add Department
            </button>
          </div>

          <DataTable columns={columns} data={departments} pageSize={5} />
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  tableSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  sectionSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  addBtn: {
    background: 'var(--accent-primary)',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '13px',
  },
  card: {
    padding: 'var(--spacing-lg)',
    maxWidth: '520px',
    width: '100%',
    margin: '0 auto',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: 'var(--spacing-md)',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  input: {
    padding: '10px 14px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  select: {
    padding: '10px 14px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    background: 'var(--accent-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  },
  editRowBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '4px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
  },
  deleteRowBtn: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '4px',
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid var(--danger-border)',
  },
  errorMsg: {
    fontSize: '11px',
    color: 'var(--danger)',
    marginTop: '2px',
  },
};
