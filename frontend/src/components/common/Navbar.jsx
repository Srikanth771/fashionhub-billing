import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import {
  Clock,
  User,
  LogOut,
  PlusCircle,
  Sparkles,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useShop();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#0B132B]/90 backdrop-blur-md border-b border-amber-500/20 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-[1px] shadow-lg shadow-amber-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#070D1E] rounded-[11px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-base md:text-lg text-slate-100 uppercase font-['Outfit']">
              The Fashion Hub
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Men's Wear
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <PhoneCall className="w-3 h-3 text-amber-500" /> {settings.phone}
          </p>
        </div>
      </div>

      {/* Center Live Clock */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-mono tracking-wide">
          {time.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}{' '}
          •{' '}
          {time.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })}
        </span>
      </div>

      {/* Actions & User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick New Bill Link */}
        <Link
          to="/billing"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Bill</span>
        </Link>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200 capitalize leading-tight">
              {user?.name || 'Staff'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-amber-400">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span className="capitalize">{user?.role || 'Cashier'}</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all ml-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
