import type { User, UserRole } from '../context/AuthContext';

// Standard email regex for UI-level validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthResponse {
  success: boolean;
  user: User | null;
  error?: string;
}

class AuthService {
  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 800));
  }

  /**
   * Mock login processor.
   * NOTE: Password input is checked for basic length. For security, passwords 
   * are never saved, printed, or exposed in logging parameters.
   */
  public async login(email: string, password: string, mockRole?: UserRole): Promise<AuthResponse> {
    await this.simulateDelay();

    console.log(`[AuthService] Attempting login verification for: ${email}`);

    if (!email || !EMAIL_REGEX.test(email)) {
      return { success: false, user: null, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, user: null, error: 'Password must be at least 6 characters long.' };
    }

    // Default mock role assignment if not overridden by dev selection
    const role: UserRole = mockRole || (email.includes('admin') ? 'admin' : 'employee');

    const user: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name: email.split('@')[0].toUpperCase().replace('.', ' '),
      email,
      role,
    };

    return { success: true, user };
  }

  /**
   * Mock signup processor.
   * NOTE: Forces UserRole to 'employee' exclusively to prevent self-elevation.
   */
  public async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    await this.simulateDelay();

    console.log(`[AuthService] Attempting signup registration for: ${email}`);

    if (!name || name.trim().length < 2) {
      return { success: false, user: null, error: 'Name must be at least 2 characters.' };
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return { success: false, user: null, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, user: null, error: 'Password must be at least 6 characters long.' };
    }

    // Force role to 'employee' for new user registrations
    const user: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      role: 'employee', 
    };

    return { success: true, user };
  }

  /**
   * Mock forgot password dispatcher.
   */
  public async forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    await this.simulateDelay();

    if (!email || !EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    console.log(`[AuthService] Dispatched password reset token link to: ${email}`);
    return { 
      success: true, 
      message: `A password reset link has been dispatched to ${email}. Please check your inbox.` 
    };
  }
}

export const authService = new AuthService();
