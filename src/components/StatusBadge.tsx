import React from 'react';
import type { AssetStatus } from '../services/assetService';

interface StatusBadgeProps {
  status: AssetStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (state: AssetStatus): React.CSSProperties => {
    switch (state) {
      case 'available':
        return {
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success)',
          border: '1px solid var(--success-border)',
        };
      case 'allocated':
        return {
          backgroundColor: 'var(--accent-primary-glow)',
          color: 'var(--accent-primary)',
          border: '1px solid var(--accent-primary)',
        };
      case 'maintenance':
        return {
          backgroundColor: 'var(--warning-bg)',
          color: 'var(--warning)',
          border: '1px solid var(--warning-border)',
        };
      case 'disposed':
        return {
          backgroundColor: 'rgba(74, 85, 104, 0.1)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)',
        };
      case 'booked':
        return {
          backgroundColor: 'rgba(107, 70, 193, 0.15)',
          color: '#b794f4',
          border: '1px solid rgba(107, 70, 193, 0.4)',
        };
      case 'pending_transfer':
        return {
          backgroundColor: 'rgba(214, 158, 46, 0.15)',
          color: '#ecc94b',
          border: '1px solid rgba(214, 158, 46, 0.4)',
        };
      case 'reserved':
        return {
          backgroundColor: 'rgba(49, 151, 149, 0.15)',
          color: '#81e6d9',
          border: '1px solid rgba(49, 151, 149, 0.4)',
        };
    }
  };

  const getLabel = (state: AssetStatus): string => {
    return state.replace('_', ' ').toUpperCase();
  };

  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: '9999px',
        display: 'inline-block',
        letterSpacing: '0.03em',
        textAlign: 'center',
        ...getBadgeStyle(status),
      }}
    >
      {getLabel(status)}
    </span>
  );
};
