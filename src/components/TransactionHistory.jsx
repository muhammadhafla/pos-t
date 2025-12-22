import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './TransactionHistory.css';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const transactionList = await invoke('get_transactions');
      setTransactions(transactionList);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      alert('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.items.some(item => 
                           item.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesDate = dateFilter === 'all' || isWithinDateFilter(transaction.timestamp, dateFilter);
    
    const matchesPayment = paymentFilter === 'all' || transaction.payment_method === paymentFilter;
    
    return matchesSearch && matchesDate && matchesPayment;
  });

  const isWithinDateFilter = (timestamp, filter) => {
    const transactionDate = new Date(timestamp);
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return transactionDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transactionDate >= monthAgo;
      default:
        return true;
    }
  };

  const getTotalRevenue = () => {
    return filteredTransactions.reduce((total, transaction) => total + transaction.total, 0);
  };

  const getTotalTransactions = () => {
    return filteredTransactions.length;
  };

  const getAverageTransactionValue = () => {
    if (filteredTransactions.length === 0) return 0;
    return getTotalRevenue() / filteredTransactions.length;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const exportTransactions = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Payment Method', 'Total', 'Items'];
    const rows = filteredTransactions.map(transaction => [
      transaction.id,
      transaction.timestamp,
      transaction.payment_method,
      transaction.total.toString(),
      transaction.items.map(item => `${item.name} x${item.quantity}`).join('; ')
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (loading) {
    return (
      <div className="transaction-history loading">
        <div className="loading-spinner">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h2>Transaction History</h2>
        <button onClick={exportTransactions} className="btn btn-primary">
          Export CSV
        </button>
      </div>

      <div className="history-filters">
        <div className="search-group">
          <label htmlFor="transaction-search">Search:</label>
          <input
            type="text"
            id="transaction-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by transaction ID or product name..."
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="date-filter">Date Range:</label>
          <select
            id="date-filter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="payment-filter">Payment Method:</label>
          <select
            id="payment-filter"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile">Mobile Payment</option>
          </select>
        </div>
      </div>

      <div className="history-stats">
        <div className="stat-card">
          <h4>Total Revenue</h4>
          <p className="stat-value">{formatCurrency(getTotalRevenue())}</p>
        </div>
        <div className="stat-card">
          <h4>Total Transactions</h4>
          <p className="stat-value">{getTotalTransactions()}</p>
        </div>
        <div className="stat-card">
          <h4>Average Sale</h4>
          <p className="stat-value">{formatCurrency(getAverageTransactionValue())}</p>
        </div>
        <div className="stat-card">
          <h4>Filtered Results</h4>
          <p className="stat-value">{filteredTransactions.length}</p>
        </div>
      </div>

      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions found for the selected criteria.</p>
          </div>
        ) : (
          <div className="transactions-grid">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="transaction-card"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="transaction-header">
                  <div className="transaction-id">#{transaction.id.slice(0, 8)}</div>
                  <div className="transaction-date">{formatDate(transaction.timestamp)}</div>
                </div>
                
                <div className="transaction-items">
                  <div className="items-summary">
                    {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                  </div>
                  <div className="items-list">
                    {transaction.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="item-summary">
                        {item.name} x{item.quantity}
                      </div>
                    ))}
                    {transaction.items.length > 3 && (
                      <div className="more-items">+{transaction.items.length - 3} more</div>
                    )}
                  </div>
                </div>
                
                <div className="transaction-footer">
                  <div className="payment-method">
                    <span className={`payment-badge ${transaction.payment_method}`}>
                      {transaction.payment_method}
                    </span>
                  </div>
                  <div className="transaction-total">
                    {formatCurrency(transaction.total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTransaction && (
        <div className="transaction-modal" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button 
                onClick={() => setSelectedTransaction(null)} 
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="transaction-info">
                <div className="info-row">
                  <span className="label">Transaction ID:</span>
                  <span className="value">{selectedTransaction.id}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date & Time:</span>
                  <span className="value">{formatDate(selectedTransaction.timestamp)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Payment Method:</span>
                  <span className="value">{selectedTransaction.payment_method}</span>
                </div>
              </div>
              
              <div className="items-details">
                <h4>Items Purchased</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="transaction-summary">
                <div className="total-row">
                  <span>Total Amount:</span>
                  <span className="total-amount">{formatCurrency(selectedTransaction.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;