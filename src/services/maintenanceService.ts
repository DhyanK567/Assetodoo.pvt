import { assetService } from './assetService';

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  photoUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'technician_assigned' | 'in_progress' | 'resolved';
  technicianName?: string;
  requestorId: string;
  requestDate: string;
  notes?: string;
  cost?: number;
}

const DEFAULT_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'mreq_1',
    assetId: 'ast_2', // Keysight Multimeter
    description: 'Numeric keypad keys stick and fail to register on keypress.',
    priority: 'low',
    status: 'pending',
    requestorId: 'usr_employee',
    requestDate: '2026-08-30'
  },
  {
    id: 'mreq_2',
    assetId: 'ast_3', // Keysight Oscilloscope
    description: 'Display backlight flickering intermittently on startup.',
    priority: 'high',
    status: 'technician_assigned',
    technicianName: 'Bob Technician',
    requestorId: 'usr_dept_head',
    requestDate: '2026-08-29'
  },
  {
    id: 'mreq_3',
    assetId: 'ast_4', // Projector
    description: 'Bulb expired and power board failing safety checks.',
    priority: 'critical',
    status: 'resolved',
    technicianName: 'Charlie Tech-Solutions',
    requestorId: 'usr_manager',
    requestDate: '2026-08-28',
    notes: 'Replaced bulb assembly and capacitor block. Safety check passed.',
    cost: 250
  }
];

class MaintenanceService {
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

  public getRequests(): MaintenanceRequest[] {
    return this.getStorageItem<MaintenanceRequest>('MOCK_DB_MAINT_REQUESTS', DEFAULT_REQUESTS);
  }

  public createRequest(
    assetId: string, 
    description: string, 
    priority: MaintenanceRequest['priority'], 
    photoUrl: string | undefined, 
    requestorId: string
  ): MaintenanceRequest {
    const requests = this.getRequests();
    const newRequest: MaintenanceRequest = {
      id: `mreq_${Math.random().toString(36).substring(2, 9)}`,
      assetId,
      description,
      priority,
      photoUrl,
      status: 'pending',
      requestorId,
      requestDate: '2026-08-30'
    };

    requests.unshift(newRequest);
    this.setStorageItem('MOCK_DB_MAINT_REQUESTS', requests);
    return newRequest;
  }

  public updateRequestStatus(
    requestId: string, 
    status: MaintenanceRequest['status'], 
    technicianName?: string, 
    notes?: string, 
    cost?: number
  ): MaintenanceRequest[] {
    const requests = this.getRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) return requests;

    const request = requests[idx];
    const prevStatus = request.status;
    request.status = status;

    if (technicianName !== undefined) request.technicianName = technicianName;
    if (notes !== undefined) request.notes = notes;
    if (cost !== undefined) request.cost = cost;

    // Flip main asset status based on state transitions
    if (status === 'approved' && prevStatus === 'pending') {
      assetService.updateAssetStatus(request.assetId, 'maintenance');
    }

    if (status === 'resolved') {
      assetService.updateAssetStatus(request.assetId, 'available');
      // Create historical log entry
      assetService.addMaintenanceLog({
        assetId: request.assetId,
        type: 'repair',
        cost: cost || 0,
        date: '2026-08-30',
        status: 'completed',
        notes: notes || 'Repair ticket resolved.'
      });
    }

    this.setStorageItem('MOCK_DB_MAINT_REQUESTS', requests);
    return requests;
  }
}

export const maintenanceService = new MaintenanceService();
