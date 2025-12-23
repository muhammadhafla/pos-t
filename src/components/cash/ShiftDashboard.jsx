import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DollarSign, 
  CreditCard, 
  Scale,
  TrendingDown,
  FileText,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '../ui/dialog';
import ShiftReports from './ShiftReports';

const ShiftDashboard = () => {
  const { user, currentShift, loadCurrentShift, openCashShift } = useAuth();
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [initialCash, setInitialCash] = useState('');
  const [cashMovements, setCashMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [actualCash, setActualCash] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [showReports, setShowReports] = useState(false);

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

  const handleCloseShift = async (e) => {
    e.preventDefault();
    
    if (!actualCash || parseFloat(actualCash) < 0) {
      alert('Please enter a valid actual cash amount');
      return;
    }

    setLoading(true);
    try {
      // Close the shift
      await invoke('close_cash_shift', {
        shiftId: currentShift.id,
        actualCash: parseFloat(actualCash),
        userId: user.id,
        notes: closeNotes || null,
      });
      
      // Get the latest report and auto-print POS58
      const reports = await invoke('get_shift_reports');
      const latestReport = reports.find(r => r.shift_id === currentShift.id);
      
      setShowCloseShift(false);
      setActualCash('');
      setCloseNotes('');
      await loadCurrentShift(user.id);
      
      // Auto-print POS58 receipt
      if (latestReport) {
        printShiftReportPOS58(latestReport);
      }
      
      alert('Shift closed successfully! Receipt has been printed.');
    } catch (error) {
      console.error('Error closing shift:', error);
      alert(error.message || 'Failed to close shift');
    } finally {
      setLoading(false);
    }
  };

  const printShiftReportPOS58 = (report) => {
    const summary = {
      totalCashIn: report.data.cash_summary?.total_cash_in || 0,
      totalCashOut: report.data.cash_summary?.total_cash_out || 0,
      initialCash: report.data.cash_summary?.initial_cash || 0,
      expectedCash: report.data.cash_summary?.expected_cash || 0,
      actualCash: report.data.cash_summary?.actual_cash || 0,
      difference: report.data.cash_summary?.difference || 0,
    };
    const shiftInfo = report.data.shift_info || {};
    
    const formatNum = (n) => new Intl.NumberFormat('id-ID').format(n);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Shift Report - ${report.shift_id.slice(0, 8)}</title>
          <style>
            @page { margin: 0; size: 58mm auto; }
            body { 
              font-family: 'Courier New', monospace; 
              width: 58mm; 
              padding: 2mm; 
              font-size: 10px;
              line-height: 1.2;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .right { text-align: right; }
            .dashed { border-bottom: 1px dashed #000; margin: 5px 0; }
            .title { font-size: 12px; font-weight: bold; margin-bottom: 5px; }
            .section { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="center title">SHIFT REPORT</div>
          <div class="center">${shiftInfo.register_name || 'Cash Register'}</div>
          <div class="dashed"></div>
          
          <div class="section">
            <div>Kasir: ${shiftInfo.user_name || 'N/A'}</div>
            <div>Mulai: ${formatDateTime(shiftInfo.start_time)}</div>
            <div>Selesai: ${formatDateTime(shiftInfo.end_time)}</div>
          </div>
          
          <div class="dashed"></div>
          
          <div class="section">
            <div class="bold">RINGKASAN KAS</div>
            <div>Kas Awal: Rp ${formatNum(summary.initialCash)}</div>
            <div>Kas Masuk: Rp ${formatNum(summary.totalCashIn)}</div>
            <div>Kas Keluar: Rp ${formatNum(summary.totalCashOut)}</div>
          </div>
          
          <div class="dashed"></div>
          
          <div class="section">
            <div>Kas Esperasi: Rp ${formatNum(summary.expectedCash)}</div>
            <div>Kas Aktual: Rp ${formatNum(summary.actualCash)}</div>
            <div class="bold">
              Selisih: ${summary.difference >= 0 ? '+' : ''}Rp ${formatNum(summary.difference)}
            </div>
          </div>
          
          <div class="dashed"></div>
          
          <div class="section">
            <div>Transaksi: ${report.data.transactions?.length || 0}</div>
            <div>Movement: ${report.data.movements?.length || 0}</div>
          </div>
          
          <div class="dashed"></div>
          
          <div class="center section">
            <div>Generated: ${formatDateTime(report.generated_at)}</div>
            <div>*** TERIMA KASIH ***</div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 300);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
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
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'cash_out':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'adjustment':
        return <Scale className="w-4 h-4 text-blue-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-8">
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">No Active Shift</h2>
            <p className="text-muted-foreground mb-8">You don't have an active cash shift. Open a new shift to start processing transactions.</p>
            
            {!showOpenShift ? (
              <Button 
                onClick={() => setShowOpenShift(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200"
              >
                Open Cash Shift
              </Button>
            ) : (
              <div className="text-left space-y-6">
                <h3 className="text-xl font-bold text-foreground text-center">Open New Cash Shift</h3>
                <form onSubmit={handleOpenShift} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="initial-cash" className="text-sm font-semibold text-foreground">Initial Cash Amount</label>
                    <Input
                      id="initial-cash"
                      type="number"
                      value={initialCash}
                      onChange={(e) => setInitialCash(e.target.value)}
                      placeholder="Enter initial cash amount"
                      step="1000"
                      min="0"
                      required
                      disabled={loading}
                      className="h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? 'Opening Shift...' : 'Open Shift'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowOpenShift(false);
                        setInitialCash('');
                      }}
                      className="px-6 py-3 rounded-xl border-2 border-border/50 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Cash Shift Dashboard</h2>
              <p className="text-muted-foreground text-lg">Manage cash operations and track movements</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full font-semibold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Shift Active
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowReports(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border/50 hover:bg-accent transition-all duration-200"
            >
              <FileText className="w-4 h-4" />
              Reports
            </Button>
            <Dialog open={showCloseShift} onOpenChange={setShowCloseShift}>
              <DialogTrigger asChild>
                <Button 
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Close Shift
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Close Cash Shift</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCloseShift} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="actual-cash" className="text-sm font-semibold text-foreground">Actual Cash Count</label>
                    <Input
                      id="actual-cash"
                      type="number"
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      placeholder="Enter actual cash count"
                      step="1000"
                      min="0"
                      required
                      disabled={loading}
                      className="h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="close-notes" className="text-sm font-semibold text-foreground">Notes (Optional)</label>
                    <Input
                      id="close-notes"
                      type="text"
                      value={closeNotes}
                      onChange={(e) => setCloseNotes(e.target.value)}
                      placeholder="Any notes about this shift"
                      disabled={loading}
                      className="h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Cash:</span>
                      <span className="font-semibold">{formatCurrency(currentShift.expected_cash)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difference:</span>
                      <span className={`font-semibold ${
                        parseFloat(actualCash || 0) - currentShift.expected_cash >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(parseFloat(actualCash || 0) - currentShift.expected_cash)}
                      </span>
                    </div>
                  </div>
                  <DialogFooter className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowCloseShift(false);
                        setActualCash('');
                        setCloseNotes('');
                      }}
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl border-2 border-border/50 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? 'Closing...' : 'Close Shift'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Shift Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Shift Details */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-foreground mb-4">Current Shift Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="font-semibold text-muted-foreground">Cashier:</span>
              <span className="font-medium text-foreground">{user?.full_name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="font-semibold text-muted-foreground">Started:</span>
              <span className="font-medium text-foreground">{formatDateTime(currentShift.start_time)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="font-semibold text-muted-foreground">Initial Cash:</span>
              <span className="font-bold text-primary">{formatCurrency(currentShift.initial_cash)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-muted-foreground">Expected Cash:</span>
              <span className="font-bold text-primary">{formatCurrency(currentShift.expected_cash)}</span>
            </div>
          </div>
        </div>

        {/* Cash Summary */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-foreground mb-4">Cash Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/50 rounded-xl">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Cash In</h4>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">{formatCurrency(getTotalCashIn())}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-950/50 rounded-xl">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Cash Out</h4>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">{formatCurrency(getTotalCashOut())}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Net Movement</h4>
                <p className={`text-xl font-bold ${
                  getNetCashMovement() >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {formatCurrency(getNetCashMovement())}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Movements */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-xl font-bold text-foreground">Cash Movement History</h3>
        </div>
        {cashMovements.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-muted-foreground text-lg">No cash movements recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/80">
                <tr>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Time</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Type</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Reason</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">User</th>
                </tr>
              </thead>
              <tbody>
                {cashMovements.map((movement) => (
                  <tr key={movement.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <td className="p-4 text-sm text-muted-foreground">{formatDateTime(movement.timestamp)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        movement.movement_type === 'cash_in' || movement.movement_type === 'sale' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                        movement.movement_type === 'cash_out' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                      }`}>
                        {getMovementIcon(movement.movement_type)}
                        {movement.movement_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${
                        movement.movement_type === 'cash_out' || movement.movement_type === 'adjustment' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {movement.movement_type === 'cash_out' || movement.movement_type === 'adjustment' ? '-' : '+'}
                        {formatCurrency(movement.amount)}
                      </span>
                    </td>
                    <td className="p-4 text-foreground">{movement.reason || '-'}</td>
                    <td className="p-4 text-muted-foreground">{movement.user_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ShiftReports open={showReports} onClose={() => setShowReports(false)} />
    </div>
  );
};

export default ShiftDashboard;
