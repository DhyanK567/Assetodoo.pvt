import React from 'react';
import { assetService } from '../services/assetService';
import type { AuditCycle } from '../services/auditService';

interface DiscrepancyReportProps {
  cycle: AuditCycle;
}

export const DiscrepancyReport: React.FC<DiscrepancyReportProps> = ({ cycle }) => {
  const assets = assetService.getAssets();

  // Find all verifications that are either 'missing' or 'damaged'
  const discrepancyItems = Object.entries(cycle.verifications)
    .filter(([, veri]) => veri.result === 'missing' || veri.result === 'damaged')
    .map(([assetId, veri]) => {
      const asset = assets.find(a => a.id === assetId);
      return {
        assetId,
        tag: asset ? asset.tag : 'UNKNOWN',
        name: asset ? asset.name : 'Unknown Asset',
        expectedLocation: asset ? asset.location : 'Unknown Location',
        expectedStatus: asset ? asset.status : 'Unknown Status',
        result: veri.result,
        notes: veri.notes
      };
    });

  const totalDiscrepancies = discrepancyItems.length;

  return (
    <div style={styles.card} className="glass-panel">
      <div style={styles.header}>
        <h4 style={styles.titleText}>📊 Discrepancy Reconciliation Report</h4>
        <p style={styles.subtitleText}>Auto-compiled summaries of equipment discrepancies flagged in stocktake.</p>
      </div>

      {totalDiscrepancies > 0 ? (
        <div style={styles.content}>
          <div style={styles.alertBanner}>
            ⚠️ <strong>Reconciliation Action Required:</strong> {totalDiscrepancies} {totalDiscrepancies === 1 ? 'item has' : 'items have'} been flagged as Missing or Damaged. 
            {cycle.status === 'closed' 
              ? ' Closing this cycle has automatically updated their inventory records.'
              : ' Closing this cycle will re-align catalog statuses.'
            }
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Flagged Asset</th>
                  <th style={styles.th}>Expected Location</th>
                  <th style={styles.th}>Discrepancy</th>
                  <th style={styles.th}>Auditor Notes</th>
                </tr>
              </thead>
              <tbody>
                {discrepancyItems.map(item => (
                  <tr key={item.assetId} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{item.tag}</strong>
                      <div style={styles.subtext}>{item.name}</div>
                    </td>
                    <td style={styles.td}>{item.expectedLocation}</td>
                    <td style={styles.td}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: item.result === 'missing' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                        color: item.result === 'missing' ? 'var(--danger)' : 'var(--warning)',
                        border: `1px solid ${item.result === 'missing' ? 'var(--danger-border)' : 'var(--warning-border)'}`
                      }}>
                        {item.result.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {item.notes || 'No remarks provided.'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={styles.cleanBanner}>
          ✓ <strong>Reconciliation Clean:</strong> Zero discrepancy warnings flagged. All inspected assets match records.
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  header: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  titleText: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitleText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  alertBanner: {
    padding: '12px 14px',
    backgroundColor: 'var(--warning-bg)',
    color: 'var(--warning)',
    border: '1px solid var(--warning-border)',
    borderRadius: '4px',
    fontSize: '13px',
    lineHeight: 1.4,
  },
  cleanBanner: {
    padding: '14px',
    backgroundColor: 'var(--success-bg)',
    color: 'var(--success)',
    border: '1px solid var(--success-border)',
    borderRadius: '4px',
    fontSize: '13.5px',
    fontWeight: 600,
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    padding: '10px 14px',
    backgroundColor: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '12px 14px',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  subtext: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
};
