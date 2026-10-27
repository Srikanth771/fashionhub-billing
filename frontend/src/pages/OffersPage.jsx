import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useShop } from '../context/ShopContext';
import {
  Megaphone,
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CheckSquare,
  X,
  Sparkles,
  Tag,
  MessageSquare,
  Phone,
  RotateCcw,
} from 'lucide-react';

const OFFER_TEMPLATES = [
  {
    label: '🎉 Weekend Sale',
    text: `🎉 BIG WEEKEND SALE at The Fashion Hub!\n\n✅ 20% OFF on all Shirts & T-Shirts\n✅ 15% OFF on Jeans & Formal Pants\n✅ Special deals on Hoodies & Track Pants\n\n📅 Valid this Weekend Only!\n📍 New Jewellary Market, Bhainsa\n\n🛒 Show this message to avail discount!`,
  },
  {
    label: '🆕 New Arrivals',
    text: `🆕 NEW ARRIVALS are here at The Fashion Hub!\n\n✨ Latest Formal Shirts — Premium Collection\n✨ Dozzel Pants — Trending Styles\n✨ Dozzels T-Shirts — Comfort Fit\n✨ Dixcy Scott Collection\n\n📍 Visit us today at New Jewellary Market, Bhainsa\n⏰ Mon–Sun: 10am – 9pm`,
  },
  {
    label: '🏷️ Festival Offer',
    text: `🙏 Festival Special Offer from The Fashion Hub!\n\n🎊 Flat 25% OFF on all purchases above ₹2000\n🎊 FREE Gift on orders above ₹5000\n\n📅 Festival Week Only!\n\n👕 Don't miss out on the best deals in Bhainsa!\n📍 New Jewellary Market, Kamala Theatre Road`,
  },
  {
    label: '⭐ VIP Customer',
    text: `⭐ Exclusive VIP Offer for our Valued Customer!\n\nAs our loyal customer, you get:\n🎁 Extra 10% OFF on your next visit\n🎁 Priority billing service\n🎁 Free alteration on any purchase\n\n📅 Valid for 7 days from today.\n\n📍 The Fashion Hub — New Jewellary Market, Bhainsa\n📞 Call us: +91 6309382716`,
  },
  {
    label: '🧵 Custom / Blank',
    text: '',
  },
];

