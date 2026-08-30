import React, { useState } from 'react';
import { orgService, type Employee, type Department } from '../services/orgService';
import { assetService, type TransferRequest, type Asset } from '../services/assetService';
import { DataTable, type Column } from './DataTable';
import { useAuth } from '../context/AuthContext';

interface TransferApprovalQueueProps {
  requests: TransferRequest[];
  onRefresh: () => void;
}

export const TransferApprovalQueue: React.FC<TransferApprovalQueueProps> = ({
  requests,
  onRefresh,
}) => {
  const { currentRole } = useAuth();
  const [assets] = useState<Asset[]>(() => assetService.getAssets());
  const [employees] = useState<Employee[]>(() => orgService.getEmployees());
  const [departments] = useState<Department[]>(() => orgService.getDepartments());

  const getAssetDetails = (assetId: string) => {
    const ast = assets.find(a => a.id === assetId);
    return ast ? `${ast.tag} - ${ast.name}` : assetId;
  };

  const getEmployeeName = (empId: string) => {
    if (empId === 'none') return '-';
    return employees.find(e => e.id === empId)?.name || empId;
  };

  const getTargetRecipientName = (row: TransferRequest) => {
    if (row.targetEmployeeId !== 'none') {
      return `👥 ${getEmployeeName(row.targetEmployeeId)}`;
    }
    if (row.targetDepartmentId !== 'none') {
      const dept = departments.find(d => d.id === row.targetDepartmentId);
      return `🏢 ${dept ? dept.name : row.targetDepartmentId}`;
    }
    return '-';
  };

  const handleAction = (requestId: string, status: 'approved' | 'rejected') => {
    assetService.handleTransferRequest(requestId, status);
    alert(`Transfer request ${status.toUpperCase()} successfully.`);
    onRefresh();
  };

  const columns: Column<TransferRequest>[] = [
    { 
      key: 'assetId', 
      label: 'Asset', 
      sortable: true,
      render: (val) => getAssetDetails(val)
    },
    { 
      key: 'requestorId', 
      label: 'Requestor', 
      sortable: true,
      render: (val) => getEmployeeName(val)
    },
    { 
      key: 'targetAssignee', 
      label: 'Target Assignee', 
      sortable: false,
      render: (_, row) => getTargetRecipientName(row)
    },
    { key: 'requestDate', label: 'Request Date', sortable: true },
    { key: 'reason', label: 'Reason for Transfer', sortable: false },
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
          backgroundColor: val === 'approved' ? 'var(--success-bg)' : val === 'pending' ? 'var(--warning-bg)' : 'var(--danger-bg)',
          color: val === 'approved' ? 'var(--success)' : val === 'pending' ? 'var(--warning)' : 'var(--danger)',
          border: `1px solid ${val === 'approved' ? 'var(--success-border)' : val === 'pending' ? 'var(--warning-border)' : 'var(--danger-border)'}`
        }}>
          {val.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => {
        if (row.status !== 'pending') return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Completed</span>;

        // Managers, Admins, and Dept Heads have approval rights
        const hasApprovalRights = ['admin', 'asset_manager', 'dept_head'].includes(currentRole);
        if (!hasApprovalRights) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Pending Approval</span>;

        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => handleAction(row.id, 'approved')} 
              style={styles.approveBtn}
            >
              Approve
            </button>
            <button 
              onClick={() => handleAction(row.id, 'rejected')} 
              style={styles.rejectBtn}
            >
              Reject
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.titleText}>Pending Transfer Queue</h3>
        <p style={styles.subtitleText}>Review and approve inventory reassignment requests across departments.</p>
      </div>

      <DataTable columns={columns} data={requests} pageSize={5} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  header: {
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
  approveBtn: {
    padding: '4px 8px',
    fontSize: '11.5px',
    fontWeight: 700,
    borderRadius: '4px',
    backgroundColor: 'var(--success-bg)',
    color: 'var(--success)',
    border: '1px solid var(--success-border)',
    cursor: 'pointer',
  },
  rejectBtn: {
    padding: '4px 8px',
    fontSize: '11.5px',
    fontWeight: 700,
    borderRadius: '4px',
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid var(--danger-border)',
    cursor: 'pointer',
  },
};
