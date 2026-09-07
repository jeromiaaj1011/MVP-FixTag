import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  QrCode, 
  PlusCircle, 
  Menu, 
  X,
  Wrench,
  ShieldAlert
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assets', label: 'Assets', icon: Layers },
    { to: '/scan', label: 'Scan to Fix', icon: QrCode },
    { to: '/report', label: 'Report Issue', icon: PlusCircle, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#334155]/70 bg-[#111827]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Positioning */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#111827] border border-[#F97316]/40 flex items-center justify-center shadow-lg shadow-[#F97316]/10 group-hover:border-[#F97316] transition-colors">
              <QrCode className="w-5 h-5 text-[#F97316] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-[#F9FAFB]">
                  Fix<span className="text-[#F97316]">Tag</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
                  MVP
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-[#94A3B8] tracking-tight -mt-0.5">
                Digital maintenance layer for physical spaces
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.highlight) {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md ${
                        isActive
                          ? 'bg-[#F97316] text-white shadow-[#F97316]/25'
                          : 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[#F97316]/20'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1E293B] text-[#F9FAFB] border border-[#334155]'
                        : 'text-[#94A3B8] hover:text-[#F9FAFB] hover:bg-[#1E293B]/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#334155]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#334155] bg-[#111827] px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                    item.highlight
                      ? 'bg-[#F97316] text-white font-semibold'
                      : isActive
                      ? 'bg-[#1E293B] text-[#F9FAFB] border border-[#334155]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
