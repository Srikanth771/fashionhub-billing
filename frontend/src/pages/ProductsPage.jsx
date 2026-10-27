import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Shirt,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  PackagePlus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ScanBarcode,
} from 'lucide-react';
import Modal from '../components/common/Modal';

const CATEGORIES = [
  'All',
  'Formal Shirts',
  'Casual Shirts',
  'Trousers',
  'Jeans',
  'Suits & Blazers',
  'Kurta & Ethnic',
  'Accessories',
];

const COMMON_SIZES = ['38', '39', '40', '42', '44', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'Free Size'];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stockStatus, setStockStatus] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    category: 'Formal Shirts',
    brand: 'The Fashion Hub',
    barcode: '',
    sku: '',
    size: '40',
    color: 'Navy Blue',
    costPrice: '',
    mrp: '',
    sellingPrice: '',
    stock: '',
    minStockAlert: 5,
    description: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [stockAdjustment, setStockAdjustment] = useState(1);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/products');
      if (res.data.success) {
        setProducts(res.data.products);
        setFilteredProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = products;

    if (category !== 'All') {
      result = result.filter((p) => p.category === category);
    }

    if (stockStatus === 'low') {
      result = result.filter((p) => p.stock <= p.minStockAlert && p.stock > 0);
    } else if (stockStatus === 'out') {
      result = result.filter((p) => p.stock <= 0);
    } else if (stockStatus === 'in') {
      result = result.filter((p) => p.stock > p.minStockAlert);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(result);
  }, [search, category, stockStatus, products]);

  const showNotification = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 4000);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/products', formData);
      if (res.data.success) {
        showNotification('Product successfully added to menswear inventory!');
        setIsAddModalOpen(false);
        setFormData(initialForm);
        loadProducts();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to add product', 'error');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.put(`/products/${selectedProduct._id}`, formData);
      if (res.data.success) {
        showNotification('Product details updated successfully.');
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        loadProducts();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      try {
        const res = await axiosClient.delete(`/products/${id}`);
        if (res.data.success) {
          showNotification(`"${name}" archived.`);
          loadProducts();
        }
      } catch (err) {
        showNotification(err.response?.data?.message || 'Delete failed', 'error');
      }
    }
  };

  const handleAdjustStockSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.patch(`/products/${selectedProduct._id}/stock`, {
        adjustment: stockAdjustment,
      });
      if (res.data.success) {
        showNotification(`Stock adjusted. New stock: ${res.data.product.stock}`);
        setIsStockModalOpen(false);
        setSelectedProduct(null);
        loadProducts();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Adjustment failed', 'error');
    }
  };

  const openEditModal = (p) => {
    setSelectedProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      brand: p.brand || 'The Fashion Hub',
      barcode: p.barcode || '',
      sku: p.sku || '',
      size: p.size,
      color: p.color || '',
      costPrice: p.costPrice || '',
      mrp: p.mrp || '',
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      minStockAlert: p.minStockAlert,
      description: p.description || '',
    });
    setIsEditModalOpen(true);
  };

  const openStockModal = (p) => {
    setSelectedProduct(p);
    setStockAdjustment(1);
    setIsStockModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-['Outfit']">
              Product & Stock Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage clothing categories, sizes, barcodes, prices, and stock inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialForm);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Garment</span>
        </button>
      </div>

      {feedbackMsg.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#0B132B] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by garment name, barcode, size, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Menswear Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="md:col-span-3">
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in">Normal In-Stock</option>
              <option value="low">Low Stock Alert (&le; Min)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#0B132B] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Garment & Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Size & Color</th>
                <th className="py-3 px-4">Barcode / SKU</th>
                <th className="py-3 px-4">Selling Price (₹)</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No garments found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStockAlert && p.stock > 0;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-100">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.brand}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono font-bold mr-1">
                          {p.size}
                        </span>
                        <span className="text-[10px] text-slate-400">{p.color}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <ScanBarcode className="w-3.5 h-3.5 text-slate-500" />
                          <span>{p.barcode || p.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-100 text-sm">
                          ₹{p.sellingPrice}
                        </span>
                        {p.mrp > p.sellingPrice && (
                          <span className="text-[10px] text-slate-500 line-through ml-1 font-mono">
                            ₹{p.mrp}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                            isOut
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                              : isLow
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openStockModal(p)}
                            title="Adjust Stock (+/-)"
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 hover:bg-slate-800 transition-colors"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            title="Archive Product"
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Men's Wear Garment"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Classic Oxford White Shirt"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Size *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 40, 42, L, 32"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Color
              </label>
              <input
                type="text"
                placeholder="e.g. Navy Blue, Jet Black"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Barcode (Optional or Auto-gen)
              </label>
              <input
                type="text"
                placeholder="Leave blank to auto-generate"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 1499"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                MRP (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 1999"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Initial Stock Units *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 25"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit "${selectedProduct?.name}"`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Size
              </label>
              <input
                type="text"
                required
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Min Stock Alert
              </label>
              <input
                type="number"
                min="1"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Update Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK STOCK ADJUSTMENT MODAL */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock for "${selectedProduct?.name}"`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdjustStockSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <p className="text-slate-400">
              Current In-Stock: <span className="font-bold text-amber-400 font-mono">{selectedProduct?.stock} units</span>
            </p>
            <p className="text-slate-400">
              Size: <span className="font-bold text-slate-200 font-mono">{selectedProduct?.size}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Stock Units to Add / Deduct
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                value={stockAdjustment}
                onChange={(e) => setStockAdjustment(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Enter positive number (e.g. 10) to restock, or negative (e.g. -2) to deduct damaged stock.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
