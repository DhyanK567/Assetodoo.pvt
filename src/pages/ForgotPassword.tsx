import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Auth.css';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email address is required.');
      return false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccessMessage(response.message || 'Reset link sent.');
      } else {
        setError(response.error || 'Failed to dispatch reset request.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
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
          <p className="auth-subtitle">Recover your password credentials</p>
        </header>

        {error && (
          <div className="alert-box danger animate-fade-in">
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="animate-fade-in">
            <div className="alert-box success" style={{ marginBottom: '24px' }}>
              {successMessage}
            </div>
            <Link to="/login" className="auth-submit-btn" style={{ textDecoration: 'none' }}>
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                className={`form-input ${emailError ? 'error' : ''}`}
                placeholder="name@odoo.pvt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
              {emailError && (
                <span className="form-error-msg">{emailError}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        {!successMessage && (
          <div className="auth-links" style={{ justifyContent: 'center' }}>
            <span>Remembered credentials? <Link to="/login" className="auth-link">Sign In</Link></span>
          </div>
        )}
      </div>
    </div>
  );
};
