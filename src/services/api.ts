import type { ApiResponse, User } from '../types';

// Read values from Vite environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';
const DEFAULT_USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

class ApiService {
  private baseUrl: string;
  private useMock: boolean;

  constructor() {
    this.baseUrl = BASE_URL;
    // Allow dynamic overrides in session storage for testing purposes
    const dynamicMockOverride = sessionStorage.getItem('VITE_USE_MOCK_API');
    this.useMock = dynamicMockOverride !== null ? dynamicMockOverride === 'true' : DEFAULT_USE_MOCK;
    
    console.log(`[ApiService] Initialized. Base URL: ${this.baseUrl}. Mode: ${this.useMock ? 'MOCK' : 'REAL'}`);
  }

  // Toggles mock mode and reloads window or sets state
  public toggleMockMode(enable: boolean): void {
    this.useMock = enable;
    sessionStorage.setItem('VITE_USE_MOCK_API', String(enable));
    console.log(`[ApiService] Mock mode toggled to: ${enable ? 'ENABLED' : 'DISABLED'}`);
  }

  public isMockEnabled(): boolean {
    return this.useMock;
  }

  // Helper method to simulate network delay
  private async delay(ms = 600): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Generic request handler
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (this.useMock) {
      await this.delay();
      return this.handleMockRequest<T>(endpoint, options);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
        message: 'Success',
      };
    } catch (error) {
      console.error(`[ApiService] Request failed on ${endpoint}:`, error);
      throw error;
    }
  }

  // Handlers for mocked responses
  private handleMockRequest<T>(endpoint: string, _options: RequestInit): ApiResponse<T> {
    console.log(`[ApiService] Mock response served for: ${endpoint}`);
    
    if (endpoint.startsWith('/user/me')) {
      const mockUser: User = {
        id: 'usr_mock_123',
        name: 'Alex Developer',
        email: 'alex.dev@odoo.pvt',
        role: 'admin',
      };
      return {
        data: mockUser as unknown as T,
        status: 200,
        message: 'Mocked response successfully fetched.',
      };
    }

    if (endpoint.startsWith('/status')) {
      return {
        data: { status: 'healthy', api: 'mocked', version: '1.0.0-scaffold' } as unknown as T,
        status: 200,
        message: 'System is healthy (Mock).',
      };
    }

    throw new Error(`[ApiService Mock Error] Endpoint "${endpoint}" is not mocked.`);
  }

  // API Methods
  public async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/user/me');
  }

  public async getSystemStatus(): Promise<ApiResponse<{ status: string; api: string; version: string }>> {
    return this.request<{ status: string; api: string; version: string }>('/status');
  }
}

export const api = new ApiService();
