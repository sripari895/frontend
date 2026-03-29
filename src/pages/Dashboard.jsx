import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LayoutDashboard, Search, Package, Loader2, RefreshCw } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminTable from '../components/AdminTable';

export default function Dashboard() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // If Admin, render the full admin dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // If User, render the user dashboard (My Orders)
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/shipments', {
        params: search.trim() ? { search: search.trim() } : {},
      });
      setShipments(data.data);
    } catch (err) {
      toast.error('Failed to load your shipments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="container-app py-12 md:py-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Shipments</h1>
            <p className="text-sm text-slate-500">View and track all your active deliveries.</p>
          </div>
        </div>
        <button
          onClick={fetchShipments}
          disabled={loading}
          className="btn-secondary rounded-xl self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="mb-6 animate-fade-in-up-delay-1">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tracking ID…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading your shipments…</p>
        </div>
      ) : (
        <div className="animate-fade-in-up-delay-2">
          {/* Reuse the AdminTable but we'll configure it to hide actions for normal users */}
          <AdminTable shipments={shipments} onRefresh={fetchShipments} />
        </div>
      )}
    </div>
  );
}
