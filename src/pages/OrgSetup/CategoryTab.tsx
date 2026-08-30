import React, { useState } from 'react';
import { orgService, type AssetCategory, type CategoryCustomField } from '../../services/orgService';
import { DataTable, type Column } from '../../components/DataTable';

export const CategoryTab: React.FC = () => {
  const [categories, setCategories] = useState<AssetCategory[]>(() => orgService.getCategories());
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState<AssetCategory>({
    id: '',
    name: '',
    description: '',
    depreciationMethod: 'straight_line',
    usefulLifeYears: 5,
    customFields: []
  });
  const [errors, setErrors] = useState<{ name?: string; usefulLife?: string; fields?: string }>({});

  const loadCategories = () => {
    setCategories(orgService.getCategories());
  };

  const handleOpenAddForm = () => {
    setFormData({
      id: `cat_${Math.random().toString(36).substring(2, 9)}`,
      name: '',
      description: '',
      depreciationMethod: 'straight_line',
      usefulLifeYears: 5,
      customFields: []
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleOpenEditForm = (cat: AssetCategory) => {
    setFormData({ 
      ...cat,
      // Deep copy fields to prevent accidental mutation of table row during edit
      customFields: cat.customFields ? cat.customFields.map(f => ({ ...f })) : []
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category? All assets linked in this category will lose category descriptors.')) {
      const updated = orgService.deleteCategory(id);
      setCategories(updated);
    }
  };

  // Dynamic fields array helpers
  const handleAddFieldRow = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { name: '', type: 'text' }]
    }));
  };

  const handleRemoveFieldRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleFieldRowChange = (index: number, key: keyof CategoryCustomField, val: string) => {
    setFormData(prev => {
      const updatedFields = [...prev.customFields];
      updatedFields[index] = {
        ...updatedFields[index],
        [key]: val
      };
      return {
        ...prev,
        customFields: updatedFields
      };
    });
  };

  const validateForm = (): boolean => {
    const errs: typeof errors = {};
    
    if (!formData.name || formData.name.trim().length < 3) {
      errs.name = 'Category Name must be at least 3 characters.';
    }

    if (!formData.usefulLifeYears || formData.usefulLifeYears <= 0) {
      errs.usefulLife = 'Useful life must be a positive number of years.';
    }

    // Check duplicate/empty custom field names
    const fieldNames = formData.customFields.map(f => f.name.trim().toLowerCase());
    const hasEmptyField = fieldNames.some(name => name === '');
    const hasDuplicates = fieldNames.some((name, idx) => fieldNames.indexOf(name) !== idx);

    if (hasEmptyField) {
      errs.fields = 'Custom field names cannot be empty.';
    } else if (hasDuplicates) {
      errs.fields = 'Custom field names must be unique.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Filter empty-ish categories fields before commit
    const sanitizedFields = formData.customFields.map(f => ({
      name: f.name.trim(),
      type: f.type
    }));

    orgService.saveCategory({
      ...formData,
      customFields: sanitizedFields
    });

    loadCategories();
    setIsEditing(false);
  };

  const columns: Column<AssetCategory>[] = [
    { key: 'name', label: 'Category Name', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { 
      key: 'depreciationMethod', 
      label: 'Depreciation Model', 
      sortable: true,
      render: (val) => val.replace('_', ' ').toUpperCase()
    },
    { 
      key: 'usefulLifeYears', 
      label: 'Useful Life (Years)', 
      sortable: true,
      render: (val) => `${val} Years`
    },
    {
      key: 'customFields',
      label: 'Attributes Count',
      sortable: false,
      render: (val: CategoryCustomField[]) => (
        <span style={{ fontSize: '13px' }}>
          🏷️ {val ? val.length : 0} dynamic fields
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
            {formData.id && categories.some(c => c.id === formData.id) ? 'Edit Asset Category' : 'Create Asset Category'}
          </h3>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Category Name */}
            <div style={styles.formGroup}>
              <label htmlFor="cat-name" style={styles.label}>Category Name *</label>
              <input
                id="cat-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ ...styles.input, borderColor: errors.name ? 'var(--danger)' : 'var(--border-color)' }}
                placeholder="e.g. IT Hardware"
              />
              {errors.name && <span style={styles.errorMsg}>{errors.name}</span>}
            </div>

            {/* Description */}
            <div style={styles.formGroup}>
              <label htmlFor="cat-desc" style={styles.label}>Description</label>
              <input
                id="cat-desc"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={styles.input}
                placeholder="Brief description of category"
              />
            </div>

            {/* Depreciation Method */}
            <div style={styles.formGroup}>
              <label htmlFor="cat-depreciation" style={styles.label}>Depreciation Method</label>
              <select
                id="cat-depreciation"
                value={formData.depreciationMethod}
                onChange={(e) => setFormData({ ...formData, depreciationMethod: e.target.value as any })}
                style={styles.select}
              >
                <option value="straight_line">Straight Line Model</option>
                <option value="double_declining">Double Declining Balance</option>
                <option value="none">No Depreciation</option>
              </select>
            </div>

            {/* Useful Life */}
            <div style={styles.formGroup}>
              <label htmlFor="cat-useful-life" style={styles.label}>Useful Life (Years) *</label>
              <input
                id="cat-useful-life"
                type="number"
                value={formData.usefulLifeYears}
                onChange={(e) => setFormData({ ...formData, usefulLifeYears: parseInt(e.target.value) || 0 })}
                style={{ ...styles.input, borderColor: errors.usefulLife ? 'var(--danger)' : 'var(--border-color)' }}
                placeholder="e.g. 5"
              />
              {errors.usefulLife && <span style={styles.errorMsg}>{errors.usefulLife}</span>}
            </div>

            {/* Dynamic Custom Fields Section */}
            <div style={{ ...styles.formGroup, marginTop: '8px' }}>
              <div style={styles.fieldSectionHeader}>
                <label style={{ ...styles.label, fontWeight: 700 }}>Dynamic Custom Fields</label>
                <button type="button" onClick={handleAddFieldRow} style={styles.addFieldBtn}>
                  + Add Field
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Add attributes that assets registered in this category will prompt for (e.g. RAM size, Purchase Date).
              </p>

              {errors.fields && <div style={{ ...styles.errorMsg, marginBottom: '8px' }}>⚠️ {errors.fields}</div>}

              <div style={styles.fieldsContainer}>
                {formData.customFields.map((field, idx) => (
                  <div key={idx} style={styles.fieldRow}>
                    <input
                      type="text"
                      placeholder="Field Name (e.g. Model)"
                      value={field.name}
                      onChange={(e) => handleFieldRowChange(idx, 'name', e.target.value)}
                      style={styles.fieldInput}
                    />
                    <select
                      value={field.type}
                      onChange={(e) => handleFieldRowChange(idx, 'type', e.target.value as any)}
                      style={styles.fieldSelect}
                    >
                      <option value="text">Text String</option>
                      <option value="number">Numeric Val</option>
                      <option value="date">Calendar Date</option>
                    </select>
                    <button type="button" onClick={() => handleRemoveFieldRow(idx)} style={styles.removeFieldRowBtn}>
                      ✕
                    </button>
                  </div>
                ))}
                {formData.customFields.length === 0 && (
                  <div style={styles.noFieldsPlaceholder}>No dynamic custom fields added yet.</div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={styles.actions}>
              <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" style={styles.saveBtn}>
                Save Category
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={styles.tableSection}>
          <div style={styles.tableHeader}>
            <div>
              <h3 style={styles.sectionTitle}>Asset Classification Categories</h3>
              <p style={styles.sectionSubtitle}>Manage depreciation schedules and dynamic attribute schemas.</p>
            </div>
            <button onClick={handleOpenAddForm} style={styles.addBtn}>
              + Add Category
            </button>
          </div>

          <DataTable columns={columns} data={categories} pageSize={5} />
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
    maxWidth: '560px',
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
  fieldSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  addFieldBtn: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    backgroundColor: 'var(--accent-primary-glow)',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  fieldsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    border: '1px solid var(--border-color)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-secondary)',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  fieldInput: {
    flex: 2,
    padding: '8px 12px',
    fontSize: '13px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  fieldSelect: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '13px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
  },
  removeFieldRowBtn: {
    fontSize: '14px',
    color: 'var(--danger)',
    padding: '6px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  noFieldsPlaceholder: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '12px 0',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
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
