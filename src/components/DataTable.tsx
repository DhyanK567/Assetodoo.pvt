import React, { useState } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({ 
  columns, 
  data, 
  pageSize = 5,
  emptyMessage = 'No matching records found.'
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle Sort Toggle
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to page 1 on sort
  };

  // Sort Data
  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      const compare = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base'
      });

      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [data, sortKey, sortDirection]);

  // Paginate Data
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            {columns.map((col) => (
              <th 
                key={col.key} 
                onClick={() => col.sortable !== false && handleSort(col.key)}
                style={{ 
                  ...styles.headerCell, 
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                <div style={styles.headerCellContent}>
                  <span>{col.label}</span>
                  {col.sortable !== false && sortKey === col.key && (
                    <span style={styles.sortIndicator}>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={styles.emptyCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                style={{ 
                  ...styles.bodyRow,
                  backgroundColor: rowIndex % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)'
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={styles.bodyCell}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination controls footer */}
      {data.length > pageSize && (
        <div style={styles.paginationFooter}>
          <span style={styles.recordsCount}>
            Showing <strong>{Math.min(data.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong>{Math.min(data.length, currentPage * pageSize)}</strong> of{' '}
            <strong>{data.length}</strong> entries
          </span>
          
          <div style={styles.pageButtons}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                ...styles.pageBtn,
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={styles.pageIndicator}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                ...styles.pageBtn,
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    boxShadow: 'var(--shadow-sm)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    textAlign: 'left',
  },
  headerRow: {
    borderBottom: '2px solid var(--border-color)',
    background: 'var(--bg-tertiary)',
  },
  headerCell: {
    padding: '12px 16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  headerCellContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  sortIndicator: {
    fontSize: '9px',
    color: 'var(--accent-primary)',
  },
  bodyRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background var(--transition-fast)',
  },
  bodyCell: {
    padding: '12px 16px',
    color: 'var(--text-secondary)',
    verticalAlign: 'middle',
  },
  emptyCell: {
    padding: '32px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  paginationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: 'var(--bg-tertiary)',
  },
  recordsCount: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  pageButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pageBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    transition: 'all var(--transition-fast)',
  },
  pageIndicator: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
};
