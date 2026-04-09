import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Truck, MapPin, Shield, Search, ArrowRight, Zap, Globe, Clock, ChevronRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Create and dispatch shipments in under 30 seconds with our streamlined process.',
    color: 'from-amber-400 to-orange-500',
    shadow: 'shadow-orange-500/20',
  },
  {
    icon: MapPin,
    title: 'Live Tracking',
    desc: 'Real-time tracking with a visual 5-step stepper from Pending to Delivered.',
    color: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-teal-500/20',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    desc: 'Every shipment gets a unique NanoID tracking code for tamper-proof identification.',
    color: 'from-blue-400 to-indigo-500',
    shadow: 'shadow-indigo-500/20',
  },
  {
    icon: Globe,
    title: 'Nationwide Coverage',
    desc: 'Distance-based pricing tiers cover local, regional, and nationwide deliveries.',
    color: 'from-violet-400 to-purple-500',
    shadow: 'shadow-purple-500/20',
  },
  {
    icon: Clock,
    title: 'Status History',
    desc: 'Full audit trail with timestamps for every step of the shipment lifecycle.',
    color: 'from-pink-400 to-rose-500',
    shadow: 'shadow-rose-500/20',
  },
  {
    icon: Package,
    title: 'Admin Dashboard',
    desc: 'Powerful admin panel with stats overview, search, and inline status management.',
    color: 'from-cyan-400 to-sky-500',
    shadow: 'shadow-sky-500/20',
  },
];

export default function Home() {
  const [trackInput, setTrackInput] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackInput.trim()) {
      navigate(`/track/${trackInput.trim().toUpperCase()}`);
    }
  };

  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-violet-600 to-primary-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Floating orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />

        <div className="relative container-app py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white/90 bg-white/10 rounded-full border border-white/20 mb-6">
                <Truck className="w-3.5 h-3.5" />
                <span>SwiftShip Logistics</span>
              </span>
            </div>

            <h1 className="animate-fade-in-up-delay-1 text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Ship Smarter,{' '}
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Track Better
              </span>
            </h1>

            <p className="animate-fade-in-up-delay-2 mt-6 text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">
              Create, manage, and track shipments effortlessly with SwiftShip's end-to-end courier management platform.
            </p>

            {/* Quick Track Bar */}
            <form
              onSubmit={handleTrack}
              className="animate-fade-in-up-delay-3 mt-10 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="hero-track-input"
                  type="text"
                  placeholder="Enter tracking ID..."
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-sm rounded-2xl bg-white/95 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/50 shadow-xl"
                />
              </div>
              <button
                id="hero-track-button"
                type="submit"
                className="w-full sm:w-auto btn-primary py-4 px-8 rounded-2xl text-base"
              >
                Track <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Actions */}
            <div className="animate-fade-in-up-delay-3 mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/create" className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition">
                <ChevronRight className="w-4 h-4" /> Create New Shipment
              </Link>
              <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition">
                <ChevronRight className="w-4 h-4" /> Admin Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L48 36C96 32 192 24 288 28C384 32 480 48 576 52C672 56 768 48 864 40C960 32 1056 24 1152 28C1248 32 1344 48 1392 56L1440 64V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0V40Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ========== FEATURES BENTO GRID ========== */}
      <section className="container-app py-20 md:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Everything You Need
          </h2>
          <p className="mt-3 text-lg text-slate-500 max-w-xl mx-auto">
            A complete toolkit for managing courier operations end-to-end.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color, shadow }, idx) => (
            <div
              key={title}
              className={`card p-7 group animate-fade-in-up`}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg ${shadow} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="container-app pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-violet-600 p-10 md:p-16 text-center">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Ship?
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-md mx-auto">
              Start managing your deliveries with SwiftShip today.
            </p>
            <Link to="/create" className="btn-primary py-4 px-10 rounded-2xl text-base">
              Create Your First Shipment <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
