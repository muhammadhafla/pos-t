import React, { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  ShoppingCart, 
  Search, 
  Sparkles, 
  ShoppingBag, 
  Trash2, 
  Camera, 
  Plus,
  CreditCard
} from 'lucide-react';
import PaymentModal from './PaymentModal';

const POSInterface = ({ products, onProductsUpdate, theme }) => {
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  
  const barcodeInputRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Focus on barcode input when component mounts
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + Enter: Open payment modal
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (cart.length > 0) {
          setShowPaymentModal(true);
        }
      }
      
      // F1: Focus search input
      if (event.key === 'F1') {
        event.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      
      // F2: Focus barcode input
      if (event.key === 'F2') {
        event.preventDefault();
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }
      
      // Escape: Clear search or close modal
      if (event.key === 'Escape') {
        if (showPaymentModal) {
          setShowPaymentModal(false);
        } else {
          setSearchTerm('');
          setBarcode('');
        }
      }
      
      // Delete: Clear cart
      if (event.key === 'Delete' && event.shiftKey) {
        event.preventDefault();
        clearCart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cart.length, showPaymentModal]);

  const addProductToCart = (product, quantity = 1) => {
    if (product.stock < quantity) {
      alert(`Insufficient stock! Only ${product.stock} items available.`);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product_id === product.id);
      
      if (existingItem) {
        // Check if new quantity would exceed stock
        if (existingItem.quantity + quantity > product.stock) {
          alert(`Insufficient stock! Only ${product.stock - existingItem.quantity} more items available.`);
          return prevCart;
        }
        
        const updatedCart = prevCart.map(item =>
          item.product_id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + quantity, 
                subtotal: (item.quantity + quantity) * item.price,
                total: (item.quantity + quantity) * item.price - (item.discount || 0)
              }
            : item
        );
        setLastAddedItem(product);
        return updatedCart;
      } else {
        const newItem = {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          discount: 0,
          subtotal: quantity * product.price,
          total: quantity * product.price
        };
        setLastAddedItem(product);
        return [...prevCart, newItem];
      }
    });
  };

  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) return;

    try {
      const product = await invoke('get_product_by_barcode', { barcode: barcode.trim() });
      
      if (product) {
        addProductToCart(product);
        setBarcode('');
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      } else {
        alert('Product not found!');
      }
    } catch (error) {
      console.error('Error searching for product:', error);
      alert('Error searching for product');
    }
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => {
        if (item.product_id === productId) {
          // Find product to check stock
          const product = products.find(p => p.id === productId);
          if (product && newQuantity > product.stock) {
            alert(`Insufficient stock! Only ${product.stock} items available.`);
            return item;
          }
          const newSubtotal = newQuantity * item.price;
          return { 
            ...item, 
            quantity: newQuantity, 
            subtotal: newSubtotal,
            total: newSubtotal - (item.discount || 0)
          };
        }
        return item;
      })
    );
  };

  const updateCartDiscount = (productId, newDiscount) => {
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.product_id === productId) {
          const discount = Math.min(newDiscount, item.subtotal);
          return { 
            ...item, 
            discount: discount,
            total: item.subtotal - discount
          };
        }
        return item;
      })
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const clearCart = () => {
    setCart([]);
    setLastAddedItem(null);
  };

  const searchProductByName = (searchTerm) => {
    if (!searchTerm.trim()) return [];
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
    );
  };

  const handleProcessPayment = async (paymentData) => {
    setIsProcessing(true);

    try {
      // Create transaction
      const transactionId = await invoke('create_transaction', {
        items: cart,
        paymentMethod: paymentMethod,
        discountData: {
          type: paymentData.discountType,
          value: paymentData.discountValue,
          discountedTotal: paymentData.discountedTotal
        }
      });

      // Print receipt
      await invoke('print_receipt', {
        transaction: {
          id: transactionId,
          items: cart,
          total: paymentData.total,
          discountedTotal: paymentData.discountedTotal,
          discount: paymentData.discountValue,
          paymentAmount: paymentData.paymentAmount,
          change: paymentData.change,
          timestamp: new Date().toISOString(),
          payment_method: paymentMethod
        },
        storeName: 'My Store',
        storeAddress: '123 Main St, City, State'
      });

      // Clear cart and refresh products
      setCart([]);
      setShowPaymentModal(false);
      setLastAddedItem(null);
      await onProductsUpdate();

      alert(`Transaction completed! Receipt ID: ${transactionId}`);
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Error processing transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 p-8 shadow-lg">
        <div className="flex justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-xl">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-primary tracking-tight">Point of Sale</h2>
          </div>
        </div>
      </div>

      {/* Row 1: Large Total Display */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-2xl p-10 shadow-xl backdrop-blur-sm">
            <div className="text-lg text-muted-foreground mb-4 uppercase tracking-widest font-semibold">
              Total Belanja
            </div>
            <div className="text-7xl font-black text-primary mb-4 tracking-tight">
              {formatCurrency(getCartTotal())}
            </div>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/20 rounded-full">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <div className="text-lg font-semibold text-primary">
                {cart.length} item{cart.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Search and Active Item Price */}
      <div className="bg-background/50 backdrop-blur-sm p-8 flex-1">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <label className="text-sm font-semibold text-foreground">
                Cari Barang:
              </label>
            </div>
            <div className="relative group">
              <Input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ketik nama atau barcode barang..."
                className="h-14 text-base pl-12 bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 focus:bg-card transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </div>
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl z-10 max-h-80 overflow-y-auto">
                  {searchProductByName(searchTerm).slice(0, 6).map(product => (
                    <div 
                      key={product.id}
                      className="p-4 hover:bg-primary/10 cursor-pointer border-b border-border/30 last:border-b-0 flex justify-between items-center transition-colors group/item"
                      onClick={() => {
                        addProductToCart(product);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-foreground group-hover/item:text-primary transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Stock: {product.stock} | {product.barcode}
                        </div>
                      </div>
                      <div className="font-bold text-primary text-lg">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Item Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-green-500" />
              </div>
              <label className="text-sm font-semibold text-foreground">
                Barang Aktif:
              </label>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-xl p-6 min-h-[120px] flex items-center justify-center transition-all duration-200 hover:border-primary/30">
              {lastAddedItem ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-500 text-sm">✓</span>
                    </div>
                    <div className="font-bold text-lg text-foreground">
                      {lastAddedItem.name}
                    </div>
                  </div>
                  <div className="text-3xl font-black text-primary mb-2">
                    {formatCurrency(lastAddedItem.price)}
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${lastAddedItem.stock > 5 ? 'bg-green-500' : lastAddedItem.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <div className="text-sm text-muted-foreground">
                      Stock: {lastAddedItem.stock}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="text-muted-foreground italic">
                    Tidak ada barang yang dipilih
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Cart Table */}
      <div className="flex-1 bg-background/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-muted/80 to-muted/60 p-6 border-b border-border/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Keranjang Belanja</h3>
                <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                  {cart.length} item
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Kosongkan Keranjang
              </Button>
            </div>

            {cart.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="text-muted-foreground">
                  <h4 className="text-2xl font-semibold mb-3">Keranjang Kosong</h4>
                  <p className="text-lg">Scan barcode atau cari barang untuk menambah ke keranjang</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/80">
                    <tr>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Qty</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Nama Barang</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Harga</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Diskon</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Total</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={item.product_id} className={`border-b border-border/30 hover:bg-primary/5 transition-colors duration-200 ${index % 2 === 0 ? 'bg-background/30' : 'bg-background/10'}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                            >
                              −
                            </Button>
                            <span className="w-12 text-center font-bold bg-primary/10 text-primary rounded-lg py-1">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                              className="h-8 w-8 p-0 hover:bg-green-500 hover:text-white transition-all duration-200"
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-foreground text-lg">{item.name}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-primary text-lg">{formatCurrency(item.price)}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            ×{item.quantity} = {formatCurrency(item.subtotal)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">Rp</div>
                            <Input
                              type="number"
                              value={item.discount || 0}
                              onChange={(e) => updateCartDiscount(item.product_id, parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                              max={item.subtotal}
                              className="h-9 w-24 text-sm bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-2xl text-primary">{formatCurrency(item.total)}</div>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.product_id)}
                            className="hover:bg-red-600 transition-all duration-200 hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-8 border-t-2 border-primary/20 flex justify-between items-center">
                  <div className="text-right">
                    <div className="text-lg text-muted-foreground mb-2 font-medium">Total Akhir:</div>
                    <div className="text-5xl font-black text-primary tracking-tight">
                      {formatCurrency(getCartTotal())}
                    </div>
                  </div>
                  
                  <Button
                    size="lg"
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0 || isProcessing}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white text-xl font-bold px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-0"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Memproses...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <span>BAYAR {formatCurrency(getCartTotal())}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barcode Scanner Section */}
      <div className="bg-card/95 backdrop-blur-sm border-t border-border/50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-500" />
              </div>
              <label className="text-sm font-semibold text-foreground min-w-[120px]">
                Scan Barcode:
              </label>
            </div>
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1">
                <Input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                  placeholder="Scan atau ketik barcode..."
                  className="h-12 text-base pl-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <Button 
                onClick={handleBarcodeSearch}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Barang
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={getCartTotal()}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onProcessPayment={handleProcessPayment}
      />
    </div>
  );
};

export default POSInterface;