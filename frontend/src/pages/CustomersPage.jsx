import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useShop } from '../context/ShopContext';
import {
  Users,
  Search,
  Phone,
  Calendar,
  IndianRupee,
  Receipt,
  MessageSquare,
  Trash2,
  Send,
  Megaphone,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import Modal from '../components/common/Modal';

const CustomersPage = () => {
  const { settings } = useShop();

  // Customer list state
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBills, setCustomerBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Clear all data state
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [clearing, setClearing] = useState(false);
  const [clearMsg, setClearMsg] = useState(null);

  // Offers / WhatsApp Blast state
  const [showOfferPanel, setShowOfferPanel] = useState(false);
  const [offerText, setOfferText] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [sending, setSending] = useState(false);
  const [offerResult, setOfferResult] = useState(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // --- Filtered customers ---
  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  // --- View purchase history ---
  const viewCustomerHistory = async (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
    try {
      setLoadingBills(true);
      const res = await axiosClient.get(`/customers/${customer.phone}/history`);
      if (res.data.success) {
        setCustomerBills(res.data.bills || []);
      }
    } catch (err) {
      console.error('Error fetching customer history:', err);
    } finally {
      setLoadingBills(false);
    }
  };

  // --- Delete single customer ---
  const handleDeleteCustomer = async (id) => {
    setDeletingId(id);
    try {
      const res = await axiosClient.delete(`/customers/${id}`);
      if (res.data.success) {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // --- Clear ALL data ---
  const handleClearAll = async () => {
    if (clearConfirmText !== 'DELETE ALL DATA') return;
    setClearing(true);
    try {
      const res = await axiosClient.delete('/customers/clear-all-data', {
        data: { confirmText: 'DELETE ALL DATA' },
      });
      if (res.data.success) {
        setClearMsg(res.data);
        setCustomers([]);
        setTimeout(() => {
          setShowClearModal(false);
          setClearMsg(null);
          setClearConfirmText('');
        }, 3000);
      }
    } catch (err) {
      setClearMsg({ success: false, message: err.response?.data?.message || 'Failed to clear data.' });
    } finally {
      setClearing(false);
    }
  };

  // --- Offer Selection ---
  const toggleCustomerSelect = (id) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedCustomerIds(customers.map((c) => c._id));
  const clearSelection = () => setSelectedCustomerIds([]);

  // --- Send Offer ---
  const handleSendOffer = async () => {
    if (!offerText.trim()) return;
    setSending(true);
    setOfferResult(null);
    try {
      const res = await axiosClient.post('/customers/send-offer', {
        offerText: offerText.trim(),
        customerIds: sendToAll ? [] : selectedCustomerIds,
        sendToAll,
      });
      setOfferResult(res.data);
    } catch (err) {
      setOfferResult({
        success: false,
        message: err.response?.data?.message || 'Failed to send offers.',
      });
    } finally {
      setSending(false);
    }
  };

  // WhatsApp link for single customer
  const openWhatsApp = (phone, name) => {
    const raw = phone?.replace(/[^0-9]/g, '');
    const clean = raw?.length === 10 ? `91${raw}` : raw;
    const msg = encodeURIComponent(`Hello ${name || 'Sir'}, thank you for visiting ${settings.shopName}!`);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-amber-500/20">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-['Outfit']">
            Customers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {customers.length} customers saved from billing records
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Offer Blast Button */}
          <button
            onClick={() => { setShowOfferPanel(true); setOfferResult(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Megaphone className="w-4 h-4" />
            <span>Send Offer to Customers</span>
          </button>

          {/* Clear DB button */}
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by name or phone number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0B132B] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-[#0B132B] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">WhatsApp Number</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Visits</th>
                <th className="py-3 px-4">Last Bill</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-500">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                    {search ? 'No customers match your search.' : 'No customers yet. Generate your first bill!'}
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">{c.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{c.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      ₹{c.totalSpend?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-semibold text-slate-300">
                        {c.billsCount || 0} visit{c.billsCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {c.lastBillNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {c.lastBillDate
                        ? new Date(c.lastBillDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* History */}
                        <button
                          onClick={() => viewCustomerHistory(c)}
                          title="View purchase history"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors"
                      