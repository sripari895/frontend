import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Menu, X, Truck, Search, LayoutDashboard, PlusCircle, LogIn, UserPlus, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  // Build nav links based on auth state
  const links = [
    { to: '/', label: 'Home', icon: Package, show: true },
    { to: '/create', label: 'Create Shipment', icon: PlusCircle, show: !!user },
    { to: '/track', label: 'Track', icon: Search, show: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: !!user },
    { to: '/help', label: 'Help', icon: MessageSquare, show: true },
  ].filter((l) => l.show);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-violet-500 bg-clip-text text-transparent">
              SwiftShip
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== '/' && pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${active
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}

            {/* Auth area */}
            <div className="ml-2 pl-2 border-l border-slate-200 flex items-center gap-1">
              {user ? (
                <>
                  <span className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{user.name}</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary-50 text-primary-600">{user.role}</span>
                  </span>
                  <button
                    id="logout-btn"
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-all">
                    <LogIn className="w-4 h-4" /> Login
                  </Link>
                  <Link to="/register" className="btn-primary px-4 py-2 text-sm rounded-lg">
                    <UserPlus className="w-4 h-4" /> Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 mt-1 pt-3 space-y-1 animate-fade-in-up">
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== '/' && pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all
                    ${active
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
              {user && user.role === 'admin' && (
                <Link to="/admin/support" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg">
                  <ShieldAlert className="w-4 h-4" /> Admin Support
                </Link>
              )}
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-slate-500">
                    Signed in as <span className="font-semibold text-slate-700">{user.name}</span>
                    <span className="ml-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary-50 text-primary-600">{user.role}</span>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all w-full"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                    <LogIn className="w-4 h-4" /> Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg">
                    <UserPlus className="w-4 h-4" /> Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
