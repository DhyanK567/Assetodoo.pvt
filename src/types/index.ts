export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

export interface ApiConfig {
  baseUrl: string;
  useMock: boolean;
  timeoutMs: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
