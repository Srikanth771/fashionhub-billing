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
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        {/* WhatsApp */}
                        <button
                          onClick={() => openWhatsApp(c.phone, c.name)}
                          title="Open WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        {deleteConfirmId === c._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteCustomer(c._id)}
                              disabled={deletingId === c._id}
                              className="px-2 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] transition-colors disabled:opacity-50"
                            >
                              {deletingId === c._id ? '…' : 'Yes, Delete'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 text-slate-400 hover:text-slate-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(c._id)}
                            title="Delete customer"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          OFFERS / WHATSAPP BLAST PANEL (Full Screen Modal)
      ============================================================ */}
      {showOfferPanel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Panel Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 font-['Outfit']">
                    Send Offer to Customers
                  </h2>
                  <p className="text-xs text-slate-400">
                    Post your shop offers directly to customers' WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowOfferPanel(false); setOfferResult(null); }}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Offer Message Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
                  ✍️ Offer / Promotion Message
                </label>
                <textarea
                  rows={6}
                  value={offerText}
                  onChange={(e) => setOfferText(e.target.value)}
                  placeholder={`Type your offer here...\n\nExample:\n🎉 BIG SALE! 30% OFF on all Shirts & Jeans this weekend only!\n🕐 Valid till Sunday 31st Oct.\n📍 Visit us at New Jewellary Market, Bhainsa.\n🛒 Show this message for discount!`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono resize-none transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Your shop name ({settings.shopName}) and thank-you footer will be added automatically.
                </p>
              </div>

              {/* Who to Send */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">
                  👥 Send To
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSendToAll(true); setSelectedCustomerIds([]); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                      sendToAll
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    All Customers ({customers.length})
                  </button>
                  <button
                    onClick={() => setSendToAll(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                      !sendToAll
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Select Specific ({selectedCustomerIds.length} selected)
                  </button>
                </div>
              </div>

              {/* Customer Selector (only when specific selection) */}
              {!sendToAll && (
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-400">
                      Select customers to receive this offer
                    </span>
                    <div className="flex gap-2">
                      <button onClick={selectAll} className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold">
                        Select All
                      </button>
                      <span className="text-slate-600">|</span>
                      <button onClick={clearSelection} className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold">
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/60">
                    {customers.map((c) => (
                      <label
                        key={c._id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/40 cursor-pointer"
                      >
                        <div
                          onClick={() => toggleCustomerSelect(c._id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            selectedCustomerIds.includes(c._id)
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-slate-600'
                          }`}
                        >
                          {selectedCustomerIds.includes(c._id) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0" onClick={() => toggleCustomerSelect(c._id)}>
                          <p className="text-xs font-semibold text-slate-200 truncate">{c.name}</p>
                          <p className="text-[10px] text-emerald-400 font-mono">{c.phone}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">₹{c.totalSpend?.toLocaleString('en-IN')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Result after sending */}
              {offerResult && (
                <div className={`p-4 rounded-2xl border text-xs ${
                  offerResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {offerResult.success ? (
                    <>
                      <div className="flex items-center gap-2 font-bold mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          Offer dispatched! {offerResult.sentCount}/{offerResult.totalCustomers} customers
                          {offerResult.failedCount > 0 && ` (${offerResult.failedCount} failed)`}
                        </span>
                      </div>
                      {offerResult.gatewayNotConfigured && (
                        <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                          <p className="text-amber-300 font-semibold mb-1">
                            ⚠️ WhatsApp Gateway Not Configured
                          </p>
                          <p className="text-amber-200/80">
                            Configure WHATSAPP_INSTANCE_ID &amp; WHATSAPP_TOKEN in <code className="font-mono bg-slate-900 px-1 rounded">backend/.env</code> for automated sending.
                          </p>
                          <p className="mt-2 font-semibold">Manual WhatsApp links (click to open each):</p>
                          <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                            {offerResult.results?.map((r, i) => r.waLink && (
                              <a
                                key={i}
                                href={r.waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {r.name} ({r.phone})
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{offerResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendOffer}
                disabled={sending || !offerText.trim() || (!sendToAll && selectedCustomerIds.length === 0)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending to customers…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>
                      Send Offer via WhatsApp
                      {sendToAll ? ` (All ${customers.length})` : ` (${selectedCustomerIds.length} selected)`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          CLEAR ALL DATA CONFIRMATION MODAL
      ============================================================ */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-rose-500/40 rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-rose-400 font-['Outfit']">
                  ⚠️ Delete All Data
                </h2>
                <p className="text-xs text-slate-400">This action is PERMANENT and cannot be undone</p>
              </div>
            </div>

            {clearMsg ? (
              <div className={`p-4 rounded-xl text-xs font-semibold ${clearMsg.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'}`}>
                {clearMsg.success
                  ? `✅ Deleted ${clearMsg.deletedBills} bills & ${clearMsg.deletedCustomers} customers. Counter reset.`
                  : `❌ ${clearMsg.message}`}
              </div>
            ) : (
              <>
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 mb-4 text-xs text-slate-300 space-y-1">
                  <p>This will permanently delete:</p>
                  <ul className="list-disc list-inside pl-2 space-y-0.5 text-rose-300">
                    <li>All bills and invoices in the database</li>
                    <li>All customer records and phone numbers</li>
                    <li>Bill number counter (reset to #1000)</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Type <span className="text-rose-400 font-mono">DELETE ALL DATA</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={clearConfirmText}
                    onChange={(e) => setClearConfirmText(e.target.value)}
                    placeholder="DELETE ALL DATA"
                    className="w-full bg-slate-900 border border-rose-500/30 rounded-xl px-3 py-2.5 text-sm text-rose-300 font-mono placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowClearModal(false); setClearConfirmText(''); }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={clearConfirmText !== 'DELETE ALL DATA' || clearing}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {clearing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deleting…
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Everything
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          PURCHASE HISTORY MODAL
      ============================================================ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setCustomerBills([]); }}
        title={`Purchase History — ${selectedCustomer?.name}`}
        maxWidth="max-w-2xl"
      >
        {loadingBills ? (
          <div className="py-10 flex justify-center">
            <div className="w-7 h-7 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400">Total Visits</p>
                <p className="text-lg font-black text-amber-400 font-mono">{selectedCustomer?.billsCount || 0}</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400">Total Spent</p>
                <p className="text-lg font-black text-emerald-400 font-mono">₹{selectedCustomer?.totalSpend?.toLocaleString('en-IN') || 0}</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-sm font-bold text-slate-200 font-mono">{selectedCustomer?.phone}</p>
              </div>
            </div>

            {customerBills.length === 0 ? (
              <p className="text-center text-slate-500 py-6 text-sm">No bill records found.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {customerBills.map((bill) => (
                  <div key={bill._id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-mono font-bold text-amber-400">{bill.billNumber}</p>
                      <p className="text-slate-400">
                        {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-slate-500">{bill.items?.length} items • {bill.paymentMethod}</p>
                    </div>
                    <p className="text-base font-black text-slate-100 font-mono">₹{bill.grandTotal?.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
