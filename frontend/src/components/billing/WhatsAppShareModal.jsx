import React, { useState } from 'react';
import { Send, Copy, Check, MessageSquare, Phone } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import Modal from '../common/Modal';

const WhatsAppShareModal = ({ isOpen, onClose, bill }) => {
  const { settings } = useShop();
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync phone when bill changes
  React.useEffect(() => {
    if (bill?.customerPhone) {
      setPhone(bill.customerPhone);
    } else {
      setPhone('');
    }
  }, [bill]);

  if (!bill) return null;

  // Format professional WhatsApp invoice message
  const generateMessage = () => {
    const formattedDate = new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const itemsText = bill.items
      ?.map(
        (item, idx) =>
          `${idx + 1}. *${item.name}* (${item.size})\n   Qty: ${item.quantity} x ₹${item.price} = *₹${item.total}*`
      )
      .join('\n');

    let msg = `✨ *${settings.shopName.toUpperCase()}* ✨\n`;
    msg += `_${settings.tagline || "Men's Luxury Wear & Exclusive Collection"}_\n`;
    msg += `📍 ${settings.address}\n`;
    msg += `📞 Support: +91 ${settings.phone}\n`;
    msg += `------------------------------------\n`;
    msg += `🧾 *TAX INVOICE: #${bill.billNumber}*\n`;
    msg += `📅 Date: ${formattedDate}\n`;
    msg += `👤 Customer: ${bill.customerName || 'Valued Customer'}\n`;
    msg += `💳 Mode: ${bill.paymentMethod}\n`;
    msg += `------------------------------------\n`;
    msg += `*PURCHASED ITEMS:*\n${itemsText}\n`;
    msg += `------------------------------------\n`;
    msg += `Subtotal: ₹${bill.subtotal?.toFixed(2)}\n`;

    if (bill.discountAmount > 0) {
      msg += `Discount: -₹${bill.discountAmount?.toFixed(2)}\n`;
    }
    if (bill.gstAmount > 0) {
      msg += `GST (${bill.gstPercentage}%): +₹${bill.gstAmount?.toFixed(2)}\n`;
    }
    if (bill.roundOff !== 0) {
      msg += `Round Off: ₹${bill.roundOff?.toFixed(2)}\n`;
    }

    msg += `\n💰 *GRAND TOTAL: ₹${bill.grandTotal?.toFixed(2)}*\n`;
    msg += `------------------------------------\n`;
    msg += `🙏 *Thank you for shopping at ${settings.shopName}! VISIT AGAIN.*\n`;
    msg += `_Note: Exchange within 7 days with this digital invoice._`;

    return msg;
  };

  const message = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const encodedMsg = encodeURIComponent(message);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;

    window.open(url, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Digital Invoice on WhatsApp" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Customer Phone Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Recipient WhatsApp Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
            <input
              type="tel"
              placeholder="e.g. 9876543210 (10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Country code +91 will be automatically prepended for 10-digit Indian numbers.
          </p>
        </div>

        {/* Message Preview Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Formatted Message Preview
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed border-l-4 border-l-emerald-500">
            {message}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Open WhatsApp & Send</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppShareModal;
