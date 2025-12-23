import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  CreditCard, 
  Tag, 
  Banknote, 
  Smartphone, 
  Check, 
  X,
  Save
} from 'lucide-react';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  total, 
  onProcessPayment, 
  paymentMethod = 'cash',
  onPaymentMethodChange 
}) => {
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [discountedTotal, setDiscountedTotal] = useState(total);
  const [change, setChange] = useState(0);
  const [shortage, setShortage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setDiscountValue(0);
      setPaymentAmount('');
      setDiscountedTotal(total);
      setChange(0);
      setShortage(0);
    }
  }, [isOpen, total]);

  useEffect(() => {
    // Calculate discounted total
    let discount = 0;
    if (discountType === 'percentage') {
      discount = (discountValue / 100) * total;
    } else {
      discount = Math.min(discountValue, total);
    }
    
    const newDiscountedTotal = Math.max(0, total - discount);
    setDiscountedTotal(newDiscountedTotal);
    
    // Calculate change or shortage
    const payment = parseFloat(paymentAmount) || 0;
    if (payment >= newDiscountedTotal) {
      setChange(payment - newDiscountedTotal);
      setShortage(0);
    } else {
      setChange(0);
      setShortage(newDiscountedTotal - payment);
    }
  }, [discountType, discountValue, paymentAmount, total]);

  const handleProcessPayment = () => {
    if (parseFloat(paymentAmount) < discountedTotal) {
      alert('Payment amount is insufficient!');
      return;
    }

    const paymentData = {
      total: total,
      discountType,
      discountValue: parseFloat(discountValue) || 0,
      discountedTotal,
      paymentAmount: parseFloat(paymentAmount) || 0,
      change,
      paymentMethod
    };

    onProcessPayment(paymentData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-border/50 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Process Payment
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Total Section */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Original Total:</span>
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(total)}
              </span>
            </div>
            {discountValue > 0 && (
              <div className="flex justify-between items-center text-red-500">
                <span className="font-medium">
                  Discount ({discountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountValue)}):
                </span>
                <span className="font-semibold">
                  -{formatCurrency(total - discountedTotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20">
              <span className="text-lg font-bold text-foreground">Total to Pay:</span>
              <span className="text-4xl font-black text-primary tracking-tight">
                {formatCurrency(discountedTotal)}
              </span>
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-orange-500" />
              </div>
              <label className="text-sm font-semibold text-foreground">Discount:</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select 
                value={discountType} 
                onChange={(e) => setDiscountType(e.target.value)}
                className="col-span-1 flex h-12 rounded-xl border-2 border-border/50 bg-card/80 px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (IDR)</option>
              </select>
              <div className="col-span-2 relative">
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === 'percentage' ? '0' : '0'}
                  min="0"
                  max={discountType === 'percentage' ? '100' : total}
                  className="h-12 pl-8 bg-card/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {discountType === 'percentage' ? '%' : 'Rp'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-500" />
              </div>
              <label className="text-sm font-semibold text-foreground">Payment Method:</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'cash', label: 'Cash', icon: Banknote },
                { value: 'card', label: 'Card', icon: CreditCard },
                { value: 'mobile', label: 'Mobile', icon: Smartphone }
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => onPaymentMethodChange(method.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    paymentMethod === method.value
                      ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                      : 'border-border/50 bg-card/50 text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <div className="mb-2">
                    <method.icon className="w-6 h-6 mx-auto text-current" />
                  </div>
                  <div className="font-semibold text-sm">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Amount */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-green-500" />
                </div>
                <label className="text-sm font-semibold text-foreground">Payment Amount:</label>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  autoFocus
                  className="h-14 text-lg pl-16 bg-card/80 border-2 border-border/50 rounded-xl focus:border-green-500/50 focus:ring-4 focus:ring-green-500/20 font-bold"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">
                  Rp
                </div>
              </div>
            </div>
          )}

          {/* Change/Shortage Display */}
          {(change > 0 || shortage > 0) && paymentAmount && (
            <div className={`p-6 rounded-2xl border-2 ${
              change > 0 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/50 dark:to-green-900/50 dark:border-green-800' 
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950/50 dark:to-red-900/50 dark:border-red-800'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    change > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <span className="text-xl">
                      {change > 0 ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                    </span>
                  </div>
                  <div>
                    <div className={`font-bold text-lg ${
                      change > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                    }`}>
                      {change > 0 ? 'Change:' : 'Shortage:'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {change > 0 ? 'Money to return' : 'Additional amount needed'}
                    </div>
                  </div>
                </div>
                <div className={`text-right ${
                  change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  <div className="text-3xl font-black">
                    {formatCurrency(change > 0 ? change : shortage)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between gap-4 pt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-8 h-12 rounded-xl border-2 border-border/50 hover:border-destructive/50 hover:bg-destructive/10 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProcessPayment}
            disabled={paymentMethod === 'cash' && parseFloat(paymentAmount) < discountedTotal}
            className={`px-12 h-12 rounded-xl font-bold text-lg transition-all duration-200 ${
              paymentMethod === 'cash' && parseFloat(paymentAmount) < discountedTotal
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl hover:scale-105'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {paymentMethod === 'cash' ? <Banknote className="w-5 h-5" /> : 
                 paymentMethod === 'card' ? <CreditCard className="w-5 h-5" /> : 
                 <Smartphone className="w-5 h-5" />}
              </span>
              <span>
                {paymentMethod === 'cash' 
                  ? `Accept Payment (${formatCurrency(discountedTotal)})` 
                  : 'Process Payment'
                }
              </span>
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;