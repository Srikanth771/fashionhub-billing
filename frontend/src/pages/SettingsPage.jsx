import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import {
  Settings,
  Store,
  Phone,
  MapPin,
  FileText,
  Printer,
  ShieldAlert,
  CheckCircle2,
  Database,
  Activity,
  RefreshCw,
} from 'lucide-react';

const SettingsPage = () => {
  const { settings, updateLocalSettings } = useShop();
  const { user } = useAuth();

  const [formData, setFormData] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [testingDb, setTestingDb] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const checkHealth = async () => {
    try {
      setTestingDb(true);
      const res = await axiosClient.get('/health');
      setHealthStatus({
        status: 'online',
        message: 'Backend server and MongoDB connection active',
        time: res.data.time,
        store: res.data.store,
      });
    } catch (err) {
      setHealthStatus({
        status: 'offline',
        message: err.message || 'Cannot reach backend server',
      });
    } finally {
      setTestingDb(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    updateLocalSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="pb-2 border-b border-amber-500/20">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 font-['Outfit']">
          Store & Receipt Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Configure branding, shop contacts, thermal receipt details, and database health.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Shop settings updated and cached for POS receipts and WhatsApp sharing!</span>
        </div>
      )}

      {/* System Health Status */}
      <div className="p-5 rounded-2xl bg-[#0B132B] border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              healthStatus?.status === 'online'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-200">System Connection Health</h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                  healthStatus?.status === 'online'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {healthStatus?.status || 'Checking...'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {healthStatus?.message || 'Verifying API status...'}
            </p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={testingDb}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-amber-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testingDb ? 'animate-spin text-amber-400' : ''}`} />
          <span>Test Connection</span>
        </button>
      </div>

      {/* Store Profile Form */}
      <form onSubmit={handleSave} className="bg-[#0B132B] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
        <h3 className="text-base font-bold text-slate-100 font-['Outfit'] border-b border-slate-800 pb-3 flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-400" />
          <span>Men's Wear Store Profile</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Shop Name (Appears on Bills & Receipts)
            </label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Contact Phone (For WhatsApp & Support)
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Store Address (Printed on 80mm roll)
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Store Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              GSTIN / Tax ID (Optional)
            </label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Receipt Terms & Policy Notice
            </label>
            <textarea
              rows={2}
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* WhatsApp Automated Sending Gateway Configuration */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 font-['Outfit']">
              <span>Automated WhatsApp Gateway (Zero-Click Direct Delivery)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Configure your WhatsApp API (e.g. UltraMsg or Webhook) to deliver digital invoices automatically in the background without opening browser tabs or clicking send.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                UltraMsg Instance ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. instance12345"
                value={formData.whatsappInstanceId || ''}
                onChange={(e) => setFormData({ ...formData, whatsappInstanceId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                UltraMsg Token (Optional)
              </label>
              <input
                type="password"
                placeholder="e.g. abcde12345token"
                value={formData.whatsappToken || ''}
                onChange={(e) => setFormData({ ...formData, whatsappToken: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Or Custom Webhook URL
              </label>
              <input
                type="text"
                placeholder="e.g. https://your-whatsapp-gateway.com/send"
                value={formData.whatsappWebhookUrl || ''}
                onChange={(e) => setFormData({ ...formData, whatsappWebhookUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
