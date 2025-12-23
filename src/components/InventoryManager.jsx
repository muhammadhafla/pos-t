import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Package, 
  Plus, 
  X, 
  Tag, 
  Hash, 
  DollarSign, 
  BarChart3, 
  FolderOpen, 
  Save, 
  Search, 
  AlertTriangle, 
  XCircle, 
  Ban, 
  TrendingUp,
  BarChart,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Inventory Management</h2>
              <p className="text-muted-foreground text-lg">Manage your product inventory and stock levels</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
          >
            {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showAddForm ? 'Cancel' : 'Add New Product'}
          </Button>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <p className="text-muted-foreground">Fill in the product details below</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Tag className="w-4 h-4" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Product name"
                    className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <label htmlFor="name" className="text-sm font-semibold text-foreground">Product Name *</label>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Hash className="w-4 h-4" />
                  </div>
                  <Input
                    id="barcode"
                    name="barcode"
                    type="text"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    required
                    placeholder="Barcode number"
                    className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <label htmlFor="barcode" className="text-sm font-semibold text-foreground">Barcode *</label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <label htmlFor="price" className="text-sm font-semibold text-foreground">Price *</label>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                    className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <label htmlFor="stock" className="text-sm font-semibold text-foreground">Stock Quantity</label>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  placeholder="Product category"
                  className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <label htmlFor="category" className="text-sm font-semibold text-foreground">Category *</label>
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200">
                <Save className="w-4 h-4 mr-2" />
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline" className="border-2 border-border/50 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 px-8 py-3 rounded-xl">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <label htmlFor="search" className="text-sm font-semibold text-foreground">Search Products</label>
            </div>
            <div className="relative">
              <Input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, barcode, or category..."
                className="pl-10 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <label htmlFor="category-filter" className="text-sm font-semibold text-foreground">Filter by Category</label>
            </div>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-12 px-4 bg-background/80 border-2 border-border/50 rounded-xl text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-xl mb-8">
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="max-w-md mx-auto">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">No products found</h3>
              <p className="text-muted-foreground text-lg">{products.length === 0 ? 'Add your first product to get started!' : 'Try adjusting your search or filters.'}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/80">
                <tr>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Product Name</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Barcode</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Price</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Stock</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={`border-b border-border/30 hover:bg-primary/5 transition-colors duration-200 ${
                    product.stock <= 5 ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''
                  }`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{product.name}</span>
                        {product.stock <= 5 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400 rounded-full text-xs font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">{product.barcode}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">{product.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-primary text-lg">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => updateStock(product.id, Math.max(0, product.stock - 1))}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          disabled={product.stock <= 0}
                        >
                          −
                        </Button>
                        <div className="w-12 text-center">
                          <span className={`font-bold text-lg ${
                            product.stock === 0 ? 'text-red-600' : 
                            product.stock <= 5 ? 'text-orange-600' : 
                            'text-primary'
                          }`}>
                            {product.stock}
                          </span>
                        </div>
                        <Button
                          onClick={() => updateStock(product.id, product.stock + 1)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-green-500 hover:text-white transition-colors"
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(product)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(product.id)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Total Products</h4>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">All products</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Low Stock Items</h4>
                <p className="text-2xl font-bold text-foreground">{products.filter(p => p.stock <= 5).length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">Need restock</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Out of Stock</h4>
                <p className="text-2xl font-bold text-foreground">{products.filter(p => p.stock === 0).length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Ban className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">No inventory</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Categories</h4>
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <BarChart className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">Product types</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;