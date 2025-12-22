import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Focus management
  const usernameInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);

  useEffect(() => {
    // Focus username input on component mount
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  // Handle Enter key navigation
  const handleKeyDown = (e, nextInputRef) => {
    if (e.key === 'Enter' && nextInputRef && nextInputRef.current) {
      nextInputRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate inputs
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username.trim(), password);
      
      if (!result.success) {
        // Handle specific error cases
        if (result.error.includes('Invalid') || result.error.includes('incorrect')) {
          setError('Invalid username or password. Please check your credentials.');
        } else if (result.error.includes('Network') || result.error.includes('connection')) {
          setError('Connection error. Please check your network and try again.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to the server. Please ensure the application is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
      setError('');
    } else if (userType === 'cashier') {
      setUsername('kasir');
      setPassword('kasir123');
      setError('');
    }
    
    // Auto-submit after a short delay to provide better UX
    setTimeout(() => {
      if (!isLoading) {
        const form = document.querySelector('.login-form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    }, 100);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>POS System</h1>
          <p>Point of Sale Cash Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              ref={usernameInputRef}
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, passwordInputRef)}
              placeholder="Enter username"
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              ref={passwordInputRef}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="quick-login">
          <p>Quick Login (Demo):</p>
          <div className="quick-login-buttons">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="quick-login-btn admin"
              disabled={isLoading}
            >
              Administrator
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('cashier')}
              className="quick-login-btn cashier"
              disabled={isLoading}
            >
              Cashier
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p className="demo-info">
            <strong>Demo Credentials:</strong><br />
            Admin: admin / admin123<br />
            Cashier: kasir / kasir123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;