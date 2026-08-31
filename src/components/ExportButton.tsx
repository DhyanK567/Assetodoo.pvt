import React from 'react';
import { assetService } from '../services/assetService';
import { orgService } from '../services/orgService';

export const ExportButton: React.FC = () => {
  const handleExportCSV = () => {
    const assets = assetService.getAssets();
    const categories = orgService.getCategories();
    
    // Header
    const headers = ['Asset Tag', 'Name', 'Category', 'Location', 'Status', 'Acquisition Date', 'Cost'];
    
    // Rows
    const rows = assets.map(asset => {
      const categoryName = categories.find(c => c.id === asset.categoryId)?.name || 'Unknown';
      return [
        `"${asset.tag}"`,
        `"${asset.name}"`,
        `"${categoryName}"`,
        `"${asset.location}"`,
        `"${asset.status.toUpperCase()}"`,
        `"${asset.acquisitionDate}"`,
        `"${asset.acquisitionCost}"`
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Asset_Catalog_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleExportCSV} style={styles.button}>
      📥 Export Catalog (CSV)
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  button: {
    padding: '8px 16px',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)',
  }
};
