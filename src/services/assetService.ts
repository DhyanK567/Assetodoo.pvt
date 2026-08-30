export type AssetStatus = 
  | 'available' 
  | 'allocated' 
  | 'maintenance' 
  | 'disposed' 
  | 'booked' 
  | 'pending_transfer' 
  | 'reserved';

export type AssetCondition = 'new' | 'good' | 'fair' | 'poor';

export interface Asset {
  id: string;
  tag: string;
  name: string;
  categoryId: string;
  serialNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: AssetCondition;
  location: string;
  isBookable: boolean;
  status: AssetStatus;
  customFields: Record<string, any>;
  photoName: string | null;
}

export interface AssetAllocationLog {
  id: string;
  assetId: string;
  employeeId: string;
  action: 'allocated' | 'returned' | 'transferred';
  date: string;
  notes: string;
}

export interface AssetMaintenanceLog {
  id: string;
  assetId: string;
  type: 'repair' | 'preventive' | 'calibration';
  cost: number;
  date: string;
  status: 'scheduled' | 'completed' | 'failed';
  notes: string;
}

export interface AssetAllocation {
  id: string;
  assetId: string;
  employeeId: string; // 'none' if department level
  departmentId: string; // 'none' if employee level
  allocatedDate: string;
  expectedReturnDate: string | null;
  status: 'active' | 'returned';
  notes: string;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  requestorId: string; // Employee ID initiating
  targetEmployeeId: string; // or 'none'
  targetDepartmentId: string; // or 'none'
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reason: string;
}

const DEFAULT_ASSETS: Asset[] = [
  {
    id: 'ast_1',
    tag: 'AST-00001',
    name: 'MacBook Pro 16" M3 Max',
    categoryId: 'cat_it',
    serialNumber: 'C02F12X0Q05D',
    acquisitionDate: '2026-01-15',
    acquisitionCost: 3499,
    condition: 'new',
    location: 'IT Storage Row B',
    isBookable: false,
    status: 'allocated',
    customFields: {
      'RAM (GB)': '64',
      'Processor': 'M3 Max 16-Core',
      'Storage capacity': '1 TB SSD'
    },
    photoName: 'macbook_pro.jpg'
  },
  {
    id: 'ast_2',
    tag: 'AST-00002',
    name: 'Steelcase Gesture Ergonomic Chair',
    categoryId: 'cat_furn',
    serialNumber: 'SC-8812039-A',
    acquisitionDate: '2026-03-10',
    acquisitionCost: 1250,
    condition: 'good',
    location: 'Design Studio Office A',
    isBookable: false,
    status: 'available',
    customFields: {
      'Material': 'Polyester Blend Fabric',
      'Color': 'Graphite Black'
    },
    photoName: null
  },
  {
    id: 'ast_3',
    tag: 'AST-00003',
    name: 'Keysight InfiniiVision Oscilloscope',
    categoryId: 'cat_lab',
    serialNumber: 'MY59201928',
    acquisitionDate: '2025-11-20',
    acquisitionCost: 5200,
    condition: 'fair',
    location: 'HW Engineering Lab 2',
    isBookable: true,
    status: 'maintenance',
    customFields: {
      'Calibration Date': '2026-02-14',
      'Model Number': 'DSOX3024T'
    },
    photoName: 'oscilloscope.jpg'
  },
  {
    id: 'ast_4',
    tag: 'AST-00004',
    name: 'Conference Room Projector 4K',
    categoryId: 'cat_it',
    serialNumber: 'PJ-4K-9922',
    acquisitionDate: '2026-04-01',
    acquisitionCost: 1800,
    condition: 'good',
    location: 'Boardroom 402',
    isBookable: true,
    status: 'allocated',
    customFields: {
      'RAM (GB)': 'N/A',
      'Processor': 'Android OS Embedded',
      'Storage capacity': '16 GB Flash'
    },
    photoName: null
  }
];

const DEFAULT_ALLOCATION_LOGS: AssetAllocationLog[] = [
  {
    id: 'alloc_1',
    assetId: 'ast_1',
    employeeId: 'usr_employee',
    action: 'allocated',
    date: '2026-01-15',
    notes: 'Initial assignment upon onboarding of worker.'
  },
  {
    id: 'alloc_2',
    assetId: 'ast_4',
    employeeId: 'usr_dept_head',
    action: 'allocated',
    date: '2026-08-01',
    notes: 'Checked out for Q3 board compliance meeting review.'
  }
];

const DEFAULT_MAINTENANCE_LOGS: AssetMaintenanceLog[] = [
  {
    id: 'maint_1',
    assetId: 'ast_3',
    type: 'calibration',
    cost: 350,
    date: '2026-02-14',
    status: 'completed',
    notes: 'Annual calibration inspection certificate verified.'
  },
  {
    id: 'maint_2',
    assetId: 'ast_3',
    type: 'repair',
    cost: 120,
    date: '2026-08-25',
    status: 'scheduled',
    notes: 'Screen flicker diagnostic repair in progress.'
  }
];

