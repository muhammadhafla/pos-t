import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShoppingCart, 
  User, 
  Lock, 
  AlertTriangle, 
  Rocket, 
  Zap, 
  Key, 
  DollarSign, 
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Focus management
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
              <ShoppingCart className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl -z-10"></div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Point of Sale System</h1>
          <p className="text-muted-foreground text-lg">Professional Cash Management Solution</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-8 h-0.5 bg-primary/50"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-8 h-0.5 bg-primary/50"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <Input
                ref={usernameInputRef}
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, passwordInputRef)}
                placeholder="Enter your username"
                disabled={isLoading}
                autoComplete="username"
                className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>
            <label htmlFor="username" className="text-sm font-semibold text-foreground">Username</label>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <Input
                ref={passwordInputRef}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
                className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>
            <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Rocket className="w-5 h-5" />
                <span>Sign In</span>
              </div>
            )}
          </Button>
        </form>

        {/* Quick Demo Access */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <p className="text-sm font-semibold text-foreground">Quick Demo Access</p>
          </div>
          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              variant="outline"
              className="w-full h-16 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200"
              disabled={isLoading}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">Administrator</div>
                  <div className="text-sm text-muted-foreground">Full access</div>
                </div>
              </div>
            </Button>
            <Button
              type="button"
              onClick={() => handleQuickLogin('cashier')}
              variant="outline"
              className="w-full h-16 border-2 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/50 transition-all duration-200"
              disabled={isLoading}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">Cashier</div>
                  <div className="text-sm text-muted-foreground">POS access</div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
            <div className="w-2 h-2 bg-primary/50 rounded-full"></div>
            <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-blue-500" />
              <strong className="text-sm font-semibold text-foreground">Demo Credentials</strong>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  Admin
                </span>
                <span className="text-sm font-mono text-muted-foreground">admin / admin123</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                  Cashier
                </span>
                <span className="text-sm font-mono text-muted-foreground">kasir / kasir123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;