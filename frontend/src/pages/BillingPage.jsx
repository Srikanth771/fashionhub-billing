import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useShop } from '../context/ShopContext';
import {
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Phone,
  User,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  QrCode,
  Banknote,
  Printer,
  ChevronDown,
} from 'lucide-react';
import ThermalReceipt from '../components/receipt/ThermalReceipt';

const GARMENT_OPTIONS = [
  { name: 'Shirts', defaultPrice: 899, defaultSize: '40' },
  { name: 'T-Shirts', defaultPrice: 499, defaultSize: 'L' },
  { name: 'Formal Shirts', defaultPrice: 1199, defaultSize: '40' },
  { name: 'Jeans', defaultPrice: 1499, defaultSize: '32' },
  { name: 'Formal Pants', defaultPrice: 1299, defaultSize: '32' },
  { name: 'Dozzel Pants', defaultPrice: 1199, defaultSize: '32' },
  { name: 'Dozzels T-Shirts', defaultPrice: 599, defaultSize: 'L' },
  { name: 'Dixcy Scott', defaultPrice: 299, defaultSize: 'M' },
  { name: 'Hoodies', defaultPrice: 1399, defaultSize: 'L' },
  { name: 'Track Pants', defaultPrice: 699, defaultSize: 'L' },
  { name: 'Kurta & Ethnic', defaultPrice: 1899, defaultSize: '40' },
  { name: 'Suits & Blazers', defaultPrice: 4999, defaultSize: '40R' },
  { name: 'Custom Item', defaultPrice: 500, defaultSize: 'Standard' },
];

const SIZES = ['38', '39', '40', '42', '44', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'Free Size'];