const DEFAULT_ALLOCATIONS: AssetAllocation[] = [
  {
    id: 'active_alloc_1',
    assetId: 'ast_1',
    employeeId: 'usr_employee',
    departmentId: 'none',
    allocatedDate: '2026-01-15',
    expectedReturnDate: '2026-09-30', // In future
    status: 'active',
    notes: 'Onboarding workstation setup.'
  },
  {
    id: 'active_alloc_2',
    assetId: 'ast_4',
    employeeId: 'usr_dept_head',
    departmentId: 'none',
    allocatedDate: '2026-08-01',
    expectedReturnDate: '2026-08-20', // OVERDUE (relative to current date 2026-08-30)
    status: 'active',
    notes: 'Boardroom projection alignment testing.'
  }
];

const DEFAULT_TRANSFER_REQUESTS: TransferRequest[] = [
  {
    id: 'trans_req_1',
    assetId: 'ast_1',
    requestorId: 'usr_admin',
    targetEmployeeId: 'usr_manager',
    targetDepartmentId: 'none',
    status: 'pending',
    requestDate: '2026-08-28',
    reason: 'Asset manager needs MacBook to verify graphics hardware acceleration tests.'
  }
];

class AssetService {
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

  public getAssets(): Asset[] {
    return this.getStorageItem<Asset>('MOCK_DB_ASSETS', DEFAULT_ASSETS);
  }

  public getAssetById(id: string): Asset | undefined {
    return this.getAssets().find(a => a.id === id);
  }

