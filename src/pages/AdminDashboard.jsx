import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Search, Package, Truck, Clock, MapPin, CheckCircle2, Loader2, RefreshCw,
} from 'lucide-react';
import AdminTable from '../components/AdminTable';

const STAT_CARDS = [
  { key: 'total',          label: 'Total',             icon: Package,       gradient: 'from-slate-500 to-slate-700',   shadow: 'shadow-slate-500/20' },
  { key: 'pending',        label: 'Pending',           icon: Clock,         gradient: 'from-amber-400 to-orange-500',  shadow: 'shadow-orange-500/20' },
  { key: 'dispatched',     label: 'Dispatched',        icon: Truck,         gradient: 'from-blue-400 to-indigo-500',   shadow: 'shadow-indigo-500/20' },
  { key: 'inTransit',      label: 'In-Transit',        icon: MapPin,        gradient: 'from-indigo-400 to-violet-500', shadow: 'shadow-violet-500/20' },
  { key: 'outForDelivery', label: 'Out for Delivery',  icon: Truck,         gradient: 'from-violet-400 to-purple-500', shadow: 'shadow-purple-500/20' },
  { key: 'delivered',      label: 'Delivered',          icon: CheckCircle2,  gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-teal-500/20' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Auth header is set globally by AuthContext
      const [statsRes, shipmentsRes] = await Promise.all([
        api.get('/shipments/stats/overview'),
        api.get('/shipments', { params: search.trim() ? { search: search.trim() } : {} }),
      ]);
      setStats(statsRes.data.data);
      setShipments(shipmentsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      toast.error(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="container-app py-12 md:py-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Manage and monitor all shipments</p>
          </div>
        </div>
        <button
          id="refresh-dashboard"
          onClick={fetchData}
          disabled={loading}
          className="btn-secondary rounded-xl self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 animate-fade-in-up-delay-1">
          {STAT_CARDS.map(({ key, label, icon: Icon, gradient, shadow }) => (
            <div key={key} className="card p-4 text-center group">
              <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats[key] ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 animate-fade-in-up-delay-2">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="admin-search"
            type="text"
            placeholder="Search by tracking ID…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading shipments…</p>
        </div>
      ) : (
        <div className="animate-fade-in-up-delay-3">
          <AdminTable shipments={shipments} onRefresh={fetchData} />
        </div>
      )}
    </div>
  );
}
