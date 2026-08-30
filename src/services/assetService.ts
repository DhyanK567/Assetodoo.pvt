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
    status: 'booked',
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
    date: '2026-08-10',
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

  public deleteAsset(id: string): Asset[] {
    const list = this.getAssets().filter(a => a.id !== id);
    return this.setStorageItem('MOCK_DB_ASSETS', list);
  }

  // --- Allocation History ---
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
}

export const assetService = new AssetService();
