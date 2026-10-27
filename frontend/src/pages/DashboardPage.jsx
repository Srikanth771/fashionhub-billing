import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useShop } from '../context/ShopContext';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Shirt,
  ArrowUpRight,
  Eye,
  Printer,
  Share2,
  RefreshCw,
  Sparkles,
  Users,
  Phone,
  MessageSquare,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Modal from '../components/common/Modal';
import ThermalReceipt from '../components/receipt/ThermalReceipt';

const DashboardPage = () => {
  const { settings } = useShop();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Modals for receipt view
  const [selectedBill, setSelectedBill] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await axiosClient.get('/reports/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError('Failed to load dashboard metrics. Ensure backend server is connected.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenWhatsApp = (phone, name, billNumber, total) => {
    let cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    let text = `Hello ${name || 'Sir'}, thank you for shopping at ${settings.shopName}!`;
    if (billNumber) {
      text += `\nYour Invoice #${billNumber} for ₹${total} is registered in our system.`;
    }
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading store analytics...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    todaySales: 0,
    todayBillCount: 0,
    todayItemsSold: 0,
    weeklySales: 0,
    monthlySales: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-['Outfit'] tracking-wide">
              Store Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Live Overview
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time sales performance, billed customers, and revenue for <span className="text-amber-300 font-semibold">{settings.shopName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-xs font-semibold text-slate-300 transition-all hover:text-amber-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/billing"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Quick Billing</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Today's Sales */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101A36] to-[#0B132B] border border-amber-500/30 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80">
              Today's Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono">
              ₹{metrics.todaySales?.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{metrics.todayBillCount} bills</span>
              <span>•</span>
              <span>{metrics.todayItemsSold} garments</span>
            </p>
          </div>
        </div>

        {/* Weekly Total */}
        <div className="p-5 rounded-2xl bg-[#0B132B] border border-slate-800 shadow-xl shadow-black/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              This Week (7 Days)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono">
              ₹{metrics.weeklySales?.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-400">Past 7 days accumulated sales</p>
          </div>
        </div>

        {/* Monthly Total */}
        <div className="p-5 rounded-2xl bg-[#0B132B] border border-slate-800 shadow-xl shadow-black/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono">
              ₹{metrics.monthlySales?.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-400">Month-to-date gross revenue</p>
          </div>
        </div>

        {/* Total Billed Customers in DB */}
        <div className="p-5 rounded-2xl bg-[#0B132B] border border-slate-800 shadow-xl shadow-black/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Billed Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono">
              {metrics.totalCustomers || 0}{' '}
              <span className="text-xs font-normal text-slate-400">saved in DB</span>
            </h3>
            <Link to="/customers" className="text-xs text-purple-400 hover:text-purple-300 font-semibold block">
              View customer list →
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section: 7-Day Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0B132B] border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-wide font-['Outfit']">
                Daily Sales Trend (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Revenue trajectory in Indian Rupees
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              ₹ Revenue
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyBreakdown || []}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070D1E',
                    borderColor: 'rgba(212, 175, 55, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Quantities Sold */}
        <div className="p-6 rounded-2xl bg-[#0B132B] border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 tracking-wide font-['Outfit']">
                Category Quantities
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                This Month
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Menswear units sold across clothing categories
            </p>

            <div className="space-y-3">
              {data?.categoryQuantities && data.categoryQuantities.length > 0 ? (
                data.categoryQuantities.slice(0, 5).map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{cat._id}</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {cat.quantity} pcs (₹{cat.revenue?.toLocaleString('en-IN')})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                        style={{
                          width: `${Math.min(
                            100,
                            (cat.quantity / (data.categoryQuantities[0]?.quantity || 1)) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  <Shirt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  No garment sales recorded yet this month.
                </div>
              )}
            </div>
          </div>

          <Link
            to="/reports"
            className="mt-6 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 hover:text-amber-300 hover:border-amber-500/30 transition-all font-semibold"
          >
            <span>View Full Sales Reports</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* SECTION: Billed Customers Saved in DB */}
      <div className="p-6 rounded-2xl bg-[#0B132B] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 tracking-wide font-['Outfit'] flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Billed Customers & Numbers (Saved in DB)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer contact numbers and purchase activity recorded directly from bills
            </p>
          </div>
          <Link
            to="/customers"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            All Customers →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">WhatsApp Mobile Number</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Total Bills</th>
                <th className="py-3 px-4">Last Invoice</th>
                <th className="py-3 px-4 text-center">Direct WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.recentCustomers && data.recentCustomers.length > 0 ? (
                data.recentCustomers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100">{cust.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{cust.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      ₹{cust.totalSpend?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">
                        {cust.billsCount} visit{cust.billsCount > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {cust.lastBillNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenWhatsApp(cust.phone, cust.name, cust.lastBillNumber, cust.totalSpend)}
                        className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-500">
                    No customer phone records yet. Generate your first bill to record customers!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bills / Invoices Table */}
      <div className="p-6 rounded-2xl bg-[#0B132B] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 tracking-wide font-['Outfit']">
              Recent Invoices
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest transactions saved to MongoDB
            </p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            All Invoices →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.recentBills && data.recentBills.length > 0 ? (
                data.recentBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {bill.billNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}{' '}
                      •{' '}
                      {new Date(bill.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-200">{bill.customerName}</p>
                      {bill.customerPhone && (
                        <p className="text-[10px] text-emerald-400 font-mono font-bold">
                          {bill.customerPhone}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {bill.items?.length} items ({bill.items?.reduce((s, i) => s + i.quantity, 0)} pcs)
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                      ₹{bill.grandTotal?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsReceiptOpen(true);
                          }}
                          title="Print 80mm Receipt"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {bill.customerPhone && (
                          <button
                            onClick={() => handleOpenWhatsApp(bill.customerPhone, bill.customerName, bill.billNumber, bill.grandTotal)}
                            title="Direct WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No recent bills found. Start with your first checkout!
                  </td>
                </tr>
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
    </div>
  );
};

export default DashboardPage;
