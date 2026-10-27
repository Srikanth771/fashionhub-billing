import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

const LoginPage = () => {
  const { login, initUsers } = useAuth();
  const { settings } = useShop();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initMsg, setInitMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleDemoFill = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
  };

  const handleInitialize = async () => {
    setLoading(true);
    setInitMsg('');
    const res = await initUsers();
    setLoading(false);
    if (res.success) {
      setInitMsg('Default accounts ready! Click Admin or Cashier below.');
      setUsername('admin');
      setPassword('admin123');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1E] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Ambient Luxury Gold & Navy Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-[1.5px] shadow-2xl shadow-amber-500/20 mb-4">
            <div className="w-full h-full bg-[#070D1E] rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider text-slate-100 uppercase font-['Outfit']">
            {settings.shopName}
          </h1>
          <p className="text-sm text-amber-400/80 font-medium tracking-wide mt-1">
            Men's Luxury Wear & Exclusive Billing
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Bhainsa • Ph: {settings.phone}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0B132B]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 shadow-2xl shadow-black/80">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              Sign In to POS
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Access sales terminal, inventory, and reports.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {initMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{initMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or cashier"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Enter Store POS</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill helper */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2.5">
              Quick One-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin', 'admin123')}
                className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/20 hover:border-amber-500/50 text-[11px] text-amber-300 font-medium transition-all text-center flex flex-col items-center"
              >
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" /> Admin
                </span>
                <span className="text-[10px] text-slate-400">admin / admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('cashier', 'cashier123')}
                className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-[11px] text-slate-300 font-medium transition-all text-center flex flex-col items-center"
              >
                <span className="font-bold flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Cashier
                </span>
                <span className="text-[10px] text-slate-400">cashier / cashier123</span>
              </button>
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleInitialize}
                className="text-[11px] text-amber-400/80 hover:text-amber-300 underline underline-offset-4"
              >
                First time? Click to initialize database default accounts
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6 font-mono">
          Secured with JWT & Role-Based Authorization
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
