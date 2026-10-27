import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  Printer,
  Share2,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import Modal from '../components/common/Modal';
import ThermalReceipt from '../components/receipt/ThermalReceipt';
import WhatsAppShareModal from '../components/billing/WhatsAppShareModal';

const ReportsPage = () => {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Modals
  const [selectedBill, setSelectedBill] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Customer Return / Size Mismatch');
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/reports/sales', {
        params: { startDate, endDate },
      });

      if (res.data.success) {
        setSummary(res.data.summary);
        setBills(res.data.bills);
      }
    } catch (err) {
      console.error('Error fetching sales report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const showNotification = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4000);
  };

  // Filter bills
  const filteredBills = bills.filter((b) => {
    if (paymentFilter !== 'All' && b.paymentMethod !== paymentFilter) return false;
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        b.billNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q)
      );
    }
    return true;
  });

  // Handle Bill Refund / Cancellation (Restores stock in MongoDB)
  const handleRefundBill = async () => {
    if (!selectedBill) return;

    try {
      const res = await axiosClient.patch(`/bills/${selectedBill._id}/status`, {
        status: 'Refunded',
        reason: refundReason,
      });

      if (res.data.success) {
        showNotification(
          `Bill #${selectedBill.billNumber} has been Refunded. Garment stock was automatically restored to inventory!`
        );
        setIsRefundModalOpen(false);
        setSelectedBill(null);
        loadReport();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to refund bill', 'error');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredBills.length === 0) return;

    const headers = [
      'Bill Number',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Items Count',
      'Payment Method',
      'Subtotal',
      'Discount',
      'GST',
      'Grand Total',
      'Status',
    ];

    const rows = filteredBills.map((b) => [
      `"${b.billNumber}"`,
      `"${new Date(b.createdAt).toLocaleDateString('en-IN')}"`,
      `"${b.customerName}"`,
      `"${b.customerPhone || ''}"`,
      b.items?.length || 0,
      `"${b.paymentMethod}"`,
      b.subtotal,
      b.discountAmount,
      b.gstAmount,
      b.grandTotal,
      `"${b.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FashionHub_Sales_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Preset Date Ranges
  const setPresetDate = (days) => {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      // Today
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - days);
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-['Outfit']">
              Sales Reports & Invoices
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Audit & Ledger
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Validate transactions, refunds, GST summaries, and inventory restorations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-xs font-bold text-slate-200 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {feedback.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Date Range Selector and Filters */}
      <div className="bg-[#0B132B] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setPresetDate(0)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800"
            >
              Today
            </button>
            <button
              onClick={() => setPresetDate(7)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPresetDate(30)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800"
            >
              This Month (30d)
            </button>
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none font-mono"
              />
            </div>
            <span>-</span>
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Secondary Filters: Search, Payment & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          <input
            type="text"
            placeholder="Search invoice #, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Split">Split</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Refunded">Refunded / Returned</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <div className="p-4 rounded-xl bg-[#0B132B] border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Invoices</span>
            <p className="text-xl font-bold font-mono text-slate-100 mt-1">
              {summary.completedBills}{' '}
              <span className="text-xs text-slate-500 font-normal">
                ({summary.refundedBills} refunded)
              </span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B132B] border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Gross Sales</span>
            <p className="text-xl font-bold font-mono text-slate-100 mt-1">
              ₹{summary.totalGross?.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B132B] border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">Discounts Given</span>
            <p className="text-xl font-bold font-mono text-amber-400 mt-1">
              ₹{summary.totalDiscounts?.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B132B] border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">GST Collected</span>
            <p className="text-xl font-bold font-mono text-blue-400 mt-1">
              ₹{summary.totalGst?.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-[#101A36] to-[#0B132B] border border-amber-500/40 col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold uppercase text-amber-400">Net Revenue</span>
            <p className="text-2xl font-black font-mono text-amber-300 mt-1">
              ₹{summary.totalNetRevenue?.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Bills Table */}
      <div className="bg-[#0B132B] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading transactions ledger...
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No transactions found for the selected period.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {b.billNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-200">{b.customerName}</p>
                      {b.customerPhone && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          {b.customerPhone}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-medium text-[10px]">
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                      {b.items?.map((i) => `${i.name} (${i.size}) x${i.quantity}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                      ₹{b.grandTotal?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          b.status === 'Completed'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : b.status === 'Refunded'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedBill(b);
                            setIsReceiptOpen(true);
                          }}
                          title="Print 80mm Receipt"
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBill(b);
                            setIsWhatsAppOpen(true);
                          }}
                          title="WhatsApp Invoice"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        {b.status === 'Completed' && (
                          <button
                            onClick={() => {
                              setSelectedBill(b);
                              setIsRefundModalOpen(true);
                            }}
                            title="Process Return & Restore Stock"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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

      {/* 80mm Thermal Receipt View Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="80mm Thermal Invoice"
        maxWidth="max-w-md"
      >
        <ThermalReceipt bill={selectedBill} onPrintComplete={() => setIsReceiptOpen(false)} />
      </Modal>

      {/* WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        bill={selectedBill}
      />

      {/* Refund / Return Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title={`Process Refund / Return for #${selectedBill?.billNumber}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Automatic Inventory Restoration</span>
            </p>
            <p>
              Confirming this refund will mark invoice as Refunded and immediately restore all
              quantities of the sold garments back into active stock!
            </p>
          </div>

          <div className="text-xs space-y-1 text-slate-300">
            <p>
              Customer: <span className="font-bold">{selectedBill?.customerName}</span>
            </p>
            <p>
              Refund Amount: <span className="font-bold font-mono text-amber-400">₹{selectedBill?.grandTotal}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Reason for Return / Refund
            </label>
            <input
              type="text"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              onClick={() => setIsRefundModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRefundBill}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Confirm Refund & Restore Stock
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportsPage;
