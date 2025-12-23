import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import UserManagement from './components/auth/UserManagement';
import POSInterface from './components/POSInterface';
import InventoryManager from './components/InventoryManager';
import TransactionHistory from './components/TransactionHistory';
import ShiftDashboard from './components/cash/ShiftDashboard';
import { Button } from './components/ui/button';
import { 
  ShoppingCart, 
  CreditCard, 
  Package, 
  BarChart3, 
  Users, 
  Sun, 
  Moon, 
  LogOut,
  ChevronDown,
  Check,
  Store
} from 'lucide-react';
import './App.css';

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pos');
  const [products, setProducts] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.nav-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const loadProducts = async () => {
    try {
      const productList = await invoke('get_products');
      setProducts(productList);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const renderActiveTab = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'pos':
        return <POSInterface products={products} onProductsUpdate={loadProducts} theme={theme} />;
      case 'cashier':
        return <ShiftDashboard />;
      case 'inventory':
        return <InventoryManager products={products} onProductsUpdate={loadProducts} />;
      case 'history':
        return <TransactionHistory />;
      case 'users':
        return <UserManagement />;
      default:
        return <POSInterface products={products} onProductsUpdate={loadProducts} theme={theme} />;
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <div className="logo-container">
              <div className="logo-icon">
                <Store size={48} />
              </div>
              <div className="logo-pulse"></div>
            </div>
          </div>
          <div className="loading-text">
            <h2>POS System</h2>
            <p>Loading your workspace...</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-icon">
              <Store className="text-2xl" />
            </div>
            <div className="logo-text">
              <h1>POS System</h1>
              <span className="version">v2.0</span>
            </div>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              <span className="avatar-icon">
                {user.role === 'admin' ? <Users className="text-lg" /> : 
                 user.role === 'manager' ? <BarChart3 className="text-lg" /> : 
                 <CreditCard className="text-lg" />}
              </span>
            </div>
            <div className="user-details">
              <span className="user-name">{user.full_name}</span>
              <span className={`user-role ${user.role}`}>{user.role}</span>
            </div>
          </div>
        </div>
        
        <nav className="navigation">
          <div className="nav-dropdown">
            <button 
              className="dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="trigger-icon">
                {activeTab === 'pos' ? <ShoppingCart className="text-xl" /> : 
                 activeTab === 'cashier' ? <CreditCard className="text-xl" /> :
                 activeTab === 'inventory' ? <Package className="text-xl" /> :
                 activeTab === 'history' ? <BarChart3 className="text-xl" /> :
                 activeTab === 'users' ? <Users className="text-xl" /> : <ShoppingCart className="text-xl" />}
              </span>
              <span className="trigger-label">
                {[
                  { id: 'pos', label: 'POS' },
                  { id: 'cashier', label: 'Cashier' },
                  { id: 'inventory', label: 'Inventory' },
                  { id: 'history', label: 'History' },
                  { id: 'users', label: 'Users' }
                ].find(tab => tab.id === activeTab)?.label || 'POS'}
              </span>
              <ChevronDown className={`dropdown-arrow ${dropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                {[
                  { id: 'pos', label: 'POS', icon: ShoppingCart, color: 'primary', desc: 'Point of Sale' },
                  { id: 'cashier', label: 'Cashier', icon: CreditCard, color: 'green', desc: 'Cash Management' },
                  { id: 'inventory', label: 'Inventory', icon: Package, color: 'blue', desc: 'Product Management' },
                  { id: 'history', label: 'History', icon: BarChart3, color: 'purple', desc: 'Transaction History' },
                  ...(user.role === 'admin' ? [{ id: 'users', label: 'Users', icon: Users, color: 'orange', desc: 'User Management' }] : [])
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`dropdown-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="item-icon">
                      <span className={`icon-bg ${tab.color}`}>
                        <tab.icon size={20} />
                      </span>
                    </div>
                    <div className="item-content">
                      <div className="item-label">{tab.label}</div>
                      <div className="item-desc">{tab.desc}</div>
                    </div>
                    {activeTab === tab.id && (
                      <div className="active-indicator">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="header-actions">
          <div className="theme-toggle-wrapper">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="theme-toggle"
            >
              <span className="theme-icon">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </span>
              <span className="theme-text">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </Button>
          </div>
          <div className="logout-wrapper">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="logout-btn"
            >
              <LogOut size={16} />
              <span className="logout-text">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        {renderActiveTab()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;