  public getNextAssetTag(): string {
    const assets = this.getAssets();
    const tags = assets.map(a => {
      const match = a.tag.match(/AST-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxVal = tags.length > 0 ? Math.max(...tags) : 0;
    const nextVal = maxVal + 1;
    return `AST-${String(nextVal).padStart(5, '0')}`;
  }

  public saveAsset(asset: Asset): Asset[] {
    const list = this.getAssets();
    const index = list.findIndex(a => a.id === asset.id);
    if (index > -1) {
      list[index] = asset;
    } else {
      list.push(asset);
    }
    return this.setStorageItem('MOCK_DB_ASSETS', list);
  }

  public updateAssetStatus(assetId: string, status: AssetStatus): void {
    const assets = this.getAssets();
    const idx = assets.findIndex(a => a.id === assetId);
    if (idx > -1) {
      assets[idx].status = status;
      this.saveAsset(assets[idx]);
    }
  }

  public deleteAsset(id: string): Asset[] {
    const list = this.getAssets().filter(a => a.id !== id);
    return this.setStorageItem('MOCK_DB_ASSETS', list);
  }

  // --- Allocation History Logs ---
  public getAllocationLogs(assetId?: string): AssetAllocationLog[] {
    const logs = this.getStorageItem<AssetAllocationLog>('MOCK_DB_ALLOC_LOGS', DEFAULT_ALLOCATION_LOGS);
    if (assetId) {
      return logs.filter(l => l.assetId === assetId);
    }
    return logs;
  }

  public addAllocationLog(log: Omit<AssetAllocationLog, 'id'>): AssetAllocationLog[] {
    const logs = this.getAllocationLogs();
    const newLog = {
      ...log,
      id: `alloc_${Math.random().toString(36).substring(2, 9)}`
    };
    logs.push(newLog);
    return this.setStorageItem('MOCK_DB_ALLOC_LOGS', logs);
  }

  // --- Maintenance History ---
  public getMaintenanceLogs(assetId?: string): AssetMaintenanceLog[] {
    const logs = this.getStorageItem<AssetMaintenanceLog>('MOCK_DB_MAINT_LOGS', DEFAULT_MAINTENANCE_LOGS);
    if (assetId) {
      return logs.filter(l => l.assetId === assetId);
    }
    return logs;
  }

  public addMaintenanceLog(log: Omit<AssetMaintenanceLog, 'id'>): AssetMaintenanceLog[] {
    const logs = this.getMaintenanceLogs();
    const newLog = {
      ...log,
      id: `maint_${Math.random().toString(36).substring(2, 9)}`
    };
    logs.push(newLog);
    return this.setStorageItem('MOCK_DB_MAINT_LOGS', logs);
  }

  // --- Phase 7 Allocation Allocations State ---
  public getAllocations(): AssetAllocation[] {
    return this.getStorageItem<AssetAllocation>('MOCK_DB_ALLOCATIONS', DEFAULT_ALLOCATIONS);
  }

  public getActiveAllocationForAsset(assetId: string): AssetAllocation | undefined {
    return this.getAllocations().find(a => a.assetId === assetId && a.status === 'active');
  }

  public createAllocation(
    assetId: string, 
    employeeId: string, 
    departmentId: string, 
    expectedReturnDate: string | null, 
    notes: string
  ): AssetAllocation[] {
    const allocations = this.getAllocations();
    
    // De-activate any pre-existing active allocation just in case
    const list = allocations.map(a => {
      if (a.assetId === assetId && a.status === 'active') {
        return { ...a, status: 'returned' as const };
      }
      return a;
    });

    const newAlloc: AssetAllocation = {
      id: `alloc_active_${Math.random().toString(36).substring(2, 9)}`,
      assetId,
      employeeId,
      departmentId,
      allocatedDate: new Date().toISOString().split('T')[0],
      expectedReturnDate,
      status: 'active',
      notes
    };

    list.push(newAlloc);
    this.setStorageItem('MOCK_DB_ALLOCATIONS', list);

    // Update asset lifecycle status
    const assets = this.getAssets();
    const assetIdx = assets.findIndex(a => a.id === assetId);
    if (assetIdx > -1) {
      assets[assetIdx].status = 'allocated';
      this.saveAsset(assets[assetIdx]);
    }

    // Add entry to history logs
    this.addAllocationLog({
      assetId,
      employeeId: employeeId !== 'none' ? employeeId : 'department_level',
      action: 'allocated',
      date: new Date().toISOString().split('T')[0],
      notes: `Allocated to ${employeeId !== 'none' ? 'Employee ' + employeeId : 'Department ' + departmentId}. Notes: ${notes}`
    });

    return list;
  }

  public returnAsset(assetId: string, returnCondition: AssetCondition, notes: string): void {
    const allocations = this.getAllocations();
    const list = allocations.map(a => {
      if (a.assetId === assetId && a.status === 'active') {
        return { ...a, status: 'returned' as const };
      }
      return a;
    });
    this.setStorageItem('MOCK_DB_ALLOCATIONS', list);

    // Update Asset Catalog
    const assets = this.getAssets();
    const assetIdx = assets.findIndex(a => a.id === assetId);
    if (assetIdx > -1) {
      assets[assetIdx].status = 'available';
      assets[assetIdx].condition = returnCondition;
      this.saveAsset(assets[assetIdx]);
    }

    // Log returns checkout history
    this.addAllocationLog({
      assetId,
      employeeId: 'none',
      action: 'returned',
      date: new Date().toISOString().split('T')[0],
      notes: `Asset returned. Inspected condition: ${returnCondition.toUpperCase()}. Notes: ${notes}`
    });
  }

  // --- Phase 7 Transfer Requests Queue ---
  public getTransferRequests(): TransferRequest[] {
    return this.getStorageItem<TransferRequest>('MOCK_DB_TRANSFER_REQUESTS', DEFAULT_TRANSFER_REQUESTS);
  }

  public createTransferRequest(
    assetId: string,
    targetEmployeeId: string,
    targetDepartmentId: string,
    reason: string,
    requestorId: string
  ): TransferRequest[] {
    const requests = this.getTransferRequests();
    const newReq: TransferRequest = {
      id: `trans_req_${Math.random().toString(36).substring(2, 9)}`,
      assetId,
      requestorId,
      targetEmployeeId,
      targetDepartmentId,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      reason
    };
    requests.push(newReq);
    
    // Update asset status to show pending_transfer
    const assets = this.getAssets();
    const assetIdx = assets.findIndex(a => a.id === assetId);
    if (assetIdx > -1) {
      assets[assetIdx].status = 'pending_transfer';
      this.saveAsset(assets[assetIdx]);
    }

    return this.setStorageItem('MOCK_DB_TRANSFER_REQUESTS', requests);
  }

  public handleTransferRequest(requestId: string, status: 'approved' | 'rejected'): TransferRequest[] {
    const requests = this.getTransferRequests();
    const reqIdx = requests.findIndex(r => r.id === requestId);
    
    if (reqIdx > -1) {
      requests[reqIdx].status = status;
      const assetId = requests[reqIdx].assetId;
      
      if (status === 'approved') {
        // Perform allocation change
        this.createAllocation(
          assetId,
          requests[reqIdx].targetEmployeeId,
          requests[reqIdx].targetDepartmentId,
          null, // Clear return date on transfer
          `Approved transfer request reason: ${requests[reqIdx].reason}`
        );

        // Append checkout log
        this.addAllocationLog({
          assetId,
          employeeId: requests[reqIdx].targetEmployeeId,
          action: 'transferred',
          date: new Date().toISOString().split('T')[0],
          notes: `Transfer approved. Reason: ${requests[reqIdx].reason}`
        });
      } else {
        // Reset asset status back to allocated
        const assets = this.getAssets();
        const assetIdx = assets.findIndex(a => a.id === assetId);
        if (assetIdx > -1) {
          assets[assetIdx].status = 'allocated';
          this.saveAsset(assets[assetIdx]);
        }
      }
    }

    return this.setStorageItem('MOCK_DB_TRANSFER_REQUESTS', requests);
  }
}

export const assetService = new AssetService();
