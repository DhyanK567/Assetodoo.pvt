import React, { useState } from 'react';
import { orgService, type AssetCategory } from '../services/orgService';
import { assetService, type Asset, type AssetCondition, type AssetStatus } from '../services/assetService';

interface AssetRegisterFormProps {
  assetToEdit?: Asset | null;
  onSave: () => void;
  onCancel: () => void;
}

export const AssetRegisterForm: React.FC<AssetRegisterFormProps> = ({
  assetToEdit,
  onSave,
  onCancel,
}) => {
  const [categories] = useState<AssetCategory[]>(() => orgService.getCategories());
  
  const [tag] = useState<string>(() => assetToEdit?.tag || assetService.getNextAssetTag());

  // Local form states
  const [formData, setFormData] = useState<Omit<Asset, 'id' | 'tag'>>(() => {
    if (assetToEdit) {
      return {
        name: assetToEdit.name,
        categoryId: assetToEdit.categoryId,
        serialNumber: assetToEdit.serialNumber,
        acquisitionDate: assetToEdit.acquisitionDate,
        acquisitionCost: assetToEdit.acquisitionCost,
        condition: assetToEdit.condition,
        location: assetToEdit.location,
        isBookable: assetToEdit.isBookable,
        status: assetToEdit.status,
        customFields: { ...assetToEdit.customFields },
        photoName: assetToEdit.photoName,
      };
    }
    return {
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      serialNumber: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: 0,
      condition: 'new',
      location: '',
      isBookable: false,
      status: 'available',
      customFields: {},
      photoName: null,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Read selected category custom fields schema definition
  const selectedCategorySchema = categories.find(c => c.id === formData.categoryId);

  // When category changes, reset custom fields mapping matching the new schema
  const handleCategoryChange = (catId: string) => {
    const matched = categories.find(c => c.id === catId);
    const initialFields: Record<string, any> = {};
    if (matched && matched.customFields) {
      matched.customFields.forEach(f => {
        initialFields[f.name] = '';
      });
    }
    setFormData(prev => ({
      ...prev,
      categoryId: catId,
      customFields: initialFields,
    }));
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldName]: value
      }
    }));
  };

  // Mock Photo Upload Type/Size Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const maxBytes = 5 * 1024 * 1024; // 5 MB limit

    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Supported types: PNG, JPEG, PDF.');
      return;
    }

    if (file.size > maxBytes) {
      setUploadError('File exceeds 5MB size limit. Max allowed size is 5MB.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      photoName: file.name
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name || formData.name.trim().length < 3) {
      errs.name = 'Asset Name must be at least 3 characters.';
    }
    if (!formData.categoryId) {
      errs.categoryId = 'Please select an asset category.';
    }
    if (!formData.serialNumber || formData.serialNumber.trim() === '') {
      errs.serialNumber = 'Serial number is required.';
    }
    if (formData.acquisitionCost < 0) {
      errs.acquisitionCost = 'Acquisition cost must be positive.';
    }
    if (!formData.location || formData.location.trim() === '') {
      errs.location = 'Operational storage location is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalAssetObj: Asset = {
      id: assetToEdit ? assetToEdit.id : `ast_${Math.random().toString(36).substring(2, 9)}`,
      tag,
      ...formData,
    };

    assetService.saveAsset(finalAssetObj);
    onSave();
  };

  return (
    <div className="glass-panel" style={styles.card}>
      <h3 style={styles.cardTitle}>
        {assetToEdit ? `Edit Asset [${tag}]` : `Register New Asset`}
      </h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          {/* Asset Tag (Read-only) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Asset Tag (Auto-Generated)</label>
            <input
              type="text"
              value={tag}
              disabled
              style={{ ...styles.input, backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
            />
          </div>

          {/* Serial Number */}
          <div style={styles.formGroup}>
            <label htmlFor="asset-serial" style={styles.label}>Serial Number *</label>
            <input
              id="asset-serial"
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              style={{ ...styles.input, borderColor: errors.serialNumber ? 'var(--danger)' : 'var(--border-color)' }}
              placeholder="e.g. S/N 992019"
            />
            {errors.serialNumber && <span style={styles.errorMsg}>{errors.serialNumber}</span>}
          </div>

          {/* Asset Name */}
          <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
            <label htmlFor="asset-name" style={styles.label}>Asset Name *</label>
            <input
              id="asset-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ ...styles.input, borderColor: errors.name ? 'var(--danger)' : 'var(--border-color)' }}
              placeholder="e.g. MacBook Pro M3 Max"
            />
            {errors.name && <span style={styles.errorMsg}>{errors.name}</span>}
          </div>

          {/* Category Dropdown */}
          <div style={styles.formGroup}>
            <label htmlFor="asset-category-select" style={styles.label}>Category *</label>
            <select
              id="asset-category-select"
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={styles.select}
            >
              <option value="">-- Select Category --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <span style={styles.errorMsg}>{errors.categoryId}</span>}
          </div>

          {/* Condition Select */}
          <div style={styles.formGroup}>
            <label htmlFor="asset-condition-select" style={styles.label}>Initial Condition</label>
            <select
              id="asset-condition-select"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
              style={styles.select}
            >
              <option value="new">New / Mint</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor / End of Life</option>
            </select>
          </div>

          {/* Acquisition Date */}
          <div style={styles.formGroup}>
            <label htmlFor="asset-acq-date" style={styles.label}>Acquisition Date</label>
            <input
              id="asset-acq-date"
              type="date"
              value={formData.acquisitionDate}
              onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
              style={styles.input}
            />
          </div>

          {/* Acquisition Cost */}
          <div style={styles.formGroup}>
            <label htmlFor="asset-acq-cost" style={styles.label}>Acquisition Cost ($)</label>
            <input
              id="asset-acq-cost"
              type="number"
              value={formData.acquisitionCost || ''}
              onChange={(e) => setFormData({ ...formData, acquisitionCost: parseFloat(e.target.value) || 0 })}
              style={{ ...styles.input, borderColor: errors.acquisitionCost ? 'var(--danger)' : 'var(--border-color)' }}
              placeholder="e.g. 1500"
            />
            {errors.acquisitionCost && <span style={styles.errorMsg}>{errors.acquisitionCost}</span>}
          </div>

          {/* Location */}
          <div style={styles.formGroup}>
            <label htmlFor="asset-location" style={styles.label}>Operational Location *</label>
            <input
              id="asset-location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={{ ...styles.input, borderColor: errors.location ? 'var(--danger)' : 'var(--border-color)' }}
              placeholder="e.g. IT Lab Row B"
            />
            {errors.location && <span style={styles.errorMsg}>{errors.location}</span>}
          </div>

          {/* Status (If editing, let manager select) */}
          <div style={styles.formGroup}>
            <label htmlFor="asset-status-select" style={styles.label}>Current Status</label>
            <select
              id="asset-status-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
              style={styles.select}
            >
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="disposed">Disposed / Decommissioned</option>
              <option value="booked">Booked</option>
              <option value="pending_transfer">Pending Transfer</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        </div>

        {/* Dynamic Fields Section */}
        {selectedCategorySchema && selectedCategorySchema.customFields && selectedCategorySchema.customFields.length > 0 && (
          <div style={styles.customFieldsSection}>
            <h4 style={styles.subHeading}>📋 Category Specific Attributes ({selectedCategorySchema.name})</h4>
            <div style={styles.formGrid}>
              {selectedCategorySchema.customFields.map((field) => (
                <div key={field.name} style={styles.formGroup}>
                  <label htmlFor={`custom-field-${field.name}`} style={styles.label}>{field.name}</label>
                  <input
                    id={`custom-field-${field.name}`}
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={formData.customFields[field.name] ?? ''}
                    onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                    style={styles.input}
                    placeholder={`Enter ${field.name}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flag Bookable / Shared */}
        <div style={styles.checkboxGroup}>
          <input
            id="bookable-flag"
            type="checkbox"
            checked={formData.isBookable}
            onChange={(e) => setFormData({ ...formData, isBookable: e.target.checked })}
            style={styles.checkbox}
          />
          <label htmlFor="bookable-flag" style={styles.checkboxLabel}>
            <strong>Shared Resource:</strong> Allow staff reservation bookings.
          </label>
        </div>

        {/* Photo Upload UI (Mocked size validation) */}
        <div style={styles.formGroup}>
          <label htmlFor="asset-photo-upload" style={styles.label}>Attach Asset Photo / Documents</label>
          <input
            id="asset-photo-upload"
            type="file"
            onChange={handleFileChange}
            style={styles.fileInput}
            accept=".png,.jpg,.jpeg,.pdf"
          />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Supported formats: PNG, JPEG, PDF. Max size: 5MB. (Client-side validation verified)
          </p>
          {uploadError && <span style={styles.errorMsg}>{uploadError}</span>}
          {formData.photoName && !uploadError && (
            <span style={styles.uploadSuccess}>
              ✔️ File selected: <strong>{formData.photoName}</strong>
            </span>
          )}
        </div>

        {/* Actions buttons */}
        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" style={styles.saveBtn}>
            Save Asset Details
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: 'var(--spacing-lg)',
    maxWidth: '720px',
    width: '100%',
    margin: '0 auto',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: 'var(--spacing-md)',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
  customFieldsSection: {
    borderTop: '1px dashed var(--border-color)',
    paddingTop: '16px',
  },
  subHeading: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  fileInput: {
    padding: '6px 0',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  uploadSuccess: {
    fontSize: '12px',
    color: 'var(--success)',
    marginTop: '4px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    marginTop: '12px',
  },
  cancelBtn: {
    padding: '10px 20px',
    fontSize: '13.5px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px',
    fontSize: '13.5px',
    background: 'var(--accent-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  },
  errorMsg: {
    fontSize: '11px',
    color: 'var(--danger)',
    marginTop: '2px',
  },
};
