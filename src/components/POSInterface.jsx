import React, { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './POSInterface.css';

const POSInterface = ({ products, onProductsUpdate }) => {
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [storeName, setStoreName] = useState('My Store');
  const [storeAddress, setStoreAddress] = useState('123 Main St, City, State');
  const [isProcessing, setIsProcessing] = useState(false);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    // Focus on barcode input when component mounts
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

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
        
        return prevCart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.price }
            : item
        );
      } else {
        return [...prevCart, {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          subtotal: quantity * product.price
        }];
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
          return { ...item, quantity: newQuantity, subtotal: newQuantity * item.price };
        }
        return item;
      })
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const processTransaction = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    setIsProcessing(true);

    try {
      // Create transaction
      const transactionId = await invoke('create_transaction', {
        items: cart,
        paymentMethod: paymentMethod
      });

      // Print receipt (console for now, can be enhanced for actual printing)
      await invoke('print_receipt', {
        transaction: {
          id: transactionId,
          items: cart,
          total: getCartTotal(),
          timestamp: new Date().toISOString(),
          payment_method: paymentMethod
        },
        storeName: storeName,
        storeAddress: storeAddress
      });

      // Clear cart and refresh products
      setCart([]);
      await onProductsUpdate();

      alert(`Transaction completed! Receipt ID: ${transactionId}`);
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Error processing transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const searchProductByName = (searchTerm) => {
    if (!searchTerm.trim()) return [];
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
    );
  };

  return (
    <div className="pos-interface">
      <div className="pos-header">
        <h2>Point of Sale</h2>
        <div className="store-settings">
          <div className="form-group">
            <label>Store Name:</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="store-input"
            />
          </div>
        </div>
      </div>

      <div className="pos-content">
        <div className="scanner-section">
          <div className="barcode-scanner">
            <label htmlFor="barcode-input">Scan or Enter Barcode:</label>
            <div className="barcode-input-group">
              <input
                ref={barcodeInputRef}
                id="barcode-input"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                placeholder="Scan barcode or type product code"
                className="barcode-input"
              />
              <button onClick={handleBarcodeSearch} className="btn btn-primary">
                Add Item
              </button>
            </div>
          </div>

          <div className="product-search">
            <label>Quick Search:</label>
            <input
              type="text"
              placeholder="Search products..."
              onChange={(e) => {
                const searchResults = searchProductByName(e.target.value);
                if (e.target.value && searchResults.length === 1) {
                  addProductToCart(searchResults[0]);
                  e.target.value = '';
                }
              }}
              className="search-input"
            />
          </div>
        </div>

        <div className="cart-section">
          <div className="cart-header">
            <h3>Current Sale</h3>
            <button onClick={clearCart} className="btn btn-secondary" disabled={cart.length === 0}>
              Clear Cart
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Cart is empty. Scan a product or search to add items.</p>
            </div>
          ) : (
            <div className="cart-items">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.product_id}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <div className="quantity-controls">
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            className="qty-btn"
                          >
                            -
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>${item.subtotal.toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="btn btn-danger"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="cart-summary">
                <div className="total-section">
                  <div className="total-line">
                    <span>Subtotal:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="total-line total-amount">
                    <span>Total:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="payment-section">
                  <label>Payment Method:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="payment-select"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile">Mobile Payment</option>
                  </select>
                </div>

                <button
                  onClick={processTransaction}
                  disabled={isProcessing || cart.length === 0}
                  className="btn btn-success process-btn"
                >
                  {isProcessing ? 'Processing...' : `Complete Sale ($${getCartTotal().toFixed(2)})`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSInterface;