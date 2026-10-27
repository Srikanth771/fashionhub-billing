import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  Users,
  Shirt,
  BarChart3,
  Settings,
  Megaphone,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Sales overview & KPIs',
    },
    {
      to: '/billing',
      label: 'New Billing',
      icon: ReceiptText,
      badge: 'POS',
      desc: 'Quick bill & WhatsApp',
    },
    {
      to: '/customers',
      label: 'Customers',
      icon: Users,
      desc: 'Billed names & numbers',
    },
    {
      to: '/offers',
      label: 'Send Offers',
      icon: Megaphone,
      badge: 'NEW',
      desc: 'WhatsApp bulk offers',
      badgeColor: 'bg-emerald-500',
    },
    {
      to: '/products',
      label: 'Products & Stock',
      icon: Shirt,
      desc: 'Catalog & inventory',
    },
    {
      to: '/reports',
      label: 'Sales Reports',
      icon: BarChart3,
      desc: 'Revenue & invoices',
    },
    {
      to: '/settings',
      label: 'Shop Settings',
      icon: Settings,
      desc: 'Store & receipt config',
    },
  ];

  return (
    <aside className="w-64 bg-[#0B132B]/95 border-r border-amber-500/15 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-amber-400/80 group-hover:text-amber-300 transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full text-slate-950 ${item.badgeColor || 'bg-amber-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Tips Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Offer Blasts</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Go to <strong className="text-emerald-400">Send Offers</strong> to post promotions directly to your customers' WhatsApp in one click.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-center">
        <p className="text-[11px] text-slate-500 font-mono">The Fashion Hub POS v1.0</p>
        <p className="text-[10px] text-amber-500/70 mt-0.5">80mm Thermal & WhatsApp Ready</p>
      </div>
    </aside>
  );
};

export default Sidebar;
