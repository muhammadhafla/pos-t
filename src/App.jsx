import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import UserManagement from './components/auth/UserManagement';
import POSInterface from './components/POSInterface';
import InventoryManager from './components/InventoryManager';
import TransactionHistory from './components/TransactionHistory';
import ShiftDashboard from './components/cash/ShiftDashboard';
import './App.css';

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pos');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

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
        return <POSInterface products={products} onProductsUpdate={loadProducts} />;
      case 'cashier':
        return <ShiftDashboard />;
      case 'inventory':
        return <InventoryManager products={products} onProductsUpdate={loadProducts} />;
      case 'history':
        return <TransactionHistory />;
      case 'users':
        return <UserManagement />;
      default:
        return <POSInterface products={products} onProductsUpdate={loadProducts} />;
    }
  };

  const getNavigationTabs = () => {
    if (!user) return [];

    const tabs = [
      { id: 'pos', label: 'POS', icon: '🛒' },
      { id: 'cashier', label: 'Cashier', icon: '💰' },
      { id: 'inventory', label: 'Inventory', icon: '📦' },
      { id: 'history', label: 'History', icon: '📊' },
    ];

    // Add user management tab for admins
    if (user.role === 'admin') {
      tabs.push({ id: 'users', label: 'Users', icon: '👥' });
    }

    return tabs;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Loading POS System...</div>
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
          <h1>POS System</h1>
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className={`user-role ${user.role}`}>{user.role}</span>
          </div>
        </div>
        
        <nav className="navigation">
          {getNavigationTabs().map(tab => (
            <button 
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
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