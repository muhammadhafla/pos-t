import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  BarChart3, 
  FileText, 
  Search, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Filter,
  Package,
  IdCard,
  MapPin,
  ShoppingBag,
  BarChart,
  Smartphone,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-lg font-medium">Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Transaction History</h2>
              <p className="text-muted-foreground text-lg">View and analyze your sales data</p>
            </div>
          </div>
          <Button onClick={exportTransactions} className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200">
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <label htmlFor="transaction-search" className="text-sm font-semibold text-foreground">Search Transactions</label>
            </div>
            <div className="relative">
              <Input
                id="transaction-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by transaction ID or product name..."
                className="pl-10 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <label htmlFor="date-filter" className="text-sm font-semibold text-foreground">Date Range</label>
            </div>
            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-12 px-4 bg-background/80 border-2 border-border/50 rounded-xl text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <label htmlFor="payment-filter" className="text-sm font-semibold text-foreground">Payment Method</label>
            </div>
            <select
              id="payment-filter"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-12 px-4 bg-background/80 border-2 border-border/50 rounded-xl text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Total Revenue</h4>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(getTotalRevenue())}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">All time</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Total Transactions</h4>
                <p className="text-2xl font-bold text-foreground">{getTotalTransactions()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <FileText className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Sales completed</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Average Sale</h4>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(getAverageTransactionValue())}</p>
                <div className="flex items-center gap-1 mt-2">
                  <BarChart className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">Per transaction</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Filtered Results</h4>
                <p className="text-2xl font-bold text-foreground">{filteredTransactions.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <BarChart className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">Current view</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="mb-8">
        {filteredTransactions.length === 0 ? (
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-16 text-center shadow-xl">
            <div className="max-w-md mx-auto">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">No transactions found</h3>
              <p className="text-muted-foreground text-lg">Try adjusting your search or filters to find transactions.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="font-mono font-bold text-primary text-lg">
                    #{transaction.id.slice(0, 8)}
                  </div>
                  <div className="text-sm text-muted-foreground">{formatDate(transaction.timestamp)}</div>
                </div>
                
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full mb-3">
                    <span className="font-bold text-primary">{transaction.items.length}</span>
                    <span className="text-sm text-primary font-medium">item{transaction.items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2">
                    {transaction.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">×{item.quantity}</span>
                      </div>
                    ))}
                    {transaction.items.length > 3 && (
                      <div className="text-xs text-muted-foreground italic text-center py-1">
                        +{transaction.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      transaction.payment_method === 'cash' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                      transaction.payment_method === 'card' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400'
                    }`}>
                      {transaction.payment_method === 'cash' ? <DollarSign className="w-3 h-3 mr-1 inline" /> :
                       transaction.payment_method === 'card' ? <CreditCard className="w-3 h-3 mr-1 inline" /> :
                       <Smartphone className="w-3 h-3 mr-1 inline" />}
                      {transaction.payment_method}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(transaction.total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTransaction(null)}>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-8 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Transaction Details</h3>
                  <p className="text-muted-foreground">Complete transaction information</p>
                </div>
              </div>
              <Button 
                onClick={() => setSelectedTransaction(null)} 
                variant="outline"
                size="icon"
                className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-8">
              {/* Transaction Info */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <IdCard className="w-4 h-4 text-muted-foreground" />
                    Transaction ID:
                  </div>
                  <span className="font-mono text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg">{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Date & Time:
                  </div>
                  <span className="text-foreground font-medium">{formatDate(selectedTransaction.timestamp)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    Payment Method:
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedTransaction.payment_method === 'cash' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                    selectedTransaction.payment_method === 'card' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400'
                  }`}>
                    {selectedTransaction.payment_method === 'cash' ? <DollarSign className="w-3 h-3 mr-1 inline" /> :
                     selectedTransaction.payment_method === 'card' ? <CreditCard className="w-3 h-3 mr-1 inline" /> :
                     <Smartphone className="w-3 h-3 mr-1 inline" />}
                    {selectedTransaction.payment_method}
                  </div>
                </div>
              </div>
              
              {/* Items Details */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Items Purchased
                </h4>
                <div className="bg-muted/30 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-primary/10">
                      <tr>
                        <th className="text-left p-4 font-semibold text-foreground">Product</th>
                        <th className="text-left p-4 font-semibold text-foreground">Quantity</th>
                        <th className="text-left p-4 font-semibold text-foreground">Price</th>
                        <th className="text-left p-4 font-semibold text-foreground">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransaction.items.map((item, index) => (
                        <tr key={index} className="border-b border-border/20 last:border-b-0 hover:bg-accent/50 transition-colors">
                          <td className="p-4 font-medium text-foreground">{item.name}</td>
                          <td className="p-4 text-muted-foreground">{item.quantity}</td>
                          <td className="p-4 font-semibold text-primary">{formatCurrency(item.price)}</td>
                          <td className="p-4 font-bold text-foreground">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Transaction Summary */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <DollarSign className="w-5 h-5" />
                    Total Amount:
                  </div>
                  <div className="text-3xl font-black text-primary">{formatCurrency(selectedTransaction.total)}</div>
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