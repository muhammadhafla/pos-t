import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '../../contexts/AuthContext';
import './ShiftDashboard.css';

const ShiftDashboard = () => {
  const { user, currentShift, loadCurrentShift, openCashShift } = useAuth();
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [initialCash, setInitialCash] = useState('');
  const [cashMovements, setCashMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentShift) {
      loadCashMovements(currentShift.id);
    }
  }, [currentShift]);

  const loadCashMovements = async (shiftId) => {
    try {
      const movements = await invoke('get_cash_movements', { shiftId });
      setCashMovements(movements);
    } catch (error) {
      console.error('Failed to load cash movements:', error);
    }
  };

  const handleOpenShift = async (e) => {
    e.preventDefault();
    
    if (!initialCash || parseFloat(initialCash) < 0) {
      alert('Please enter a valid initial cash amount');
      return;
    }

    setLoading(true);
    try {
      await openCashShift(initialCash);
      setShowOpenShift(false);
      setInitialCash('');
      await loadCurrentShift(user.id);
    } catch (error) {
      console.error('Error opening shift:', error);
      alert(error.message || 'Failed to open shift');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'cash_in':
      case 'sale':
        return '💰';
      case 'cash_out':
        return '💸';
      case 'adjustment':
        return '⚖️';
      default:
        return '💳';
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'cash_in':
      case 'sale':
        return 'positive';
      case 'cash_out':
        return 'negative';
      case 'adjustment':
        return 'neutral';
      default:
        return 'default';
    }
  };

  const getTotalCashIn = () => {
    return cashMovements
      .filter(m => m.movement_type === 'cash_in' || m.movement_type === 'sale')
      .reduce((sum, m) => sum + m.amount, 0);
  };

  const getTotalCashOut = () => {
    return cashMovements
      .filter(m => m.movement_type === 'cash_out' || m.movement_type === 'adjustment')
      .reduce((sum, m) => sum + m.amount, 0);
  };

  const getNetCashMovement = () => {
    return getTotalCashIn() - getTotalCashOut();
  };

  if (!currentShift) {
    return (
      <div className="shift-dashboard">
        <div className="no-shift">
          <div className="no-shift-content">
            <h2>No Active Shift</h2>
            <p>You don't have an active cash shift. Open a new shift to start processing transactions.</p>
            
            {!showOpenShift ? (
              <button 
                onClick={() => setShowOpenShift(true)}
                className="btn btn-primary btn-large"
              >
                Open Cash Shift
              </button>
            ) : (
              <div className="open-shift-form">
                <h3>Open New Cash Shift</h3>
                <form onSubmit={handleOpenShift}>
                  <div className="form-group">
                    <label htmlFor="initial-cash">Initial Cash Amount</label>
                    <input
                      id="initial-cash"
                      type="number"
                      value={initialCash}
                      onChange={(e) => setInitialCash(e.target.value)}
                      placeholder="Enter initial cash amount"
                      step="1000"
                      min="0"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? 'Opening Shift...' : 'Open Shift'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowOpenShift(false);
                        setInitialCash('');
                      }}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shift-dashboard">
      <div className="dashboard-header">
        <h2>Cash Shift Dashboard</h2>
        <div className="shift-status">
          <span className="status-badge active">Shift Active</span>
        </div>
      </div>

      <div className="shift-info">
        <div className="shift-details">
          <h3>Current Shift Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Cashier:</span>
              <span className="value">{user?.full_name}</span>
            </div>
            <div className="info-item">
              <span className="label">Started:</span>
              <span className="value">{formatDateTime(currentShift.start_time)}</span>
            </div>
            <div className="info-item">
              <span className="label">Initial Cash:</span>
              <span className="value">{formatCurrency(currentShift.initial_cash)}</span>
            </div>
            <div className="info-item">
              <span className="label">Expected Cash:</span>
              <span className="value">{formatCurrency(currentShift.expected_cash)}</span>
            </div>
          </div>
        </div>

        <div className="cash-summary">
          <h3>Cash Summary</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h4>Cash In</h4>
                <p className="amount positive">{formatCurrency(getTotalCashIn())}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">💸</div>
              <div className="card-content">
                <h4>Cash Out</h4>
                <p className="amount negative">{formatCurrency(getTotalCashOut())}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">⚖️</div>
              <div className="card-content">
                <h4>Net Movement</h4>
                <p className={`amount ${getNetCashMovement() >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(getNetCashMovement())}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cash-movements">
        <h3>Cash Movement History</h3>
        {cashMovements.length === 0 ? (
          <div className="no-movements">
            <p>No cash movements recorded yet.</p>
          </div>
        ) : (
          <div className="movements-table">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {cashMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="time">{formatDateTime(movement.timestamp)}</td>
                    <td>
                      <span className={`movement-type ${getMovementColor(movement.movement_type)}`}>
                        {getMovementIcon(movement.movement_type)} {movement.movement_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`amount ${getMovementColor(movement.movement_type)}`}>
                      {movement.movement_type === 'cash_out' || movement.movement_type === 'adjustment' ? '-' : '+'}
                      {formatCurrency(movement.amount)}
                    </td>
                    <td className="reason">{movement.reason || '-'}</td>
                    <td className="user">{movement.user_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftDashboard;