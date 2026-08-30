import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetService } from '../services/assetService';
import { maintenanceService, type MaintenanceRequest } from '../services/maintenanceService';
import { MaintenanceStatusTracker } from './MaintenanceStatusTracker';

interface MaintenanceQueueProps {
  requests: MaintenanceRequest[];
  onRefresh: () => void;
}

export const MaintenanceQueue: React.FC<MaintenanceQueueProps> = ({
  requests,
  onRefresh,
}) => {
  const { currentRole } = useAuth();
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Manager privileges checker
  const isManager = ['admin', 'asset_manager'].includes(currentRole);

  const getAssetDetails = (assetId: string) => {
    const asset = assetService.getAssetById(assetId);
    return asset ? `${asset.tag} - ${asset.name}` : assetId;
  };

  const handleApprove = (id: string) => {
    maintenanceService.updateRequestStatus(id, 'approved');
    alert('Ticket approved. Asset status flipped to Under Maintenance.');
    onRefresh();
  };

  const handleReject = (id: string) => {
    maintenanceService.updateRequestStatus(id, 'rejected');
    alert('Ticket rejected.');
    onRefresh();
  };

  const handleAssignTech = (id: string) => {
    const tech = prompt('Enter technician name to assign:');
    if (!tech || tech.trim().length === 0) return;
    maintenanceService.updateRequestStatus(id, 'technician_assigned', tech.trim());
    alert(`Technician "${tech}" assigned successfully.`);
    onRefresh();
  };

  const handleStartRepair = (id: string) => {
    maintenanceService.updateRequestStatus(id, 'in_progress');
    alert('Work started. Ticket set to In Progress.');
    onRefresh();
  };

  const handleResolve = (id: string) => {
    const notes = prompt('Enter resolution remarks:');
    if (notes === null) return;
    const costStr = prompt('Enter repair cost ($):', '0');
    if (costStr === null) return;
    const cost = parseFloat(costStr) || 0;

    maintenanceService.updateRequestStatus(id, 'resolved', undefined, notes || 'Resolved.', cost);
    alert('Ticket marked Resolved. Asset status reverted to Available.');
    onRefresh();
  };

  const toggleExpand = (id: string) => {
    setExpandedRequestId(prev => (prev === id ? null : id));
  };

  const getPriorityColor = (prio: MaintenanceRequest['priority']) => {
    switch (prio) {
      case 'low': return 'var(--text-muted)';
      case 'medium': return 'var(--accent-primary)';
      case 'high': return 'var(--warning)';
      case 'critical': return 'var(--danger)';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.gridHeader}>
        <h3 style={styles.titleText}>🛠️ Service Request Queue</h3>
        <p style={styles.subtitleText}>Click a ticket row to inspect state timelines and transition parameters.</p>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Asset ID</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Request Date</th>
              <th style={styles.th}>Actions / Ops</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              const isExpanded = expandedRequestId === req.id;
              return (
                <React.Fragment key={req.id}>
                  {/* Primary Data Row */}
                  <tr 
                    onClick={() => toggleExpand(req.id)}
                    style={{ 
                      ...styles.tr, 
                      backgroundColor: isExpanded ? 'var(--bg-secondary)' : 'transparent' 
                    }}
                  >
                    <td style={styles.td}>
                      <strong>{getAssetDetails(req.assetId)}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '11px',
                        color: getPriorityColor(req.priority)
                      }}>
                        ● {req.priority.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ 
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: req.status === 'resolved' ? 'var(--success-bg)' : req.status === 'rejected' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                        color: req.status === 'resolved' ? 'var(--success)' : req.status === 'rejected' ? 'var(--danger)' : 'var(--warning)',
                        border: `1px solid ${req.status === 'resolved' ? 'var(--success-border)' : req.status === 'rejected' ? 'var(--danger-border)' : 'var(--warning-border)'}`
                      }}>
                        {req.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>{req.requestDate}</td>
                    
                    {/* Gated Action Operators */}
                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      {!isManager ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Read-only</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {req.status === 'pending' && (
                            <>
                              <button onClick={() => handleApprove(req.id)} style={styles.actionApprove}>Approve</button>
                              <button onClick={() => handleReject(req.id)} style={styles.actionReject}>Reject</button>
                            </>
                          )}
                          {req.status === 'approved' && (
                            <button onClick={() => handleAssignTech(req.id)} style={styles.actionAssign}>Assign Tech</button>
                          )}
                          {req.status === 'technician_assigned' && (
                            <button onClick={() => handleStartRepair(req.id)} style={styles.actionStart}>Start Work</button>
                          )}
                          {req.status === 'in_progress' && (
                            <button onClick={() => handleResolve(req.id)} style={styles.actionResolve}>Mark Resolved</button>
                          )}
                          {(req.status === 'resolved' || req.status === 'rejected') && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Finished</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Detail Timeline Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={5} style={styles.expandedTd}>
                        <div style={styles.expandBox} className="glass-panel">
                          <div style={styles.expandHeader}>
                            <strong>Ticket Details</strong>
                          </div>
                          
                          <div style={styles.detailText}>
                            <strong>Description:</strong> {req.description}
                          </div>

                          {req.technicianName && (
                            <div style={styles.detailText}>
                              👨‍🔧 <strong>Assigned Tech:</strong> {req.technicianName}
                            </div>
                          )}

                          {req.notes && (
                            <div style={styles.detailText}>
                              📝 <strong>Resolution notes:</strong> {req.notes}
                            </div>
                          )}

                          {req.cost !== undefined && (
                            <div style={styles.detailText}>
                              💰 <strong>Repair Cost:</strong> ${req.cost}
                            </div>
                          )}

                          {req.photoUrl && (
                            <div style={styles.detailText}>
                              🖼️ <strong>Attached file:</strong> <a href="#" onClick={(e) => { e.preventDefault(); alert('Photo rendering mock preview active.'); }} style={{ color: 'var(--accent-primary)' }}>{req.photoUrl}</a>
                            </div>
                          )}

                          {/* Progress Tracker Status Line */}
                          <div style={{ marginTop: '8px' }}>
                            <MaintenanceStatusTracker status={req.status} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {requests.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...styles.td, textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No active maintenance tickets matching the search parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  gridHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
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
    fontSize: '13.5px',
  },
  th: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast)',
  },
  td: {
    padding: '14px 16px',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  expandedTd: {
    padding: '8px 16px 16px 16px',
    backgroundColor: 'rgba(9, 13, 22, 0.2)',
  },
  expandBox: {
    padding: '16px',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  expandHeader: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '4px',
    marginBottom: '4px',
  },
  detailText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: 1.4,
  },
  actionApprove: {
    padding: '4px 8px',
    fontSize: '11.5px',
    fontWeight: 700,
    borderRadius: '4px',
    backgroundColor: 'var(--success-bg)',
    color: 'var(--success)',
    border: '1px solid var(--success-border)',
    cursor: 'pointer',
  },
  actionReject: {
    padding: '4px 8px',
    fontSize: '11.5px',
    fontWeight: 700,
    borderRadius: '4px',
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid var(--danger-border)',
    cursor: 'pointer',
  },
  actionAssign: {
    padding: '4px 8px',
    fontSize: '11.5px',
    fontWeight: 700,
    borderRadius: '4px',
    backgroundColor: 'var(--accent-primary-glow)',
    color: 'var(--accent-primary)',
    border: '1px solid var(--accent-primary)',
    cursor: 'pointer',
  },
  actionStart: {
    padding: '4px 8px',
    fontSize: '11.5px',
    fontWeight: 700,
    borderRadius: '4px',
    backgroundColor: 'rgba(237, 137, 54, 0.15)',
    color: '#ed8936',
    border: '1px solid rgba(237, 137, 54, 0.4)',
    cursor: 'pointer',
  },
  actionResolve: {
    padding: '4px 8px',
    fontSize: '11.5px',
    fontWeight: 700,
    borderRadius: '4px',
    backgroundColor: 'var(--success-bg)',
    color: 'var(--success)',
    border: '1px solid var(--success-border)',
    cursor: 'pointer',
  },
};

// Add row hover overrides
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    tr[style*="cursor: pointer"]:hover {
      background-color: var(--bg-tertiary) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}