const BillingPage = () => {
  const { settings } = useShop();

  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Item Input Row
  const [selectedGarment, setSelectedGarment] = useState('Shirts');
  const [customName, setCustomName] = useState('');
  const [selectedSize, setSelectedSize] = useState('40');
  const [price, setPrice] = useState(899);
  const [quantity, setQuantity] = useState(1);

  // Bill Items & Calculations
  const [billItems, setBillItems] = useState([]);
  const [discountType, setDiscountType] = useState('flat'); // 'flat' | 'percentage'
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'UPI'

  // Printing & Status State
  const [printableBill, setPrintableBill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState(null);

  // Update default price & size when dropdown garment changes
  const handleGarmentChange = (garmentName) => {
    setSelectedGarment(garmentName);
    const found = GARMENT_OPTIONS.find((g) => g.name === garmentName);
    if (found) {
      if (garmentName !== 'Custom Item') {
        setPrice(found.defaultPrice);
        setSelectedSize(found.defaultSize);
      }
    }
  };

  // Add item row to bill
  const handleAddItem = (e) => {
    e.preventDefault();
    const itemName = selectedGarment === 'Custom Item' ? (customName.trim() || 'Custom Garment') : selectedGarment;
    const numPrice = Number(price);
    const numQty = Number(quantity);

    if (numPrice <= 0) {
      setErrorMsg('Price must be greater than 0');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    if (numQty <= 0) {
      setErrorMsg('Quantity must be at least 1');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const newItem = {
      id: Date.now(),
      name: itemName,
      category: selectedGarment,
      size: selectedSize,
      price: numPrice,
      quantity: numQty,
      total: numPrice * numQty,
    };

    setBillItems((prev) => [...prev, newItem]);

    // Reset row inputs
    if (selectedGarment === 'Custom Item') setCustomName('');
    setQuantity(1);
    setErrorMsg('');
  };

  // Remove item
  const handleRemoveItem = (id) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round((subtotal * (Number(discountValue) || 0)) / 100 * 100) / 100;
  } else {
    discountAmount = Math.min(Number(discountValue) || 0, subtotal);
  }

  const rawGrandTotal = Math.max(0, subtotal - discountAmount);
  const grandTotal = Math.round(rawGrandTotal);

  // Helper to format WhatsApp text
  const createWhatsAppText = (billNumber) => {
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const itemsSummary = billItems
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.name}* (${item.size})\n   Qty: ${item.quantity} x ₹${item.price} = *₹${item.total}*`
      )
      .join('\n');

    let text = `✨ *${settings.shopName.toUpperCase()}* ✨\n`;
    text += `_${settings.tagline || "Men's Luxury Wear & Exclusive Collection"}_\n`;
    text += `📍 ${settings.address}\n`;
    text += `📞 Support: +91 ${settings.phone}\n`;
    text += `------------------------------------\n`;
    text += `🧾 *INVOICE: #${billNumber}*\n`;
    text += `📅 Date: ${formattedDate}\n`;
    text += `👤 Customer: ${customerName.trim() || 'Valued Customer'}\n`;
    text += `💳 Mode: *${paymentMethod}*\n`;
    text += `------------------------------------\n`;
    text += `*PURCHASED ITEMS:*\n${itemsSummary}\n`;
    text += `------------------------------------\n`;
    text += `Subtotal: ₹${subtotal.toFixed(2)}\n`;

    if (discountAmount > 0) {
      text += `Discount: -₹${discountAmount.toFixed(2)}\n`;
    }

    text += `\n💰 *GRAND TOTAL: ₹${grandTotal.toFixed(2)}*\n`;
    text += `------------------------------------\n`;
    text += `🙏 *Thank you for shopping at ${settings.shopName}! VISIT AGAIN.*\n`;
    text += `_Note: Exchange within 7 days with this digital invoice._`;

    return text;
  };

  // Direct 80mm Print & Direct WhatsApp Dispatch without opening multiple tabs
  const handleGenerateBillAndPrint = async () => {
    if (billItems.length === 0) {
      setErrorMsg('Please add at least one garment item to the bill.');
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit customer mobile number.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const billPayload = {
        customerName: customerName.trim() || 'Valued Customer',
        customerPhone: cleanPhone,
        items: billItems,
        discountType,
        discountValue: Number(discountValue) || 0,
        discountAmount,
        gstPercentage: 0,
        grandTotal,
        paymentMethod,
        cashReceived: grandTotal,
      };

      // 1. Save Bill in MongoDB, save customer profile, and auto-dispatch WhatsApp from backend
      const res = await axiosClient.post('/bills', billPayload);

      if (res.data.success) {
        const generatedBill = res.data.bill;
        const billNumber = generatedBill.billNumber;
        const whatsappInfo = res.data.whatsapp;

        // Set printable bill so thermal receipt HTML is ready in DOM
        setPrintableBill(generatedBill);

        // 2. Automatically trigger 80mm thermal receipt printing dialog directly!
        setTimeout(() => {
          window.print();
        }, 150);

        // 3. Set success notification
        setSuccessBanner({
          billNumber,
          customerName: customerName.trim() || 'Valued Customer',
          phone: cleanPhone,
          total: grandTotal,
          bill: generatedBill,
          whatsappSent: whatsappInfo?.success,
          gatewayNotConfigured: whatsappInfo?.gatewayNotConfigured,
        });

        // 4. Reset form ready for next customer
        setCustomerName('');
        setCustomerPhone('');
        setBillItems([]);
        setDiscountValue(0);
        setPaymentMethod('Cash');
      }
    } catch (err) {
      console.error('Bill generation error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-amber-500/20">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-['Outfit']">
            Quick POS Billing
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Auto-prints 80mm receipt and directly dispatches invoice to customer's WhatsApp.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                ✓ Bill Saved & 80mm Receipt Printed!
              </p>
              <p className="text-xs text-slate-300">
                Invoice <span className="font-mono font-bold text-amber-300">#{successBanner.billNumber}</span> for{' '}
                <span className="font-semibold text-slate-100">{successBanner.customerName}</span> (+91 {successBanner.phone}) • Total: ₹{successBanner.total}
              </p>
              {successBanner.whatsappSent ? (
                <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                  ✓ Digital invoice delivered directly to customer's WhatsApp!
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  WhatsApp prepared for +91 {successBanner.phone}.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Reprint 80mm</span>
            </button>
            <button
              onClick={() => {
                const messageText = createWhatsAppText(successBanner.billNumber);
                const encoded = encodeURIComponent(messageText);
                window.open(`https://wa.me/91${successBanner.phone}?text=${encoded}`, '_blank');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open Chat</span>
            </button>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Billing Card */}
      <div className="bg-[#0B132B] rounded-3xl border border-amber-500/25 shadow-2xl p-6 md:p-8 space-y-6">
        {/* SECTION 1: Customer Details */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>1. Customer Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Customer Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Enter Customer Name (e.g. Srikanth)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                WhatsApp Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="10-digit number (e.g. 7730899024)"
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Select Garments from Dropdown */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>2. Select Garment & Add to Bill</span>
          </h3>

          <form onSubmit={handleAddItem} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Garment Dropdown */}
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Garment Option *
                </label>
                <div className="relative">
                  <select
                    value={selectedGarment}
                    onChange={(e) => handleGarmentChange(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
                  >
                    {GARMENT_OPTIONS.map((g) => (
                      <option key={g.name} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Size
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price (₹) */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Custom name if custom item selected */}
            {selectedGarment === 'Custom Item' && (
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Custom Garment Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Silk Dupatta, Special Dhoti"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Item to Bill</span>
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 3: Current Bill Items Table */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Garments in Current Bill ({billItems.length})
            </h4>
            {billItems.length > 0 && (
              <button
                onClick={() => setBillItems([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
            {billItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No garments added yet. Select from the dropdown above and click "+ Add Item to Bill".
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Garment</th>
                    <th className="py-2.5 px-4">Size</th>
                    <th className="py-2.5 px-4">Rate (₹)</th>
                    <th className="py-2.5 px-4">Qty</th>
                    <th className="py-2.5 px-4 text-right">Total (₹)</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {billItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-4 font-bold text-slate-200">{item.name}</td>
                      <td className="py-2.5 px-4 font-mono text-amber-400">{item.size}</td>
                      <td className="py-2.5 px-4 font-mono">₹{item.price}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-100">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-100">
                        ₹{item.total}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* SECTION 4: Discounts, Payment Mode & Totals */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discount & Payment Mode */}
          <div className="space-y-4">
            {/* Discount */}
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Discount</span>
                <div className="flex rounded bg-slate-950 p-0.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setDiscountType('flat')}
                    className={`px-2 py-0.5 rounded ${
                      discountType === 'flat' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Flat ₹
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`px-2 py-0.5 rounded ${
                      discountType === 'percentage' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Discount amount"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none"
              />
            </div>

            {/* Payment Method Toggle: Cash or UPI */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                Payment Method (Cash or UPI)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`py-3 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all ${
                    paymentMethod === 'Cash'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>CASH</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-3 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Totals & Generate Button */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-200 font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Discount:</span>
                  <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Grand Total:
                </span>
                <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* DIRECT ACTION: GENERATE BILL, 80MM PRINT & SEND TO WHATSAPP */}
            <button
              type="button"
              onClick={handleGenerateBillAndPrint}
              disabled={isSubmitting || billItems.length === 0}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  <span>Generate Bill & Print 80mm Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden 80mm Thermal Receipt (Directly rendered for window.print() roll printing) */}
      {printableBill && (
        <div className="hidden print:block">
          <ThermalReceipt bill={printableBill} />
        </div>
      )}
    </div>
  );
};

export default BillingPage;
