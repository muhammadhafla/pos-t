import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './InventoryManager.css';

const InventoryManager = ({ products, onProductsUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: '',
    stock: '',
    category: ''
  });

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      barcode: '',
      price: '',
      stock: '',
      category: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.barcode || !formData.price || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingProduct) {
        // Update existing product
        // Note: This would need a backend command to update product
        // For now, we'll just simulate it
        alert('Product update functionality would be implemented here');
      } else {
        // Add new product
        // Note: This would need a backend command to add product
        // For now, we'll just simulate it
        alert('Product addition functionality would be implemented here');
      }
      
      resetForm();
      await onProductsUpdate();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      barcode: product.barcode,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Note: This would need a backend command to delete product
        alert('Product deletion functionality would be implemented here');
        await onProductsUpdate();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const updateStock = async (productId, newStock) => {
    try {
      await invoke('update_product_stock', {
        productId: productId,
        newStock: newStock
      });
      await onProductsUpdate();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    }
  };

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn btn-primary"
        >
          {showAddForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="product-form-section">
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="barcode">Barcode *</label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="stock">Stock</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="form-input"
                list="categories"
              />
              <datalist id="categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inventory-filters">
        <div className="search-group">
          <label htmlFor="search">Search Products:</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, barcode, or category..."
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="inventory-table-section">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found. {products.length === 0 ? 'Add your first product!' : 'Try adjusting your search or filters.'}</p>
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className={product.stock <= 5 ? 'low-stock' : ''}>
                  <td className="product-name">{product.name}</td>
                  <td className="barcode">{product.barcode}</td>
                  <td className="category">{product.category}</td>
                  <td className="price">${product.price.toFixed(2)}</td>
                  <td className="stock">
                    <div className="stock-controls">
                      <button
                        onClick={() => updateStock(product.id, Math.max(0, product.stock - 1))}
                        className="stock-btn"
                        disabled={product.stock <= 0}
                      >
                        -
                      </button>
                      <span className="stock-value">{product.stock}</span>
                      <button
                        onClick={() => updateStock(product.id, product.stock + 1)}
                        className="stock-btn"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="inventory-stats">
        <div className="stat-card">
          <h4>Total Products</h4>
          <p className="stat-value">{products.length}</p>
        </div>
        <div className="stat-card">
          <h4>Low Stock Items</h4>
          <p className="stat-value">{products.filter(p => p.stock <= 5).length}</p>
        </div>
        <div className="stat-card">
          <h4>Out of Stock</h4>
          <p className="stat-value">{products.filter(p => p.stock === 0).length}</p>
        </div>
        <div className="stat-card">
          <h4>Categories</h4>
          <p className="stat-value">{categories.length}</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;