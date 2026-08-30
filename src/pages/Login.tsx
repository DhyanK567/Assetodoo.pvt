import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { authService } from '../services/authService';
import './Auth.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  // Form fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const fromPath = location.state?.from?.pathname || '/';

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.user) {
        loginUser(response.user);
        navigate(fromPath, { replace: true });
      } else {
        setFormError(response.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setFormError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Login bypass helper for developer validation
  const handleQuickLogin = async (role: UserRole) => {
    setLoading(true);
    setFormError(null);
    setValidationErrors({});

    const dummyEmail = `${role}@odoo.pvt`;
    const dummyPassword = 'password123';
    
    try {
      const response = await authService.login(dummyEmail, dummyPassword, role);
      if (response.success && response.user) {
        loginUser(response.user);
        navigate(fromPath, { replace: true });
      }
    } catch {
      setFormError('Failed to execute quick login bypass.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <header className="auth-header">
          <div className="auth-logo">
            <span className="gradient-text">Odoo</span>
            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Security</span>
          </div>
          <p className="auth-subtitle">Sign in to manage organizational assets</p>
        </header>

        {/* Security Alert Header */}
        <div className="auth-warning-banner">
          🔒 <strong>Security Warning:</strong> Client validation is UX-only. Real authentication boundaries must be enforced at production network borders using TLS.
        </div>

        {formError && (
          <div className="alert-box danger animate-fade-in">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className={`form-input ${validationErrors.email ? 'error' : ''}`}
              placeholder="name@odoo.pvt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
            {validationErrors.email && (
              <span className="form-error-msg">{validationErrors.email}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {validationErrors.password && (
              <span className="form-error-msg">{validationErrors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          <span>Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></span>
        </div>

        {/* Developer Sandbox Logins */}
        <div className="dev-shortcuts">
          <div className="dev-shortcuts-title">🧪 Dev Quick Logins</div>
          <div className="dev-buttons">
            <button type="button" className="dev-btn" onClick={() => handleQuickLogin('admin')} disabled={loading}>
              Alex (Admin)
            </button>
            <button type="button" className="dev-btn" onClick={() => handleQuickLogin('asset_manager')} disabled={loading}>
              Sam (Manager)
            </button>
            <button type="button" className="dev-btn" onClick={() => handleQuickLogin('dept_head')} disabled={loading}>
              Jordan (Head)
            </button>
            <button type="button" className="dev-btn" onClick={() => handleQuickLogin('employee')} disabled={loading}>
              Taylor (Employee)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