const OffersPage = () => {
  const { settings } = useShop();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [offerText, setOfferText] = useState(OFFER_TEMPLATES[0].text);

  const [sendToAll, setSendToAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    axiosClient.get('/customers').then((res) => {
      if (res.data.success) setCustomers(res.data.customers);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  const toggleId = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleTemplateSelect = (idx) => {
    setSelectedTemplate(idx);
    setOfferText(OFFER_TEMPLATES[idx].text);
    setResult(null);
  };

  const handleSend = async () => {
    if (!offerText.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await axiosClient.post('/customers/send-offer', {
        offerText: offerText.trim(),
        customerIds: sendToAll ? [] : selectedIds,
        sendToAll,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to send.' });
    } finally {
      setSending(false);
    }
  };

  const recipientCount = sendToAll ? customers.length : selectedIds.length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald-500/20">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-emerald-400" />
            Send Offers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Post your shop promotions directly to customers' WhatsApp — {customers.length} customers in database
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          WhatsApp Blast
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Compose Offer */}
        <div className="space-y-5">
          {/* Offer Templates */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              Quick Offer Templates
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OFFER_TEMPLATES.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemplateSelect(idx)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                    selectedTemplate === idx
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offer Message Editor */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Offer Message
            </label>
            <textarea
              rows={10}
              value={offerText}
              onChange={(e) => { setOfferText(e.target.value); setResult(null); }}
              placeholder="Type your custom offer message here..."
              className="w-full bg-[#0B132B] border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono resize-none transition-colors leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-slate-500">
                Shop name <span className="text-amber-400 font-semibold">({settings.shopName})</span> and footer added automatically
              </p>
              <button
                onClick={() => setOfferText('')}
                className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          {/* Preview */}
          {offerText.trim() && (
            <div className="bg-[#0B132B] border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-wider">Preview (WhatsApp format)</p>
              <div className="bg-slate-900 rounded-xl p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
                {`✨ *${settings.shopName.toUpperCase()}* ✨\n\n${offerText.trim()}\n\n🙏 Thank you for shopping with us!\n_Visit us again for exclusive deals._`}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Select Recipients & Send */}
        <div className="space-y-5">
          {/* Who to Send */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Select Recipients
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => { setSendToAll(true); setSelectedIds([]); }}
                className={`flex flex-col items-center gap-1 px-3 py-4 rounded-2xl border font-bold text-xs transition-all ${
                  sendToAll
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-6 h-6" />
                <span>All Customers</span>
                <span className="text-lg font-black">{customers.length}</span>
              </button>
              <button
                onClick={() => setSendToAll(false)}
                className={`flex flex-col items-center gap-1 px-3 py-4 rounded-2xl border font-bold text-xs transition-all ${
                  !sendToAll
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckSquare className="w-6 h-6" />
                <span>Select Specific</span>
                <span className="text-lg font-black">{selectedIds.length} selected</span>
              </button>
            </div>
          </div>

          {/* Customer List for specific selection */}
          {!sendToAll && (
            <div className="bg-[#0B132B] rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search customers…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedIds(customers.map((c) => c._id))}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    All
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-[11px] text-slate-500 hover:text-slate-300 font-semibold"
                  >
                    None
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                  {filtered.map((c) => (
                    <label
                      key={c._id}
                      onClick={() => toggleId(c._id)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/40 cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        selectedIds.includes(c._id)
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-600 hover:border-emerald-500/50'
                      }`}>
                        {selectedIds.includes(c._id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{c.name}</p>
                        <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          {c.phone}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-amber-400 font-mono font-bold">₹{c.totalSpend?.toLocaleString('en-IN')}</p>
                        <p className="text-[9px] text-slate-500">{c.billsCount} visit{c.billsCount !== 1 ? 's' : ''}</p>
                      </div>
                    </label>
                  ))}
                  {filtered.length === 0 && (
                    <p className="py-6 text-center text-slate-500 text-xs">No customers found</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Result Panel */}
          {result && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              result.success
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              {result.success ? (
                <>
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      ✅ Offer sent to {result.sentCount} of {result.totalCustomers} customers!
                      {result.failedCount > 0 && ` (${result.failedCount} failed)`}
                    </span>
                  </div>

                  {result.gatewayNotConfigured && (
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                      <p className="text-amber-300 font-semibold">
                        ⚠️ WhatsApp Gateway not configured — click links below to send manually:
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {result.results?.filter((r) => r.waLink).map((r, i) => (
                          <a
                            key={i}
                            href={r.waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            {r.name} — {r.phone}
                          </a>
                        ))}
                      </div>
                      <p className="text-amber-200/70 text-[10px] mt-1">
                        To enable auto-sending, add <code className="bg-slate-900 px-1 rounded font-mono">WHATSAPP_INSTANCE_ID</code> and <code className="bg-slate-900 px-1 rounded font-mono">WHATSAPP_TOKEN</code> to <code className="bg-slate-900 px-1 rounded font-mono">backend/.env</code> (UltraMsg gateway).
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{result.message}</span>
                </div>
              )}
            </div>
          )}

          {/* SEND BUTTON */}
          <button
            onClick={handleSend}
            disabled={
              sending ||
              !offerText.trim() ||
              recipientCount === 0
            }
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending WhatsApp messages…</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>
                  🚀 Send Offer to {recipientCount} Customer{recipientCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </button>

          {/* Info box about UltraMsg */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-500 space-y-2">
            <p className="font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              How WhatsApp sending works:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li><span className="text-emerald-400 font-semibold">Auto (recommended):</span> Configure UltraMsg in Settings or <code className="font-mono bg-slate-950 px-1 rounded">backend/.env</code></li>
              <li><span className="text-amber-400 font-semibold">Manual links:</span> Without gateway, clickable WhatsApp links are generated for each customer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
