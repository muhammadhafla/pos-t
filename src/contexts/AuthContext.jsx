import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentShift, setCurrentShift] = useState(null);

  useEffect(() => {
    // Check if user is logged in (you might want to persist this in localStorage)
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        loadCurrentShift(userData.id);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('pos_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const userData = await invoke('authenticate_user', {
        loginData: { username, password }
      });

      if (userData) {
        setUser(userData);
        localStorage.setItem('pos_user', JSON.stringify(userData));
        
        // Load current shift if user has one
        await loadCurrentShift(userData.id);
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentShift(null);
    localStorage.removeItem('pos_user');
  };

  const loadCurrentShift = async (userId) => {
    try {
      const shift = await invoke('get_current_shift', { userId });
      setCurrentShift(shift);
      return shift;
    } catch (error) {
      console.error('Error loading current shift:', error);
      return null;
    }
  };

  const openCashShift = async (initialCash) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const shiftId = await invoke('open_cash_shift', {
        userId: user.id,
        initialCash: parseFloat(initialCash)
      });

      // Reload current shift
      await loadCurrentShift(user.id);
      
      return shiftId;
    } catch (error) {
      console.error('Error opening cash shift:', error);
      throw error;
    }
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isCashier = () => {
    return user && (user.role === 'kasir' || user.role === 'admin');
  };

  const value = {
    user,
    loading,
    currentShift,
    login,
    logout,
    loadCurrentShift,
    openCashShift,
    isAdmin,
    isCashier,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};