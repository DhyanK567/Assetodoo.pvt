import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import './Auth.css';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

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

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
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
      const response = await authService.signup(name, email, password);
      if (response.success && response.user) {
        loginUser(response.user);
        navigate('/', { replace: true });
      } else {
        setFormError(response.error || 'Signup failed. Please try again.');
      }
    } catch {
      setFormError('A network error occurred. Please try again.');
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
          <p className="auth-subtitle">Register a new Employee account</p>
        </header>

        {/* Security Alert Header */}
        <div className="auth-warning-banner">
          ⚠️ <strong>Privilege Isolation:</strong> Registration is restricted to <strong>Employee</strong> roles only. Access elevations must be authorized by an administrator.
        </div>

        {formError && (
          <div className="alert-box danger animate-fade-in">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className={`form-input ${validationErrors.name ? 'error' : ''}`}
              placeholder="Alex Dev"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoComplete="name"
            />
            {validationErrors.name && (
              <span className="form-error-msg">{validationErrors.name}</span>
            )}
          </div>

          {/* Email Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
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
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div className="input-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
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

          {/* Confirm Password Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            {validationErrors.confirmPassword && (
              <span className="form-error-msg">{validationErrors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-links" style={{ justifyContent: 'center' }}>
          <span>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></span>
        </div>
      </div>
    </div>
  );
};
