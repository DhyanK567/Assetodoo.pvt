import { assetService } from './assetService';

export interface AuditVerification {
  result: 'verified' | 'missing' | 'damaged';
  notes: string;
}

export interface AuditCycle {
  id: string;
  title: string;
  scopeDepartmentId: string; // 'all' or specific id
  scopeLocation: string; // 'all' or location string
  startDate: string;
  endDate: string;
  auditorIds: string[];
  status: 'active' | 'closed';
  verifications: Record<string, AuditVerification>;
  closedDate?: string;
}

const DEFAULT_AUDIT_CYCLES: AuditCycle[] = [
  {
    id: 'aud_1',
    title: 'Q2 IT Equipment Stocktake',
    scopeDepartmentId: 'dept_it',
    scopeLocation: 'all',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    auditorIds: ['usr_employee'],
    status: 'closed',
    closedDate: '2026-08-14',
    verifications: {
      ast_1: { result: 'verified', notes: 'Asset confirmed in laboratory workbench.' },
      ast_2: { result: 'verified', notes: 'Keys are working.' },
      ast_3: { result: 'damaged', notes: 'Backlight has slight flicker.' }
    }
  },
  {
    id: 'aud_2',
    title: 'Q3 Facility General Audit',
    scopeDepartmentId: 'all',
    scopeLocation: 'HQ Level 2',
    startDate: '2026-08-28',
    endDate: '2026-09-10',
    auditorIds: ['usr_manager'],
    status: 'active',
    verifications: {
      ast_3: { result: 'verified', notes: 'Backlight flickered but working.' }
    }
  }
];

class AuditService {
  private getStorageItem<T>(key: string, defaults: T[]): T[] {
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : this.setStorageItem(key, defaults);
    } catch {
      return this.setStorageItem(key, defaults);
    }
  }

  private setStorageItem<T>(key: string, value: T[]): T[] {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  public getCycles(): AuditCycle[] {
    return this.getStorageItem<AuditCycle>('MOCK_DB_AUDIT_CYCLES', DEFAULT_AUDIT_CYCLES);
  }

  public createCycle(
    title: string, 
    scopeDepartmentId: string, 
    scopeLocation: string, 
    startDate: string, 
    endDate: string, 
    auditorIds: string[]
  ): AuditCycle {
    const cycles = this.getCycles();
    const newCycle: AuditCycle = {
      id: `aud_${Math.random().toString(36).substring(2, 9)}`,
      title,
      scopeDepartmentId,
      scopeLocation,
      startDate,
      endDate,
      auditorIds,
      status: 'active',
      verifications: {}
    };

    cycles.unshift(newCycle);
    this.setStorageItem('MOCK_DB_AUDIT_CYCLES', cycles);
    return newCycle;
  }

  public verifyAsset(
    cycleId: string, 
    assetId: string, 
    result: AuditVerification['result'], 
    notes: string
  ): AuditCycle[] {
    const cycles = this.getCycles();
    const idx = cycles.findIndex(c => c.id === cycleId);
    if (idx === -1) return cycles;

    if (cycles[idx].status === 'closed') {
      alert('Action Blocked: Closed audit cycles are locked from further edits.');
      return cycles;
    }

    cycles[idx].verifications[assetId] = { result, notes };
    return this.setStorageItem('MOCK_DB_AUDIT_CYCLES', cycles);
  }

  public closeCycle(cycleId: string): AuditCycle[] {
    const cycles = this.getCycles();
    const idx = cycles.findIndex(c => c.id === cycleId);
    if (idx === -1) return cycles;

    const cycle = cycles[idx];
    if (cycle.status === 'closed') return cycles;

    cycle.status = 'closed';
    cycle.closedDate = new Date().toISOString().split('T')[0];

    // Align catalog asset statuses based on verifications discrepancies
    Object.entries(cycle.verifications).forEach(([assetId, veri]) => {
      if (veri.result === 'missing') {
        // Lost / missing flips to disposed status
        assetService.updateAssetStatus(assetId, 'disposed');
      } else if (veri.result === 'damaged') {
        // Damaged flips to maintenance status
        assetService.updateAssetStatus(assetId, 'maintenance');
      }
    });

    return this.setStorageItem('MOCK_DB_AUDIT_CYCLES', cycles);
  }
}

export const auditService = new AuditService();
